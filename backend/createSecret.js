const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Generate a secure JWT secret key
 */

// Generate a random 64-character hex string (256 bits of entropy)
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('\n✅ Secure JWT Secret Generated!\n');
console.log('Secret Key:', jwtSecret);
console.log('Length:', jwtSecret.length, 'characters');
console.log('Entropy:', '256 bits');

// Try to update .env file
const envPath = path.join(__dirname, '.env');

try {
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf-8');
    
    if (envContent.includes('JWT_SECRET=')) {
      // Replace existing JWT_SECRET
      envContent = envContent.replace(
        /JWT_SECRET=.*/,
        `JWT_SECRET=${jwtSecret}`
      );
      console.log('\n✅ Updated existing JWT_SECRET in .env');
    } else {
      // Add new JWT_SECRET if it doesn't exist
      envContent += `\nJWT_SECRET=${jwtSecret}`;
      console.log('\n✅ Added JWT_SECRET to .env');
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('📁 .env file updated successfully!\n');
  } else {
    console.log('\n⚠️  .env file not found. Please add this to your .env file:');
    console.log(`JWT_SECRET=${jwtSecret}\n`);
  }
} catch (error) {
  console.error('\n❌ Error updating .env file:', error.message);
  console.log('\n📋 Please manually add this line to your .env file:');
  console.log(`JWT_SECRET=${jwtSecret}\n`);
  process.exit(1);
}
