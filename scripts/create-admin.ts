/**
 * Script to create an admin user in the database
 * Use this when you need to manually create an admin account
 */

import prisma from '../src/lib/prisma';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  try {
    console.log('=== Create Admin User ===\n');

    const email = await question('Enter admin email: ');
    const name = await question('Enter admin name: ');
    const clerkId = await question('Enter Clerk ID (optional, press Enter to skip): ');

    if (!email || !name) {
      console.error('Email and name are required!');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`\nUser with email ${email} already exists.`);
      const updateRole = await question('Update their role to ADMIN? (y/n): ');

      if (updateRole.toLowerCase() === 'y') {
        await prisma.user.update({
          where: { email },
          data: {
            role: 'ADMIN',
            ...(clerkId && { clerkId }),
          },
        });
        console.log('\n✓ User role updated to ADMIN');
      }
    } else {
      // Create new admin user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          role: 'ADMIN',
          ...(clerkId && { clerkId }),
          password: null, // Clerk users don't need passwords
        },
      });

      console.log('\n✓ Admin user created successfully!');
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
    }
  } catch (error) {
    console.error('\n✗ Failed to create admin user:', error);
    throw error;
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdmin();
