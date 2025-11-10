const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Generate a JWT token for testing purposes
 * Usage: node generateToken.js <userId> [expiresIn]
 * 
 * Examples:
 * node generateToken.js 507f1f77bcf86cd799439011
 * node generateToken.js 507f1f77bcf86cd799439011 7d
 */

const userId = process.argv[2];
const expiresIn = process.argv[3] || process.env.JWT_EXPIRE || '7d';

if (!userId) {
  console.error('❌ Error: User ID is required');
  console.log('\nUsage: node generateToken.js <userId> [expiresIn]');
  console.log('Example: node generateToken.js 507f1f77bcf86cd799439011');
  console.log('Example with expiry: node generateToken.js 507f1f77bcf86cd799439011 30d');
  process.exit(1);
}

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.error('❌ Error: JWT_SECRET is not set in .env file');
  process.exit(1);
}

try {
  const token = jwt.sign(
    { id: userId },
    jwtSecret,
    { expiresIn }
  );

  console.log('\n✅ JWT Token Generated Successfully!\n');
  console.log('Token:', token);
  console.log('\nToken Details:');
  console.log('- User ID:', userId);
  console.log('- Expires In:', expiresIn);
  console.log('- Generated At:', new Date().toISOString());
  
  // Decode token to show payload
  const decoded = jwt.decode(token, { complete: true });
  console.log('\nDecoded Payload:', JSON.stringify(decoded.payload, null, 2));
  
  console.log('\n📋 Use this token in the Authorization header:');
  console.log('Authorization: Bearer ' + token);
  
} catch (error) {
  console.error('❌ Error generating token:', error.message);
  process.exit(1);
}
