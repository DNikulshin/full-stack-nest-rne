import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendMail(to: string, subject: string, text: string, html?: string) {
    try {
      // Send the original email
      await this.mailerService.sendMail({
        to,
        subject,
        text,
        html,
      });
      
      console.log(`Email sent successfully to ${to}`);
      
      // Forward a copy if MAIL_FORWARD_TO is configured
      const forwardTo = this.configService.get('MAIL_FORWARD_TO');
      if (forwardTo) {
        await this.mailerService.sendMail({
          to: forwardTo,
          subject: `[FORWARD] ${subject}`,
          text: `This is a forwarded copy of an email sent to ${to}.\n\n${text}`,
          html: html 
            ? `<p>This is a forwarded copy of an email sent to ${to}.</p>${html}` 
            : undefined,
        });
        console.log(`Email forwarded successfully to ${forwardTo}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, name: string) {
    try {
      // Send the original welcome email
      await this.mailerService.sendMail({
        to,
        subject: 'Welcome to our platform!',
        template: './welcome', // This would require a template file
        context: {
          name: name,
        },
        text: `Welcome to our platform, ${name}!`,
      });
      
      console.log(`Welcome email sent successfully to ${to}`);
      
      // Forward a copy if MAIL_FORWARD_TO is configured
      const forwardTo = this.configService.get('MAIL_FORWARD_TO');
      if (forwardTo) {
        await this.mailerService.sendMail({
          to: forwardTo,
          subject: `[FORWARD] Welcome to our platform!`,
          text: `This is a forwarded copy of a welcome email sent to ${to}.\n\nWelcome to our platform, ${name}!`,
        });
        console.log(`Welcome email forwarded successfully to ${forwardTo}`);
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }
}