# AI Radio — 开发阶段规划

## 总体策略

- **每阶段 2 周，总计 14 周**
- **每阶段结束有可交付物**（能跑、能演示）
- **MVP 在 Phase 3 结束**（能聊天 + 能语音播放）
- **单人开发友好**：每阶段拆分 Task，粒度控制在半天以内
- **Claude Code 持续开发**：每个 Task 可独立交给 Claude Code 实现

---

## Phase 1: 地基 (Week 1-2)

### 目标
项目骨架跑通：前端能访问后端，WebSocket 能收发消息，数据库能读写。

### 任务清单

| # | 任务 | 产出 | 估时 |
|---|------|------|------|
| 1.1 | 初始化 monorepo (npm workspaces) | 根 package.json, tsconfig.json | 0.5h |
| 1.2 | 搭建 server 骨架 (Express + WS) | app.ts, wsServer.ts, 健康检查端点 | 2h |
| 1.3 | 搭建 client 骨架 (Vite + React + Tailwind) | App.tsx, vite.config.ts, tailwind.config.ts | 2h |
| 1.4 | 配置 Prisma + SQLite | schema.prisma, 初始迁移, seed 脚本 | 2h |
| 1.5 | 实现 shared 类型 + 事件枚举 | shared/types.ts, shared/events.ts | 1h |
| 1.6 | 建立 WebSocket 基础通道 | 前后端 WS 连接/心跳/重连 | 3h |
| 1.7 | 实现模块目录骨架 | 所有 8 个模块的目录 + 空文件 | 0.5h |
| 1.8 | 配置开发脚本 (dev.sh) | 一键启动前后端 + 数据库 | 1h |
| 1.9 | 编写 CLAUDE.md | Claude Code 项目文档 | 1h |
| 1.10 | 配置 PWA manifest + sw.js 骨架 | 可安装的空白 PWA | 2h |

### 验收标准
- [ ] `npm run dev` 一键启动前后端
- [ ] 浏览器访问 `localhost:5173` 看到空白 App 壳
- [ ] WebSocket 连接成功，心跳正常
- [ ] SQLite 数据库自动创建，表结构正确
- [ ] PWA 可安装到桌面

---

## Phase 2: 核心对话 (Week 3-4)

### 目标
DJ 能聊天了：用户发消息 → Claude 返回回复 → 前端显示（纯文本，无语音）。

### 任务清单

| # | 任务 | 产出 | 估时 |
|---|------|------|------|
| 2.1 | 实现 Claude API 客户端 | claude.client.ts, claude.stream.ts | 3h |
| 2.2 | 实现 DJ 人格模板 v1 | dj-persona.md, chat-rules.md | 2h |
| 2.3 | 实现 PersonaModule (prompt 组装) | persona.service.ts, persona.templates.ts | 3h |
| 2.4 | 实现 ChatModule (会话管理) | chat.service.ts, chat.router.ts | 4h |
| 2.5 | 实现 Chat WebSocket 事件 | chat.ws.ts, chat:message → chat:token | 3h |
| 2.6 | 实现 Conversation + Message Repository | conversation.repo.ts, message.repo.ts | 2h |
| 2.7 | 实现前端 Chat 组件 | ChatPanel, MessageBubble, StreamingText | 4h |
| 2.8 | 实现前端 chatStore | chatStore.ts (Zustand) | 2h |
| 2.9 | 实现前端 useWebSocket hook | useWebSocket.ts | 2h |
| 2.10 | 对话历史持久化 + 恢复 | 数据库读写 + 前端历史列表 | 2h |

### 验收标准
- [ ] 用户在 ChatPanel 输入文字 → 发送
- [ ] DJ 以"夜汐"人设回复，文字流式显示
- [ ] 对话历史保存到 SQLite
- [ ] 刷新页面后历史对话可恢复
- [ ] System Prompt 人格一致（温暖、不油腻、不越界）

---

## Phase 3: 语音与音频 (Week 5-6) — MVP 完成

### 目标
DJ 有声音了：回复文本 → TTS 转语音 → 客户端流式播放。

### 任务清单

