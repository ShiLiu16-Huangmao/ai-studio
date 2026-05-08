# AI Radio — 架构设计文档

## 1. 项目概述

个人 AI 电台是一个具备人格感的 AI DJ 系统。它不只是音乐播放器，而是一个有记忆、有情绪、会聊天的深夜电台伴侣。

**核心体验路径**: 用户打开 PWA → DJ 根据时间/天气/用户状态开场 → 聊天互动 → 推荐音乐 → 流式播放 → 记忆沉淀

---

## 2. 完整目录结构

```
ai-radio/
├── client/                          # PWA 前端 (React + Vite + Tailwind)
│   ├── public/
│   │   ├── manifest.json            # PWA manifest
│   │   ├── sw.js                    # Service Worker (离线缓存 + 音频缓存)
│   │   └── icons/                   # PWA 图标集 (192/512)
│   ├── src/
│   │   ├── components/
│   │   │   ├── player/              # 音频播放器组件族
│   │   │   │   ├── PlayerBar.tsx     #   底部常驻播放栏
│   │   │   │   ├── PlayerQueue.tsx   #   播放队列面板
│   │   │   │   ├── VinylDisc.tsx     #   黑胶唱片旋转动画
│   │   │   │   └── Waveform.tsx      #   音频波形可视化
│   │   │   ├── chat/                # 聊天界面组件族
│   │   │   │   ├── ChatPanel.tsx     #   聊天主面板
│   │   │   │   ├── MessageBubble.tsx #   消息气泡 (用户/DJ)
│   │   │   │   ├── StreamingText.tsx #   流式文字渲染
│   │   │   │   └── ChatInput.tsx     #   输入区 (文本/语音)
│   │   │   ├── dj/                  # DJ 人格化 UI
│   │   │   │   ├── DJAvatar.tsx      #   DJ 头像/动画
│   │   │   │   ├── DJStatus.tsx      #   DJ 状态指示 (直播中/休息)
│   │   │   │   └── MoodIndicator.tsx #   当前情绪指示
│   │   │   ├── widgets/             # 信息挂件
│   │   │   │   ├── WeatherWidget.tsx #   天气卡片
│   │   │   │   ├── ScheduleWidget.tsx#   日程卡片
│   │   │   │   └── TimeDisplay.tsx   #   时间/日期显示
│   │   │   └── common/              # 通用 UI 组件
│   │   │       ├── GlassPanel.tsx    #   毛玻璃面板
│   │   │       ├── IconButton.tsx
│   │   │       └── Toast.tsx
│   │   ├── hooks/                   # React Hooks
│   │   │   ├── useWebSocket.ts      #   WebSocket 连接管理
│   │   │   ├── useAudioPlayer.ts    #   音频播放控制
│   │   │   ├── useStreamingTTS.ts   #   流式 TTS 接收
│   │   │   ├── useMediaSession.ts   #   Media Session API
│   │   │   └── usePWA.ts            #   PWA 安装/更新
│   │   ├── stores/                  # Zustand 状态管理
│   │   │   ├── playerStore.ts       #   播放器状态
│   │   │   ├── chatStore.ts         #   聊天状态
│   │   │   ├── djStore.ts           #   DJ 人格状态
│   │   │   ├── widgetStore.ts       #   挂件数据状态
│   │   │   └── appStore.ts          #   应用全局状态
│   │   ├── services/                # 前端服务层
│   │   │   ├── apiClient.ts         #   REST API 客户端
│   │   │   ├── wsClient.ts          #   WebSocket 客户端
│   │   │   └── audioContext.ts      #   Web Audio API 封装
│   │   ├── lib/                     # 工具函数
│   │   │   ├── time.ts              #   时间格式化
│   │   │   ├── audio.ts             #   音频工具
│   │   │   └── storage.ts           #   localStorage 封装
│   │   ├── types/                   # 前端类型定义
│   │   │   └── index.ts
│   │   ├── App.tsx                  # 根组件
│   │   ├── main.tsx                 # 入口
│   │   └── index.css                # 全局样式 + Tailwind
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── server/                          # Node.js 后端 (Express + WS + Prisma)
│   ├── src/
│   │   ├── core/                    # 核心基础设施
│   │   │   ├── config.ts            #   配置管理 (env + 默认值)
│   │   │   ├── logger.ts            #   结构化日志 (pino)
│   │   │   ├── errors.ts            #   错误类型定义 + 错误中间件
│   │   │   └── di.ts                #   轻量依赖注入容器
│   │   ├── modules/                 # 业务模块 (每个模块独立目录)
│   │   │   ├── chat/                # 聊天模块
│   │   │   │   ├── chat.service.ts  #     会话管理 + 上下文组装
│   │   │   │   ├── chat.router.ts   #     REST 端点
│   │   │   │   ├── chat.ws.ts       #     WebSocket 事件处理
│   │   │   │   └── chat.types.ts    #     模块类型
│   │   │   ├── music/               # 音乐模块
│   │   │   │   ├── music.service.ts #     搜索/推荐/播放列表
│   │   │   │   ├── music.router.ts
│   │   │   │   ├── music.ws.ts
│   │   │   │   └── music.types.ts
│   │   │   ├── weather/             # 天气模块
│   │   │   │   ├── weather.service.ts#    获取/缓存天气
│   │   │   │   ├── weather.router.ts
│   │   │   │   ├── weather.scheduler.ts#  定时播报调度
│   │   │   │   └── weather.types.ts
│   │   │   ├── schedule/            # 日程模块
│   │   │   │   ├── schedule.service.ts
│   │   │   │   ├── schedule.router.ts
│   │   │   │   ├── schedule.scheduler.ts
│   │   │   │   └── schedule.types.ts
│   │   │   ├── memory/              # 记忆模块
│   │   │   │   ├── memory.service.ts#    存储/检索/巩固
│   │   │   │   ├── memory.retriever.ts#  检索算法
│   │   │   │   ├── memory.consolidator.ts# 记忆巩固
│   │   │   │   ├── memory.router.ts
│   │   │   │   └── memory.types.ts
│   │   │   ├── persona/             # 人格模块
│   │   │   │   ├── persona.service.ts#   提示词组装/注入
│   │   │   │   ├── persona.templates.ts# 模板管理
│   │   │   │   └── persona.types.ts
│   │   │   ├── audio/               # 音频模块
│   │   │   │   ├── audio.service.ts #    TTS 调用 + 流式输出
│   │   │   │   ├── audio.pipeline.ts#    音频处理管道
│   │   │   │   ├── audio.router.ts
│   │   │   │   └── audio.types.ts
│   │   │   └── system/              # 系统模块
│   │   │       ├── health.router.ts #    健康检查
│   │   │       └── system.service.ts#    定时任务调度
│   │   ├── services/                # 外部服务适配器
│   │   │   ├── claude/
│   │   │   │   ├── claude.client.ts #      Claude API 封装
│   │   │   │   ├── claude.stream.ts #      流式响应处理
│   │   │   │   └── claude.types.ts
│   │   │   ├── fish-audio/
│   │   │   │   ├── fish.client.ts   #      Fish Audio TTS API
│   │   │   │   └── fish.types.ts
│   │   │   ├── netease/
│   │   │   │   ├── netease.client.ts#      网易云 API 封装
│   │   │   │   └── netease.types.ts
│   │   │   └── weather/
│   │   │       ├── weather.client.ts#      天气 API 封装
│   │   │       └── weather.types.ts
│   │   ├── db/                      # 数据库层
│   │   │   ├── schema.prisma        #   Prisma Schema
│   │   │   ├── repositories/        #   数据访问层 (每个表一个)
│   │   │   │   ├── conversation.repo.ts
│   │   │   │   ├── message.repo.ts
│   │   │   │   ├── memory.repo.ts
│   │   │   │   ├── preference.repo.ts
│   │   │   │   ├── playHistory.repo.ts
│   │   │   │   └── scheduleItem.repo.ts
│   │   │   └── seed.ts              #   初始数据
│   │   ├── ws/                      # WebSocket 基础设施
│   │   │   ├── wsServer.ts          #   WS 服务启动 + 连接管理
│   │   │   ├── wsRouter.ts          #   事件路由分发
│   │   │   └── wsTypes.ts           #   事件类型定义
│   │   ├── middleware/              # Express 中间件
│   │   │   ├── errorHandler.ts
│   │   │   ├── requestLogger.ts
│   │   │   └── cors.ts
│   │   ├── routes/                  # 路由注册
│   │   │   └── index.ts             #   统一挂载所有模块路由
│   │   └── app.ts                   # Express 应用入口 (createApp)
│   ├── prompts/                     # Prompt 模板 (markdown)
│   │   ├── system/
│   │   │   ├── dj-persona.md        #   DJ 人格定义
│   │   │   ├── music-recommend.md   #   音乐推荐规则
│   │   │   └── chat-rules.md        #   对话规则
│   │   └── dynamic/
│   │       ├── weather-intro.md     #   天气播报模板
│   │       ├── schedule-intro.md    #   日程播报模板
│   │       ├── mood-detect.md       #   情绪识别提示
│   │       └── memory-context.md    #   记忆上下文模板
│   ├── data/                        # 本地数据 (gitignore)
│   │   └── radio.db
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                          # 前后端共享 (类型 + 常量 + 事件枚举)
│   ├── types.ts                     #   共享类型定义
│   ├── constants.ts                 #   共享常量
│   └── events.ts                    #   WebSocket 事件枚举
│
├── docs/                            # 设计文档
│   ├── architecture.md
│   ├── roadmap.md
│   ├── api-design.md
│   └── memory-system.md
│
├── scripts/                         # 开发/部署脚本
│   ├── dev.sh                       #   启动开发环境
│   └── seed-db.ts                   #   数据库种子脚本
│
├── .claude/                         # Claude Code 配置
│   └── settings.json
│
├── package.json                     # 根 workspace (npm workspaces)
├── tsconfig.json                    # 根 tsconfig
├── CLAUDE.md                        # Claude Code 项目文档
└── .gitignore
```

