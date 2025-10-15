# ProSprint AI 2.0 - Database Scripts

This directory contains utility scripts for database management.

## Available Scripts

### init-database.sh

Initializes the PostgreSQL database and runs migrations.

**Usage:**

```bash
# Make script executable (first time only)
chmod +x scripts/init-database.sh

# Run the script
./scripts/init-database.sh
```

**What it does:**
1. Checks that `DATABASE_URL` and `ENCRYPTION_KEY` are configured
2. Generates Prisma Client
3. Runs database migrations (dev or production mode)
4. Verifies database connection

**Prerequisites:**
- PostgreSQL database created and accessible
- `DATABASE_URL` set in environment or `.env` file
- `ENCRYPTION_KEY` set in environment or `.env` file

## Environment Variables

The scripts require these environment variables:

```bash
# Database connection string
DATABASE_URL=postgresql://user:password@hostname:5432/dbname?schema=public

# Encryption key for token storage (64 hex characters)
ENCRYPTION_KEY=your_encryption_key_here
```

Generate an encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Manual Commands

If you prefer to run commands manually:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (development)
npx prisma migrate dev --name init

# Run migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Troubleshooting

### Permission Denied

If you get "Permission denied" when running the script:
```bash
chmod +x scripts/init-database.sh
```

### Database Connection Failed

1. Verify `DATABASE_URL` is correct
2. Check that the database server is running
3. Ensure firewall allows connections
4. Test connection: `npx prisma db pull`

### Migration Conflicts

If migrations fail due to existing schema:
```bash
# Force reset (WARNING: deletes data)
npx prisma migrate reset

# Or push schema without migration history
npx prisma db push
```

## More Information

See [DATABASE_SETUP.md](../DATABASE_SETUP.md) for complete setup instructions.
