import { Controller, Post, Body, HttpStatus, HttpException } from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiProperty } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';

class SendEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Recipient email address',
  })
  to: string;

  @ApiProperty({
    example: 'Welcome to our platform!',
    description: 'Email subject',
  })
  subject: string;

  @ApiProperty({
    example: 'Welcome to our platform! We are excited to have you.',
    description: 'Plain text email content',
  })
  text: string;

  @ApiProperty({
    example: '<p>Welcome to our platform!</p><p>We are excited to have you.</p>',
    description: 'HTML email content (optional)',
    required: false,
  })
  html?: string;
}

class SendWelcomeEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Recipient email address',
  })
  to: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Recipient name',
  })
  name: string;
}

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Public()
  @Post('send')
  @ApiOperation({ summary: 'Send an email' })
  @ApiResponse({ status: 200, description: 'Email sent successfully.' })
  @ApiResponse({ status: 500, description: 'Failed to send email.' })
  @ApiBody({ type: SendEmailDto })
  async sendEmail(
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('text') text: string,
    @Body('html') html?: string,
  ) {
    try {
      await this.mailService.sendMail(to, subject, text, html);
      return {
        statusCode: HttpStatus.OK,
        message: 'Email sent successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to send email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Post('welcome')
  @ApiOperation({ summary: 'Send a welcome email' })
  @ApiResponse({ status: 200, description: 'Welcome email sent successfully.' })
  @ApiResponse({ status: 500, description: 'Failed to send welcome email.' })
  @ApiBody({ type: SendWelcomeEmailDto })
  async sendWelcomeEmail(
    @Body('to') to: string,
    @Body('name') name: string,
  ) {
    try {
      await this.mailService.sendWelcomeEmail(to, name);
      return {
        statusCode: HttpStatus.OK,
        message: 'Welcome email sent successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to send welcome email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}