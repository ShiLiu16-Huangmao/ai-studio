# AI Radio — AI 记忆系统设计

## 1. 设计目标

让 DJ"夜汐"具备类人的记忆能力：

- 记得用户说过的重要事情（"我下周有个面试"）
- 记得用户的音乐偏好（"你好像更喜欢爵士而非摇滚"）
- 感知用户的情绪周期（"最近几天你好像有点低落"）
- 在合适的时机自然地引用记忆（不违和、不生硬）
- 错误记忆可纠正、可删除

**核心挑战**: 在单人 SQLite 场景下实现有效的记忆检索，不引入向量数据库。

---

## 2. 三层记忆架构

```
┌─────────────────────────────────────────────────┐
│            Layer 1: Working Memory               │
│            当前对话上下文（短期窗口）              │
│            存储: 内存 (不持久化)                  │
│            容量: 最近 20 轮对话                   │
│            作用: 本次对话的即时上下文              │
└──────────────────────┬──────────────────────────┘
                       │ 对话结束后
                       ▼
┌─────────────────────────────────────────────────┐
│            Layer 2: Episodic Memory              │
│            对话片段记忆（事件/情景）               │
│            存储: SQLite (Memory 表)              │
│            容量: ~10000 条                       │
│            组织: 时间 + 类型 + 重要性             │
│            检索: 关键词 + 时间衰减 + 情绪关联    │
└──────────────────────┬──────────────────────────┘
                       │ 模式提取/巩固
                       ▼
┌─────────────────────────────────────────────────┐
│            Layer 3: Semantic Memory              │
│            事实/偏好/关系（抽象知识）              │
│            存储: SQLite (Memory 表, type=fact/   │
│                   preference) + Preference 表     │
│            容量: ~1000 条                        │
│            检索: 精确匹配 + 模糊关联             │
│            更新: 覆盖式 (新旧合并)               │
└─────────────────────────────────────────────────┘
```

### 各层对比

| 维度 | Working | Episodic | Semantic |
|------|---------|----------|----------|
| 内容 | 原始对话 | 事件快照 | 抽象事实 |
| 粒度 | 每轮对话 | 每次会话的关键 extract | 跨会话聚合 |
| 生命周期 | 当前对话 | 数周~数月 | 永久 (可更新) |
| 检索速度 | 即时 | <50ms | <10ms |
| 遗忘机制 | 对话结束清除 | 时间衰减 + 访问衰减 | 覆盖更新 |

---

## 3. 记忆类型定义

```typescript
type MemoryType = 'fact' | 'preference' | 'event' | 'emotion' | 'relationship';

interface MemoryEntry {
  id: string;
  userId: string;
  type: MemoryType;
  content: string;          // 自然语言，方便检索和注入 prompt
  keywords: string;         // 逗号分隔的关键词（用于 SQLite LIKE 检索）
  sourceMsgId?: string;     // 来源消息 ID（溯源）
  importance: number;       // 0-1，越高越不容易遗忘
  accessCount: number;      // 被检索次数
  lastAccess: Date;         // 上次被检索时间
  decayFactor: number;      // 衰减因子 (初值1.0，随时间和访问变化)
  createdAt: Date;
  updatedAt: Date;
}
```

### 各类型说明

| 类型 | 示例 | 提取方式 |
|------|------|----------|
| `fact` | "用户养了一只叫团团的猫" | Claude 从对话中提取 |
| `preference` | "用户喜欢爵士乐，不喜欢重金属" | 行为模式 + 明确陈述 |
| `event` | "用户明天下午3点有面试" | 时间敏感信息识别 |
| `emotion` | "本周三用户情绪低落" | 对话情绪分析 |
| `relationship` | "用户和同事张伟关系紧张" | 社交关系提取 |

---

## 4. 记忆生命周期

### 4.1 创建 (Extraction)

```
┌─────────────────┐
│   对话完成        │
│ (chat:done)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MemoryConsolidator.extract()    │
│  输入: 完整对话 + 消息列表       │
│  处理:                           │
│    1. 调用 Claude (轻量 prompt)  │
│       提取关键记忆               │
│    2. 返回结构化记忆列表         │
│       [{ type, content,          │
│          keywords, importance }] │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MemoryService.createMemories()  │
│  - 去重: 与已有记忆比对相似度    │
│  - 合并: 同类记忆更新而非新增    │
│  - 存储: 写入 Memory 表          │
└─────────────────┘
```

### 4.2 检索 (Retrieval)

