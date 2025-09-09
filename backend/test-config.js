const { config } = require('dotenv');
const { resolve } = require('path');

// Load development environment variables
config({ path: resolve(process.cwd(), '.env.development') });

console.log('MAIL_HOST:', process.env.MAIL_HOST);
console.log('MAIL_PORT:', process.env.MAIL_PORT);
console.log('MAIL_SECURE:', process.env.MAIL_SECURE);
console.log('MAIL_USER:', process.env.MAIL_USER);
console.log('MAIL_PASS:', process.env.MAIL_PASS);
console.log('MAIL_FROM:', process.env.MAIL_FROM);