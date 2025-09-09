const http = require('http');

// Test sending a simple email
const sendEmail = () => {
  const data = JSON.stringify({
    to: 'test@example.com',
    subject: 'Test Email',
    text: 'This is a test email from our NestJS application'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/mail/send',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    res.on('data', (chunk) => {
      console.log(`Response: ${chunk}`);
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.write(data);
  req.end();
};

// Test sending a welcome email
const sendWelcomeEmail = () => {
  const data = JSON.stringify({
    to: 'welcome@example.com',
    name: 'John Doe'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/mail/welcome',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Welcome Email Status: ${res.statusCode}`);
    res.on('data', (chunk) => {
      console.log(`Response: ${chunk}`);
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.write(data);
  req.end();
};

// Send both emails
sendEmail();
setTimeout(sendWelcomeEmail, 1000);