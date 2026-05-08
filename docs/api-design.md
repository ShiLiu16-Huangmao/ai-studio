# AI Radio — API 设计文档

## 1. 通信架构

```
┌─────────────────────────────────────────┐
│                 Client (PWA)             │
│                                          │
│  ┌─────────────┐    ┌────────────────┐  │
│  │  REST API    │    │   WebSocket    │  │
│  │  (按需请求)   │    │  (持久连接)     │  │
│  └──────┬──────┘    └───────┬────────┘  │
│         │                   │           │
└─────────┼───────────────────┼───────────┘
          │                   │
    ┌─────┴─────┐      ┌──────┴──────┐
    │  /api/*   │      │   ws://     │
    │  (CRUD)   │      │  (实时流)    │
    └─────┬─────┘      └──────┬──────┘
          │                   │
┌─────────┴───────────────────┴───────────┐
│              Server                      │
└──────────────────────────────────────────┘
```

**原则**:
- REST: 数据 CRUD、配置、历史查询
- WebSocket: 实时聊天、流式 TTS、状态推送、音乐控制
- 文件上传/下载走 REST（multipart / blob）

---

## 2. REST API

### 2.1 通用约定

```
Base URL: http://localhost:3001/api

请求头:
  Content-Type: application/json (除文件上传)

响应格式:
  Success: { success: true, data: T }
  Error:   { success: false, error: { code: string, message: string, details?: any } }
  List:    { success: true, data: T[], total: number, hasMore: boolean }

分页:
  Query: ?limit=20&offset=0
  响应: { ..., total: 100, hasMore: true }

HTTP Status Codes:
  200: 成功
  201: 创建成功
  400: 请求参数错误
  404: 资源不存在
  500: 服务端错误
```

### 2.2 对话 API

```
GET    /api/conversations
  → 获取对话列表 (分页)
  Query: ?limit=20&offset=0
  Response: { conversations: Conversation[] }

GET    /api/conversations/:id
  → 获取单个对话详情
  Response: { conversation: Conversation & { messages: Message[] } }

POST   /api/conversations
  → 创建新对话
  Body: { title?: string }
  Response: { conversation: Conversation }

DELETE /api/conversations/:id
  → 删除对话 (级联删除消息+音频)
  Response: { success: true }

GET    /api/conversations/:id/messages
  → 获取对话消息 (分页，从旧到新)
  Query: ?limit=50&before=messageId
  Response: { messages: Message[], hasMore: boolean }
```

### 2.3 音乐 API

```
GET    /api/music/search
  → 搜索歌曲
  Query: ?q=关键词&limit=10
  Response: { tracks: Track[] }

GET    /api/music/recommend
  → 获取推荐歌曲
  Query: ?mood=chill&genre=jazz&limit=5
  Response: { tracks: Track[], reason: string }

GET    /api/music/track/:id
  → 获取歌曲详情 (+ 播放 URL)
  Response: { track: Track & { mp3Url: string } }

GET    /api/music/history
  → 播放历史
  Query: ?limit=50&offset=0
  Response: { history: PlayHistoryItem[] }
```

### 2.4 天气 API

```
GET    /api/weather/current
  → 获取当前天气
  Response: {
    weather: {
      temperature: number,
      condition: string,      // "晴" | "多云" | "雨" | ...
      humidity: number,
      windLevel: number,
      city: string,
      updatedAt: string
    }
  }
```

### 2.5 日程 API

```
GET    /api/schedule
  → 获取日程列表
  Response: { items: ScheduleItem[] }

POST   /api/schedule
  → 创建日程
  Body: { title: string, time: string, date?: string, repeat?: string }
  Response: { item: ScheduleItem }

PUT    /api/schedule/:id
  → 更新日程
  Body: Partial<ScheduleItem>
  Response: { item: ScheduleItem }

DELETE /api/schedule/:id
  → 删除日程
  Response: { success: true }

GET    /api/schedule/upcoming
  → 获取接下来的日程
  Query: ?hours=24
  Response: { items: ScheduleItem[] }
```

### 2.6 记忆 API

```
GET    /api/memory
  → 获取记忆列表
  Query: ?type=fact&limit=50
  Response: { memories: Memory[] }

DELETE /api/memory/:id
  → 删除单条记忆
  Response: { success: true }

POST   /api/memory/clear
  → 清除所有记忆
  Response: { success: true }
```