```
┌─────────────────┐
│  用户发消息       │
│  "今天心情不太好"  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MemoryRetriever.retrieve()      │
│  输入:                           │
│    - userId                      │
│    - currentMessage: string      │
│    - currentMood?: string        │
│    - currentTime: Date           │
│    - limit: number (default 5)   │
│  输出: MemoryEntry[]             │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────┐
│  检索算法 (多路召回 + 融合排序)   │
│                                   │
│  Path 1: 关键词匹配 (SQLite LIKE) │
│    权重: 0.4                      │
│    SELECT * FROM Memory           │
│    WHERE keywords LIKE '%心情%'   │
│       OR keywords LIKE '%情绪%'   │
│                                   │
│  Path 2: 时间关联                 │
│    权重: 0.2                      │
│    - 同时间段记忆 (如都是深夜)    │
│    - 同日期的历史记忆             │
│    - 最近 7 天的记忆加权          │
│                                   │
│  Path 3: 情绪关联                 │
│    权重: 0.2                      │
│    - 同情绪状态的记忆             │
│    - type=emotion 的记忆          │
│                                   │
│  Path 4: 重要性加权               │
│    权重: 0.2                      │
│    - importance 高的记忆          │
│    - 最近频繁访问的记忆           │
│                                   │
│  融合排序:                        │
│    score = Σ (path_score ×       │
│               path_weight)        │
│           × decayFactor           │
│           × recencyBoost          │
│                                   │
│  取 top-N (通常 3-5 条)           │
└──────────────────────────────────┘
```

### 4.3 更新 (Consolidation)

```
触发条件 (满足任一):
  - 对话结束后
  - 用户明确纠正 ("不对，我其实...")
  - 定时 (每日凌晨 3 点)

处理:
  1. 扫描近期相关记忆
  2. 同类合并: 两条 "喜欢爵士" → 更新 importance 和 accessCount
  3. 矛盾处理: 新信息覆盖旧信息，但记录历史版本
  4. 过期清理: event 类记忆过期后标记 (不再检索但保留)
```

### 4.4 遗忘 (Decay)

```
衰减函数:
  decayFactor = e^(-λ × days_since_last_access)

  其中 λ 由 importance 调节:
    importance >= 0.8: λ = 0.001 (几乎不遗忘)
    importance >= 0.5: λ = 0.01  (缓慢遗忘)
    importance <  0.5: λ = 0.05  (正常遗忘)

访问刷新:
  每次被检索 → decayFactor 重置为 1.0
  每次被检索 → accessCount += 1

物理删除:
  decayFactor < 0.1 且 accessCount < 3 → 标记为 archived
  用户可查看 archived 记忆，但不再参与检索
```

---

## 5. Prompt 注入策略

### 5.1 注入位置

```
System Prompt 结构:

[人格层]
... DJ 身份定义 ...

[规则层]
... 对话规则 ...

[记忆上下文层] ← 动态注入
以下是关于这位听众的一些记忆，请自然地融入对话中，
不要生硬地复述。只在相关时提及。

近期记忆：
- (3天前) 用户提到最近工作压力很大
- (昨天) 用户说喜欢在下雨天听爵士乐
- (今天上午) 用户有一个会议，可能已经结束了

用户偏好：
- 音乐口味: 爵士、Lofi、City Pop
- 不喜欢: 重金属、过于吵闹的音乐
- DJ 叫他"夜汐"即可

情绪观察：
- 本周情绪以低落为主
- 今晚似乎比较放松

[当前上下文]
... 时间、天气、日程 ...

[用户消息]
...
```

### 5.2 注入原则

| 原则 | 说明 |
|------|------|
| **相关优先** | 只注入与当前话题相关的记忆 |
| **数量克制** | 每次最多注入 5 条（避免 token 浪费） |
| **时效标注** | 每条记忆带时间标签，让模型判断时效性 |
| **自然融入** | 指令强调"自然提及"，不要求模型每条都说 |
| **情绪适配** | 用户情绪低落时不提愉快记忆，避免反差 |

### 5.3 Token 预算

```
System Prompt Token 预算: 800 tokens
├── 人格层: 250 tokens
├── 规则层: 150 tokens
├── 记忆上下文: 200 tokens (约 5 条记忆)
├── 当前上下文: 150 tokens
└── 保留: 50 tokens

总 Context Window: 取决于模型
├── System: 800 tokens
├── History: 最近 15 轮对话 (~2000 tokens)
└── Response: ~500 tokens (max_tokens)
```

---

## 6. 记忆提取 Prompt 设计

### 6.1 提取器 Prompt