### 目录设计原则

| 原则 | 实现 |
|------|------|
| **模块低耦合** | 每个 `modules/*` 自包含 service/router/ws/types，不允许跨模块直接引用内部实现 |
| **服务层隔离** | `services/*` 是外部 API 的薄封装，模块通过 service 调用，不直接依赖外部 SDK |
| **共享最小化** | `shared/` 只放真正的共享品（类型、事件枚举），不放业务逻辑 |
| **提示词外置** | `prompts/` 以 markdown 文件管理，支持热更新，不走代码部署 |
| **前端分层** | components(视图) → hooks(逻辑) → stores(状态) → services(IO)，单向依赖 |

---

## 3. 模块边界

```
┌──────────────────────────────────────────────────────┐
│                    Client (PWA)                       │
│  components ← hooks ← stores ← services → WS/REST   │
└──────────────────────┬───────────────────────────────┘
                       │ WebSocket + REST
┌──────────────────────┴───────────────────────────────┐
│                   Server (Express)                     │
│                                                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │  Chat   │  │  Music  │  │ Weather │  │Schedule │ │
│  │ Module  │  │ Module  │  │ Module  │  │ Module  │ │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘ │
│       │            │            │            │        │
│  ┌────┴────────────┴────────────┴────────────┴────┐  │
│  │              Persona Module                      │  │
│  │         (Prompt Assembly + Context Injection)    │  │
│  └─────────────────────┬───────────────────────────┘  │
│                        │                              │
│  ┌─────────────────────┴───────────────────────────┐  │
│  │              Memory Module                       │  │
│  │         (Retrieve → Inject → Consolidate)        │  │
│  └─────────────────────┬───────────────────────────┘  │
│                        │                              │
│  ┌─────────────────────┴───────────────────────────┐  │
│  │              Audio Module                        │  │
│  │         (TTS → Stream → Pipeline)                │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │            External Services                     │  │
│  │  Claude API │ Fish Audio │ NetEase │ Weather API │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │            Data Layer                             │  │
│  │  SQLite + Prisma + Repositories                  │  │
│  └─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### 模块职责与边界

#### Chat Module
- **职责**: 会话生命周期、消息 CRUD、上下文组装、调用 Persona 生成回复
- **输入**: 用户消息文本、当前会话 ID
- **输出**: DJ 回复文本（含结构化 action 标记）、流式 token
- **不负责**: 不直接调用 Claude API、不组装 system prompt、不处理音频
- **依赖**: Persona Module（获取 prompt）、Memory Module（获取记忆）、Claude Service（发送请求）

#### Music Module
- **职责**: 音乐搜索、心情→曲目推荐、播放列表生成、播放历史记录
- **输入**: 搜索关键词 / 情绪标签 / 用户偏好
- **输出**: 曲目信息、播放列表、推荐理由
- **不负责**: 不处理音频流、不直接播放
- **依赖**: NetEase Service

#### Weather Module
- **职责**: 天气数据获取、缓存、定时播报触发、格式化为自然语言片段
- **输入**: 位置信息（配置）
- **输出**: 结构化天气数据 + DJ 口播文案
- **不负责**: 不直接推送消息到客户端（由 Chat Module 调度）
- **依赖**: Weather API Service

#### Schedule Module
- **职责**: 日程 CRUD、定时提醒触发、日程→自然语言播报
- **输入**: 用户日程数据
- **输出**: 即将到来的日程列表 + 口播文案
- **不负责**: 不处理日历同步（v2）、不直接推送
- **依赖**: 无外部服务

#### Memory Module
- **职责**: 记忆存储/检索/巩固/衰减，用户画像维护
- **输入**: 对话内容、用户反馈、系统事件
- **输出**: 相关记忆列表、用户偏好摘要、情绪历史
- **不负责**: 不直接修改对话内容
- **依赖**: 本地 embedding 模型（可选）/ 关键词匹配回退

#### Persona Module
- **职责**: DJ 人格定义、System Prompt 组装、动态上下文注入、语气控制
- **输入**: 当前时间、天气、日程、记忆、用户情绪
- **输出**: 完整的 System Prompt + 动态注入片段
- **不负责**: 不存储对话、不调用 LLM
- **依赖**: Memory Module、Weather Module、Schedule Module（只读数据）

#### Audio Module
- **职责**: TTS 文本→语音流转换、音频格式处理、流式传输
- **输入**: DJ 回复文本
- **输出**: PCM/MP3 音频流 chunks
- **不负责**: 不管理播放队列（前端负责）
- **依赖**: Fish Audio Service

#### System Module
- **职责**: 健康检查、定时任务调度（播报触发）、配置管理、日志
- **输入**: 系统时间、配置
- **输出**: 调度事件
- **依赖**: 无

### 模块间通信规则

1. **同步调用**: 模块间通过 service 方法调用，返回值
2. **事件驱动**: 定时任务通过 System Module 触发，Chat Module 消费
3. **禁止循环依赖**: Persona → Memory/Weather/Schedule，但不能反向依赖
4. **数据传递**: 使用 shared types，不传递 ORM 实体

---

## 4. 数据流设计

### 4.1 主交互流 (用户聊天 → DJ 回复 → 语音播放)

```
User Input (Text)
    │
    ▼
