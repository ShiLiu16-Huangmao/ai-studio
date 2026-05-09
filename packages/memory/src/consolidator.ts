// @ai-radio/memory — Memory consolidator (extraction + deduplication + merge)

import type { UserMemory } from '@ai-radio/shared';
import type { MemoryStore, ConsolidateInput, ConsolidateOutput, ExtractedMemory } from './types';

/**
 * Memory consolidator — extracts memories from conversations.
 *
 * Phase 1: Simple keyword-based extraction (no LLM dependency)
 * Phase 2: Upgrade to Claude-driven extraction with dedup + merge
 */
export class MemoryConsolidator {
  private store: MemoryStore;

  constructor(store: MemoryStore) {
    this.store = store;
  }

  /** Extract and persist memories from a conversation */
  async consolidate(input: ConsolidateInput): Promise<ConsolidateOutput> {
    const extracted = this.extract(input);
    const deduplicated = await this.deduplicate(extracted);
    await this.store.createMany(deduplicated);

    return {
      extracted: deduplicated,
      updatedIds: [],
    };
  }

  // ==================== Private ====================

  /** Simple rule-based extraction */
  private extract(input: ConsolidateInput): ExtractedMemory[] {
    const results: ExtractedMemory[] = [];

    for (const msg of input.messages) {
      if (msg.role !== 'user') continue;

      const content = msg.content;

      // Time-sensitive event detection
      const timePatterns = [
        /(?:明天|后天|下周|下周[一二三四五六日]|(\d+)月(\d+)号?)有?([^，。！？\n]{2,30})/g,
        /(\d+)[点时](?:有|要|去)([^，。！？\n]{2,30})/g,
      ];

      for (const pattern of timePatterns) {
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(content)) !== null) {
          results.push({
            type: 'event',
            content: `用户提到: ${match[0]}`,
            keywords: this.extractKeywords(match[0]),
            importance: 0.7,
            sourceMessageId: msg.id,
          });
        }
      }

      // Preference detection
      const prefPatterns = [
        /(?:喜欢|爱|偏好|最爱)([^，。！？\n]{2,30})/g,
        /(?:不喜欢|讨厌|受不了)([^，。！？\n]{2,30})/g,
        /经常(?:听|喜欢)([^，。！？\n]{2,30})/g,
      ];

      for (const pattern of prefPatterns) {
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(content)) !== null) {
          results.push({
            type: 'preference',
            content: `用户${match[0]}`,
            keywords: this.extractKeywords(match[0]),
            importance: 0.6,
            sourceMessageId: msg.id,
          });
        }
      }

      // Emotion detection
      const emotionKeywords = ['开心', '难过', '累', '焦虑', '兴奋', '压力', '无聊', '放松'];
      for (const ek of emotionKeywords) {
        if (content.includes(ek)) {
          results.push({
            type: 'emotion',
            content: `用户表示感到${ek}`,
            keywords: [ek, '情绪', '心情'],
            importance: 0.5,
            sourceMessageId: msg.id,
          });

          // Only capture the first emotion per message
          break;
        }
      }
    }

    return results;
  }

  /** Simple keyword overlap dedup */
  private async deduplicate(extracted: ExtractedMemory[]): Promise<ExtractedMemory[]> {
    if (extracted.length === 0) return [];

    // Get existing memories for comparison
    const existing = await this.store.findRecent(30, 100);
    const unique: ExtractedMemory[] = [];

    for (const mem of extracted) {
      const isDuplicate = existing.some((e: UserMemory) => {
        const overlap = mem.keywords.filter((k) => e.keywords.includes(k));
        return overlap.length >= 2; // 2+ keyword overlap = likely duplicate
      });

      if (!isDuplicate) {
        unique.push(mem);
      }
    }

    return unique;
  }

  private extractKeywords(text: string): string[] {
    // Simple 2-char+ word extraction
    const words = text.replace(/[^一-龥a-zA-Z0-9]/g, ' ').split(/\s+/);
    return words.filter((w) => w.length >= 2);
  }
}
