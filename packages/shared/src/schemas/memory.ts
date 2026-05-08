// @ai-radio/shared — Memory schemas

import { z } from 'zod';
import { MemoryTypeSchema } from './enums';

// ==================== Memory Entry ====================
export const MemoryEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: MemoryTypeSchema,
  content: z.string(),
  keywords: z.array(z.string()),
  sourceMsgId: z.string().nullable(),
  importance: z.number().min(0).max(1),
  accessCount: z.number().int().min(0),
  lastAccess: z.string().datetime(),
  decayFactor: z.number().min(0).max(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type MemoryEntry = z.infer<typeof MemoryEntrySchema>;

// ==================== Extracted Memory ====================
export const ExtractedMemorySchema = z.object({
  type: MemoryTypeSchema,
  content: z.string(),
  keywords: z.array(z.string()),
  importance: z.number().min(0).max(1),
  sourceMessageId: z.string().optional(),
});
export type ExtractedMemory = z.infer<typeof ExtractedMemorySchema>;

// ==================== Memory Query ====================
export const MemoryQuerySchema = z.object({
  keywords: z.array(z.string()),
  types: z.array(MemoryTypeSchema).optional(),
  minImportance: z.number().min(0).max(1).optional(),
  limit: z.number().int().min(1).max(50).default(10),
});
export type MemoryQuery = z.infer<typeof MemoryQuerySchema>;

// ==================== Memory Search Result ====================
export const MemorySearchResultSchema = z.object({
  entries: z.array(MemoryEntrySchema),
  scores: z.array(z.number()),
});
export type MemorySearchResult = z.infer<typeof MemorySearchResultSchema>;

// ==================== Consolidate Input ====================
export const ConsolidateInputSchema = z.object({
  conversationText: z.string(),
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.string(),
      content: z.string(),
    }),
  ),
  currentMood: z.string().optional(),
});
export type ConsolidateInput = z.infer<typeof ConsolidateInputSchema>;

// ==================== Consolidate Output ====================
export const ConsolidateOutputSchema = z.object({
  extracted: z.array(ExtractedMemorySchema),
  updatedIds: z.array(z.string()),
});
export type ConsolidateOutput = z.infer<typeof ConsolidateOutputSchema>;
