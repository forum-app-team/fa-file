import { createServer } from 'http';
import app from './app.js';
import { config } from './config.js';
import { logger } from './utils/logger.js';

const server = createServer(app);
const port = config.port;
server.listen(port, () => {
  logger.info({ event: 'server_started', port }, `File Service listening on :${port}`);
});

process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'unhandledRejection');
});
process.on('uncaughtException', (err) => {
  logger.error({ err }, 'uncaughtException');
  process.exit(1);
});