[Client] chatStore.addMessage(userMessage)
    │
    ▼
[Client] wsClient.send({ type: "chat:message", payload: { text, conversationId } })
    │
    ▼
[Server] ChatModule.handleMessage()
    │
    ├─► MemoryModule.retrieve(userId, messageText, currentContext)
    │       └─► 返回相关记忆列表
    │
    ├─► WeatherModule.getCurrent()
    │       └─► 返回当前天气快照
    │
    ├─► ScheduleModule.getUpcoming()
    │       └─► 返回即将到来的日程
    │
    ├─► PersonaModule.assemblePrompt({
    │       memories, weather, schedule, time, userProfile
    │   })
    │       └─► 返回完整 system prompt + messages
    │
    ├─► ClaudeService.streamChat(systemPrompt, messages)
    │       └─► 返回 ReadableStream<token>
    │
    ├─► [并行] AudioModule.streamTTS(tokenStream)
    │       └─► 每个 token 或短句 → TTS → audio chunk
    │
    ├─► [WS] → Client: chat:response (text token)
    │   [WS] → Client: audio:chunk   (audio data)
    │
    └─► [异步] MemoryModule.consolidate(conversation)
            └─► 提取关键信息 → 存储为记忆
```

### 4.2 自动播报流 (定时触发)

```
SystemModule.scheduler (cron)
    │
    ▼
