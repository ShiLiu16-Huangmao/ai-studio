# @ai-radio/shared

AI Radio 项目的共享类型系统。所有类型由 Zod schema 自动推导，同时提供 runtime validation。

## 设计原则

### 1. Schema 即真理源

所有类型定义以 Zod schema 为准。TypeScript 类型通过 `z.infer` 自动推导，**不手写 interface 或 type**。

```
Zod Schema ──parse──▶ Runtime Validation
     │
     └──z.infer──▶ TypeScript Type (compile-time)
```

### 2. Schema 与 Type 分离

- `schemas/` — Zod schema 定义（runtime 可用）
- `types/` — 纯类型导出（compile-time only）

前端引类型，后端引 schema+类型，各取所需。

### 3. 零 any

全项目禁 `any`。不确定类型时用 `unknown` + type guard。Schema 层面用 `z.unknown()`。

### 4. 注释即文档

每个 schema 字段写详细 JSDoc 注释，包括：
- 字段含义
- 取值范围
- 使用示例

## 目录结构

```
src/
├── schemas/          # Zod schema 定义 (runtime validation)
│   ├── ai.ts         #   AIState, AIResponse, MoodType, ThinkingState
│   ├── chat.ts       #   ChatMessage, ChatRole, ChatEvent, Conversation
│   ├── music.ts      #   Song, Playlist, PlayerState, NowPlaying
│   ├── audio.ts      #   TTSRequest, AudioChunk, AudioQueue, DuckingState
│   ├── weather.ts    #   WeatherInfo, WeatherMood
│   ├── memory.ts     #   UserMemory, MoodMemory, RecentContext
│   ├── schedule.ts   #   ScheduleItem
│   └── ws.ts         #   All WebSocket event payload schemas
├── types/
│   └── index.ts      #   纯类型导出 (z.infer from schemas)
├── index.ts          #   统一入口
├── events.ts         #   WebSocket 事件名字符串常量
└── constants.ts      #   应用级常量
```

## 使用示例

### 前端（引类型）

```typescript
import type { Song, PlayerState, ChatMessage } from '@ai-radio/shared';

const track: Song = {
  id: '123',
  name: 'Fly Me to the Moon',
  artist: 'Frank Sinatra',
  album: 'It Might as Well Be Swing',
  coverUrl: 'https://example.com/cover.jpg',
  mp3Url: 'https://example.com/song.mp3',
  duration: 239,
  source: 'netease',
};
```

### 后端（引 schema + runtime validate）

```typescript
import { SongSchema, AIResponseSchema } from '@ai-radio/shared';

// Runtime 校验外部数据
app.post('/api/music/add', (req, res) => {
  const result = SongSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  // result.data 类型自动为 Song
  musicService.add(result.data);
});

// 校验 Claude 返回的结构化输出
const parsed = AIResponseSchema.parse(claudeResponse);
// parsed.text, parsed.action, parsed.mood 全部带类型
```

### WebSocket 事件（取某一事件的 payload schema）

```typescript
import { ChatMessagePayloadSchema } from '@ai-radio/shared';

ws.on('message', (raw) => {
  const event = JSON.parse(raw);
  if (event.type === 'chat:message') {
    // runtime 验证 payload 结构
    const payload = ChatMessagePayloadSchema.parse(event.payload);
    // payload: { conversationId: string, text: string }
  }
});
```

### 获取 WebSocket 事件类型映射

```typescript
import { ClientToServerEventMap, ServerToClientEventMap } from '@ai-radio/shared';

// 运行时根据事件类型查找对应 schema
const schema = ClientToServerEventMap['chat:message'];
// schema === ChatMessagePayloadSchema
```

## 依赖

- **zod** ^4 — runtime schema validation
- 零其他运行时依赖

## 导出清单

| 类别 | Schema | 类型 |
|------|--------|------|
| AI | `MoodTypeSchema`, `ThinkingStateSchema`, `AIStateSchema`, `AIResponseSchema` | `MoodType`, `ThinkingState`, `AIState`, `AIResponse` |
| Chat | `ChatRoleSchema`, `ChatMessageSchema`, `ChatEventSchema`, `ConversationSchema` | `ChatRole`, `ChatMessage`, `ChatEvent`, `Conversation` |
| Music | `SongSchema`, `PlaylistSchema`, `NowPlayingSchema`, `PlayerStateSchema` | `Song`, `Playlist`, `NowPlaying`, `PlayerState` |
| Audio | `AudioFormatSchema`, `TTSRequestSchema`, `AudioChunkSchema`, `AudioQueueSchema` | `AudioFormat`, `TTSRequest`, `AudioChunk`, `AudioQueue` |
| Weather | `WeatherInfoSchema`, `WeatherMoodSchema` | `WeatherInfo`, `WeatherMood` |
| Memory | `UserMemorySchema`, `MoodMemorySchema`, `RecentContextSchema` | `UserMemory`, `MoodMemory`, `RecentContext` |
| Schedule | `ScheduleItemSchema` | `ScheduleItem` |
| WebSocket | 15+ payload schemas + event maps | `WSEventEnvelope` |
