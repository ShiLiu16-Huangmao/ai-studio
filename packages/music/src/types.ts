// @ai-radio/music — Music types

import type { Song, MoodType } from '@ai-radio/shared';

export interface MusicAdapter {
  /** Search tracks by keyword */
  search(query: string, limit?: number): Promise<Song[]>;

  /** Get track details with streaming URL */
  getTrack(trackId: string): Promise<Song | null>;

  /** Get track recommendations from the music source */
  getRecommendations(params: {
    genre?: string;
    mood?: string;
    limit?: number;
  }): Promise<Song[]>;
}

export interface RecommendInput {
  /** Explicit user query */
  query?: string;

  /** Target mood for recommendation */
  mood?: MoodType;

  /** Preferred genres */
  genres?: string[];

  /** Tracks to avoid (recently played) */
  excludeIds?: string[];

  /** Maximum number of recommendations */
  limit: number;
}

export interface RecommendResult {
  tracks: Song[];
  reason: string;
  mood: MoodType | null;
}