触发 "auto-broadcast" 事件
    │
    ├─► WeatherModule.getCurrent()
    ├─► ScheduleModule.getUpcoming()
    ├─► MemoryModule.getRecentContext()
    │
    ▼
PersonaModule.assembleAutoBroadcastPrompt(...)
    │
    ▼
ClaudeService.streamChat(...)
    │
    ▼
AudioModule.streamTTS(...)
    │
    ▼
[WS] → Client: chat:response + audio:chunk
```

### 4.3 音乐推荐流

```
User: "放一首适合下雨天的歌"
    │
    ▼
ChatModule → Claude 解析意图 → { action: "recommend_music", params: { mood: "rainy" } }
    │
    ▼
MusicModule.recommend({ mood: "rainy", userId })
    ├─► 查询用户偏好 (Preference)
    ├─► 查询播放历史 (PlayHistory) → 避免重复
    ├─► NetEaseService.search(keywords, genre)
    │
    ▼
返回曲目列表 → Persona 生成推荐语 → 一起返回给用户
    │
    ▼
[WS] → Client: chat:response + music:track
    │
    ▼
[Client] playerStore.addToQueue(track) → 自动播放
```

### 4.4 数据流关键原则

1. **所有 LLM 调用走 Chat Module**：其他模块不直接调用 Claude
2. **流式优先**：文本和音频都走 stream，不做全量缓存后再发送
3. **记忆异步写入**：记忆巩固在响应完成后异步执行，不阻塞回复
4. **天气/日程带缓存**：5 分钟内不重复请求外部 API
5. **音乐推荐本地优先**：先查历史+偏好，再远程搜索

---

## 5. 状态管理设计

### 5.1 前端 Stores (Zustand)

```
appStore
├── connectionStatus: 'connecting' | 'connected' | 'disconnected'
├── appMode: 'idle' | 'chatting' | 'playing'
├── isPWAInstalled: boolean
├── theme: 'dark' (电台只有暗色模式)
└── actions: setConnectionStatus, setAppMode

