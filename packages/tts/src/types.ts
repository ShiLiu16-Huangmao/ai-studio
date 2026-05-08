// @ai-radio/tts — TTS types

export interface AudioFormat {
  container: 'mp3' | 'pcm' | 'wav';
  sampleRate: number;
  channels: number;
  bitrate: number;
}

export interface TTSRequest {
  text: string;
  voiceId: string;
  format: AudioFormat;
}

export interface TTSChunk {
  sequence: number;
  data: Uint8Array;
  sentence: string;
  format: AudioFormat;
}

export interface TTSResponse {
  messageId: string;
  chunks: AsyncIterable<TTSChunk>;
}

export interface TTSAdapter {
  /** Convert a single sentence to speech stream */
  textToSpeech(request: TTSRequest): Promise<TTSResponse>;

  /** Get available voice IDs */
  listVoices(): Promise<Array<{ id: string; name: string; language: string }>>;
}
