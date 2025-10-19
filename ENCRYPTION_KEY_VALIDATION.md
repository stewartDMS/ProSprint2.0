# Encryption Key Validation

## Overview

The ProSprint 2.0 application uses AES-256-GCM encryption for securing OAuth tokens at rest in the database. The encryption key **must** be in a specific format to work correctly.

## Key Requirements

### Format Specifications

- **Length**: Exactly 64 characters
- **Format**: Hexadecimal (hex)
- **Characters**: Only 0-9, a-f, A-F
- **Bytes**: Represents 32 bytes (256 bits)

### ❌ Common Mistakes

1. **Base64 Encoding** - The key must NOT be base64 encoded
   - ❌ Wrong: `YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY3ODkwYWJjZGVm`
   - ✅ Correct: `a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`

2. **Wrong Length** - Key must be exactly 64 characters
   - ❌ Wrong: `abcdef1234567890` (too short - 16 chars)
   - ❌ Wrong: `a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456789012` (too long - 72 chars)
   - ✅ Correct: `a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456` (64 chars)

3. **Invalid Characters** - Only hex characters allowed
   - ❌ Wrong: `g1b2c3d4...` (contains 'g', not a hex character)
   - ❌ Wrong: `a1b2-c3d4-...` (contains dashes)
   - ✅ Correct: `a1b2c3d4...` (only 0-9, a-f, A-F)

## How to Generate a Valid Key

### Using Node.js (Recommended)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This will output something like:
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### Using OpenSSL

```bash
openssl rand -hex 32
```

## Environment Variable Configuration

Set the key in your `.env` file:

```bash
# Use TOKEN_ENCRYPTION_KEY (recommended)
TOKEN_ENCRYPTION_KEY=your_64_character_hex_key_here

# Or use ENCRYPTION_KEY (legacy, but still supported)
ENCRYPTION_KEY=your_64_character_hex_key_here
```

## Startup Validation

When the application starts, the encryption module will validate the key format and log the results:

### ✅ Valid Key Example

```
[Encryption] ========================================
[Encryption] Encryption Module Startup Validation
[Encryption] ========================================
[Encryption] TOKEN_ENCRYPTION_KEY available: true
[Encryption] ENCRYPTION_KEY available: false
[Encryption] Key length: 64 characters
[Encryption] Expected: 64 characters (64 hex chars for 32 bytes)
[Encryption] ✓ Encryption key validation PASSED
[Encryption] ========================================
```

### ❌ Invalid Key Example (Base64)

```
[Encryption] ========================================
[Encryption] Encryption Module Startup Validation
[Encryption] ========================================
[Encryption] TOKEN_ENCRYPTION_KEY available: true
[Encryption] ENCRYPTION_KEY available: false
[Encryption] Key length: 64 characters
[Encryption] Expected: 64 characters (64 hex chars for 32 bytes)
[Encryption] WARNING: Key contains non-hexadecimal characters
[Encryption] WARNING: Key appears to be base64 encoded - must be hex!
[Encryption] ✗ Encryption key validation FAILED
[Encryption] Error: TOKEN_ENCRYPTION_KEY must be a hexadecimal string (64 characters), not base64...
[Encryption] Application will fail when attempting to encrypt/decrypt tokens
[Encryption] ========================================
```

### ❌ Invalid Key Example (Wrong Length)

```
[Encryption] ========================================
[Encryption] Encryption Module Startup Validation
[Encryption] ========================================
[Encryption] TOKEN_ENCRYPTION_KEY available: true
[Encryption] ENCRYPTION_KEY available: false
[Encryption] Key length: 32 characters
[Encryption] Expected: 64 characters (64 hex chars for 32 bytes)
[Encryption] WARNING: Key length is incorrect (expected 64, got 32)
[Encryption] ✗ Encryption key validation FAILED
[Encryption] Error: TOKEN_ENCRYPTION_KEY must be exactly 64 hex characters...
[Encryption] Application will fail when attempting to encrypt/decrypt tokens
[Encryption] ========================================
```

## Runtime Validation

When the application attempts to encrypt or decrypt data, it will validate the key again and throw an error if invalid:

### Base64 Key Error

```
Error: Encryption failed: TOKEN_ENCRYPTION_KEY must be a hexadecimal string (64 characters), not base64. 
The key appears to be base64 encoded. 
Generate a proper hex key with: node -e "console.log(crypto.randomBytes(32).toString('hex'))"
```

### Wrong Length Error

```
Error: Encryption failed: TOKEN_ENCRYPTION_KEY must be exactly 64 hex characters. 
Current length: 32 characters. 
Generate a new key with: node -e "console.log(crypto.randomBytes(32).toString('hex'))"
```

### Invalid Characters Error

```
Error: Encryption failed: TOKEN_ENCRYPTION_KEY must contain only hexadecimal characters (0-9, a-f, A-F). 
Generate a new key with: node -e "console.log(crypto.randomBytes(32).toString('hex'))"
```

## Testing Key Validation

Run the provided test script to validate key formats:

```bash
node examples/test-encryption-key-validation.js
```

This will test various key formats and show which ones are valid/invalid.

## Security Best Practices

1. **Never commit the key to version control** - Keep it in `.env` and ensure `.env` is in `.gitignore`
2. **Use different keys for different environments** - Development, staging, and production should have unique keys
3. **Store keys securely** - Use environment variables or secrets management services
4. **Rotate keys periodically** - Consider implementing key rotation for enhanced security
5. **Back up the key securely** - If you lose the key, all encrypted tokens become unrecoverable

## Troubleshooting

### "Key appears to be base64 encoded"

This error occurs when you use a base64-encoded key instead of hex. Base64 keys typically contain characters like `+`, `/`, or `=`, and may have uppercase and lowercase letters mixed with numbers.

**Solution**: Generate a new hex key using the command above.

### "Key length is incorrect"

The key must be exactly 64 hexadecimal characters, representing 32 bytes.

**Solution**: Generate a new key using the command above, or check that you copied the entire key.

### "Application will fail when attempting to encrypt/decrypt tokens"

This warning appears during startup validation when the key is invalid. The application may start, but any operation requiring encryption/decryption will fail.

**Solution**: Fix the key format before attempting any operations that require encryption.

## Related Files

- `lib/encryption.ts` - Main encryption module with validation logic
- `.env.example` - Example environment configuration
- `examples/test-encryption-key-validation.js` - Key validation test script

## Migration from Base64 to Hex

If you previously used a base64 key and have encrypted data in your database, you'll need to:

1. Back up your database
2. Decrypt all tokens using the old base64 key
3. Generate a new hex key
4. Re-encrypt all tokens with the new hex key
5. Update your environment variables

**Note**: This is a breaking change. Consult with your team before migrating production systems.