### 2.7 偏好 API

```
GET    /api/preferences
  → 获取用户偏好
  Response: { preferences: Preference }

PUT    /api/preferences
  → 更新用户偏好
  Body: Partial<Preference>
  Response: { preferences: Preference }
```

### 2.8 系统 API

```
GET    /api/health
  → 健康检查
  Response: {
    status: 'ok',
    uptime: number,
    version: string,
    services: { claude: boolean, fishAudio: boolean, netease: boolean }
  }

GET    /api/system/stats
  → 系统统计
  Response: {
    totalConversations: number,
    totalMessages: number,
    totalMemories: number,
    totalTracksPlayed: number
  }
```

---

## 3. WebSocket 协议

### 3.1 连接

```
ws://localhost:3001/ws

连接时携带 query:
  ws://localhost:3001/ws?clientVersion=1.0.0

服务器验证后发送欢迎消息:
  { type: "system:event", payload: { event: "connected", serverVersion: "1.0.0" } }
  { type: "dj:state",     payload: { status: "online", mood: "chill" } }
  { type: "weather:update", payload: { ... } }
  { type: "schedule:update", payload: { items: [...] } }
```

### 3.2 心跳

```
Client → Server (每 30s):
  { type: "ping", payload: {}, timestamp: 1700000000000, seq: N }

Server → Client:
  { type: "pong", payload: {}, timestamp: 1700000000000, seq: N }

超时: 60s 无心跳 → 服务端断开连接
```

### 3.3 完整事件目录

#### Client → Server

| 事件 | 载荷 | 说明 |
|------|------|------|
| `chat:message` | `{ conversationId, text }` | 发送聊天消息 |
| `chat:typing` | `{ conversationId }` | 正在输入指示 |
| `chat:stop` | `{ conversationId }` | 中断 AI 生成 |
| `player:action` | `{ action, value?, trackId? }` | 播放控制 |
| `player:sync` | `{}` | 请求播放状态同步 |
| `player:queue` | `{ tracks, action }` | 更新播放队列 |
| `user:presence` | `{ status }` | 用户在线状态 |
| `user:preference` | `{ key, value }` | 更新单个偏好 |
| `ping` | `{}` | 心跳 |

#### Server → Client

| 事件 | 载荷 | 说明 |
|------|------|------|
| `chat:token` | `{ conversationId, messageId, token, index }` | 流式文本 token |
| `chat:done` | `{ conversationId, messageId, metadata? }` | 回复完成 |
| `chat:action` | `{ action, params }` | 结构化动作 |
| `audio:start` | `{ conversationId, messageId, format, sampleRate }` | 音频流开始 |
| `audio:chunk` | `{ conversationId, messageId, data, sequence, sentence }` | 音频数据块 |
| `audio:end` | `{ conversationId, messageId }` | 音频流结束 |
| `music:track` | `{ track, recommendReason? }` | 音乐曲目 |
| `music:playlist` | `{ tracks, title, context }` | 播放列表 |
| `weather:update` | `{ weather }` | 天气数据推送 |
| `schedule:update` | `{ items }` | 日程数据推送 |
| `dj:state` | `{ status, mood?, currentSegment? }` | DJ 状态变更 |
| `dj:mood` | `{ mood, reason? }` | DJ 情绪变更 |
| `system:event` | `{ event, message?, data? }` | 系统通知 |
| `error` | `{ code, message, recoverable }` | 错误信息 |
| `pong` | `{}` | 心跳响应 |

### 3.4 流式聊天时序

```
发送消息:
  Client → { type: "chat:message", payload: { conversationId: "c1", text: "今晚月色真美" } }

流式响应:
  Client ← { type: "chat:token", payload: { conversationId: "c1", messageId: "m1", token: "是啊", index: 0 } }
  Client ← { type: "chat:token", payload: { ..., token: "，", index: 1 } }
  Client ← { type: "chat:token", payload: { ..., token: "很适合", index: 2 } }
  Client ← { type: "audio:start", payload: { conversationId: "c1", messageId: "m1", format: "mp3" } }
  Client ← { type: "audio:chunk", payload: { ..., data: "base64...", sequence: 0, sentence: "是啊，" } }
  Client ← { type: "chat:token", payload: { ..., token: "听一首", index: 3 } }
  Client ← { type: "chat:token", payload: { ..., token: "爵士", index: 4 } }
  Client ← { type: "audio:chunk", payload: { ..., data: "base64...", sequence: 1, sentence: "很适合听一首爵士。" } }
  Client ← { type: "chat:action", payload: { action: "recommend_music", params: { genre: "jazz", mood: "night" } } }
  Client ← { type: "music:track", payload: { track: {...}, recommendReason: "月夜爵士" } }
  Client ← { type: "audio:end", payload: { conversationId: "c1", messageId: "m1" } }
  Client ← { type: "chat:done", payload: { conversationId: "c1", messageId: "m1" } }
```

