#!/bin/bash

# Seed Production Database Script
# This script runs the seed file against the production database

echo "🌱 Seeding Production Database"
echo "================================"
echo ""
echo "⚠️  WARNING: This will add data to your PRODUCTION database!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Seed cancelled"
  exit 0
fi

echo ""
echo "🚀 Running seed script..."
echo ""

# Run the TypeScript seed file
npx tsx scripts/seed-production.ts

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Production database seeded successfully!"
else
  echo ""
  echo "❌ Seed failed. Check the error messages above."
  exit 1
fi
