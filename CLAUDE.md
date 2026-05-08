# CLAUDE.md — AI Radio 最高开发规则

## Project Identity

**项目名称**: AI Radio (个人 AI 电台)
**项目性质**: 具备人格感的 AI DJ 系统
**技术栈**: Node.js + TypeScript + React + Vite + Tailwind + Express + WebSocket + SQLite + Prisma
**运行模式**: 本地单用户 PWA
**首席架构文档**: `docs/architecture.md`

---

## 1. Code Rules

### 1.1 TypeScript 铁律

- 所有 `.ts` / `.tsx` 文件必须是严格 TypeScript
- **禁止 `any` 类型** — 无法确定类型时使用 `unknown` + type guard
- **禁止 `as` 强制类型断言** — 使用 type guard 或 zod 验证替代
- 所有函数必须声明返回值类型
- 所有模块导出必须有显式类型定义

```typescript
// ❌ 禁止
function getData(): any { ... }
const x = data as SomeType;

// ✅ 正确
function getData(): GetDataResult { ... }
const x = parseSomeType(data); // type guard
```

### 1.2 类型定义规则

- 共享类型放在 `shared/types.ts`
- 模块私有类型放在 `server/src/modules/<name>/<name>.types.ts`
- 前端类型放在 `client/src/types/index.ts`
- API 请求/响应类型必须与路由定义同文件
- WebSocket 事件载荷类型必须与事件枚举对应

### 1.3 可测试性

- 每个 service 必须是 class 或 pure function 集合，依赖通过构造函数注入
- 外部 API 调用必须通过 adapter 层 (`server/src/services/*`)
- 禁止在 service 中直接 `import` 第三方 SDK（必须通过 adapter）
- Adapter 必须实现 interface，方便 mock
- 数据库操作必须通过 repository 层，禁止 service 中直接调用 `prisma`

```typescript
// ❌ 禁止
class ChatService {
  async reply(text: string) {
    const prisma = new PrismaClient();
    const result = await anthropic.messages.create(...);
  }
}

// ✅ 正确
interface IClaudeAdapter {
  streamChat(prompt: string, messages: Message[]): AsyncIterable<string>;
}

class ChatService {
  constructor(
    private claude: IClaudeAdapter,
    private messageRepo: IMessageRepository,
  ) {}
}
```

### 1.4 错误处理

- 所有异步操作必须有错误边界
- 自定义错误类继承 `AppError`，携带 `code` + `statusCode` + `recoverable`
- API 层错误通过 `errorHandler` 中间件统一拦截
- WebSocket 错误通过 `error` 事件推送
- 禁止 `try { } catch (e) { }` 吞错误 — 至少要 log

### 1.5 状态追踪

- 前端所有全局状态必须通过 Zustand store 管理
- Store 变更必须通过 `actions`，禁止直接 `setState`
- 服务端无状态，所有持久化状态在 SQLite
- 关键状态变更必须打印结构化日志 (pino)
- WebSocket 连接状态必须反映在 `appStore.connectionStatus`

---

## 2. Architecture Rules

### 2.1 模块边界 (最高优先级)

```
禁止跨模块直接依赖:

  Chat ──→ Persona (允许，通过 interface)
  Chat ──→ Memory  (允许，通过 interface)
  Chat ──→ Weather (允许，通过 interface)
  Chat ──→ Claude  (允许，通过 adapter interface)

  Memory ──→ Chat     ❌ 禁止
  Weather ──→ Chat    ❌ 禁止
  Music ──→ Persona   ❌ 禁止
  Schedule ──→ Audio  ❌ 禁止
```

**唯一例外**: Persona Module 可以读取 Weather/Schedule/Memory 模块的**只读查询方法**（仅用于组装 prompt）。

### 2.2 模块通信协议

- 模块间通信必须通过 interface 定义契约
- 接口文件位置:
  - 模块对外接口: `server/src/modules/<name>/<name>.service.ts` 的 class 即为 interface
  - Adapter 接口: `server/src/services/<name>/<name>.client.ts`
