import { config } from '../config.js';
import { errors } from '../utils/errors.js';

// Simple in-memory sliding window per userId
const buckets = new Map();

export function rateLimit() {
  return (req, res, next) => {
    const userId = req.user?.userId || 'anon';
    const key = `${userId}`;
    const now = Date.now();
    const windowMs = 60 * 1000;
    const limit = config.rateLimitPerMinute;

    if (!buckets.has(key)) buckets.set(key, []);
    const arr = buckets.get(key);

    // remove old
    while (arr.length && now - arr[0] > windowMs) arr.shift();
    if (arr.length >= limit) {
      const retryAfter = Math.ceil((windowMs - (now - arr[0])) / 1000);
      const err = errors.tooMany(retryAfter);
      res.setHeader('Retry-After', String(retryAfter));
      return next(err);
    }
    arr.push(now);
    next();
  };
}

