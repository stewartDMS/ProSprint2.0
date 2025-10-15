#!/bin/bash
# Database initialization script for ProSprint AI 2.0
# This script initializes the PostgreSQL database and runs migrations

set -e

echo "🔄 ProSprint AI 2.0 - Database Initialization"
echo "=============================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set DATABASE_URL in your .env file:"
    echo "DATABASE_URL=postgresql://user:password@hostname:5432/dbname?schema=public"
    echo ""
    exit 1
fi

# Check if ENCRYPTION_KEY is set
if [ -z "$ENCRYPTION_KEY" ]; then
    echo "❌ ERROR: ENCRYPTION_KEY environment variable is not set"
    echo ""
    echo "Generate a secure key with:"
    echo "node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    echo ""
    echo "Then add it to your .env file:"
    echo "ENCRYPTION_KEY=your_64_character_hex_key_here"
    echo ""
    exit 1
fi

echo "✓ Environment variables configured"
echo ""

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

echo "✓ Prisma Client generated"
echo ""

# Run migrations
echo "🔄 Running database migrations..."

if [ "$NODE_ENV" = "production" ]; then
    # Production: Use migrate deploy (no prompts)
    npx prisma migrate deploy
else
    # Development: Use migrate dev (with prompts)
    npx prisma migrate dev --name init
fi

if [ $? -ne 0 ]; then
    echo "❌ Failed to run migrations"
    exit 1
fi

echo "✓ Migrations completed"
echo ""

echo "✅ Database initialization complete!"
echo ""
echo "Next steps:"
echo "1. Configure OAuth2 credentials for integrations"
echo "2. Start the application: npm run dev"
echo "3. Test an integration to verify token storage"
echo ""
echo "To view stored tokens: npx prisma studio"
echo ""