- 依赖注入: 通过构造函数传入，在 `app.ts` 中组装依赖图
- 禁止在模块内部 `import` 其他模块的具体实现

### 2.3 分层架构

```
┌─────────────────────────────────┐
│  UI Layer (client/src)          │
│  components → hooks → stores    │
│  只能调用: REST API + WebSocket │
├─────────────────────────────────┤
│  API Layer (server/src/routes)  │
│  路由 → 参数校验 → 调用 service │
│  不包含业务逻辑                  │
├─────────────────────────────────┤
│  Service Layer (modules/*)      │
│  纯业务逻辑                       │
│  调用: adapter + repository     │
├─────────────────────────────────┤
│  Adapter Layer (services/*)     │
│  外部 API 的薄封装               │
│  返回: 领域类型 (非原始响应)     │
├─────────────────────────────────┤
│  Data Layer (db/repositories)   │
│  Prisma 的薄封装                 │
│  返回: 领域类型 (非 Prisma 模型) │
└─────────────────────────────────┘
```

**硬性规则**:
- UI 层不得直接调用第三方 API
- Service 层不得直接操作 DOM
- Adapter 层不得包含业务逻辑
- Data 层不得被 UI 层引用

### 2.4 Brain 层定义

"Brain 层" = Persona Module + Memory Module + Chat Module 的 Service 层组合。

Brain 层规则:
- 不得直接操作 UI 状态
- 不得直接发送 WebSocket 消息（由 Chat Module 的 ws handler 负责）
- 不得直接读写文件系统
- 对外只暴露 service 方法，返回值是纯数据

### 2.5 目录规范

- 新模块必须创建在 `server/src/modules/<name>/`
- 每个模块至少包含: `*.service.ts`, `*.types.ts`
- 可选包含: `*.router.ts`, `*.ws.ts`, `*.scheduler.ts`
- 模块之间不得有文件引用（只能通过 DI 容器引用 service）

---

## 3. AI Rules

### 3.1 Prompt 模块化

- 所有 prompt 存储在 `server/prompts/` 目录
- 结构:
  - `system/` — 静态模板（人格、规则、通用指令），通过 fs.readFile 加载
  - `dynamic/` — 动态模板（天气、日程、记忆），运行时渲染
- 模板引擎: 简单的 `{{variable}}` 替换（使用 `String.prototype.replace`）
- 每个模板文件不超过 200 行

### 3.2 人格设定

- DJ 人格定义存储在 `server/prompts/system/dj-persona.md`
- 人格参数可配置项:
  - DJ 名字（默认"夜汐"）
  - 说话风格标签
  - 口头禅列表
  - 情感基调范围
- 人格修改不需要重新部署代码 — 改文件然后重启服务即可
- 人格文件格式:

```markdown
# DJ 人格定义

## 身份
你叫 {{djName}}，是一档深夜电台的 AI DJ。

## 风格
{{styleTags}}

## 口头禅
{{catchphrases}}

## 规则
{{rules}}
```

### 3.3 用户长期记忆

- 记忆存储位置: SQLite `Memory` 表
- 记忆类型: `fact` | `preference` | `event` | `emotion` | `relationship`
- 记忆检索: 多路召回（关键词 + 时间 + 情绪 + 重要性）
- 记忆注入: 通过 Persona Module 在 prompt 组装时注入
- 记忆管理: 用户可通过 API 查看/删除/纠正记忆
- 记忆不得包含敏感信息摘要（如确切地址、密码等）

### 3.4 Mood 系统

- Mood 必须是连续变化的数值，不允许硬切换
- 使用二维情绪模型: `valence` (-1~1) + `energy` (-1~1)
- 每次对话结束后更新 mood 状态
- Mood 变化速率受限: 单次变化不超过 0.3
- Mood 影响范围:
  - DJ 语气 (valence 低 → 更温柔)
  - 音乐推荐 (energy 低 → 更舒缓)
  - 主动性 (valence 低 → 更少打扰)

