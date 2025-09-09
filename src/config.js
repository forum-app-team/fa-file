import 'dotenv/config';

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 8080),
  corsOrigins: process.env.CORS_ORIGINS || 'http://localhost:3000',
}