# Database Setup Guide

This guide explains how to set up PostgreSQL database for secure token storage in ProSprint AI 2.0.

## Overview

ProSprint AI 2.0 uses PostgreSQL with Prisma ORM for persistent, secure token storage. All OAuth tokens are encrypted at rest using AES-256-GCM encryption.

## Prerequisites

- PostgreSQL database (local or hosted)
- Node.js 18+ installed
- Access to environment variables configuration

## Quick Start

### 1. Set Up PostgreSQL Database

#### Option A: Using Render (Recommended for Production)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "PostgreSQL"
3. Configure your database:
   - Name: `prosprint-db` (or your preferred name)
   - Database: `prosprint`
   - User: Auto-generated
   - Region: Choose closest to your deployment
   - Plan: Free or paid based on needs
4. Click "Create Database"
5. Copy the "External Database URL" from the database page

#### Option B: Using Local PostgreSQL

1. Install PostgreSQL:
   ```bash
   # macOS
   brew install postgresql@15
   brew services start postgresql@15

   # Ubuntu/Debian
   sudo apt-get install postgresql-15
   sudo systemctl start postgresql

   # Windows
   # Download and install from https://www.postgresql.org/download/windows/
   ```

2. Create database:
   ```bash
   psql -U postgres
   CREATE DATABASE prosprint;
   CREATE USER prosprint_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE prosprint TO prosprint_user;
   \q
   ```

3. Your connection string will be:
   ```
   postgresql://prosprint_user:your_password@localhost:5432/prosprint
   ```

#### Option C: Using Other Providers

ProSprint AI works with any PostgreSQL provider:
- **Supabase**: Create a project and get the connection string
- **AWS RDS**: Set up PostgreSQL instance
- **Azure Database**: Create PostgreSQL flexible server
- **DigitalOcean**: Create managed PostgreSQL database

### 2. Generate Encryption Key

Generate a secure 256-bit encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**IMPORTANT**: 
- Store this key securely (e.g., password manager, secrets vault)
- Never commit it to version control
- If lost, all encrypted tokens will be unrecoverable
- Use different keys for development and production

### 3. Configure Environment Variables

Create or update your `.env` or `.env.local` file:

```bash
# Database connection string
DATABASE_URL=postgresql://user:password@hostname:5432/dbname?schema=public

# Encryption key for token storage (generate with command above)
ENCRYPTION_KEY=your_64_character_hex_encryption_key_here
```

For **Render** deployments, add these as environment variables in your service settings.

For **Vercel** deployments, add these in Project Settings → Environment Variables.

### 4. Run Database Migrations

Initialize the database schema:

```bash
# Install dependencies if not already done
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init
```

For production deployments:

```bash
# Run migrations without prompts
npx prisma migrate deploy
```

### 5. Verify Setup

Test your database connection and encryption:

```bash
# Check database connection
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

## Database Schema

The token storage uses the following schema:

```prisma
model OAuthToken {
  id              String   @id @default(cuid())
  userId          String
  integration     String
  
  // Encrypted fields
  accessToken     String   @db.Text
  refreshToken    String?  @db.Text
  
  // Metadata
  expiresAt       DateTime?
  scope           String?  @db.Text
  tokenType       String?
  
  // Audit trail
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  lastUsed        DateTime @default(now())
  issuedAt        DateTime @default(now())
  
  // Security metadata
  ipAddress       String?
  userAgent       String?  @db.Text
  
  @@unique([userId, integration])
  @@index([userId])
  @@index([integration])
  @@index([expiresAt])
}
```

## Security Features

### Encryption at Rest

- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Size**: 256 bits (32 bytes)
- **IV**: Random 128-bit initialization vector per encryption
- **Authentication**: 128-bit authentication tag to prevent tampering

### Token Refresh

Tokens are automatically refreshed when:
- Token expires in less than 5 minutes
- A token retrieval is requested
- Refresh token is available

### Audit Trail

Each token includes:
- Creation timestamp
- Last update timestamp
- Last used timestamp
- IP address (when available)
- User agent (when available)

## Maintenance

### Backup Database

```bash
# Using pg_dump
pg_dump -h hostname -U username -d prosprint > backup.sql

# Restore from backup
psql -h hostname -U username -d prosprint < backup.sql
```

### Clean Expired Tokens

Create a scheduled task to clean up expired tokens:

```sql
DELETE FROM oauth_tokens 
WHERE expires_at IS NOT NULL 
AND expires_at < NOW() - INTERVAL '30 days';
```

### Monitor Database

```bash
# View all tables
npx prisma studio

# Check token count
psql -c "SELECT COUNT(*) FROM oauth_tokens;"

# View recent tokens (encrypted)
psql -c "SELECT id, user_id, integration, created_at, last_used FROM oauth_tokens ORDER BY last_used DESC LIMIT 10;"
```

## Troubleshooting

### Connection Issues

1. **Cannot connect to database**
   - Verify `DATABASE_URL` is correct
   - Check firewall rules allow connection
   - Ensure database is running
   - Test connection: `npx prisma db pull`

2. **SSL/TLS errors**
   - Add `?sslmode=require` to connection string for secure connections
   - For Render: Connection string includes SSL by default

3. **Permission errors**
   - Ensure database user has CREATE, READ, UPDATE, DELETE permissions
   - Run: `GRANT ALL PRIVILEGES ON DATABASE dbname TO username;`

### Encryption Issues

1. **"ENCRYPTION_KEY environment variable is not set"**
   - Add `ENCRYPTION_KEY` to your environment variables
   - Generate a new key with the command above

2. **"ENCRYPTION_KEY must be 32 bytes"**
   - Key must be exactly 64 hex characters (32 bytes)
   - Generate a new key with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

3. **"Decryption failed"**
   - Encryption key may have changed
   - Tokens encrypted with old key cannot be decrypted with new key
   - Users will need to re-authenticate

### Migration Issues

1. **"Migration failed"**
   - Check database permissions
   - Ensure `DATABASE_URL` is correct
   - Try: `npx prisma migrate reset` (WARNING: deletes all data)

2. **"Table already exists"**
   - Database may have existing schema
   - Use: `npx prisma db push` instead of migrate
   - Or reset: `npx prisma migrate reset`

## Production Checklist

Before deploying to production:

- [ ] PostgreSQL database created and accessible
- [ ] `DATABASE_URL` configured in production environment
- [ ] `ENCRYPTION_KEY` generated and stored securely
- [ ] `ENCRYPTION_KEY` added to production environment (different from dev)
- [ ] Database migrations run: `npx prisma migrate deploy`
- [ ] Connection pool configured for serverless (if using Vercel/serverless)
- [ ] Database backups configured
- [ ] Monitoring and alerts set up
- [ ] SSL/TLS enabled for database connections
- [ ] Database credentials stored in secrets manager
- [ ] Firewall rules configured to allow application access only

## Support

For issues or questions:
- Check Prisma documentation: https://www.prisma.io/docs
- PostgreSQL documentation: https://www.postgresql.org/docs/
- Render PostgreSQL guide: https://render.com/docs/databases
- Open an issue in the repository

## Next Steps

After setting up the database:

1. Configure OAuth2 credentials for integrations (Gmail, Outlook, etc.)
2. Test token storage by connecting an integration
3. Verify tokens are encrypted in database using Prisma Studio
4. Set up monitoring and alerts for database issues
5. Configure regular backups

See [README.md](./README.md) for integration setup instructions.