```typescript
interface MoodState {
  valence: number;     // -1.0 ~ 1.0
  energy: number;      // -1.0 ~ 1.0
  label: string;       // 派生标签: "chill" | "energetic" | etc
  confidence: number;  // 0.0 ~ 1.0
  updatedAt: Date;
}
```

### 3.5 Claude API 调用规范

- 所有 Claude API 调用必须带 `max_tokens` 限制
- System prompt token 预算: ≤ 800 tokens
- 必须启用 prompt caching (cache control on system prompt)
- 流式调用统一使用 `streamChat` 方法
- 错误重试: 只重试 5xx 错误，最多 2 次，指数退避
- 每次调用记录: token 用量、延迟、是否缓存命中

---

## 4. Audio Rules

### 4.1 TTS 流式

- TTS 必须使用流式模式（Fish Audio streaming API）
- 文本到音频的转换管道: token → 句子边界 → TTS request → audio chunk → WebSocket
- 句子边界检测: 遇到 `[.。!！?？,，;；\n]` 且长度 ≥ 2 字符时触发
- 每个 TTS 请求对应一个完整句子
- 第一句的 TTS 请求必须在收到足够 text token 后立即发送（不等待完整回复）

### 4.2 音频 Ducking

- 当 DJ 开始说话时，背景音乐必须做 ducking（降低至 20% 音量）
- DJ 说完后，音乐恢复原音量
- Ducking 过渡时间: 0.3s (fade)
- 实现方式: Web Audio API GainNode

```typescript
interface DuckingController {
  duckMusic(): void;      // 降低音乐到 20%，0.3s fade
  restoreMusic(): void;   // 恢复音乐到 100%，0.3s fade
  readonly isDucking: boolean;
}
```

### 4.3 播放队列

- 音频播放必须支持 queue，不允许单曲循环硬逻辑
- Queue 结构: 先进先出（FIFO）
- Queue 操作:
  - `enqueue(track)`: 添加到队尾
  - `dequeue()`: 移除队首
  - `insertAt(track, index)`: 插队
  - `remove(trackId)`: 移除指定
  - `clear()`: 清空队列
  - `shuffle()`: 随机重排
- 当前播放曲目播放完毕 → 自动播放下一首
- 队列为空时 → 停止播放，等待新曲目
- 用户插入"立即播放" → 当前曲目暂停，插队曲目播放完毕后恢复

### 4.4 音频格式标准

- 输出格式: MP3 @ 128kbps CBR
- 采样率: 44100 Hz
- 声道: Stereo (音乐) / Mono (TTS 语音)
- 客户端兼容: 必须同时支持 Web Audio API 和 HTML5 Audio 回退

---

## 5. Workflow Rules

### 5.1 单人开发模式

- 每次只开发**一个模块**（一个 module 内的一个文件或紧密关联的 2-3 个文件）
- 开发顺序严格按照 `docs/roadmap.md` 的 Phase 和 Task 编号
- 一个 Task 完成并验证后，再开始下一个 Task
- 不允许跨 Phase 提前开发（避免依赖未实现的模块）

### 5.2 开发前必读

每次开始新 Task 前，必须阅读以下文件（按优先级）:

1. `CLAUDE.md` — 本文件，开发规则
2. `docs/architecture.md` — 模块边界、数据流、目录结构
3. `docs/api-design.md` — 如果涉及 API/WebSocket 变更
4. `docs/memory-system.md` — 如果涉及记忆系统变更
5. `docs/roadmap.md` — 当前 Task 在整体中的位置

### 5.3 开发后必更新

Task 完成后必须检查并更新:

1. **代码变更**:
   - 如果新增了模块 → 更新 `docs/architecture.md` 的模块描述
   - 如果新增了 API → 更新 `docs/api-design.md`
   - 如果修改了数据流 → 更新 `docs/architecture.md` 的数据流章节
   - 如果修改了 prompt → 检查是否影响 `CLAUDE.md` 中的 AI Rules

2. **文档变更**:
   - 在 commit message 中注明更新了哪个文档
   - 格式: `docs(architecture): update data flow for audio pipeline`

