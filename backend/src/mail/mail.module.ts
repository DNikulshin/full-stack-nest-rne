import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const environment = configService.get('NODE_ENV', 'development');
        
        // Development configuration (Docker with MailHog)
        if (environment === 'development') {
          return {
            transport: {
              host: configService.get('MAIL_HOST', 'localhost'),
              port: configService.get('MAIL_PORT', 1025),
              secure: false, // Force secure to false for development
              ignoreTLS: true,
              auth: false, // No authentication for MailHog
              tls: {
                rejectUnauthorized: false,
              },
            },
            defaults: {
              from: `"No Reply" <${configService.get('MAIL_FROM', 'noreply@example.com')}>`,
            },
          };
        }
        
        // Production configuration (.env file with real SMTP)
        return {
          transport: {
            host: configService.get('MAIL_HOST'),
            port: configService.get('MAIL_PORT'),
            secure: configService.get('MAIL_SECURE', false),
            auth: {
              user: configService.get('MAIL_USER'),
              pass: configService.get('MAIL_PASS'),
            },
            tls: {
              rejectUnauthorized: false,
            },
          },
          defaults: {
            from: `"No Reply" <${configService.get('MAIL_FROM')}>`,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}