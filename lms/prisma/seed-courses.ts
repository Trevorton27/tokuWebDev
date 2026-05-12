/**
 * Seed script to populate the database with sample courses
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding courses...');

  // Find or create an instructor user
  let instructor = await prisma.user.findFirst({
    where: { role: 'INSTRUCTOR' },
  });

  if (!instructor) {
    instructor = await prisma.user.create({
      data: {
        email: 'instructor@example.com',
        name: 'John Smith',
        password: '$2a$10$YourHashedPasswordHere', // Placeholder
        role: 'INSTRUCTOR',
      },
    });
    console.log('✅ Created instructor user');
  }

  // Create sample courses
  const courses = [
    {
      title: 'Introduction to Web Development',
      description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript. Perfect for beginners who want to start their journey in web development.',
      published: true,
      maxStudents: 50,
      instructorId: instructor.id,
      lessons: [
        { title: 'HTML Basics', content: 'Introduction to HTML', order: 1, duration: 30 },
        { title: 'CSS Fundamentals', content: 'Styling with CSS', order: 2, duration: 45 },
        { title: 'JavaScript Essentials', content: 'Getting started with JS', order: 3, duration: 60 },
      ],
    },
    {
      title: 'Advanced React & Next.js',
      description: 'Master React and Next.js by building real-world applications. Learn hooks, state management, server components, and more.',
      published: true,
      maxStudents: 30,
      instructorId: instructor.id,
      lessons: [
        { title: 'React Hooks Deep Dive', content: 'Understanding hooks', order: 1, duration: 50 },
        { title: 'Next.js App Router', content: 'Modern routing in Next.js', order: 2, duration: 55 },
        { title: 'Server Components', content: 'RSC patterns', order: 3, duration: 45 },
        { title: 'State Management with Zustand', content: 'Managing state', order: 4, duration: 40 },
      ],
    },
    {
      title: 'Python for Data Science',
      description: 'Dive into data science with Python. Learn pandas, NumPy, and data visualization techniques.',
      published: true,
      maxStudents: null, // Unlimited
      instructorId: instructor.id,
      lessons: [
        { title: 'Python Basics Review', content: 'Python fundamentals', order: 1, duration: 40 },
        { title: 'NumPy Arrays', content: 'Working with arrays', order: 2, duration: 50 },
        { title: 'Pandas DataFrames', content: 'Data manipulation', order: 3, duration: 60 },
        { title: 'Data Visualization', content: 'Matplotlib and Seaborn', order: 4, duration: 55 },
      ],
    },
    {
      title: 'Full-Stack TypeScript',
      description: 'Build complete applications with TypeScript from frontend to backend. Learn type-safe development practices.',
      published: true,
      maxStudents: 25,
      instructorId: instructor.id,
      lessons: [
        { title: 'TypeScript Fundamentals', content: 'Types and interfaces', order: 1, duration: 45 },
        { title: 'Advanced Types', content: 'Generics and utilities', order: 2, duration: 50 },
        { title: 'Backend with Node.js', content: 'Type-safe APIs', order: 3, duration: 60 },
      ],
    },
    {
      title: 'DevOps Essentials',
      description: 'Learn Docker, CI/CD, and cloud deployment. Get hands-on experience with modern DevOps tools and practices.',
      published: true,
      maxStudents: 20,
      instructorId: instructor.id,
      lessons: [
        { title: 'Docker Basics', content: 'Containers 101', order: 1, duration: 50 },
        { title: 'CI/CD with GitHub Actions', content: 'Automated pipelines', order: 2, duration: 55 },
        { title: 'Cloud Deployment', content: 'AWS and Vercel', order: 3, duration: 60 },
      ],
    },
    {
      title: 'UI/UX Design Principles',
      description: 'Master the art of designing beautiful and functional user interfaces. Learn Figma, design systems, and accessibility.',
      published: true,
      maxStudents: null,
      instructorId: instructor.id,
      lessons: [
        { title: 'Design Fundamentals', content: 'Color, typography, layout', order: 1, duration: 40 },
        { title: 'Figma Mastery', content: 'Design tools', order: 2, duration: 45 },
        { title: 'Design Systems', content: 'Building consistent UIs', order: 3, duration: 50 },
        { title: 'Accessibility Best Practices', content: 'Inclusive design', order: 4, duration: 40 },
      ],
    },
  ];

  for (const courseData of courses) {
    const { lessons, ...courseInfo } = courseData;

    const course = await prisma.course.create({
      data: {
        ...courseInfo,
        lessons: {
          create: lessons,
        },
      },
      include: {
        lessons: true,
      },
    });

    console.log(`✅ Created course: ${course.title} with ${course.lessons.length} lessons`);
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
