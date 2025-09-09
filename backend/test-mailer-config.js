const { MailerModule, MailerService } = require('@nestjs-modules/mailer');
const { ConfigModule, ConfigService } = require('@nestjs/config');
const { Test } = require('@nestjs/testing');

async function testMailerConfig() {
  console.log('Testing mailer configuration...');
  
  try {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MailerModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService) => ({
            transport: {
              host: configService.get('MAIL_HOST', 'localhost'),
              port: configService.get('MAIL_PORT', 1027),
              secure: configService.get('MAIL_SECURE', false),
              auth: {
                user: configService.get('MAIL_USER', ''),
                pass: configService.get('MAIL_PASS', ''),
              },
              tls: {
                rejectUnauthorized: false,
              },
              ignoreTLS: true,
            },
            defaults: {
              from: `"No Reply" <${configService.get('MAIL_FROM', 'noreply@example.com')}>`,
            },
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [MailerService],
    }).compile();

    const mailerService = moduleRef.get(MailerService);
    
    // Test sending an email
    await mailerService.sendMail({
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email',
    });
    
    console.log('✓ Email sent successfully');
  } catch (error) {
    console.error('✗ Error sending email:', error);
  }
}

testMailerConfig();