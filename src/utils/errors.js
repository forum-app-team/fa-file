export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const errors = {
  unauthorized: (message = 'Authentication required') => new ApiError(401, 'UNAUTHORIZED', message),
  forbidden: (message = 'Access denied') => new ApiError(403, 'FORBIDDEN', message),
  notFound: (message = 'Resource not found') => new ApiError(404, 'NOT_FOUND', message),
  badRequest: (message, details) => new ApiError(400, 'BAD_REQUEST', message, details),
  unprocessable: (message, details) => new ApiError(422, 'UNPROCESSABLE_ENTITY', message, details),
  conflict: (message, details) => new ApiError(409, 'CONFLICT', message, details),
  tooLarge: (message, details) => new ApiError(413, 'PAYLOAD_TOO_LARGE', message, details),
  unsupported: (message, details) => new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', message, details),
  tooMany: (retryAfterSec) => {
    const e = new ApiError(429, 'TOO_MANY_REQUESTS', 'Too many requests');
    e.retryAfterSec = retryAfterSec;
    return e;
  },
  internal: (message = 'Internal server error', details) => new ApiError(500, 'INTERNAL_SERVER_ERROR', message, details),
};

