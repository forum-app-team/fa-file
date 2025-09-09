import { createServer } from 'http';
import app from './app.js';
import { config } from './config.js';

const server = createServer(app);

server.listen(config.port, () => {
  console.log(`File Service listening on :${config.port}`);
});