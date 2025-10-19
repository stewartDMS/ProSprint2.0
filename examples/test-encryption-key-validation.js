/**
 * Encryption Key Validation Test
 * 
 * This test demonstrates the encryption key validation behavior.
 * It tests various key formats to ensure proper validation.
 * 
 * Run with: node examples/test-encryption-key-validation.js
 */

const crypto = require('crypto');

console.log('='.repeat(70));
console.log('ENCRYPTION KEY VALIDATION TEST');
console.log('='.repeat(70));

/**
 * Helper function to check if a string is valid hex
 */
function isHexString(str) {
  return /^[0-9a-fA-F]+$/.test(str);
}

/**
 * Helper function to check if a string appears to be base64
 */
function isBase64(str) {
  const base64Pattern = /^[A-Za-z0-9+\/]+={0,2}$/;
  return base64Pattern.test(str) && str.length % 4 === 0;
}

/**
 * Validate a key according to TOKEN_ENCRYPTION_KEY requirements
 */
function validateKey(key, testName) {
  console.log(`\n--- ${testName} ---`);
  console.log(`Key: ${key.substring(0, 30)}...`);
  console.log(`Length: ${key.length} characters`);
  
  const KEY_LENGTH = 32; // 32 bytes = 256 bits
  const expectedLength = KEY_LENGTH * 2; // 64 hex characters
  
  // Check 1: Length validation
  if (key.length !== expectedLength) {
    console.error(`✗ FAILED: Key length is ${key.length}, expected ${expectedLength}`);
    return false;
  }
  console.log(`✓ Length check passed: ${key.length} characters`);
  
  // Check 2: Hex format validation
  if (!isHexString(key)) {
    if (isBase64(key)) {
      console.error('✗ FAILED: Key appears to be base64 encoded - MUST be hex!');
      console.error('  Generate a proper hex key with:');
      console.error('  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    } else {
      console.error('✗ FAILED: Key contains invalid characters');
      console.error('  Key must contain only hexadecimal characters (0-9, a-f, A-F)');
    }
    return false;
  }
  console.log('✓ Hex format check passed');
  
  // Check 3: Buffer conversion
  const keyBuffer = Buffer.from(key, 'hex');
  if (keyBuffer.length !== KEY_LENGTH) {
    console.error(`✗ FAILED: Buffer conversion error (expected ${KEY_LENGTH} bytes, got ${keyBuffer.length})`);
    return false;
  }
  console.log(`✓ Buffer conversion passed: ${keyBuffer.length} bytes`);
  
  console.log('✓ ALL CHECKS PASSED - Key is valid!');
  return true;
}

// Test cases
const testCases = [
  {
    name: 'Valid 64-character hex key',
    key: crypto.randomBytes(32).toString('hex'),
    shouldPass: true
  },
  {
    name: 'Base64 encoded key (should fail)',
    key: crypto.randomBytes(48).toString('base64'),
    shouldPass: false
  },
  {
    name: 'Too short hex key (should fail)',
    key: crypto.randomBytes(16).toString('hex'),
    shouldPass: false
  },
  {
    name: 'Too long hex key (should fail)',
    key: crypto.randomBytes(40).toString('hex'),
    shouldPass: false
  },
  {
    name: 'Invalid characters in key (should fail)',
    key: 'zzzz' + crypto.randomBytes(30).toString('hex'),
    shouldPass: false
  },
  {
    name: 'Another valid 64-character hex key',
    key: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    shouldPass: true
  }
];

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  const result = validateKey(testCase.key, testCase.name);
  
  if (result === testCase.shouldPass) {
    passed++;
  } else {
    console.error(`\n!!! TEST FAILED: Expected ${testCase.shouldPass ? 'pass' : 'fail'}, got ${result ? 'pass' : 'fail'}`);
    failed++;
  }
}

console.log('\n' + '='.repeat(70));
console.log('TEST SUMMARY');
console.log('='.repeat(70));
console.log(`Total tests: ${testCases.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  console.error('\n✗ SOME TESTS FAILED');
  process.exit(1);
} else {
  console.log('\n✓ ALL TESTS PASSED');
  console.log('\nTo generate a valid encryption key, run:');
  console.log('  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  process.exit(0);
}
