# Token Storage API Examples

This directory contains examples and test scripts for the secure OAuth token storage API.

## Overview

The `/api/tokens` endpoint provides secure storage and retrieval of OAuth tokens using:
- **AES-256-GCM encryption** for tokens at rest
- **Prisma ORM** for database operations
- **PostgreSQL** for persistent storage
- **TypeScript** for type safety

## Prerequisites

1. **Set up environment variables** in `.env`:
   ```bash
   # Required
   DATABASE_URL=postgresql://user:password@localhost:5432/prosprint
   TOKEN_ENCRYPTION_KEY=<64-character-hex-key>
   
   # Generate a key with:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Set up the database**:
   ```bash
   npm run db:migrate
   # or
   npx prisma migrate dev
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

## Testing the API

### 1. Test Encryption Module

Test the encryption/decryption functionality:

```bash
# Set your encryption key
export TOKEN_ENCRYPTION_KEY=your_64_char_hex_key_here

# Run a simple test
node -e "
const crypto = require('crypto');
const key = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY, 'hex');
console.log('Key length:', key.length, 'bytes');
console.log('✅ Encryption key is valid');
"
```

### 2. Test API via curl

Set your base URL (defaults to localhost for development):
```bash
BASE_URL="${NEXT_PUBLIC_BASE_URL:-http://localhost:3000}"
```

#### Store a token (POST):

```bash
curl -X POST ${BASE_URL}/api/tokens \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "integration": "gmail",
    "token": {
      "access_token": "ya29.a0AfH6SMBxyz123",
      "refresh_token": "1//0gZxABC123",
      "expires_at": 1234567890,
      "scope": "https://www.googleapis.com/auth/gmail.readonly",
      "token_type": "Bearer"
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Token stored successfully for gmail:user123"
}
```

#### Retrieve a token (GET):

```bash
curl "${BASE_URL}/api/tokens?userId=user123&integration=gmail"
```

Expected response:
```json
{
  "success": true,
  "message": "Token retrieved successfully for gmail:user123",
  "data": {
    "access_token": "ya29.a0AfH6SMBxyz123",
    "refresh_token": "1//0gZxABC123",
    "expires_at": 1234567890,
    "scope": "https://www.googleapis.com/auth/gmail.readonly",
    "token_type": "Bearer"
  }
}
```

### 3. Test with Postman or Thunder Client

Use your deployment URL or `http://localhost:3000` for local development.

1. **POST** to `${BASE_URL}/api/tokens`
   - Headers: `Content-Type: application/json`
   - Body: See example above

2. **GET** from `${BASE_URL}/api/tokens`
   - Query params: `userId=user123&integration=gmail`

## Integration Example

Here's how to use the token storage in your OAuth callback handlers:

```typescript
// Example: pages/api/integrations/gmail/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { store } from '../../../../lib/tokenStorage';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.query;
  
  // Exchange code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });
  
  const tokens = await tokenResponse.json();
  
  // Store encrypted tokens directly using the library (recommended for server-side)
  await store('gmail', 'user123', {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
    scope: tokens.scope,
    token_type: tokens.token_type,
  });
  
  res.redirect('/integrations?success=true');
}
```

## Direct Library Usage

For server-side code, you can use the libraries directly instead of the API:

```typescript
import { store, get } from '../lib/tokenStorage';

// Store a token
await store('gmail', 'user123', {
  access_token: 'ya29.a0AfH6SMB...',
  refresh_token: '1//0gZx...',
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  scope: 'https://www.googleapis.com/auth/gmail.readonly',
  token_type: 'Bearer',
});

// Retrieve a token (automatically refreshes if expired)
const token = await get('gmail', 'user123');
if (token) {
  console.log('Access token:', token.access_token);
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK`: Success
- `400 Bad Request`: Invalid request (missing fields, validation errors)
- `404 Not Found`: Token not found
- `405 Method Not Allowed`: Invalid HTTP method
- `500 Internal Server Error`: Server error (missing env vars, encryption failure, database error)

Example error response:
```json
{
  "success": false,
  "error": "Validation error",
  "details": "userId is required"
}
```

## Security Notes

1. **Never expose TOKEN_ENCRYPTION_KEY** in client-side code
2. **Use HTTPS** in production to protect tokens in transit
3. **Rotate encryption keys** periodically (requires re-encryption of existing tokens)
4. **Implement proper authentication** - the example API doesn't validate user identity
5. **Use environment-specific keys** - different keys for dev/staging/production

## Troubleshooting

### "TOKEN_ENCRYPTION_KEY environment variable is not set"

Generate and set a valid encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output to .env as TOKEN_ENCRYPTION_KEY
```

### "DATABASE_URL environment variable is not set"

Set up your PostgreSQL connection string:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/prosprint
```

### Database connection errors

Make sure PostgreSQL is running and migrations are applied:
```bash
npm run db:migrate
```

### Build errors

Ensure dependencies are installed:
```bash
npm install
npm run build
```

## Files

- `test-token-api.ts`: Test script for encryption functionality
- `README.md`: This file

## Related Documentation

- [Prisma Schema](/prisma/schema.prisma)
- [Encryption Module](/lib/encryption.ts)
- [Token Storage Module](/lib/tokenStorage.ts)
- [Prisma Client](/lib/prisma.ts)
- [Environment Variables](/.env.example)