| # | 任务 | 产出 | 估时 |
|---|------|------|------|
| 3.1 | 实现 Fish Audio TTS 客户端 | fish.client.ts, 流式 TTS | 3h |
| 3.2 | 实现 AudioModule (音频管道) | audio.service.ts, audio.pipeline.ts | 4h |
| 3.3 | 实现句子边界检测器 | Sentence boundary detection | 1h |
| 3.4 | 实现音频 WebSocket 事件 | audio:start/chunk/end | 2h |
| 3.5 | 实现前端 MediaSource 播放器 | useAudioPlayer.ts, audioContext.ts | 4h |
| 3.6 | 实现 PlayerBar 组件 | PlayerBar.tsx (底部播放栏) | 3h |
| 3.7 | 实现 playerStore | playerStore.ts | 2h |
| 3.8 | 实现流式文本+语音同步 | StreamingText.tsx 高亮当前播放句 | 2h |
| 3.9 | 实现 Media Session API | useMediaSession.ts (锁屏控制) | 1h |
| 3.10 | 音频播放器完整交互 | 播放/暂停/音量/进度 | 2h |
| 3.11 | 音频文件本地缓存 | Service Worker 音频缓存 | 2h |

### 验收标准
- [ ] 用户发消息 → DJ 文字流式显示 + 语音同步播放
- [ ] 播放/暂停/音量控制正常
- [ ] 锁屏界面显示歌曲信息
- [ ] 音频播放流畅无卡顿
- [ ] 端到端延迟 < 2 秒

---

## Phase 4: 音乐集成 (Week 7-8)

### 目标
DJ 能推歌了：根据对话情绪/用户请求 → 推荐音乐 → 流式播放。

### 任务清单

| # | 任务 | 产出 | 估时 |
|---|------|------|------|
| 4.1 | 实现网易云 API 客户端 | netease.client.ts (搜索+歌曲详情+播放URL) | 4h |
| 4.2 | 实现 MusicModule | music.service.ts (搜索/推荐/播放列表) | 4h |
| 4.3 | 实现音乐推荐引擎 v1 | 基于情绪标签 + 用户偏好 | 3h |
| 4.4 | 实现 Claude action 解析 | 从回复中解析 recommend_music 意图 | 2h |
| 4.5 | 实现音乐 WebSocket 事件 | music:track, music:playlist | 2h |
| 4.6 | 实现 PlayHistory Repository | playHistory.repo.ts | 1h |
| 4.7 | 实现前端 PlayerQueue 组件 | PlayerQueue.tsx (播放列表) | 3h |
| 4.8 | 实现 VinylDisc 动画 | VinylDisc.tsx (黑胶旋转) | 2h |
| 4.9 | 实现 Waveform 可视化 | Waveform.tsx (Web Audio API) | 2h |
| 4.10 | 音乐播放完整链路调试 | 推荐→获取URL→播放→历史记录 | 3h |

### 验收标准
- [ ] 用户说"推荐一首歌" → DJ 推荐 + 自动播放
- [ ] 用户说"来点摇滚" → 推荐摇滚风格曲目
- [ ] DJ 根据时段/情绪主动推荐（如深夜→lofi）
- [ ] 播放历史记录正确
- [ ] 播放队列可管理（添加/移除/排序）

---

## Phase 5: 智能功能 (Week 9-10)

### 目标
DJ 有"眼睛"了：自动感知天气、时间、日程，并据此调整播报内容。

### 任务清单

| # | 任务 | 产出 | 估时 |
|---|------|------|------|
| 5.1 | 实现天气 API 客户端 | weather.client.ts | 2h |
| 5.2 | 实现 WeatherModule | weather.service.ts + 缓存 | 3h |
| 5.3 | 实现天气定时播报 | weather.scheduler.ts | 2h |
| 5.4 | 实现天气播报 Prompt 模板 | weather-intro.md | 1h |
| 5.5 | 实现 ScheduleModule | schedule.service.ts + CRUD | 3h |
| 5.6 | 实现日程定时提醒 | schedule.scheduler.ts | 2h |
| 5.7 | 实现日程播报 Prompt 模板 | schedule-intro.md | 1h |
| 5.8 | 实现前端 WeatherWidget | WeatherWidget.tsx | 2h |
| 5.9 | 实现前端 ScheduleWidget | ScheduleWidget.tsx | 2h |
| 5.10 | 实现自动播报编排 | SystemModule scheduler 统一调度 | 3h |
| 5.11 | 实现 DJStatus + MoodIndicator | DJ 状态/情绪 UI 组件 | 2h |

### 验收标准
- [ ] 打开 App 时 DJ 播报当前天气
- [ ] 定时（如早8点、晚10点）自动播报天气+日程
- [ ] 日程提醒在设定时间触发
- [ ] 天气/日程数据在 Widget 中正确显示
- [ ] DJ 状态跟随实际行为变化

---

## Phase 6: 记忆系统 (Week 11-12)

### 目标
DJ 有"记忆"了：记得用户说过的话、偏好、情绪历史，回复越来越个性化。

### 任务清单