chatStore
├── conversations: Conversation[]
├── activeConversationId: string | null
├── messages: Map<conversationId, Message[]>
├── streamingText: string              // 正在流式接收的文本
├── isStreaming: boolean
├── inputMode: 'text' | 'voice'
└── actions: sendMessage, startStream, appendToken, finishStream

playerStore
├── currentTrack: Track | null
├── queue: Track[]
├── isPlaying: boolean
├── volume: number
├── progress: number                   // 0-100
├── duration: number
├── isBuffering: boolean
└── actions: play, pause, skip, addToQueue, removeFromQueue, setVolume

djStore
├── djName: string
├── currentMood: string                // 'chill' | 'energetic' | 'melancholy' | 'cheerful'
├── status: 'online' | 'broadcasting' | 'resting'
├── currentContext: string             // 当前播报场景描述
└── actions: updateMood, updateStatus

widgetStore
├── weather: WeatherData | null
├── schedule: ScheduleItem[]
├── lastWeatherUpdate: number
├── lastScheduleUpdate: number
└── actions: updateWeather, updateSchedule

audioStore (纯前端，不持久化)
├── audioContext: AudioContext | null
├── sourceNode: AudioBufferSourceNode | null
├── gainNode: GainNode | null
├── analyserNode: AnalyserNode | null   // 用于波形可视化
└── actions: initAudioContext, playChunk, stop
```

### 5.2 服务端状态

服务端除数据库外**无状态**（stateless），通过以下方式保持扩展性：

- WebSocket 连接状态存在 `wsServer` 的 Map 中（内存）
- 流式传输状态跟随单次连接生命周期
- 所有持久化状态走 SQLite

### 5.3 状态同步策略

```
客户端 ←→ 服务端
─────────────────
聊天消息: 客户端乐观更新 + 服务端确认
播放状态: 客户端本地权威 (播放器归前端管)
DJ 状态:  服务端推送 (服务端决定 DJ 什么时候说话)
天气/日程: 客户端请求 + 服务端推送更新
```

---

## 6. 音频流设计

### 6.1 整体管道

```
Claude 文本流 (token by token)
    │
    ▼
Sentence Boundary Detector
    积累到完整句子或标点 (. ! ? , 。)
    │
    ▼
Fish Audio TTS API (streaming mode)
    输入: 文本句子 + voice_id
    输出: PCM audio chunks (base64 / binary)
    │
    ▼
[可选] Audio Transcoding (ffmpeg/wasm)
    PCM → MP3 (降低带宽)
    │
    ▼
WebSocket → Client (audio:chunk event)
    每个 chunk: { sequence: number, data: base64, format: 'mp3', sentence: string }
    │
    ▼
[Client] MediaSource API 流式播放
    或 fetch + decodeAudioData 逐段播放
```

### 6.2 关键技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| TTS 流式协议 | Fish Audio streaming API | 原生的流式 TTS，延迟最低 |
| 音频格式 | MP3 @ 128kbps | 兼容性好，体积小，适合流式 |
| 客户端播放 | MediaSource API | 原生支持流式拼接，无额外依赖 |
| 缓冲策略 | 预加载 2 个句子 | 平衡延迟与流畅度 |
| 断点续传 | 不支持（每句独立） | 简化实现，失败影响范围小 |

### 6.3 流式时序

```
T=0ms   用户发送消息
T=200ms Claude 返回第一个 token
T=300ms 第一个完整句子形成 → 发送 TTS
T=800ms TTS 返回第一个音频 chunk → WebSocket → 客户端
T=900ms 用户听到第一个字
───────
目标: 端到端延迟 < 1.5 秒 (首字)
```

### 6.4 客户端音频缓冲

```
MediaSource SourceBuffer 队列:
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Chunk 1 │ │ Chunk 2 │ │ Chunk 3 │ ...
└─────────┘ └─────────┘ └─────────┘
     ↓
  Audio Element 连续播放 (无缝拼接)
