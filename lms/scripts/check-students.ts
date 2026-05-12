import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: {
      id: true,
      email: true,
      name: true,
      clerkId: true,
    },
  });

  console.log('Students in database:');
  students.forEach(student => {
    console.log('---');
    console.log('Email:', student.email);
    console.log('Name:', student.name || '(null)');
    console.log('ClerkId:', student.clerkId);
    console.log('Email prefix:', student.email.split('@')[0]);
  });

  await prisma.$disconnect();
}

main();
