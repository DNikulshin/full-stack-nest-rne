/**
 * Test script to verify email configuration
 * Run with: node test-email-config.js
 */

const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.development' });

async function testEmailConfig() {
  console.log('Testing email configuration...');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Mail Host:', process.env.MAIL_HOST || 'localhost');
  console.log('Mail Port:', process.env.MAIL_PORT || 1025);
  
  // Create transporter using environment variables
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'localhost',
    port: process.env.MAIL_PORT || 1025,
    secure: process.env.MAIL_SECURE === 'true', // true for 465, false for other ports
    ignoreTLS: true,
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    // Verify connection configuration
    await transporter.verify();
    console.log('✓ Email server connection verified successfully');
    
    // Send test email (only if MAIL_USER is configured)
    if (process.env.MAIL_USER && process.env.MAIL_FROM) {
      const info = await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: process.env.MAIL_FROM, // Send to self for testing
        subject: 'Test Email Configuration',
        text: 'This is a test email to verify the email configuration.',
        html: '<p>This is a <b>test email</b> to verify the email configuration.</p>',
      });
      
      console.log('✓ Test email sent successfully');
      console.log('  Message ID:', info.messageId);
    } else {
      console.log('ℹ️  MAIL_USER or MAIL_FROM not configured, skipping test email send');
    }
  } catch (error) {
    console.error('✗ Email configuration test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testEmailConfig();