```

---

## 7. WebSocket 事件设计

### 7.1 事件枚举 (shared/events.ts)

```typescript
// ========== Client → Server ==========
export const ClientEvents = {
  // 聊天
  CHAT_MESSAGE:     'chat:message',      // 发送消息
  CHAT_TYPING:      'chat:typing',        // 正在输入
  CHAT_STOP:        'chat:stop',          // 中断生成

  // 播放器
  PLAYER_ACTION:    'player:action',      // play/pause/skip/seek
  PLAYER_SYNC:      'player:sync',        // 请求状态同步
  PLAYER_QUEUE:     'player:queue',       // 更新队列

  // 用户
  USER_PRESENCE:    'user:presence',      // online/away
  USER_PREFERENCE:  'user:preference',    // 更新偏好

  // 系统
  PING:             'ping',               // 心跳
} as const;

// ========== Server → Client ==========
export const ServerEvents = {
  // 聊天响应
  CHAT_TOKEN:       'chat:token',         // 流式文本 token
  CHAT_DONE:        'chat:done',          // 回复完成
  CHAT_ACTION:      'chat:action',        // 结构化动作 (音乐推荐等)

  // 音频
  AUDIO_CHUNK:      'audio:chunk',        // 音频数据块
  AUDIO_START:      'audio:start',        // 音频流开始
  AUDIO_END:        'audio:end',          // 音频流结束

  // 音乐
  MUSIC_TRACK:      'music:track',        // 曲目信息
  MUSIC_PLAYLIST:   'music:playlist',     // 播放列表

  // 数据更新
  WEATHER_UPDATE:   'weather:update',     // 天气数据
  SCHEDULE_UPDATE:  'schedule:update',    // 日程更新

  // DJ 状态
  DJ_STATE:         'dj:state',           // DJ 状态变更
  DJ_MOOD:          'dj:mood',            // DJ 情绪变更

  // 系统
  SYSTEM_EVENT:     'system:event',       // 系统通知
  ERROR:            'error',              // 错误信息
  PONG:             'pong',               // 心跳响应
} as const;
```

### 7.2 事件载荷约定

```typescript
// 通用事件包装
interface WSEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
  seq: number;          // 事件序号 (用于重连去重)
}

// Client → Server
interface ChatMessagePayload {
  conversationId: string;
  text: string;
}

interface PlayerActionPayload {
  action: 'play' | 'pause' | 'skip' | 'seek';
  value?: number;       // seek 时的时间 (秒)
  trackId?: string;
}

// Server → Client
interface ChatTokenPayload {
  conversationId: string;
  token: string;
  index: number;        // token 序号
}

interface AudioChunkPayload {
  conversationId: string;
  messageId: string;
  data: string;         // base64 编码音频
  format: 'mp3' | 'pcm';
  sequence: number;
  sentence: string;     // 对应的文字 (用于字幕同步)
}

interface MusicTrackPayload {
  track: {
    id: string;
    name: string;
    artist: string;
    album: string;
    coverUrl: string;
    mp3Url: string;
    duration: number;
    source: 'netease' | 'local';
  };
  recommendReason?: string;  // DJ 推荐语
}

interface DJStatePayload {
  status: 'online' | 'broadcasting' | 'resting';
  mood?: string;
  currentSegment?: string;  // 当前环节描述
}
```

### 7.3 连接生命周期

```
Client                           Server
  │                                │
  ├──── ws connect ──────────────►│
  │                                ├─ 验证/鉴权
  │◄─── connected (ack) ──────────┤
  │                                │
  │◄─── dj:state (当前 DJ 状态) ──┤  (初始状态推送)
  │◄─── weather:update ───────────┤  (当前天气)
  │◄─── schedule:update ──────────┤  (今日日程)
  │                                │
  ├──── ping (每 30s) ───────────►│
  │◄─── pong ─────────────────────┤
  │                                │
  │         ... 正常通信 ...        │
  │                                │
  │◄─── error / disconnect ───────┤
  │                                │
  ├──── 自动重连 (backoff 1s→30s)  │
  │                                │
  ├──── player:sync (重连后同步) ──┤
