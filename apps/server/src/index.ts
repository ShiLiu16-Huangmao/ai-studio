// @ai-radio/server — Application entry point
// ===================================================================

import { createApp } from './app/createApp';
import { env } from './utils/env';
import { logger } from './utils/logger';

async function main(): Promise<void> {
  logger.info('Starting AI Radio server...');

  const app = createApp();
  app.listen(env.RADIO_SERVER_PORT);
}

main().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
