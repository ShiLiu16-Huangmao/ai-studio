// @ai-radio/web — Web Audio API utilities
// ===================================================================

/**
 * Minimal audio playback abstraction.
 * Handles AudioContext lifecycle and GainNode for ducking.
 */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  /** Initialize (must be called from user gesture) */
  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);

      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 64;
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /** Set master volume (0~1) */
  setVolume(v: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = v;
    }
  }

  /** Stop current playback */
  stop(): void {
    if (this.sourceNode) {
      try { this.sourceNode.stop(); } catch { /* already stopped */ }
      this.sourceNode = null;
    }
  }

  /** Get frequency data for waveform visualization */
  getFrequencyData(): Uint8Array | null {
    if (!this.analyserNode) return null;
    const data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(data);
    return data;
  }

  /** Check if AudioContext is available */
  get isAvailable(): boolean {
    return typeof AudioContext !== 'undefined';
  }

  /** Simulate buffer loading (mock — will be replaced with real streaming) */
  async loadMockAudio(_url: string): Promise<void> {
    this.ensureContext();
    // MVP: don't actually load audio, just initialize AudioContext
    // Real implementation will decode and play streamed chunks
  }

  destroy(): void {
    this.stop();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
      this.gainNode = null;
      this.analyserNode = null;
    }
  }
}

export const audioEngine = new AudioEngine();
