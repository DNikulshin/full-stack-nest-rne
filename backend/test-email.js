const http = require('http');

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