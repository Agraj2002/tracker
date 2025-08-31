const crypto = require('crypto');

// Generate a secure JWT secret
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('🔑 Generated JWT Secret:');
console.log(jwtSecret);
console.log('');
console.log('📋 Copy this to your Render environment variables as JWT_SECRET');
console.log('');
console.log('⚠️  Keep this secret secure and never commit it to version control!');

module.exports = jwtSecret;
