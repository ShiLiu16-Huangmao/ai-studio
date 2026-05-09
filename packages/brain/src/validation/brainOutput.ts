// @ai-radio/brain — Brain output validation + Claude response parsing
// ===================================================================

import { z } from 'zod';
import { BrainOutputSchema, MoodDecisionSchema, SaySegmentSchema } from '../types';
import type { BrainOutput, MoodDecision, MusicRecommendation, SaySegment } from '../types';

/**
 * Claude 返回的原始 JSON 结构（可能不完整/格式错误）
 * 这里不做严格校验，先宽松解析再逐字段验证
 */
const ClaudeRawResponseSchema = z.object({
  text: z.string().optional(),
  segments: z.array(z.record(z.string(), z.unknown())).optional(),
  mood_valence: z.number().optional(),
  mood_energy: z.number().optional(),
  mood_label: z.string().optional(),
  mood_reason: z.string().optional(),
  energy: z.number().optional(),
  recommend_song: z.string().optional(),
  recommend_artist: z.string().optional(),
  recommend_reason: z.string().optional(),
  recommend_genre: z.string().optional(),
  recommend_mood: z.string().optional(),
  transition: z.string().optional(),
});

/**
 * Parse and validate raw Claude JSON response into typed BrainOutput.
 *
 * Strategy:
 * 1. Parse JSON
 * 2. Map flat Claude output → structured BrainOutput
 * 3. Validate each field with zod
 */
export function parseBrainOutput(raw: string): BrainOutput {
  let parsed: unknown;

  // 1. Parse JSON
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Not JSON — treat as raw text
    return buildFallbackOutput(raw);
  }

  // 2. Loose validation
  const loose = ClaudeRawResponseSchema.safeParse(parsed);
  if (!loose.success) {
    return buildFallbackOutput(raw);
  }

  const d = loose.data;

  // 3. Build validated segments
  const segments: SaySegment[] = [];
  if (d.segments && Array.isArray(d.segments)) {
    for (const seg of d.segments) {
      const parsed = SaySegmentSchema.safeParse({
        text: String(seg.text ?? ''),
        type: String(seg.type ?? 'comment'),
      });
      if (parsed.success) segments.push(parsed.data);
    }
  }

  if (segments.length === 0 && d.text) {
    segments.push({ text: d.text, type: 'comment' });
  }

  // 4. Build mood decision
  const mood = buildMood(d);

  // 5. Build music recommendation
  const recommendSong: MusicRecommendation = d.recommend_song
    ? {
        trackName: String(d.recommend_song),
        artist: String(d.recommend_artist ?? ''),
        reason: String(d.recommend_reason ?? ''),
        genre: d.recommend_genre,
        mood: d.recommend_mood,
      }
    : null;

  // 6. Valid transition
  const validTransitions = [
    'greeting', 'reply', 'weather_intro', 'schedule_intro',
    'music_intro', 'farewell', 'idle',
  ];
  const transition = (
    d.transition && validTransitions.includes(String(d.transition))
      ? String(d.transition)
      : null
  ) as BrainOutput['transition'];

  // 7. Validate full output
  const output = BrainOutputSchema.safeParse({
    say: {
      text: d.text ?? raw.slice(0, 500),
      segments,
    },
    mood,
    energy: typeof d.energy === 'number' ? d.energy : 0.5,
    recommendSong,
    transition,
    metadata: {},
  });

  if (output.success) return output.data;
  return buildFallbackOutput(raw);
}

// ===================================================================
// Helpers
// ===================================================================

function buildMood(
  d: Record<string, unknown>,
): MoodDecision {
  const validLabels = ['chill', 'energetic', 'melancholy', 'cheerful', 'neutral'];
  const label = (
    d.mood_label && validLabels.includes(String(d.mood_label))
      ? String(d.mood_label)
      : 'neutral'
  ) as MoodDecision['label'];

  return MoodDecisionSchema.parse({
    valence: typeof d.mood_valence === 'number' ? clamp(d.mood_valence, -1, 1) : 0,
    energy: typeof d.mood_energy === 'number' ? clamp(d.mood_energy, -1, 1) : 0,
    label,
    reason: String(d.mood_reason ?? ''),
  });
}

function buildFallbackOutput(raw: string): BrainOutput {
  const text = raw.slice(0, 500);
  return {
    say: {
      text,
      segments: [{ text, type: 'comment' }],
    },
    mood: {
      valence: 0,
      energy: 0,
      label: 'neutral',
      reason: 'fallback',
    },
    energy: 0.5,
    recommendSong: null,
    transition: 'reply',
    metadata: {},
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
