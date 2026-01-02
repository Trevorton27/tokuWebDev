/**
 * Diagnostic script to test auth and database connection
 */

import prisma from '../src/lib/prisma';

async function testAuth() {
  try {
    console.log('Testing database connection...');

    // Test basic database query
    const userCount = await prisma.user.count();
    console.log(`✓ Database connected. Total users: ${userCount}`);

    // List all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        clerkId: true,
      },
    });

    console.log('\nExisting users:');
    users.forEach((user) => {
      console.log(`  - ${user.email} (${user.role}) - ClerkID: ${user.clerkId || 'Not set'}`);
    });

    console.log('\n✓ Auth test completed successfully');
  } catch (error) {
    console.error('✗ Auth test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
