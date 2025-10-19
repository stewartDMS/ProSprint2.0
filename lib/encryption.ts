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
 * - ENCRYPTION_KEY: 32-byte (256-bit) secret key in hex format
 * 
 * @module encryption
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128-bit IV for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag
const KEY_LENGTH = 32; // 256-bit key

// Debug logging: Log encryption key availability at application startup
console.log('[Encryption] Environment variables status at startup:');
console.log(`[Encryption] TOKEN_ENCRYPTION_KEY available: ${!!process.env.TOKEN_ENCRYPTION_KEY}`);
console.log(`[Encryption] ENCRYPTION_KEY available: ${!!process.env.ENCRYPTION_KEY}`);

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
  
  // Convert hex string to buffer
  const keyBuffer = Buffer.from(key, 'hex');
  
  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(
      `TOKEN_ENCRYPTION_KEY must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex characters). ` +
      `Current length: ${keyBuffer.length} bytes. ` +
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
