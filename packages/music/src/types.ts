// @ai-radio/music — Music types

import type { Track, MoodLabel } from '@ai-radio/shared';

export interface MusicAdapter {
  /** Search tracks by keyword */
  search(query: string, limit?: number): Promise<Track[]>;

  /** Get track details with streaming URL */
  getTrack(trackId: string): Promise<Track | null>;

  /** Get track recommendations from the music source */
  getRecommendations(params: {
    genre?: string;
    mood?: string;
    limit?: number;
  }): Promise<Track[]>;
}

export interface RecommendInput {
  /** Explicit user query */
  query?: string;

  /** Target mood for recommendation */
  mood?: MoodLabel;

  /** Preferred genres */
  genres?: string[];

  /** Tracks to avoid (recently played) */
  excludeIds?: string[];

  /** Maximum number of recommendations */
  limit: number;
}

export interface RecommendResult {
  tracks: Track[];
  reason: string; // Human-readable recommendation reason
  mood: MoodLabel | null;
}
