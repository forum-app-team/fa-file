import { errors } from '../utils/errors.js';

// Mock JWT validator: Accepts Authorization: Bearer demo-<userId>
export function requireAuth(req, _res, next) {
  const hdr = req.header('Authorization') || '';
  const m = hdr.match(/^Bearer\s+(demo-(\d+|[A-Za-z0-9_-]+))$/);
  if (!m) return next(errors.unauthorized());
  const token = m[1];
  const userId = token.replace('demo-','');
  req.user = { userId };
  next();
}


/*
// Replace the mock auth with real JWT validation
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const authHeader = req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return next(errors.unauthorized('No token provided'));
  }
  
  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Extract user info from token
    req.user = {
      userId: decoded.sub,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (err) {
    return next(errors.unauthorized('Invalid token'));
  }
}
*/