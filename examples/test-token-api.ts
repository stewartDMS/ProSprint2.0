/**
 * Example Test Script for Token Storage API
 * 
 * This script demonstrates how to use the /api/tokens endpoint
 * for storing and retrieving encrypted OAuth tokens.
 * 
 * Prerequisites:
 * 1. Set up .env with TOKEN_ENCRYPTION_KEY and DATABASE_URL
 * 2. Run: npx prisma migrate dev (to set up the database)
 * 3. Start the dev server: npm run dev
 * 
 * Usage:
 *   # From project root
 *   npx ts-node examples/test-token-api.ts
 *   
 *   # Or from examples directory
 *   cd examples && npx ts-node test-token-api.ts
 */

import crypto from 'crypto';
import { encrypt, decrypt, validateEncryptionConfig } from '../lib/encryption';
import { store } from '../lib/tokenStorage';

/**
 * Test encryption and decryption functionality
 */
export async function testEncryption() {
  console.log('🔐 Testing Token Encryption...\n');

  try {
    // Validate encryption configuration
    console.log('1. Validating encryption configuration...');
    validateEncryptionConfig();
    console.log('   ✓ Encryption configuration is valid\n');

    // Test encryption/decryption with a sample token
    console.log('2. Testing encryption/decryption...');
    const sampleToken = 'ya29.a0AfH6SMBxyz123_sample_access_token';
    console.log(`   Original token: ${sampleToken.substring(0, 20)}...`);

    const encrypted = encrypt(sampleToken);
    console.log(`   Encrypted: ${encrypted.substring(0, 50)}...`);

    const decrypted = decrypt(encrypted);
    console.log(`   Decrypted: ${decrypted.substring(0, 20)}...`);

    if (decrypted === sampleToken) {
      console.log('   ✓ Encryption/decryption successful\n');
    } else {
      console.error('   ✗ Decrypted token does not match original\n');
      process.exit(1);
    }

    // Test with multiple encryptions (each should be unique due to random IV)
    console.log('3. Testing encryption uniqueness (random IV)...');
    const encrypted1 = encrypt(sampleToken);
    const encrypted2 = encrypt(sampleToken);
    
    if (encrypted1 !== encrypted2) {
      console.log('   ✓ Each encryption produces unique ciphertext\n');
    } else {
      console.error('   ✗ Encryptions are identical (should be unique)\n');
      process.exit(1);
    }

    // Both should decrypt to the same value
    const decrypted1 = decrypt(encrypted1);
    const decrypted2 = decrypt(encrypted2);
    
    if (decrypted1 === decrypted2 && decrypted1 === sampleToken) {
      console.log('   ✓ Both encrypted values decrypt correctly\n');
    } else {
      console.error('   ✗ Decryption mismatch\n');
      process.exit(1);
    }

    console.log('✅ All encryption tests passed!\n');
    
    console.log('📝 Example API Usage:\n');
    console.log('POST /api/tokens');
    console.log(JSON.stringify({
      userId: 'user123',
      integration: 'gmail',
      token: {
        access_token: 'ya29.a0AfH6SMB...',
        refresh_token: '1//0gZx...',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
        token_type: 'Bearer'
      }
    }, null, 2));
    console.log('\nGET /api/tokens?userId=user123&integration=gmail\n');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Example: How to use the API from client code
 */
export async function exampleApiUsage() {
  console.log('📚 Example API Usage from Client Code:\n');

  // Example 1: Storing a token
  console.log('1. Store a token:');
  console.log(`
const response = await fetch('/api/tokens', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'user123',
    integration: 'gmail',
    token: {
      access_token: 'ya29.a0AfH6SMB...',
      refresh_token: '1//0gZx...',
      expires_at: ${Math.floor(Date.now() / 1000) + 3600},
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
      token_type: 'Bearer'
    }
  })
});

const data = await response.json();
console.log(data);
// { success: true, message: "Token stored successfully for gmail:user123" }
  `);

  // Example 2: Retrieving a token
  console.log('2. Retrieve a token:');
  console.log(`
const response = await fetch('/api/tokens?userId=user123&integration=gmail');
const data = await response.json();

if (data.success) {
  console.log('Access token:', data.data.access_token);
  console.log('Expires at:', new Date(data.data.expires_at * 1000));
}
  `);

  // Example 3: Using with integrations
  console.log('3. Integration callback example:');
  console.log(`
// In your OAuth callback handler (e.g., /api/integrations/gmail/callback)
export default async function handler(req, res) {
  // Exchange code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: JSON.stringify({
      code: req.query.code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });
  
  const tokens = await tokenResponse.json();
  
  // Store encrypted tokens using the library directly (recommended for server-side)
  // Note: In real code, use a static import at the top of the file:
  // import { store } from '../lib/tokenStorage';
  await store('gmail', 'user123', {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
    scope: tokens.scope,
    token_type: tokens.token_type,
  });
  
  // Or via HTTP (if calling from client-side or external service)
  /*
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  await fetch(\`\${baseUrl}/api/tokens\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'user123',
      integration: 'gmail',
      token: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
        scope: tokens.scope,
        token_type: tokens.token_type,
      },
    }),
  });
  */
  
  res.redirect('/integrations?success=true');
}
  `);
}

// Run tests if executed directly
if (require.main === module) {
  testEncryption()
    .then(() => exampleApiUsage())
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}
