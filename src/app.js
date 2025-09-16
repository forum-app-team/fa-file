import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger.js';
import { config } from './config.js';
import { requestId } from './middleware/requestId.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import filesRouter from './routes/files.routes.js';

const app = express();

app.use(requestId());
app.use(pinoHttp({ logger, customLogLevel: (res, err) => (err || res.statusCode >= 400 ? 'error' : 'info') }));
app.use(cors({ origin: config.corsOrigins.split(','), credentials: true }));
app.use(express.json({ limit: '5mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'forum-file-service', version: '0.1.0' });
});
app.get('/api/files/health', (_req, res) => {
  res.json({ status: 'ok', service: 'forum-file-service', version: '0.1.0' });
});


app.use('/api/files', filesRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

