# @ai-radio/web

AI Radio PWA 播放器 — React + Vite + Tailwind + Zustand

## 启动

```bash
pnpm dev          # Dev server at localhost:5173
pnpm build        # Production build + PWA SW
pnpm preview      # Preview production build
```

## 设计风格

**现代极简暗黑风 + 复古数字元素**

| 元素 | 规格 |
|------|------|
| 背景 | `#0a0a0a` 深黑 |
| 表面 | `#141414` / `#1c1c1c` 毛玻璃 |
| 高亮 | `#00ffc8` 青绿色，带 glow 阴影 |
| ON AIR | `#ff3344` 红色，呼吸动画 |
| 数字字体 | Courier New monospace |
| 组件 | 圆角 12-16px，border opacity 6% |

## 架构

```
src/
├── App.tsx                     # 根组件，组装 AppShell
├── main.tsx                    # 入口
├── index.css                   # Tailwind + 自定义暗黑主题
├── components/
│   ├── layout/AppShell.tsx     # Mobile-first 布局壳
│   ├── dj/
│   │   ├── DJStatus.tsx        # ON AIR 灯 + AI 状态 + 时钟
│   │   └── MoodIndicator.tsx   # 情绪标签显示
│   ├── chat/
│   │   ├── ChatInput.tsx       # 消息输入框 + 发送按钮
│   │   ├── ChatBubble.tsx      # 聊天气泡（user/DJ 风格区分）
│   │   └── ChatPanel.tsx       # 消息列表 + 流式文字
│   ├── player/
│   │   ├── PlayerBar.tsx       # 底部播放控制栏
│   │   ├── VinylDisc.tsx       # 旋转黑胶唱片动画
│   │   ├── Waveform.tsx        # 频谱柱状波形可视化
│   │   └── TrackInfo.tsx       # 曲名/艺术家/进度
│   ├── widgets/
│   │   ├── TimeDisplay.tsx     # 数字时钟 + 时段标签
│   │   └── WeatherWidget.tsx   # 天气卡片
│   └── common/
│       ├── GlassPanel.tsx      # 磨砂玻璃容器
│       └── IconButton.tsx      # 图标按钮
├── hooks/
│   ├── useWebSocket.ts         # WS 连接管理（支持 mock 模式）
│   ├── useAudioPlayer.ts       # 音频播放进度模拟
│   └── useMediaSession.ts      # 锁屏 Media Session API
├── stores/                     # Zustand 状态管理
│   ├── appStore.ts             # 连接状态 / 应用模式
│   ├── chatStore.ts            # 消息列表 / 流式文本
│   ├── playerStore.ts          # 播放器状态 + 队列
│   └── djStore.ts              # DJ 状态 / 天气
├── services/
│   ├── apiClient.ts            # REST API 客户端
│   └── wsClient.ts             # WebSocket 客户端 + store 同步
├── lib/
│   ├── audio.ts                # Web Audio API 抽象
│   └── time.ts                 # 时间格式化工具
└── types/
    └── index.ts                # 前端类型（部分从 shared re-export）
```

## 状态管理

4 个 Zustand Store，单向数据流：

```
wsClient (WS events)
    │
    ▼
stores (useAppStore / useChatStore / usePlayerStore / useDJStore)
    │
    ▼
components (selective subscribe via hooks)
```

## Mock 模式

当前 MVP 无需后端即可运行。`useWebSocket(true)` 启用 mock 模式：

- 连接状态模拟为 `connected`
- 2 秒后自动模拟 DJ 上线事件
- 聊天通过 apiClient 调用 server mock API（需要 server 运行）

纯离线 demo：打开 `http://localhost:5173` 即可看到完整 UI。
