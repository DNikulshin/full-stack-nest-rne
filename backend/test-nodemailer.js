const nodemailer = require('nodemailer');

async function testNodemailer() {
  console.log('Testing nodemailer configuration...');
  
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      secure: false, // true for 465, false for other ports
      tls: {
        rejectUnauthorized: false,
      },
      ignoreTLS: true,
    });
    
    // Verify connection
    await transporter.verify();
    console.log('✓ Connection verified successfully');
    
    // Send test email
    const info = await transporter.sendMail({
      from: '"No Reply" <noreply@example.com>',
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email',
    });
    
    console.log('✓ Email sent successfully');
    console.log('  Message ID:', info.messageId);
  } catch (error) {
    console.error('✗ Error:', error);
  }
}

testNodemailer();