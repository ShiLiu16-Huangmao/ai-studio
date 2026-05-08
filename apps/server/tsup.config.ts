import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  external: [
    '@ai-radio/shared',
    '@ai-radio/prompts',
    '@ai-radio/scheduler',
    '@ai-radio/tts',
    '@ai-radio/music',
    '@ai-radio/memory',
    '@ai-radio/brain',
    'express',
    'ws',
    'pino',
  ],
});