```
你是一个记忆提取器。从以下对话中提取值得记住的信息。

规则：
1. 只提取对以后对话有用的信息
2. 每条记忆标注类型：fact / preference / event / emotion / relationship
3. 每条记忆标注重要性 0-1 (越高越重要)
4. 提取 3-5 个关键词用于检索
5. 不要提取闲聊、寒暄等无长期价值的内容

输出格式 (JSON):
[
  {
    "type": "preference",
    "content": "用户喜欢在雨天听爵士乐",
    "keywords": ["爵士", "雨天", "音乐偏好"],
    "importance": 0.7
  },
  ...
]

对话：
{conversation_messages}
```

### 6.2 记忆检索关键词扩展

```
用户输入: "今天心情不太好"
    │
    ▼
关键词扩展 (同义词/关联词映射):
  "心情" → ["心情", "情绪", "状态", "感觉"]
  "不好" → ["不好", "低落", "糟糕", "难过", "down"]
    │
    ▼
检索查询:
  SELECT * FROM Memory
  WHERE keywords LIKE '%心情%' OR '%情绪%' OR '%状态%' ...
     OR keywords LIKE '%不好%' OR '%低落%' OR '%糟糕%' ...
  ORDER BY importance DESC, lastAccess DESC
  LIMIT 10
```

---

## 7. 去重与合并策略

### 7.1 相似度检测

```
简单方案 (Phase 1):
  - 关键词 Jaccard 相似度
  - 两个记忆共享 ≥ 2 个关键词 → 视为可能重复
  - 人工判断 (交给 Claude 在提取阶段做)

升级方案 (Phase 2+):
  - 基于本地 embedding 的余弦相似度
  - 使用轻量模型 (如 all-MiniLM-L6-v2 via transformers.js)
  - 相似度 > 0.85 → 合并

合并规则:
  - 同类型记忆 → 保留最新的，合并关键词
  - importance 取 max
  - 旧记忆标记为 superseded，不检索但保留
```

### 7.2 冲突解决

```
场景: 用户说 "我喜欢摇滚" → 但之前记忆 "用户不喜欢重金属"

处理:
  1. 检测矛盾: 新记忆 importance > 旧记忆 → 更新
  2. 保留旧版本: metadata.previous = old_content
  3. 在 prompt 注入时使用新版本
  4. 用户可以手动查看/恢复旧记忆
```

---

## 8. 情绪追踪系统

### 8.1 情绪模型

```
情绪维度 (简化):
  valence (效价):   -1 (负面) → 0 (中性) → +1 (正面)
  energy (能量):    -1 (低能/倦怠) → 0 → +1 (高能/兴奋)

情绪标签映射:
  "chill"      → valence: +0.3, energy: -0.3
  "energetic"  → valence: +0.5, energy: +0.8
  "melancholy" → valence: -0.4, energy: -0.5
  "cheerful"   → valence: +0.7, energy: +0.5
  "neutral"    → valence: 0, energy: 0
```

### 8.2 情绪检测

```
每轮对话结束时:

1. Claude 轻量分析: "判断这轮对话中用户的情绪状态"
   → 返回情绪标签 + 置信度

2. 聚合:
   - 单轮情绪 → 存入 MoodRecord 表
   - 近期趋势 (7天) → 计算平均 valence/energy
   - 异常检测: 如果连续 3 天 valence < -0.3 → 标记为"情绪低落期"

3. 注入使用:
   - 近期趋势 → 注入 system prompt
   - 低落期 → DJ 语气更温柔，主动推荐舒缓音乐
   - 高涨期 → DJ 更有活力，推荐欢快曲目
```

---

## 9. 隐私与控制

```
用户可见性:
  - 前端记忆面板: 展示最近 50 条记忆
  - 每条显示: 类型图标 + 内容 + 时间 + 重要性
  - 操作: 查看详情 / 删除 / "这不对"纠正

用户控制:
  - "忘了我说的这件事" → 删除相关记忆
  - "清除所有记忆" → 全部标记 archived
  - "今晚的对话不要记" → 跳过本次 consolidation

数据安全:
  - 所有记忆在本地 SQLite
  - 不会上传到任何外部服务
  - 备份就是复制 radio.db 文件
```

---

## 10. 实现路线

### Phase 1: 基础 (Week 11 前半)
- Memory 表 + Repository (CRUD)
- 关键词提取器 (简单分词 + 词频)
- 关键词匹配检索
- 手动创建/删除记忆的 API

### Phase 2: 智能提取 (Week 11 后半 - Week 12 前半)
- Claude 驱动的记忆提取器
- Memory Consolidator
- 去重与合并
- Prompt 注入

### Phase 3: 深度学习 (Week 12 后半)
- 情绪追踪
- 时间衰减算法
- 用户偏好自动学习
- 记忆面板 UI

### 未来扩展 (v2+)
- 本地 embedding (transformers.js)
- 语义相似度检索
- 知识图谱 (实体关系)
- 梦境/总结生成 ("本周电台回顾")
