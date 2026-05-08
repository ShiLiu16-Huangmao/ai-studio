// @ai-radio/server — Application entry point

import { createApp } from './app';

const PORT = process.env.RADIO_SERVER_PORT
  ? parseInt(process.env.RADIO_SERVER_PORT, 10)
  : 3001;

async function main(): Promise<void> {
  const app = await createApp();

  app.listen(PORT, () => {
    console.info(`[AI Radio] Server running at http://localhost:${PORT}`);
    console.info(`[AI Radio] WebSocket at ws://localhost:${PORT}/ws`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
