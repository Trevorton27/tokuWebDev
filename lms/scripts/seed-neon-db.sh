#!/bin/bash

# Seed Neon Database Script
# Creates schema and seeds the production Neon database with sample data

echo "🌱 Setting up Neon Production Database"
echo "======================================="
echo ""

# Set the production database URL
export DATABASE_URL="postgresql://neondb_owner:npg_k0DQoVrHnBK1@ep-polished-flower-a1olnkuj-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

echo "📊 Database: Neon (ap-southeast-1)"
echo ""
echo "📋 Step 1: Running database migrations..."
echo ""

# Run migrations to create tables
npx prisma migrate deploy

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Migration failed. Check the error messages above."
  exit 1
fi

echo ""
echo "✅ Migrations completed successfully!"
echo ""
echo "🚀 Step 2: Running seed script..."
echo ""

# Run the seed script
npx tsx scripts/seed-production.ts

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Neon production database seeded successfully!"
  echo ""
  echo "🌐 Check your data at: https://toku-web-dev-lms.vercel.app/admin"
else
  echo ""
  echo "❌ Seed failed. Check the error messages above."
  exit 1
fi