```

### 7.4 重连策略

```
重连间隔: 1s → 2s → 4s → 8s → 16s → 30s (cap)
重连成功后: 自动发送 player:sync + 请求最新 weather/schedule
连接断开时 UI: DJ 状态显示 "连接中..."，播放器继续本地播放
```

---

## 8. 数据库结构

### 8.1 Prisma Schema

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:../data/radio.db"
}

generator client {
  provider = "prisma-client-js"
}

// ==================== 用户 ====================
model User {
  id          String         @id @default(cuid())
  name        String         @default("听众")
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  conversations Conversation[]
  memories      Memory[]
  preference    Preference?
  playHistory   PlayHistory[]
  scheduleItems ScheduleItem[]
  moodHistory   MoodRecord[]
}

// ==================== 对话 ====================
model Conversation {
  id        String    @id @default(cuid())
  userId    String
  title     String?           // 自动生成的主题
  mood      String?           // 会话整体情绪
  context   String?           // JSON: { weather, time, schedule }
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  messages  Message[]
  user      User      @relation(fields: [userId], references: [id])

  @@index([userId, createdAt])
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  role           String   // "user" | "assistant" | "system"
  content        String
  metadata       String?  // JSON: { action?, music?, weather? }
  tokensUsed     Int?
  createdAt      DateTime @default(now())

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  audioClip      AudioClip?

  @@index([conversationId, createdAt])
}

model AudioClip {
  id        String   @id @default(cuid())
  messageId String   @unique
  filePath  String?          // 本地存储路径
  duration  Float?           // 秒
  size      Int?             // bytes
  createdAt DateTime @default(now())

  message   Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
}

// ==================== 记忆 ====================
model Memory {
  id          String   @id @default(cuid())
  userId      String
  type        String   // "fact" | "preference" | "event" | "emotion" | "relationship"
  content     String
  embedding   String?          // JSON array of floats (本地 embedding)
  sourceMsgId String?          // 来源消息 ID
  importance  Float    @default(0.5)
  accessCount Int      @default(0)
  lastAccess  DateTime @default(now())
  decayFactor Float    @default(1.0)  // 衰减因子 (随时间递减)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id])

  @@index([userId, type])
  @@index([userId, importance])
  @@index([userId, lastAccess])
}

// ==================== 用户偏好 ====================
model Preference {
  id          String  @id @default(cuid())
  userId      String  @unique
  musicGenres String? // JSON: ["jazz", "lofi", "citypop"]
  voiceId     String? // Fish Audio voice ID
  djName      String? // 用户给 DJ 起的名字
  timezone    String  @default("Asia/Shanghai")
  location    String? // 天气城市

  user        User    @relation(fields: [userId], references: [id])
}

// ==================== 播放历史 ====================
model PlayHistory {
  id        String   @id @default(cuid())
  userId    String
  trackId   String
  trackName String
  artist    String
  album     String?
  coverUrl  String?
  source    String   // "netease" | "local" | "url"
  playedAt  DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])

  @@index([userId, playedAt])
}

// ==================== 日程 ====================
model ScheduleItem {
  id        String    @id @default(cuid())
  userId    String
  title     String
  time      String    // HH:mm 格式
  date      String?   // YYYY-MM-DD (空=每日)
  repeat    String?   // "daily" | "weekly" | cron表达式
  enabled   Boolean   @default(true)
  createdAt DateTime  @default(now())

  user      User      @relation(fields: [userId], references: [id])

  @@index([userId, time])
}

// ==================== 情绪记录 ====================
model MoodRecord {
  id        String    @id @default(cuid())
  userId    String
  mood      String    // "chill" | "energetic" | "melancholy" | "cheerful" | "neutral"
  source    String    // "user_stated" | "detected" | "system"
  context   String?   // 触发场景
  createdAt DateTime  @default(now())

  user      User      @relation(fields: [userId], references: [id])

  @@index([userId, createdAt])
}
```

### 8.2 数据库设计原则

| 原则 | 实现 |
|------|------|
| **JSON 字段克制** | 只对确实动态的结构用 JSON（genres, metadata, context），核心字段保持列化 |
| **索引覆盖查询** | 常用查询路径都有索引覆盖 |
| **级联删除** | 删除会话 → 自动删除消息 + 音频 |
| **单用户优化** | 当前只服务一人，但 Schema 预留 userId 以便未来扩展 |
| **Embedding 内联** | 嵌入向量直接存 JSON 字符串，避免额外向量数据库依赖 |

---

## 9. Prompt 工程结构

### 9.1 分层组装

