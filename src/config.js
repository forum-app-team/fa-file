import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 8080),
  corsOrigins: process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000',
  // Auth (mock)
  jwtPublicKey: process.env.JWT_PUBLIC_KEY || 'MOCK',
  // S3
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  bucket: process.env.S3_BUCKET,
  endpoint: process.env.S3_ENDPOINT || undefined,
  publicBaseUrl: process.env.S3_PUBLIC_BASE_URL,
  sse: process.env.S3_SSE || 'AES256',
  // Presign
  presignExpiresSeconds: Number(process.env.PRESIGN_EXPIRES_SECONDS || 600),
  // Rate Limit
  rateLimitPerMinute: Number(process.env.RATE_LIMIT_PER_MINUTE || 60),
  // Testing/dev
  mockS3: (process.env.MOCK_S3 || 'true') === 'true',
};