3. **Task 完成标记**:
   - 在 `docs/roadmap.md` 对应的 Task 行末添加 `✅` 标记
   - 示例: `| 2.3 | 实现 PersonaModule | persona.service.ts | 3h | ✅ |`

### 5.4 Git 规则

- 每个 Task 一个 commit
- Commit message 格式: `<type>(<scope>): <description>`
- Types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`
- Scopes: `chat`, `music`, `audio`, `memory`, `persona`, `weather`, `schedule`, `system`, `client`, `server`
- 示例: `feat(chat): implement streaming token response via WebSocket`

### 5.5 禁止事项

- ❌ 禁止一次修改超过 3 个模块
- ❌ 禁止跳过文档更新直接写代码
- ❌ 禁止在不读 `architecture.md` 的情况下开始开发
- ❌ 禁止在 service 中直接操作数据库（必须走 repository）
- ❌ 禁止在 UI 组件中直接调用 fetch/WebSocket（必须走 service/hook 层）
- ❌ 禁止使用 `any` 类型
- ❌ 禁止跨模块文件 import（必须走 interface / DI）
- ❌ 禁止修改其他模块的内部实现

---

## 6. 技术约束

### 6.1 依赖管理

- 使用 npm workspaces (monorepo)
- 根 package.json 只包含 workspaces 配置和 dev 脚本
- 每个子包独立管理依赖
- 共享依赖版本在根 package.json 的 `overrides` 中锁定

### 6.2 环境变量

- 所有 API Key 通过环境变量注入，写在 `.env` 文件
- `.env` 加入 `.gitignore`
- 提供 `.env.example` 模板文件
- 环境变量命名: `RADIO_<SERVICE>_<KEY>`
  - `RADIO_CLAUDE_API_KEY`
  - `RADIO_FISH_AUDIO_API_KEY`
  - `RADIO_NETEASE_API_KEY`
  - `RADIO_WEATHER_API_KEY`

### 6.3 端口约定

- 前端 Dev Server: `5173`
- 后端 Server: `3001`
- 后端 WebSocket: `3001/ws`

### 6.4 Node.js 版本

- 最低要求: Node.js 20.x
- 推荐: Node.js 22.x (LTS)

---

## 7. 质量检查清单

每个 Task 完成前自查:

- [ ] TypeScript 编译零错误 (`tsc --noEmit`)
- [ ] 无 `any` 类型
- [ ] 所有函数有返回值类型声明
- [ ] 模块间无非法依赖 (检查 import 路径)
- [ ] API 有类型定义
- [ ] 状态变更在 store 中可追踪
- [ ] 无跨层直接调用 (UI 不调 API, Service 不调 DOM)
- [ ] 相关文档已更新

---

## 8. 快速参考

### 项目文件导航

| 想看什么 | 去哪里 |
|----------|--------|
| 整体架构 | `docs/architecture.md` |
| 开发计划 | `docs/roadmap.md` |
| API 协议 | `docs/api-design.md` |
| 记忆设计 | `docs/memory-system.md` |
| DJ 人格 | `server/prompts/system/dj-persona.md` |
| 对话规则 | `server/prompts/system/chat-rules.md` |
| 数据库结构 | `server/src/db/schema.prisma` |
| WS 事件枚举 | `shared/events.ts` |
| 共享类型 | `shared/types.ts` |

### 模块清单

| 模块 | 路径 | 职责 |
|------|------|------|
| Chat | `server/src/modules/chat/` | 会话管理、上下文组装、回复调度 |
| Music | `server/src/modules/music/` | 音乐搜索、推荐、播放列表 |
| Weather | `server/src/modules/weather/` | 天气获取、缓存、定时播报 |
| Schedule | `server/src/modules/schedule/` | 日程 CRUD、定时提醒 |
| Memory | `server/src/modules/memory/` | 记忆存储、检索、巩固 |
| Persona | `server/src/modules/persona/` | Prompt 组装、人格管理 |
| Audio | `server/src/modules/audio/` | TTS 调用、音频管道、流式输出 |
| System | `server/src/modules/system/` | 健康检查、定时调度、配置 |