```
System Prompt = 人格层 + 规则层 + 上下文层 + 指令层

Layer 1: 人格层 (prompts/system/dj-persona.md)
    ├── DJ 身份定义
    ├── 说话风格
    ├── 口头禅
    └── 情感基调 (温暖/陪伴/不油腻)

Layer 2: 规则层 (prompts/system/chat-rules.md)
    ├── 回复长度控制
    ├── 何时推荐音乐
    ├── 何时不打扰
    └── 安全边界

Layer 3: 上下文层 (动态注入)
    ├── 当前时间 → 时段氛围描述
    ├── 天气快照 → 天气问候素材
    ├── 近期记忆 → 个性化引用
    ├── 用户情绪 → 语气适配
    └── 今日日程 → 提醒素材

Layer 4: 指令层 (按场景注入)
    ├── 音乐推荐场景 → music-recommend.md
    ├── 天气播报场景 → weather-intro.md
    ├── 日程播报场景 → schedule-intro.md
    └── 情绪识别场景 → mood-detect.md
```

### 9.2 System Prompt 组装流程

```typescript
// PersonaModule.assemblePrompt()
async function assemblePrompt(ctx: ChatContext): Promise<PromptResult> {
  const layers: string[] = [];

  // Layer 1: 人格 (缓存，启动时加载)
  layers.push(await loadTemplate('system/dj-persona.md'));

  // Layer 2: 规则 (缓存，启动时加载)
  layers.push(await loadTemplate('system/chat-rules.md'));

  // Layer 3: 上下文 (每次动态生成)
  const contextBlock = [
    `【当前时间】${formatTime(ctx.now)} — ${describeTimeOfDay(ctx.now)}`,
    ctx.weather ? await renderTemplate('dynamic/weather-intro.md', ctx.weather) : '',
    ctx.schedule.length > 0 ? await renderTemplate('dynamic/schedule-intro.md', { items: ctx.schedule }) : '',
    ctx.memories.length > 0 ? await renderTemplate('dynamic/memory-context.md', { memories: ctx.memories }) : '',
    ctx.userMood ? `【用户当前情绪】${ctx.userMood}` : '',
  ].filter(Boolean).join('\n\n');
  layers.push(contextBlock);

  // Layer 4: 指令 (按需)
  if (ctx.intent === 'recommend_music') {
    layers.push(await loadTemplate('system/music-recommend.md'));
  }

  return {
    systemPrompt: layers.join('\n\n---\n\n'),
    messages: ctx.recentMessages,  // 最近 N 轮对话
  };
}
```

### 9.3 Prompt 模板示例

```markdown
<!-- prompts/system/dj-persona.md -->

你叫「夜汐」，是一档深夜电台的 AI DJ。

**你的风格**:
- 像老朋友一样说话，温暖但不越界
- 偶尔文艺，但不矫情
- 懂得在合适的时候推荐一首歌
- 不需要一直说话，适当留白

**你的口头禅**:
- "这首歌送给还没睡的你"
- "今晚的月色很适合..."
- "我记得你上次说..."

**你不做的事**:
- 不说教、不评判
- 不假装自己是人类
- 不在用户不想说话时硬聊
- 不推荐不符合用户品味的歌
```

### 9.4 设计原则
- **Markdown 外置**: 修改 Prompt 不需要重新部署代码
- **分层独立**: 改人格不影响规则，改规则不影响上下文
- **模板引擎轻量**: 用简单的 `{{variable}}` 替换，不引入重型模板库
- **Token 预算管理**: System Prompt 控制在 800 token 以内，留给对话足够空间

---

## 10. 技术选型理由

| 技术 | 选择理由 |
|------|----------|
| **SQLite** | 零配置、单文件、足够单用户场景、备份就是复制文件 |
| **Prisma** | 类型安全、迁移管理、单人开发效率高 |
| **Zustand** | 比 Redux 轻、比 Context 性能好、API 简单 |
| **WebSocket (ws)** | 双向流式通信、Node.js 原生支持好、比 SSE 灵活 |
| **Vite** | 开发启动快、HMR、与 React 配合成熟 |
| **Tailwind** | 组件级样式隔离、不产生 CSS 冲突、适合单人迭代 |
| **Express** | 生态最大、中间件丰富、没有学习成本 |
| **PWA** | Service Worker 离线缓存、Media Session API、接近原生体验 |

---

## 11. 安全与隐私

- 所有数据本地存储 (`data/radio.db`)，不上传云端
- API Key 通过环境变量注入，不入库
- 无用户认证系统（单用户、本地访问）
- PWA Service Worker 只缓存静态资源，不缓存聊天内容
- 音频文件本地缓存，定期清理
