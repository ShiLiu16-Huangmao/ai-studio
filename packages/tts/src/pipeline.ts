// @ai-radio/tts — Audio pipeline: text token → sentence → TTS → audio chunks

import type { TTSAdapter, TTSChunk } from './types';
import { STREAMING, AUDIO_FORMAT } from '@ai-radio/shared';

export class AudioPipeline {
  private adapter: TTSAdapter;
  private voiceId: string;

  constructor(adapter: TTSAdapter, voiceId: string) {
    this.adapter = adapter;
    this.voiceId = voiceId;
  }

  /**
   * Process a stream of text tokens into a stream of audio chunks.
   * Tokens are accumulated until a sentence boundary is detected,
   * then flushed to TTS.
   */
  async *process(tokenStream: AsyncIterable<string>): AsyncIterable<TTSChunk> {
    const buffer: string[] = [];
    let sequence = 0;

    for await (const token of tokenStream) {
      buffer.push(token);
      const current = buffer.join('');

      // Check for sentence boundary
      const shouldFlush = this.shouldFlush(current);

      if (shouldFlush) {
        const sentence = current.trim();
        if (sentence.length >= STREAMING.MIN_SENTENCE_LENGTH) {
          const response = await this.adapter.textToSpeech({
            text: sentence,
            voiceId: this.voiceId,
            format: {
              container: 'mp3',
              sampleRate: AUDIO_FORMAT.SAMPLE_RATE,
              channels: AUDIO_FORMAT.TTS_CHANNELS,
              bitrate: AUDIO_FORMAT.BITRATE,
            },
          });

          // Yield chunks with updated sequence
          for await (const chunk of response.chunks) {
            yield {
              ...chunk,
              sequence: sequence,
              sentence: sentence,
            };
          }
          sequence++;
        }
        buffer.length = 0; // Clear buffer
      }
    }

    // Flush remaining text
    const remaining = buffer.join('').trim();
    if (remaining.length >= STREAMING.MIN_SENTENCE_LENGTH) {
      const response = await this.adapter.textToSpeech({
        text: remaining,
        voiceId: this.voiceId,
        format: {
          container: 'mp3',
          sampleRate: AUDIO_FORMAT.SAMPLE_RATE,
          channels: AUDIO_FORMAT.TTS_CHANNELS,
          bitrate: AUDIO_FORMAT.BITRATE,
        },
      });

      for await (const chunk of response.chunks) {
        yield {
          ...chunk,
          sequence: sequence,
          sentence: remaining,
        };
      }
    }
  }

  // ==================== Private ====================

  private shouldFlush(text: string): boolean {
    if (text.length > STREAMING.MAX_SENTENCE_LENGTH) {
      return true;
    }
    return STREAMING.SENTENCE_BOUNDARY.test(text);
  }
}
