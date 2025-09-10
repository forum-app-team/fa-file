import { randomUUID } from 'crypto';

export const requestId = () => (req, res, next) => {
  const incoming = req.header('X-Request-ID');
  const id = incoming && incoming.trim() ? incoming.trim() : randomUUID();
  req.id = id;
  res.setHeader('X-Request-ID', id);
  next();
};

