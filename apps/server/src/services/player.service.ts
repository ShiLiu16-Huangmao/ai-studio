// @ai-radio/server — Player state service (mock)
// ===================================================================

import type { Song } from '@ai-radio/shared';
import { logger } from '../utils/logger';
import { eventBus, InternalEvents } from '../websocket/events';

/** Mock track for demo */
const MOCK_TRACK: Song = {
  id: 'mock_001',
  name: 'Fly Me to the Moon',
  artist: 'Frank Sinatra',
  album: "It Might as Well Be Swing",
  coverUrl: 'https://picsum.photos/400/400',
  mp3Url: 'https://example.com/mock-song.mp3',
  duration: 239,
  source: 'netease',
};

export class PlayerService {
  private currentSong: Song | null = null;
  private isPlaying = false;
  private volume = 0.8;
  private progress = 0;

  /** Get current player state */
  getState() {
    return {
      currentSong: this.currentSong,
      isPlaying: this.isPlaying,
      volume: this.volume,
      progress: this.progress,
    };
  }

  /** Get a mock track for demo */
  getMockTrack(): Song {
    return { ...MOCK_TRACK };
  }

  /** Play a track */
  play(song: Song): void {
    this.currentSong = song;
    this.isPlaying = true;
    this.progress = 0;

    eventBus.emit(InternalEvents.MUSIC_PLAYING_START, {
      song,
      isPlaying: true,
    });

    eventBus.emit(InternalEvents.PLAYER_STATE_CHANGED, this.getState());

    logger.info({ song: song.name }, 'Now playing');
  }

  /** Pause playback */
  pause(): void {
    this.isPlaying = false;

    eventBus.emit(InternalEvents.MUSIC_PLAYING_STOP, {
      song: this.currentSong,
      reason: 'paused',
    });

    eventBus.emit(InternalEvents.PLAYER_STATE_CHANGED, this.getState());

    logger.info('Playback paused');
  }

  /** Stop playback */
  stop(): void {
    this.currentSong = null;
    this.isPlaying = false;
    this.progress = 0;

    eventBus.emit(InternalEvents.MUSIC_PLAYING_STOP, { reason: 'stopped' });
    eventBus.emit(InternalEvents.PLAYER_STATE_CHANGED, this.getState());

    logger.info('Playback stopped');
  }

  /** Set volume (0~1) */
  setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    eventBus.emit(InternalEvents.PLAYER_STATE_CHANGED, this.getState());
  }
}

export const playerService = new PlayerService();
