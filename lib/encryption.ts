/**
 * Encryption Utility for Token Storage
 * 
 * Provides AES-256-GCM encryption/decryption for sensitive OAuth tokens.
 * Uses a secret key from environment variables for encryption at rest.
 * 
 * Security Features:
 * - AES-256-GCM (Galois/Counter Mode) for authenticated encryption
 * - Random IV (initialization vector) for each encryption
 * - Authentication tags to prevent tampering
 * - Base64 encoding for database storage
 * 
 * Environment Variables Required:
 * - TOKEN_ENCRYPTION_KEY (recommended) or ENCRYPTION_KEY (legacy): 
 *   32-byte (256-bit) secret key in HEXADECIMAL format (64 characters)
 *   IMPORTANT: Must be HEX, NOT base64!
 *   Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 * 
 * Key Format Requirements:
 * - MUST be exactly 64 hexadecimal characters (0-9, a-f, A-F)
 * - MUST NOT be base64 encoded
 * - Example valid key: "a1b2c3d4e5f6...64 hex chars total..."
 * 
 * @module encryption
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128-bit IV for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag
const KEY_LENGTH = 32; // 256-bit key

// Debug logging: Log encryption key availability at application startup
// This helps diagnose issues with environment variable configuration in production
console.log('[Encryption] ========================================');
console.log('[Encryption] Encryption Module Startup Validation');
console.log('[Encryption] ========================================');
console.log(`[Encryption] TOKEN_ENCRYPTION_KEY available: ${!!process.env.TOKEN_ENCRYPTION_KEY}`);
console.log(`[Encryption] ENCRYPTION_KEY available: ${!!process.env.ENCRYPTION_KEY}`);

// Validate encryption configuration at startup
if (process.env.TOKEN_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY) {
  const key = process.env.TOKEN_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
  console.log(`[Encryption] Key length: ${key?.length} characters`);
  console.log(`[Encryption] Expected: ${KEY_LENGTH * 2} characters (64 hex chars for ${KEY_LENGTH} bytes)`);
  
  // Perform validation checks without throwing to provide complete diagnostic info
  if (key && key.length !== KEY_LENGTH * 2) {
    console.error(`[Encryption] WARNING: Key length is incorrect (expected ${KEY_LENGTH * 2}, got ${key.length})`);
  }
  
  if (key && !/^[0-9a-fA-F]+$/.test(key)) {
    console.error('[Encryption] WARNING: Key contains non-hexadecimal characters');
    // Check if it looks like base64
    if (/^[A-Za-z0-9+/]+={0,2}$/.test(key) && key.length % 4 === 0) {
      console.error('[Encryption] WARNING: Key appears to be base64 encoded - must be hex!');
    }
  }
  
  // Try to validate the key (this will throw if invalid, but we catch it for logging)
  try {
    getEncryptionKey();
    console.log('[Encryption] ✓ Encryption key validation PASSED');
  } catch (error) {
    console.error('[Encryption] ✗ Encryption key validation FAILED');
    console.error(`[Encryption] Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('[Encryption] Application will fail when attempting to encrypt/decrypt tokens');
  }
} else {
  console.error('[Encryption] WARNING: No encryption key configured');
  console.error('[Encryption] Application will fail when attempting to encrypt/decrypt tokens');
}
console.log('[Encryption] ========================================');

/**
 * Check if a string appears to be base64 encoded
 * Base64 strings contain only A-Z, a-z, 0-9, +, /, and optional = padding
 * @param str - String to check
 * @returns true if string appears to be base64
 */
function isBase64(str: string): boolean {
  // Base64 regex pattern - must match entire string
  const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;
  return base64Pattern.test(str) && str.length % 4 === 0;
}

/**
 * Check if a string is a valid hexadecimal string
 * @param str - String to check
 * @returns true if string contains only hex characters (0-9, a-f, A-F)
 */
function isHexString(str: string): boolean {
  return /^[0-9a-fA-F]+$/.test(str);
}

/**
 * Get the encryption key from environment variables
 * Supports both TOKEN_ENCRYPTION_KEY and ENCRYPTION_KEY for backwards compatibility
 * @throws Error if neither key is set or if the key is invalid
 */
