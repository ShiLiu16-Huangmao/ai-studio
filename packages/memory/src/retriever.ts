// @ai-radio/memory — Memory retriever (multi-path recall + fusion ranking)

import type { UserMemory, MemoryType } from '@ai-radio/shared';
import type { MemoryStore } from './types';
import { MEMORY } from '@ai-radio/shared';

export interface RetrieveInput {
  /** Current user message text */
  message: string;

  /** Detected or stated mood */
  mood?: string;

  /** Types of memories to include */
  types?: MemoryType[];

  /** Max memories to return */
  limit?: number;
}

export class MemoryRetriever {
  private store: MemoryStore;

  constructor(store: MemoryStore) {
    this.store = store;
  }

  /**
   * Multi-path retrieval:
   * 1. Keyword match (weight: 0.4)
   * 2. Recent memories (weight: 0.3)
   * 3. High importance (weight: 0.3)
   *
   * Results are fusion-ranked and decay-adjusted.
   */
  async retrieve(input: RetrieveInput): Promise<UserMemory[]> {
    const limit = input.limit ?? MEMORY.MAX_INJECTED_MEMORIES;
    const keywords = this.extractKeywords(input.message);

    // Path 1: Keyword-based search
    const keywordResults = await this.store.search({
      keywords,
      types: input.types,
      limit: limit * 2,
    });

    // Path 2: Recent memories
    const recentResults = await this.store.findRecent(7, limit);

    // Path 3: Important memories
    const importantResults = await this.store.search({
      keywords: [],
      minImportance: 0.7,
      types: input.types,
      limit,
    });

    // Fusion ranking
    const scored = this.fusionRank(keywordResults, recentResults, importantResults, limit);

    return scored;
  }

  /** Expand query into search keywords */
  extractKeywords(text: string): string[] {
    // Simple word segmentation + mood synonym expansion
    const words = text.split(/[\s,，。！？、]+/).filter((w) => w.length > 0);

    const moodSynonyms: Record<string, string[]> = {
      心情: ['情绪', '状态', '感觉'],
      不好: ['低落', '糟糕', '难过'],
      开心: ['高兴', '愉快', '快乐'],
      累: ['疲惫', '疲劳', '困'],
    };

    const expanded: string[] = [];
    for (const word of words) {
      expanded.push(word);
      const synonyms = moodSynonyms[word];
      if (synonyms) {
        expanded.push(...synonyms);
      }
    }

    return expanded;
  }

  // ==================== Private ====================

  private fusionRank(
    keyword: UserMemory[],
    recent: UserMemory[],
    important: UserMemory[],
    limit: number,
  ): UserMemory[] {
    const scoreMap = new Map<string, { entry: UserMemory; score: number }>();

    // Weighted scoring
    const addScore = (entry: UserMemory, weight: number, rank: number) => {
      const existing = scoreMap.get(entry.id);
      const rankScore = rank === 0 ? 1 : 1 / (rank + 1);
      const newScore = weight * rankScore * entry.decayFactor;
      if (existing) {
        existing.score += newScore;
      } else {
        scoreMap.set(entry.id, { entry, score: newScore });
      }
    };

    keyword.forEach((e, i) => addScore(e, 0.4, i));
    recent.forEach((e, i) => addScore(e, 0.3, i));
    important.forEach((e, i) => addScore(e, 0.3, i));

    // Sort by score descending, take top N
    return Array.from(scoreMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.entry);
  }
}