| # | 任务 | 产出 | 估时 |
|---|------|------|------|
| 6.1 | 实现 Memory Repository | memory.repo.ts (CRUD + 检索) | 2h |
| 6.2 | 实现关键词抽取器 | 从对话中提取关键实体/偏好 | 3h |
| 6.3 | 实现 Memory Consolidator | 对话→记忆摘要 + 重要性评分 | 3h |
| 6.4 | 实现 Memory Retriever | 基于关键词 + 时间衰减的检索 | 3h |
| 6.5 | 实现记忆注入 Prompt 模板 | memory-context.md | 1h |
| 6.6 | 实现用户偏好学习 | 从对话+行为中推断 Genre/风格偏好 | 2h |
| 6.7 | 实现情绪追踪 | MoodRecord 写入 + 情绪历史查询 | 2h |
| 6.8 | 实现情绪感知回复 | 根据近期情绪调整 DJ 语气 | 2h |
| 6.9 | 前端记忆面板 (可选) | 用户可查看/删除记忆 | 2h |
| 6.10 | 记忆系统端到端测试 | 模拟多轮对话验证记忆召回 | 2h |

### 验收标准
- [ ] 用户提到过"喜欢爵士" → 几天后 DJ 记得并推荐爵士
- [ ] 用户说过"明天有面试" → DJ 第二天主动提到
- [ ] 情绪低落时 DJ 语气更温柔
- [ ] 错误记忆可查看/删除
- [ ] 记忆检索不阻塞聊天响应 (< 100ms)

---

## Phase 7: 打磨 (Week 13-14)

### 目标
体验完整、性能稳定、可以日常使用。

### 任务清单

| # | 任务 | 产出 | 估时 |
|---|------|------|------|
| 7.1 | DJ 人格微调 | 优化 prompt，增加人格深度 | 4h |
| 7.2 | UI/UX 全面打磨 | 动画、过渡、毛玻璃效果、响应式 | 6h |
| 7.3 | 夜间模式深度优化 | 低亮度配色、护眼、深色主题 | 2h |
| 7.4 | 错误处理完善 | 网络断开/API故障/超时的优雅降级 | 4h |
| 7.5 | 性能优化 | 前端打包优化、数据库查询优化 | 3h |
| 7.6 | PWA 离线体验 | 离线缓存策略、离线提示 | 2h |
| 7.7 | 音频预加载优化 | 减少播放等待时间 | 2h |
| 7.8 | 日志与监控 | pino 日志配置、关键路径埋点 | 2h |
| 7.9 | 文档完善 | README、开发指南、部署说明 | 2h |
| 7.10 | 端到端测试 | 完整用户场景测试脚本 | 3h |

### 验收标准
- [ ] 所有核心流程无卡顿
- [ ] 网络断开后核心功能仍可用（缓存+离线）
- [ ] 连续使用 1 小时无内存泄漏
- [ ] 移动端适配良好
- [ ] DJ 人格一致性和深度令人满意

---

## 里程碑总览

```
Week  1-2  ████████  Phase 1: 地基
            交付: 项目骨架 + PWA 壳 + WS 通道 + DB

Week  3-4  ████████  Phase 2: 核心对话
            交付: DJ 文字聊天 + Claude 集成 + 对话历史

Week  5-6  ████████  Phase 3: 语音与音频 ★ MVP
            交付: 流式 TTS + 音频播放器 + PWA

Week  7-8  ████████  Phase 4: 音乐集成
            交付: 网易云接入 + 推荐引擎 + 播放队列

Week  9-10 ████████  Phase 5: 智能功能
            交付: 天气/日程播报 + 定时触发 + Widget

Week 11-12 ████████  Phase 6: 记忆系统
            交付: 长期记忆 + 用户画像 + 个性化

Week 13-14 ████████  Phase 7: 打磨
            交付: 完整产品 + 文档 + 性能优化
```

## 开发约定

### 分支策略
- `main` — 始终可运行
- `phase/N-description` — 每阶段一个分支
- 每完成一个 Task 提交一次，不积压

### 提交信息格式
```
<type>(<scope>): <description>

types: feat, fix, refactor, style, docs, chore
scope: chat, music, audio, memory, persona, weather, schedule, system, client, server
```

### Claude Code 协作模式
- 每个 Task 用独立对话实现
- 实现前先让 Claude Code 读取相关 docs 了解上下文
- 关键模块（Persona、Memory、Audio Pipeline）需人工 review
- Prompt 调整直接在 markdown 文件改，不走代码

### 测试策略
- Phase 1-3: 手动测试为主（功能快速迭代）
- Phase 4-6: 核心模块加单元测试（memory retriever, persona assembler, music recommender）
- Phase 7: 端到端场景测试 + 性能基准
