import jwt from 'jsonwebtoken';
import { errors } from '../utils/errors.js';
import { config } from '../config.js';

// JWT validator: expects Authorization: Bearer <HS256 JWT>
export function requireAuth(req, _res, next) {
  const authHeader = req.header('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (!token) return next(errors.unauthorized('No token provided'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY);
    const userId = decoded?.sub;
    if (!userId) return next(errors.unauthorized('Invalid token: missing sub'));

    req.user = {
      userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return next(errors.unauthorized('Invalid token'));
  }
}