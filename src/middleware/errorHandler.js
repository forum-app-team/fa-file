import { ApiError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export function notFoundHandler(_req, res, _next) {
  res.status(404).json({ traceId: res.getHeader('X-Request-ID'), error: { code: 'NOT_FOUND', message: 'Route not found' } });
}

export function errorHandler(err, req, res, _next) {
  if (!(err instanceof ApiError)) {
    logger.error({ err, traceId: req.id }, 'Unhandled error');
  }
  const status = err.status || 500;
  const payload = {
    traceId: req.id,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Unexpected error',
      details: err.details,
    },
  };
  res.status(status).json(payload);
}

