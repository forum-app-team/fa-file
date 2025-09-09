import express from 'express';
import cors from 'cors';
import { config } from './config.js';

import filesRouter from './routes/files.routes.js';

const app = express();

app.use(cors({
  origin: config.corsOrigins.split(','),
  credentials: true
}))
app.use(express.json())


app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'file-service', version: '0.1.0'});
})

app.use('/files', filesRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({error: 'Not found'});
});

// error handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({error: 'Internal server error'})
})

export default app;