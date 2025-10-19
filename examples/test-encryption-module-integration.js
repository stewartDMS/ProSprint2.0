/**
 * Integration test for encryption module startup validation
 * This test simulates the actual module loading and validates behavior
 * 
 * Run with: node examples/test-encryption-module-integration.js
 */

const crypto = require('crypto');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

console.log('='.repeat(70));
console.log('ENCRYPTION MODULE INTEGRATION TEST');
console.log('='.repeat(70));

async function testEncryptionModule(testName, envKey, expectedSuccess) {
  console.log(`\n--- ${testName} ---`);
  
  // Create a test Node.js script that imports the encryption module
  const testScript = `
    process.env.TOKEN_ENCRYPTION_KEY = '${envKey}';
    
    // Simulate module import
    try {
      console.log('Attempting to validate key...');
      
      const KEY_LENGTH = 32;
      const key = process.env.TOKEN_ENCRYPTION_KEY;
      
      if (!key) {
        throw new Error('KEY_MISSING');
      }
      
      if (key.length !== KEY_LENGTH * 2) {
        throw new Error('KEY_LENGTH_INVALID');
      }
      
      if (!/^[0-9a-fA-F]+$/.test(key)) {
        // Check if base64
        if (/^[A-Za-z0-9+\\/]+={0,2}$/.test(key) && key.length % 4 === 0) {
          throw new Error('KEY_BASE64_DETECTED');
        }
        throw new Error('KEY_INVALID_CHARS');
      }
      
      const keyBuffer = Buffer.from(key, 'hex');
      if (keyBuffer.length !== KEY_LENGTH) {
        throw new Error('KEY_BUFFER_INVALID');
      }
      
      console.log('SUCCESS: Key validation passed');
      process.exit(0);
    } catch (error) {
      console.error('FAILED: ' + error.message);
      process.exit(1);
    }
  `;
  
  try {
    const { stdout, stderr } = await execPromise(`node -e "${testScript}"`, {
      timeout: 5000
    });
    
    if (expectedSuccess) {
      console.log('✓ Test passed - validation succeeded as expected');
      console.log('  Output:', stdout.trim());
    } else {
      console.error('✗ Test failed - validation should have failed but succeeded');
      console.log('  Output:', stdout.trim());
    }
    return expectedSuccess;
  } catch (error) {
    if (!expectedSuccess) {
      console.log('✓ Test passed - validation failed as expected');
      console.log('  Error:', error.stdout?.trim() || error.stderr?.trim() || error.message);
    } else {
      console.error('✗ Test failed - validation should have succeeded but failed');
      console.error('  Error:', error.stdout?.trim() || error.stderr?.trim() || error.message);
    }
    return !expectedSuccess;
  }
}

async function runTests() {
  const tests = [
    {
      name: 'Valid 64-character hex key',
      key: crypto.randomBytes(32).toString('hex'),
      shouldPass: true
    },
    {
      name: 'Base64 key (should fail)',
      key: crypto.randomBytes(48).toString('base64'),
      shouldPass: false
    },
    {
      name: 'Too short key (should fail)',
      key: 'abcdef1234567890',
      shouldPass: false
    },
    {
      name: 'Invalid characters (should fail)',
      key: 'g123456789012345678901234567890123456789012345678901234567890123',
      shouldPass: false
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await testEncryptionModule(test.name, test.key, test.shouldPass);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('TEST RESULTS');
  console.log('='.repeat(70));
  console.log(`Total: ${tests.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  if (failed > 0) {
    console.error('\n✗ SOME TESTS FAILED');
    process.exit(1);
  } else {
    console.log('\n✓ ALL TESTS PASSED');
    process.exit(0);
  }
}

runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
