import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Update spiral272 to test-student1
  await prisma.user.update({
    where: { clerkId: 'user_36KCDLaL8DSCtny5awV4PpdRDfJ' },
    data: { name: 'test-student1' },
  });

  // Update mihalis27 to test-student2
  await prisma.user.update({
    where: { clerkId: 'user_36MtFwurOz4SJSyPY5NYf9E3pxL' },
    data: { name: 'test-student2' },
  });

  console.log('✅ Updated student names to test-student1 and test-student2');

  await prisma.$disconnect();
}

main();
