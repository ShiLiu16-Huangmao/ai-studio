# @ai-radio/server

AI Radio 本地中枢服务 — Express + WebSocket 后端。

## 启动

```bash
# 安装依赖（在项目根）
pnpm install

# 仅启动 server
cd apps/server && pnpm dev

# 或从根启动所有服务
pnpm dev
```

## 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/health` | 健康检查 |
| `GET` | `/api/state` | 获取当前 DJ + 播放器 + 天气状态快照 |
| `POST` | `/api/chat` | 发送聊天消息（mock 回复） |
| `WS` | `/ws` | WebSocket 实时事件流 |

## REST API 示例

### POST /api/chat

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"text": "今晚月色真美"}'
```

响应:
```json
{
  "success": true,
  "data": {
    "text": "今晚的月色真美。很适合听一首安静的爵士...",
    "action": null,
    "track": null,
    "mood": null
  }
}
```

### GET /api/state

```bash
curl http://localhost:3001/api/state
```

## WebSocket 事件

连接后，服务端会通过 WS 广播以下事件：

| 事件 | 方向 | 触发时机 |
|------|------|----------|
| `connected` | S→C | 客户端连接成功 |
| `ai:thinking` | S→C | AI 开始思考/处理用户消息 |
| `ai:speaking` | S→C | AI 开始流式语音输出 |
| `music:playing` | S→C | 新曲目开始播放 |
| `player:update` | S→C | 播放器状态变更（播放/暂停/音量） |
| `system:event` | S→C | 系统通知 |

## 目录结构

```
src/
├── index.ts              # 入口
├── app/
│   └── createApp.ts      # Express + WS 组装
├── routes/
│   └── index.ts          # 路由注册
├── controllers/
│   ├── chat.controller.ts
│   └── state.controller.ts
├── services/
│   ├── chat.service.ts   # Mock 聊天（意图识别 + 回复生成）
│   ├── dj.service.ts     # DJ 状态管理
│   └── player.service.ts # 播放器状态管理 (mock)
├── websocket/
│   ├── wsManager.ts      # WS 连接管理 + 心跳 + 广播
│   └── events.ts         # 内部 EventEmitter + 事件枚举
├── middleware/
│   ├── validate.ts       # Zod 校验中间件
│   ├── errorHandler.ts   # 全局错误处理
│   └── requestLogger.ts  # HTTP 请求日志
├── utils/
│   ├── env.ts            # 环境变量 (dotenv + zod validate)
│   ├── logger.ts         # Pino 日志
│   ├── AppError.ts       # 自定义错误类
│   └── gracefulShutdown.ts
└── types/
    └── index.ts          # 服务端特有类型
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `RADIO_SERVER_PORT` | `3001` | 服务端口 |
| `RADIO_CLIENT_ORIGIN` | `http://localhost:5173` | CORS 允许来源 |
| `RADIO_LOG_LEVEL` | `info` | 日志级别 (debug/info/warn/error) |
| `NODE_ENV` | `development` | 运行环境 |

## Mock 数据说明

当前 MVP 版本所有外部服务均为 mock：
- **Chat**: 基于关键词的简单意图识别 + 预设回复
- **DJ**: 内存中的状态管理，支持 thinking/mood 变更
- **Player**: 内存中的 Mock 曲目，支持 play/pause/stop
- **Weather**: 硬编码的天气快照（上海，18°C 多云）

后续 Phase 将逐步接入真实的 Claude API、Fish Audio、网易云 API。
