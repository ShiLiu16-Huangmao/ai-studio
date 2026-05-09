// @ai-radio/memory — Memory types

import type { UserMemory, MemoryType } from '@ai-radio/shared';

/** Storage interface — implemented by the server's repository layer */
export interface MemoryStore {
  /** Search memories by keywords */
  search(query: MemoryQuery): Promise<UserMemory[]>;

  /** Create new memory entries */
  createMany(entries: ExtractedMemory[]): Promise<UserMemory[]>;

  /** Update an existing memory */
  update(id: string, updates: Partial<UserMemory>): Promise<UserMemory | null>;

  /** Delete a memory */
  delete(id: string): Promise<void>;

  /** Get memories by type */
  findByType(type: MemoryType, limit?: number): Promise<UserMemory[]>;

  /** Get recent memories */
  findRecent(days: number, limit?: number): Promise<UserMemory[]>;
}

export interface MemoryQuery {
  keywords: string[];
  types?: MemoryType[];
  minImportance?: number;
  limit: number;
}

export interface MemorySearchResult {
  entries: UserMemory[];
  scores: number[]; // One score per entry (0-1)
}

export interface ExtractedMemory {
  type: MemoryType;
  content: string;
  keywords: string[];
  importance: number;
  sourceMessageId?: string;
}

export interface ConsolidateInput {
  /** Full conversation text */
  conversationText: string;

  /** Individual messages */
  messages: Array<{
    id: string;
    role: string;
    content: string;
  }>;

  /** Current mood state */
  currentMood?: string;
}

export interface ConsolidateOutput {
  extracted: ExtractedMemory[];
  updatedIds: string[]; // IDs of existing memories that were updated
}
