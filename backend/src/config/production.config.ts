import { ConfigType } from '@nestjs/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load production environment variables
config({ path: resolve(process.cwd(), '.env.production') });

export default () => ({
  environment: 'production',
  database: {
    url: process.env.DATABASE_URL,
  },
  mail: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: process.env.MAIL_SECURE === 'true',
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  frontend: {
    url: process.env.FRONTEND_URL,
  },
});