function getEncryptionKey(): Buffer {
  // Try TOKEN_ENCRYPTION_KEY first (as specified in requirements), then fall back to ENCRYPTION_KEY
  const key = process.env.TOKEN_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error(
      'TOKEN_ENCRYPTION_KEY or ENCRYPTION_KEY environment variable is not set. ' +
      'Generate a secure key with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"'
    );
  }
  
  // Validate key length first
  if (key.length !== KEY_LENGTH * 2) {
    console.error(`[Encryption] ERROR: TOKEN_ENCRYPTION_KEY must be exactly ${KEY_LENGTH * 2} characters (64 hex characters for ${KEY_LENGTH} bytes)`);
    console.error(`[Encryption] ERROR: Current key length: ${key.length} characters`);
    throw new Error(
      `TOKEN_ENCRYPTION_KEY must be exactly ${KEY_LENGTH * 2} hex characters. ` +
      `Current length: ${key.length} characters. ` +
      'Generate a new key with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"'
    );
  }
  
  // Check if the key is in hex format
  if (!isHexString(key)) {
    // Check if it might be base64 encoded
    if (isBase64(key)) {
      console.error('[Encryption] ERROR: TOKEN_ENCRYPTION_KEY appears to be base64 encoded');
      console.error('[Encryption] ERROR: The key MUST be a 64-character hexadecimal string, not base64');
      console.error('[Encryption] ERROR: Generate a proper hex key with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"');
      throw new Error(
        'TOKEN_ENCRYPTION_KEY must be a hexadecimal string (64 characters), not base64. ' +
        'The key appears to be base64 encoded. ' +
        'Generate a proper hex key with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"'
      );
    }
    
    console.error('[Encryption] ERROR: TOKEN_ENCRYPTION_KEY contains invalid characters');
    console.error('[Encryption] ERROR: The key must contain only hexadecimal characters (0-9, a-f, A-F)');
    throw new Error(
      'TOKEN_ENCRYPTION_KEY must contain only hexadecimal characters (0-9, a-f, A-F). ' +
      'Generate a new key with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"'
    );
  }
  
  // Convert hex string to buffer
  const keyBuffer = Buffer.from(key, 'hex');
  
  // Double-check buffer length (should be guaranteed by previous checks, but verify for security)
  if (keyBuffer.length !== KEY_LENGTH) {
    console.error(`[Encryption] ERROR: Key buffer length mismatch. Expected ${KEY_LENGTH} bytes, got ${keyBuffer.length} bytes`);
    throw new Error(
      `TOKEN_ENCRYPTION_KEY buffer conversion failed. Expected ${KEY_LENGTH} bytes, got ${keyBuffer.length} bytes. ` +
      'Generate a new key with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"'
    );
  }
  
  return keyBuffer;
}

/**
 * Encrypt a string value using AES-256-GCM
 * 
 * @param plaintext - The string to encrypt
 * @returns Encrypted string in format: iv:authTag:ciphertext (all base64 encoded)
 * @throws Error if encryption fails
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty string');
  }
  
  try {
    const key = getEncryptionKey();
    
    // Generate random IV for this encryption
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt the data
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    // Return format: iv:authTag:ciphertext (all base64)
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Encryption failed: ${errorMessage}`);
  }
}

/**
 * Decrypt a string value encrypted with AES-256-GCM
 * 
 * @param encryptedData - Encrypted string in format: iv:authTag:ciphertext
 * @returns Decrypted plaintext string
 * @throws Error if decryption fails or data is tampered with
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) {
    throw new Error('Cannot decrypt empty string');
  }
  
  try {
    const key = getEncryptionKey();
    
    // Parse the encrypted data format: iv:authTag:ciphertext
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [ivBase64, authTagBase64, ciphertext] = parts;
    
    // Convert from base64
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    
    // Validate lengths
    if (iv.length !== IV_LENGTH) {
      throw new Error('Invalid IV length');
    }
    if (authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error('Invalid auth tag length');
    }
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt the data
    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Decryption failed: ${errorMessage}`);
  }
}

/**
 * Generate a secure encryption key
 * This is a utility function for generating new keys
 * 
 * @returns 32-byte key in hex format
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Validate that encryption is properly configured
 * 
 * @returns true if encryption is properly configured
 * @throws Error with details if configuration is invalid
 */
export function validateEncryptionConfig(): boolean {
  try {
    getEncryptionKey();
    
    // Test encryption/decryption
    const testData = 'test_encryption_' + Date.now();
    const encrypted = encrypt(testData);
    const decrypted = decrypt(encrypted);
    
    if (decrypted !== testData) {
      throw new Error('Encryption test failed: decrypted data does not match original');
    }
    
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Encryption configuration validation failed: ${errorMessage}`);
  }
}