### 3.5 错误处理

```typescript
// 不可恢复错误
{ type: "error", payload: { code: "AUTH_FAILED", message: "...", recoverable: false } }
// → 客户端显示错误并断开

// 可恢复错误
{ type: "error", payload: { code: "TTS_TIMEOUT", message: "语音生成超时", recoverable: true } }
// → 客户端提示用户，继续文字模式

// 流式中断
// 服务端发送 chat:done 但带有错误标记
{ type: "chat:done", payload: { conversationId: "c1", messageId: "m1", metadata: { error: "CLAUDE_TIMEOUT" } } }
```

### 3.6 重连与状态恢复

```
重连后自动流程:
  1. Client 发送最后收到的 seq 号 (在连接 query 中)
  2. Server 重放 seq 之后的遗漏事件 (从事件日志缓冲区)
  3. Server 推送当前完整状态:
      - dj:state
      - weather:update
      - schedule:update
  4. Client 发送 player:sync 同步播放状态

事件日志缓冲区:
  - 保留最近 500 条事件
  - 保留时间: 最近 5 分钟
  - 超过的丢弃 (客户端全量重新拉取)
```

---

## 4. 流式传输协议细节

### 4.1 TTS 流管道

```
Claude token stream
    │
    ▼
SentenceAccumulator
    ├── 检测句子边界: [. ! ? , ; 。！？，；\n]
    ├── 最小句子长度: 2 字符 (避免单个标点触发 TTS)
    ├── 最大句子长度: 80 字符 (长句切分)
    │
    ▼
TTS Request Queue (并发 = 1, 按序处理)
    ├── Fish Audio API POST /v1/tts
    ├── Body: { text, voice_id, format: "mp3", streaming: true }
    ├── Response: ReadableStream<Buffer>
    │
    ▼
AudioChunkEmitter
    ├── 每个 TTS 返回的 chunk → WebSocket audio:chunk
    ├── 附带: sequence, sentence (用于字幕同步)
    │
    ▼
Client AudioBufferQueue
    ├── MediaSource SourceBuffer 队列
    ├── 自动拼接播放
    └── 当前播放 sentence → 触发 StreamingText 高亮
```

### 4.2 字幕同步

```
audio:chunk 中的 sentence 字段:
  { sequence: 3, sentence: "今晚的月色真美。", data: "base64..." }

客户端:
  sentenceTimeline = [
    { sequence: 0, sentence: "是啊，", startTime: 0 },
    { sequence: 1, sentence: "很适合听一首爵士。", startTime: 1.2 },
  ]

StreamingText 组件:
  - 根据当前播放时间 → 查找对应 sentence
  - 高亮当前 sentence
  - 已完成 sentence 显示为正常色
```

---

## 5. 版本兼容

```
API 版本通过 WebSocket 连接时的 clientVersion 宣告:
  - 服务端检查 clientVersion
  - 不兼容时发送: { type: "error", payload: { code: "VERSION_MISMATCH" } }
  - 客户端提示刷新页面

版本号规则: MAJOR.MINOR.PATCH
  - MAJOR 不同 = 不兼容
  - MINOR 不同 = 兼容 (服务端可降级)
  - PATCH 不同 = 完全兼容
```

---

## 6. 速率限制

```
REST API:
  - 全局: 100 req/min
  - /api/music/search: 30 req/min (网易云 API 有频率限制)
  - /api/weather/current: 10 req/min (天气 API 调用频率限制)

WebSocket:
  - chat:message: 20 msg/min
  - 超出限制: { type: "error", payload: { code: "RATE_LIMITED", message: "..." } }
```
