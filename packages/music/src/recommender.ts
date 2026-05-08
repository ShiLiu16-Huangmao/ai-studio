// @ai-radio/music — Music recommendation engine

import type { MoodLabel } from '@ai-radio/shared';
import type { MusicAdapter, RecommendInput, RecommendResult } from './types';

/** Genre-to-mood mapping for default recommendations */
const MOOD_GENRE_MAP: Record<MoodLabel, string[]> = {
  chill: ['jazz', 'lofi', 'ambient', 'bossanova'],
  energetic: ['pop', 'rock', 'electronic', 'funk'],
  melancholy: ['blues', 'jazz', 'ballad', 'post-rock'],
  cheerful: ['citypop', 'funk', 'disco', 'indie-pop'],
  neutral: ['jazz', 'pop', 'indie', 'folk'],
};

const MOOD_REASON_MAP: Record<MoodLabel, string> = {
  chill: '适合现在放松一下',
  energetic: '给你来点活力的节奏',
  melancholy: '这首歌懂你的心情',
  cheerful: '让好心情继续',
  neutral: '为你挑选的这首歌',
};

export class MusicRecommender {
  private adapter: MusicAdapter;

  constructor(adapter: MusicAdapter) {
    this.adapter = adapter;
  }

  /** Generate music recommendations based on input */
  async recommend(input: RecommendInput): Promise<RecommendResult> {
    const mood = input.mood ?? 'neutral';
    const genres = input.genres ?? MOOD_GENRE_MAP[mood] ?? [];
    const limit = input.limit ?? 5;

    // If user provided a direct query, search for it
    if (input.query) {
      const tracks = await this.adapter.search(input.query, limit);
      return {
        tracks: this.filterExcluded(tracks, input.excludeIds),
        reason: `关于"${input.query}"的搜索结果`,
        mood: null,
      };
    }

    // Mood-based recommendation
    const allTracks = await Promise.all(
      genres.map((genre) =>
        this.adapter.getRecommendations({ genre, mood, limit: Math.ceil(limit / genres.length) }),
      ),
    );

    const tracks = this.filterExcluded(allTracks.flat(), input.excludeIds).slice(0, limit);

    return {
      tracks,
      reason: MOOD_REASON_MAP[mood] ?? '为你推荐',
      mood,
    };
  }

  /** Get genre suggestions for a given mood */
  getGenresForMood(mood: MoodLabel): string[] {
    return MOOD_GENRE_MAP[mood] ?? [];
  }

  // ==================== Private ====================

  private filterExcluded(tracks: import('@ai-radio/shared').Track[], excludeIds?: string[]) {
    if (!excludeIds?.length) return tracks;
    const excludeSet = new Set(excludeIds);
    return tracks.filter((t) => !excludeSet.has(t.id));
  }
}
