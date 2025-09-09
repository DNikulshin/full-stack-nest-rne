import { ConfigType } from '@nestjs/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load development environment variables
config({ path: resolve(process.cwd(), '.env.development') });

export default () => ({
  environment: 'development',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/postgres?schema=public',
  },
  mail: {
    host: process.env.MAIL_HOST || 'localhost',
    port: parseInt(process.env.MAIL_PORT || '1025', 10),
    secure: process.env.MAIL_SECURE === 'true',
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    from: process.env.MAIL_FROM || 'noreply@example.com',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'development-jwt-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'development-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
});