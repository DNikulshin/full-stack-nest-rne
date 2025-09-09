const http = require('http');

// Test sending an email with forwarding
const sendEmailWithForwarding = () => {
  const data = JSON.stringify({
    to: 'user@example.com',
    subject: 'Test Email with Forwarding',
    text: 'This is a test email to verify the forwarding functionality.'
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

sendEmailWithForwarding();