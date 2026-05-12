/**
 * Test Assessment Script
 *
 * Runs through the complete 27-step intake assessment
 * and generates a roadmap for a test user.
 *
 * Usage: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/test-assessment.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test user Clerk ID - test-student1
const TEST_CLERK_ID = 'user_36KCDLaL8DSCtny5awV4PpdRDfJ';

// DELIBERATELY WRONG ANSWERS - Target score: ≤30%
const ASSESSMENT_ANSWERS: Record<string, any> = {
  // Step 1: Level Self-Prediction (QUESTIONNAIRE) - claim beginner
  'level_self_prediction': {
    predicted_level: 'beginner',
  },

  // Step 2: Quick Skill Probe (MICRO_MCQ_BURST) - ALL WRONG
  'quick_skill_probe': {
    answers: {
      'probe_const': 'c',    // WRONG - correct is 'a'
      'probe_flex': 'd',     // WRONG - correct is 'b'
      'probe_http': 'a',     // WRONG - correct is 'c'
    },
  },

  // Step 3: About You (QUESTIONNAIRE) - minimal experience
  'questionnaire_background': {
    programming_experience: 'none',
    technologies_used: [],
    github_url: '',
    learning_goal: 'curiosity',
  },

  // Step 4: Self-Assessment Sliders (QUESTIONNAIRE) - lowest confidence
  'questionnaire_confidence': {
    confidence_programming: 1,
    confidence_html_css: 1,
    confidence_javascript: 1,
    confidence_backend: 1,
    confidence_git: 1,
    confidence_design: 1,
  },

  // Step 5: Learning Style (QUESTIONNAIRE)
  'questionnaire_learning_style': {
    learning_style: 'reading',
    weekly_hours: '0_5',
    explanation_preference: 'simple',
  },

  // Step 6-15: MCQs - ALL WRONG ANSWERS
  'mcq_variables': { selectedOptionId: 'd' },         // WRONG - correct is 'b'
  'mcq_arrays': { selectedOptionId: 'd' },            // WRONG - correct is 'b'
  'mcq_functions': { selectedOptionId: 'd' },         // WRONG - correct is 'b'
  'mcq_async': { selectedOptionId: 'a' },             // WRONG - correct is 'c'
  'mcq_css_layout': { selectedOptionId: 'a' },        // WRONG - correct is 'c'
  'mcq_html_semantics': { selectedOptionId: 'd' },    // WRONG - correct is 'b'
  'mcq_git_basics': { selectedOptionId: 'd' },        // WRONG - correct is 'b'
  'mcq_dom': { selectedOptionId: 'd' },               // WRONG - correct is 'b'
  'mcq_responsive': { selectedOptionId: 'd' },        // WRONG - correct is 'b'
  'mcq_architecture': { selectedOptionId: 'd' },      // WRONG - correct is 'b'

  // Step 16-18: Short Text - POOR/WRONG ANSWERS
  'short_explain_callback': {
    text: 'I dont know what a callback is. Maybe its when someone calls you back on the phone?',
  },
  'short_debug_approach': {
    text: 'I would just refresh the page and hope it works.',
  },
  'short_explain_api': {
    text: 'API means something about computers talking I think.',
  },

  // Step 19-21: Code Challenges - BROKEN/WRONG CODE
  'code_unique_sorted': {
    code: `function uniqueSorted(nums) {
  return nums; // just return the input, no idea how to do this
}`,
  },
  'code_count_words': {
    code: `function countWords(str) {
  return str.length; // wrong - returns number not object
}`,
  },
  'code_reverse_words': {
    code: `function reverseWords(str) {
  return str; // no idea
}`,
  },

  // Step 22-26: Design - ALL WRONG CHOICES
  'design_comparison_1': { selectedOption: 'A' },   // WRONG - correct is 'B'
  'design_comparison_2': { selectedOption: 'A' },   // WRONG - correct is 'B'
  'design_critique': {
    critique: 'It looks fine to me. I like the colors.',
  },
  'design_typography': { selectedOption: 'A' },     // WRONG - correct is 'B'
  'design_ux_flow': {
    critique: 'Seems good, more steps means more information.',
  },

  // Step 27-28: Meta Skills - POOR ANSWERS
  'meta_explain_thinking': {
    text: 'I guessed on everything.',
  },
  'meta_ai_reasoning': {
    text: 'AI should just write all my code for me so I dont have to learn.',
  },

  // Step 29: Summary (no answer needed)
  'summary': {},
};

async function main() {
  console.log('🚀 Starting Assessment Test Script\n');

  // 1. Find or create the test user
  console.log('📋 Looking up test user...');
  let user = await prisma.user.findUnique({
    where: { clerkId: TEST_CLERK_ID },
  });

  if (!user) {
    console.log('Creating test user...');
    user = await prisma.user.create({
      data: {
        clerkId: TEST_CLERK_ID,
        email: 'test-student1@signalworks.com',
        name: 'Test Student 1',
        role: 'STUDENT',
      },
    });
  }
  console.log(`✅ User found: ${user.name} (${user.id})\n`);

  // 2. Check for existing incomplete session and delete it
  const existingSession = await prisma.assessmentSession.findFirst({
    where: {
      userId: user.id,
      sessionType: 'INTAKE',
      status: 'IN_PROGRESS',
    },
  });

  if (existingSession) {
    console.log('🗑️  Deleting existing incomplete session...');
    await prisma.assessmentResponse.deleteMany({
      where: { sessionId: existingSession.id },
    });
    await prisma.assessmentSession.delete({
      where: { id: existingSession.id },
    });
  }

  // Also delete completed sessions for fresh test
  const completedSessions = await prisma.assessmentSession.findMany({
    where: {
      userId: user.id,
      sessionType: 'INTAKE',
    },
  });

  for (const session of completedSessions) {
    await prisma.assessmentResponse.deleteMany({
      where: { sessionId: session.id },
    });
    await prisma.assessmentSession.delete({
      where: { id: session.id },
    });
  }

  // Clear existing skill masteries for fresh test
  await prisma.userSkillMastery.deleteMany({
    where: { userId: user.id },
  });

  // Clear existing roadmap for fresh test
  await prisma.studentRoadmap.deleteMany({
    where: { userId: user.id },
  });

  console.log('🧹 Cleared previous assessment data\n');

  // 3. Create new assessment session
  console.log('📝 Creating new assessment session...');

  // Import the intake config to get step IDs
  const { getOrderedSteps } = await import('../src/server/assessment/intakeConfig');
  const steps = getOrderedSteps();

  const session = await prisma.assessmentSession.create({
    data: {
      userId: user.id,
      sessionType: 'INTAKE',
      status: 'IN_PROGRESS',
      currentStep: steps[0].id,
      stepData: {},
      metadata: {},
    },
  });
  console.log(`✅ Session created: ${session.id}\n`);

  // 4. Process each step
  console.log('🎯 Processing assessment steps...\n');

  const { gradeStep } = await import('../src/server/assessment/intakeGrader');

  let totalScore = 0;
  let stepCount = 0;

  for (const step of steps) {
    const answer = ASSESSMENT_ANSWERS[step.id];

    if (!answer || step.kind === 'SUMMARY') {
      console.log(`📊 Step ${step.order}: ${step.title} (${step.kind}) - Skipped`);
      continue;
    }

    try {
      // Grade the step
      const gradeResult = await gradeStep(step, answer, user.id);

      // Save response
      await prisma.assessmentResponse.create({
        data: {
          sessionId: session.id,
          stepId: step.id,
          stepKind: step.kind,
          rawAnswer: answer,
          gradeResult: gradeResult as any,
          skillUpdates: gradeResult.skillScores || {},
        },
      });

      // Update skill masteries
      if (gradeResult.skillScores) {
        for (const [skillKey, score] of Object.entries(gradeResult.skillScores)) {
          await prisma.userSkillMastery.upsert({
            where: {
              userId_skillKey: {
                userId: user.id,
                skillKey,
              },
            },
            update: {
              mastery: score,
              confidence: gradeResult.confidence || 0.5,
              attempts: { increment: 1 },
            },
            create: {
              userId: user.id,
              skillKey,
              mastery: score,
              confidence: gradeResult.confidence || 0.5,
              attempts: 1,
            },
          });
        }
      }

      totalScore += gradeResult.score;
      stepCount++;

      const status = gradeResult.passed ? '✅' : '⚠️';
      console.log(`${status} Step ${step.order}: ${step.title} - Score: ${(gradeResult.score * 100).toFixed(0)}%`);

      // Update session progress
      await prisma.assessmentSession.update({
        where: { id: session.id },
        data: { currentStep: step.id },
      });

    } catch (error) {
      console.error(`❌ Step ${step.order}: ${step.title} - Error:`, error);
    }
  }

  // 5. Complete session
  await prisma.assessmentSession.update({
    where: { id: session.id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  const avgScore = stepCount > 0 ? totalScore / stepCount : 0;
  console.log(`\n📊 Assessment Complete!`);
  console.log(`   Average Score: ${(avgScore * 100).toFixed(1)}%`);
  console.log(`   Steps Completed: ${stepCount}/${steps.length - 1}\n`);

  // 6. Generate Roadmap
  console.log('🗺️  Generating personalized roadmap...\n');

  // Get skill masteries for roadmap generation
  const skillMasteries = await prisma.userSkillMastery.findMany({
    where: { userId: user.id },
  });

  // Identify weak areas (below 0.6 mastery)
  const weakSkills = skillMasteries
    .filter(s => s.mastery < 0.6)
    .map(s => s.skillKey);

  const strongSkills = skillMasteries
    .filter(s => s.mastery >= 0.7)
    .map(s => s.skillKey);

  console.log(`   Strong skills (≥70%): ${strongSkills.length}`);
  console.log(`   Weak skills (<60%): ${weakSkills.length}\n`);

  // Create roadmap items based on assessment
  const roadmapItems = [
    // Phase 1: Foundations
    {
      title: 'JavaScript Fundamentals Review',
      description: 'Solidify core JavaScript concepts including closures, async programming, and ES6+ features.',
      itemType: 'COURSE' as const,
      status: 'NOT_STARTED' as const,
      phase: 1,
      order: 1,
      skillKeys: ['prog_variables', 'prog_functions', 'js_closures', 'js_async'],
      difficulty: 2,
      estimatedHours: 20,
    },
    {
      title: 'HTML/CSS Mastery',
      description: 'Deep dive into semantic HTML, CSS layout techniques, and responsive design.',
      itemType: 'COURSE' as const,
      status: 'NOT_STARTED' as const,
      phase: 1,
      order: 2,
      skillKeys: ['html_structure', 'html_semantics', 'css_layout', 'css_responsive'],
      difficulty: 2,
      estimatedHours: 15,
    },
    {
      title: 'Build a Personal Portfolio',
      description: 'Apply HTML/CSS skills by building a responsive portfolio website.',
      itemType: 'PROJECT' as const,
      status: 'NOT_STARTED' as const,
      phase: 1,
      order: 3,
      skillKeys: ['html_structure', 'css_layout', 'css_responsive', 'design_layout'],
      difficulty: 2,
      estimatedHours: 10,
    },
    // Phase 2: Intermediate
    {
      title: 'React Fundamentals',
      description: 'Learn React component architecture, hooks, and state management.',
      itemType: 'COURSE' as const,
      status: 'NOT_STARTED' as const,
      phase: 2,
      order: 1,
      skillKeys: ['js_dom', 'prog_functions', 'js_es6'],
      difficulty: 3,
      estimatedHours: 30,
    },
    {
      title: 'Build a Task Manager App',
      description: 'Create a full-featured task management application with React.',
      itemType: 'PROJECT' as const,
      status: 'NOT_STARTED' as const,
      phase: 2,
      order: 2,
      skillKeys: ['js_dom', 'prog_arrays', 'prog_objects'],
      difficulty: 3,
      estimatedHours: 15,
    },
    {
      title: 'Backend Development with Node.js',
      description: 'Learn server-side JavaScript, Express.js, and REST API design.',
      itemType: 'COURSE' as const,
      status: 'NOT_STARTED' as const,
      phase: 2,
      order: 3,
      skillKeys: ['backend_rest', 'backend_server', 'system_architecture'],
      difficulty: 3,
      estimatedHours: 25,
    },
    // Phase 3: Advanced
    {
      title: 'Database Design & PostgreSQL',
      description: 'Master database design, SQL queries, and ORM usage with Prisma.',
      itemType: 'COURSE' as const,
      status: 'NOT_STARTED' as const,
      phase: 3,
      order: 1,
      skillKeys: ['backend_database', 'system_architecture'],
      difficulty: 4,
      estimatedHours: 20,
    },
    {
      title: 'Full-Stack Project: E-Commerce Store',
      description: 'Build a complete e-commerce application with React, Node.js, and PostgreSQL.',
      itemType: 'PROJECT' as const,
      status: 'NOT_STARTED' as const,
      phase: 3,
      order: 2,
      skillKeys: ['backend_rest', 'backend_database', 'js_async', 'design_ux_basics'],
      difficulty: 4,
      estimatedHours: 40,
    },
    {
      title: 'Career Preparation Milestone',
      description: 'Complete portfolio, resume, and start applying to jobs.',
      itemType: 'MILESTONE' as const,
      status: 'NOT_STARTED' as const,
      phase: 3,
      order: 3,
      skillKeys: ['meta_communication'],
      difficulty: 3,
      estimatedHours: 15,
    },
  ];

  // Insert roadmap items
  for (const item of roadmapItems) {
    await prisma.studentRoadmap.create({
      data: {
        userId: user.id,
        ...item,
        metadata: {},
      },
    });
  }

  console.log(`✅ Roadmap generated with ${roadmapItems.length} items!\n`);

  // 7. Summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                    TEST COMPLETE                           ');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`📌 User ID: ${user.id}`);
  console.log(`📌 Session ID: ${session.id}`);
  console.log(`📌 Average Score: ${(avgScore * 100).toFixed(1)}%`);
  console.log(`📌 Roadmap Items: ${roadmapItems.length}\n`);

  console.log('🔗 View the roadmap at:');
  console.log(`   http://localhost:3000/student/roadmap\n`);

  console.log('🔗 View skills at:');
  console.log(`   http://localhost:3000/student/skills\n`);

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('❌ Test failed:', error);
  await prisma.$disconnect();
  process.exit(1);
});
