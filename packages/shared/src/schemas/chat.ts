// @ai-radio/shared — Chat & conversation schemas

import { z } from 'zod';
import { MessageRoleSchema } from './enums';
import { TrackSchema } from './track';

// ==================== Message Metadata ====================
export const MessageMetadataSchema = z.object({
  action: z.string().optional(),
  track: TrackSchema.optional(),
  weather: z.record(z.string(), z.unknown()).optional(),
  schedule: z.array(z.record(z.string(), z.unknown())).optional(),
});
export type MessageMetadata = z.infer<typeof MessageMetadataSchema>;

// ==================== Message ====================
export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: MessageRoleSchema,
  content: z.string(),
  metadata: MessageMetadataSchema.nullable(),
  tokensUsed: z.number().int().positive().nullable(),
  createdAt: z.string().datetime(),
});
export type Message = z.infer<typeof MessageSchema>;

// ==================== Conversation ====================
export const ConversationSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  mood: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Conversation = z.infer<typeof ConversationSchema>;

// ==================== Chat Message (UI) ====================
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// ==================== Conversation Detail ====================
export const ConversationDetailSchema = ConversationSchema.extend({
  messages: z.array(MessageSchema),
});
export type ConversationDetail = z.infer<typeof ConversationDetailSchema>;

// ==================== Create Conversation Input ====================
export const CreateConversationInputSchema = z.object({
  title: z.string().optional(),
});
export type CreateConversationInput = z.infer<typeof CreateConversationInputSchema>;

// ==================== Chat Send Input ====================
export const ChatSendInputSchema = z.object({
  conversationId: z.string(),
  text: z.string().min(1).max(5000),
});
export type ChatSendInput = z.infer<typeof ChatSendInputSchema>;
