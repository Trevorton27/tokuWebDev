import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Hash password for all users (password: "Password123!")
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // ============================================
  // 1. CREATE INSTRUCTORS
  // ============================================
  console.log('👨‍🏫 Creating instructors...');

  const instructor1 = await prisma.user.upsert({
    where: { email: 'sarah.chen@signalworks.com' },
    update: {},
    create: {
      email: 'sarah.chen@signalworks.com',
      name: 'Sarah Chen',
      password: hashedPassword,
      role: 'INSTRUCTOR',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
  });

  const instructor2 = await prisma.user.upsert({
    where: { email: 'marcus.johnson@signalworks.com' },
    update: {},
    create: {
      email: 'marcus.johnson@signalworks.com',
      name: 'Marcus Johnson',
      password: hashedPassword,
      role: 'INSTRUCTOR',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    },
  });

  const instructor3 = await prisma.user.upsert({
    where: { email: 'elena.rodriguez@signalworks.com' },
    update: {},
    create: {
      email: 'elena.rodriguez@signalworks.com',
      name: 'Elena Rodriguez',
      password: hashedPassword,
      role: 'INSTRUCTOR',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    },
  });

  console.log(`✅ Created 3 instructors\n`);

  // ============================================
  // 2. CREATE STUDENTS
  // ============================================
  console.log('👨‍🎓 Creating students...');

  const studentData = [
    { email: 'alex.kim@student.com', name: 'Alex Kim' },
    { email: 'jordan.smith@student.com', name: 'Jordan Smith' },
    { email: 'taylor.brown@student.com', name: 'Taylor Brown' },
    { email: 'casey.wilson@student.com', name: 'Casey Wilson' },
    { email: 'morgan.davis@student.com', name: 'Morgan Davis' },
    { email: 'riley.anderson@student.com', name: 'Riley Anderson' },
    { email: 'dakota.martinez@student.com', name: 'Dakota Martinez' },
    { email: 'skyler.garcia@student.com', name: 'Skyler Garcia' },
    { email: 'quinn.lopez@student.com', name: 'Quinn Lopez' },
    { email: 'avery.nguyen@student.com', name: 'Avery Nguyen' },
  ];

  const students = [];
  for (const data of studentData) {
    const student = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: 'STUDENT',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name.replace(' ', '')}`,
      },
    });
    students.push(student);
  }

  console.log(`✅ Created 10 students\n`);

  // ============================================
  // 3. CREATE COURSES
  // ============================================
  console.log('📚 Creating courses...');

  // Course 1: JavaScript Fundamentals (Sarah Chen)
  const course1 = await prisma.course.create({
    data: {
      title: 'JavaScript Fundamentals',
      description: 'Master the core concepts of JavaScript including variables, functions, arrays, objects, and async programming. Perfect for beginners starting their web development journey.',
      instructorId: instructor1.id,
      published: true,
      thumbnailUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400',
    },
  });

  // Course 2: React & Modern Frontend (Sarah Chen)
  const course2 = await prisma.course.create({
    data: {
      title: 'React & Modern Frontend Development',
      description: 'Build dynamic, responsive web applications with React. Learn hooks, state management, component patterns, and best practices for modern frontend development.',
      instructorId: instructor1.id,
      published: true,
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    },
  });

  // Course 3: Node.js Backend Development (Marcus Johnson)
  const course3 = await prisma.course.create({
    data: {
      title: 'Node.js Backend Development',
      description: 'Learn server-side JavaScript with Node.js and Express. Build RESTful APIs, work with databases, implement authentication, and deploy production-ready applications.',
      instructorId: instructor2.id,
      published: true,
      thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
    },
  });

  // Course 4: Database Design & SQL (Marcus Johnson)
  const course4 = await prisma.course.create({
    data: {
      title: 'Database Design & SQL Mastery',
      description: 'Master relational database design, SQL queries, indexing, transactions, and optimization. Learn PostgreSQL, MySQL, and database best practices.',
      instructorId: instructor2.id,
      published: true,
      thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400',
    },
  });

  // Course 5: Full-Stack TypeScript (Elena Rodriguez)
  const course5 = await prisma.course.create({
    data: {
      title: 'Full-Stack TypeScript Development',
      description: 'Build type-safe applications from frontend to backend. Learn TypeScript, Next.js, tRPC, Prisma, and deploy full-stack applications with confidence.',
      instructorId: instructor3.id,
      published: true,
      thumbnailUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400',
    },
  });

  console.log(`✅ Created 5 courses\n`);

  // ============================================
  // 4. CREATE LESSONS
  // ============================================
  console.log('📖 Creating lessons...');

  // Course 1 Lessons: JavaScript Fundamentals
  const course1Lessons = [
    {
      courseId: course1.id,
      title: 'Introduction to JavaScript',
      content: `# Introduction to JavaScript

Welcome to JavaScript Fundamentals! In this lesson, we'll explore what JavaScript is and why it's essential for modern web development.

## What is JavaScript?

JavaScript is a high-level, interpreted programming language that enables interactive web pages. It's one of the core technologies of the web, alongside HTML and CSS.

## Key Concepts

- **Variables and Data Types**: Learn how to store and manipulate data
- **Functions**: Reusable blocks of code
- **Control Flow**: Making decisions in your code
- **The DOM**: Interacting with web pages

## Your First JavaScript

\`\`\`javascript
console.log('Hello, World!');
\`\`\`

Let's get started!`,
      order: 1,
      duration: 45,
      videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
    },
    {
      courseId: course1.id,
      title: 'Variables, Data Types & Operators',
      content: `# Variables, Data Types & Operators

## Variables

JavaScript has three ways to declare variables:

\`\`\`javascript
var oldWay = 'avoid using var';
let modernWay = 'use let for variables that change';
const constant = 'use const for values that don\'t change';
\`\`\`

## Data Types

- **Primitives**: String, Number, Boolean, Null, Undefined, Symbol
- **Objects**: Arrays, Objects, Functions

## Operators

- Arithmetic: +, -, *, /, %
- Comparison: ===, !==, <, >, <=, >=
- Logical: &&, ||, !

## Practice Exercise

Create variables for a user profile and log them to the console.`,
      order: 2,
      duration: 60,
    },
    {
      courseId: course1.id,
      title: 'Functions & Scope',
      content: `# Functions & Scope

## Function Declaration

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Arrow Functions

\`\`\`javascript
const greet = (name) => \`Hello, \${name}!\`;
\`\`\`

## Scope

- **Global Scope**: Accessible everywhere
- **Function Scope**: Accessible within the function
- **Block Scope**: Accessible within {} (let and const)

## Higher-Order Functions

Functions that take other functions as arguments or return functions.

\`\`\`javascript
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
\`\`\``,
      order: 3,
      duration: 75,
    },
    {
      courseId: course1.id,
      title: 'Arrays & Objects',
      content: `# Arrays & Objects

## Arrays

\`\`\`javascript
const fruits = ['apple', 'banana', 'orange'];

// Common methods
fruits.push('grape');      // Add to end
fruits.pop();              // Remove from end
fruits.map(f => f.toUpperCase());
fruits.filter(f => f.length > 5);
\`\`\`

## Objects

\`\`\`javascript
const person = {
  name: 'Alex',
  age: 25,
  greet() {
    console.log(\`Hi, I'm \${this.name}\`);
  }
};

// Destructuring
const { name, age } = person;
\`\`\`

## Practice

Build a todo list using arrays and objects.`,
      order: 4,
      duration: 90,
    },
    {
      courseId: course1.id,
      title: 'Async JavaScript & Promises',
      content: `# Async JavaScript & Promises

## Callbacks

\`\`\`javascript
setTimeout(() => {
  console.log('This runs after 1 second');
}, 1000);
\`\`\`

## Promises

\`\`\`javascript
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
\`\`\`

## Async/Await

\`\`\`javascript
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
\`\`\`

## Project

Build a weather app that fetches data from an API.`,
      order: 5,
      duration: 90,
    },
  ];

  for (const lesson of course1Lessons) {
    await prisma.lesson.create({ data: lesson });
  }

  // Course 2 Lessons: React & Modern Frontend
  const course2Lessons = [
    {
      courseId: course2.id,
      title: 'Introduction to React',
      content: `# Introduction to React

React is a JavaScript library for building user interfaces. It's component-based and declarative.

## Why React?

- **Component-Based**: Build encapsulated components
- **Declarative**: Describe what the UI should look like
- **Learn Once, Write Anywhere**: Web, mobile, desktop

## Your First Component

\`\`\`jsx
function Welcome() {
  return <h1>Hello, React!</h1>;
}
\`\`\`

## JSX

JSX is a syntax extension that looks like HTML but is actually JavaScript.`,
      order: 1,
      duration: 60,
    },
    {
      courseId: course2.id,
      title: 'Components & Props',
      content: `# Components & Props

## Functional Components

\`\`\`jsx
function UserCard({ name, email }) {
  return (
    <div className="card">
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
}
\`\`\`

## Props

Props are arguments passed to components, like function parameters.

\`\`\`jsx
<UserCard name="Alex" email="alex@example.com" />
\`\`\`

## Children

\`\`\`jsx
function Card({ children }) {
  return <div className="card">{children}</div>;
}
\`\`\``,
      order: 2,
      duration: 75,
    },
    {
      courseId: course2.id,
      title: 'State & Hooks',
      content: `# State & Hooks

## useState

\`\`\`jsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

## useEffect

\`\`\`jsx
useEffect(() => {
  // Run on mount and when count changes
  document.title = \`Count: \${count}\`;
}, [count]);
\`\`\`

## Custom Hooks

Create reusable stateful logic.`,
      order: 3,
      duration: 90,
    },
    {
      courseId: course2.id,
      title: 'Forms & Events',
      content: `# Forms & Events

## Controlled Components

\`\`\`jsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
\`\`\``,
      order: 4,
      duration: 75,
    },
  ];

  for (const lesson of course2Lessons) {
    await prisma.lesson.create({ data: lesson });
  }

  // Course 3 Lessons: Node.js Backend
  const course3Lessons = [
    {
      courseId: course3.id,
      title: 'Introduction to Node.js',
      content: `# Introduction to Node.js

Node.js is a JavaScript runtime built on Chrome's V8 engine. It allows you to run JavaScript on the server.

## Key Features

- **Asynchronous & Event-Driven**: Non-blocking I/O
- **Fast**: V8 engine compiles JavaScript to machine code
- **NPM**: Largest package ecosystem

## Your First Server

\`\`\`javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World!');
});

server.listen(3000);
\`\`\``,
      order: 1,
      duration: 60,
    },
    {
      courseId: course3.id,
      title: 'Express.js Fundamentals',
      content: `# Express.js Fundamentals

Express is a minimal and flexible Node.js web application framework.

## Basic Server

\`\`\`javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.listen(3000);
\`\`\`

## Middleware

\`\`\`javascript
app.use(express.json());

app.use((req, res, next) => {
  console.log(\`\${req.method} \${req.url}\`);
  next();
});
\`\`\`

## Routing

Create organized routes for your API.`,
      order: 2,
      duration: 75,
    },
    {
      courseId: course3.id,
      title: 'RESTful API Design',
      content: `# RESTful API Design

## REST Principles

- **Resources**: Use nouns (users, posts, comments)
- **HTTP Methods**: GET, POST, PUT, PATCH, DELETE
- **Status Codes**: 200, 201, 400, 404, 500

## Example API

\`\`\`javascript
// GET /api/users
app.get('/api/users', async (req, res) => {
  const users = await db.user.findMany();
  res.json(users);
});

// POST /api/users
app.post('/api/users', async (req, res) => {
  const user = await db.user.create({
    data: req.body
  });
  res.status(201).json(user);
});

// GET /api/users/:id
app.get('/api/users/:id', async (req, res) => {
  const user = await db.user.findUnique({
    where: { id: req.params.id }
  });
  res.json(user);
});
\`\`\``,
      order: 3,
      duration: 90,
    },
  ];

  for (const lesson of course3Lessons) {
    await prisma.lesson.create({ data: lesson });
  }

  // Course 4 Lessons: Database Design
  const course4Lessons = [
    {
      courseId: course4.id,
      title: 'Database Fundamentals',
      content: `# Database Fundamentals

## What is a Database?

A database is an organized collection of structured data stored electronically.

## Relational Databases

- Tables with rows and columns
- Relationships between tables
- ACID properties (Atomicity, Consistency, Isolation, Durability)

## PostgreSQL

A powerful, open-source relational database.

## Key Concepts

- **Tables**: Store data in rows and columns
- **Primary Keys**: Unique identifier for each row
- **Foreign Keys**: Reference to another table
- **Indexes**: Speed up queries`,
      order: 1,
      duration: 60,
    },
    {
      courseId: course4.id,
      title: 'SQL Queries',
      content: `# SQL Queries

## SELECT

\`\`\`sql
SELECT name, email FROM users;
SELECT * FROM users WHERE age > 18;
SELECT * FROM users ORDER BY created_at DESC;
\`\`\`

## INSERT

\`\`\`sql
INSERT INTO users (name, email, age)
VALUES ('Alex', 'alex@example.com', 25);
\`\`\`

## UPDATE

\`\`\`sql
UPDATE users
SET age = 26
WHERE email = 'alex@example.com';
\`\`\`

## DELETE

\`\`\`sql
DELETE FROM users WHERE id = 1;
\`\`\`

## JOIN

\`\`\`sql
SELECT u.name, o.total
FROM users u
JOIN orders o ON u.id = o.user_id;
\`\`\``,
      order: 2,
      duration: 90,
    },
    {
      courseId: course4.id,
      title: 'Database Design & Normalization',
      content: `# Database Design & Normalization

## Normal Forms

- **1NF**: Atomic values, no repeating groups
- **2NF**: No partial dependencies
- **3NF**: No transitive dependencies

## Example Schema

\`\`\`sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
\`\`\``,
      order: 3,
      duration: 90,
    },
  ];

  for (const lesson of course4Lessons) {
    await prisma.lesson.create({ data: lesson });
  }

  // Course 5 Lessons: Full-Stack TypeScript
  const course5Lessons = [
    {
      courseId: course5.id,
      title: 'TypeScript Fundamentals',
      content: `# TypeScript Fundamentals

TypeScript is JavaScript with syntax for types.

## Why TypeScript?

- **Type Safety**: Catch errors at compile time
- **Better IDE Support**: Autocomplete and refactoring
- **Documentation**: Types serve as documentation

## Basic Types

\`\`\`typescript
let name: string = 'Alex';
let age: number = 25;
let isStudent: boolean = true;
let scores: number[] = [95, 87, 92];

interface User {
  id: string;
  name: string;
  email: string;
}

const user: User = {
  id: '1',
  name: 'Alex',
  email: 'alex@example.com'
};
\`\`\``,
      order: 1,
      duration: 60,
    },
    {
      courseId: course5.id,
      title: 'Next.js with TypeScript',
      content: `# Next.js with TypeScript

Next.js is a React framework with built-in TypeScript support.

## Pages

\`\`\`typescript
import { GetServerSideProps } from 'next';

interface Props {
  user: User;
}

export default function ProfilePage({ user }: Props) {
  return <h1>Welcome, {user.name}</h1>;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const user = await fetchUser(ctx.params.id);
  return { props: { user } };
};
\`\`\`

## API Routes

\`\`\`typescript
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const users = await db.user.findMany();
  res.status(200).json(users);
}
\`\`\``,
      order: 2,
      duration: 90,
    },
    {
      courseId: course5.id,
      title: 'Prisma ORM',
      content: `# Prisma ORM

Prisma is a next-generation ORM for TypeScript.

## Schema

\`\`\`prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  published Boolean  @default(false)
}
\`\`\`

## Queries

\`\`\`typescript
const user = await prisma.user.create({
  data: {
    email: 'alex@example.com',
    name: 'Alex',
  },
});

const users = await prisma.user.findMany({
  include: { posts: true },
});
\`\`\``,
      order: 3,
      duration: 75,
    },
    {
      courseId: course5.id,
      title: 'Full-Stack Project',
      content: `# Full-Stack Project

Build a complete blogging platform with authentication, CRUD operations, and deployment.

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma
- **Auth**: NextAuth.js
- **Deployment**: Vercel

## Features

1. User authentication
2. Create, read, update, delete posts
3. Comments system
4. User profiles
5. Rich text editor

## Project Structure

\`\`\`
src/
  app/
    api/
    blog/
    profile/
  components/
  lib/
    prisma.ts
  types/
\`\`\`

Let's build it together!`,
      order: 4,
      duration: 120,
    },
  ];

  for (const lesson of course5Lessons) {
    await prisma.lesson.create({ data: lesson });
  }

  console.log(`✅ Created lessons for all courses\n`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('✨ Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Instructors: 3`);
  console.log(`   - Students: 10`);
  console.log(`   - Courses: 5`);
  console.log(`   - Lessons: ${course1Lessons.length + course2Lessons.length + course3Lessons.length + course4Lessons.length + course5Lessons.length}`);
  console.log('\n🔐 Login credentials:');
  console.log('   Email: any email from above');
  console.log('   Password: Password123!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
