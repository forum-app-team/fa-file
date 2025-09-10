import { errors } from '../utils/errors.js';

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(errors.unprocessable('Validation failed', result.error.issues));
  }
  req.validated = result.data;
  next();
};

