/**
 * Seed Assessment for Trevor M (spiral272@gmail.com)
 *
 * Completes the full intake assessment with good intermediate-level answers.
 *
 * Usage: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-trevor-assessment.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TREVOR_EMAIL = 'spiral272@gmail.com';

const ASSESSMENT_ANSWERS: Record<string, any> = {
  // Step 1: Experience Level
  'level_self_prediction': {
    predicted_level: 'intermediate',
  },

  // Step 2: Quick Skill Probe — ALL CORRECT
  'quick_skill_probe': {
    answers: {
      'probe_const': 'a',   // Correct: Reassignment
      'probe_flex': 'b',    // Correct: Grows to fill available space
      'probe_http': 'c',    // Correct: PUT is idempotent
    },
  },

  // Step 3: About You
  'questionnaire_background': {
    programming_experience: 'self_taught_intermediate',
    technologies_used: ['html_css', 'javascript', 'react', 'git'],
    github_url: 'https://github.com/Trevorton27',
    learning_goal: 'skill_upgrade',
  },

  // Step 4: Self-Assessment Sliders — solid intermediate confidence
  'questionnaire_confidence': {
    confidence_programming: 3,
    confidence_html_css: 3,
    confidence_javascript: 3,
    confidence_backend: 2,
    confidence_git: 3,
    confidence_design: 2,
  },

  // Step 5: Learning Style
  'questionnaire_learning_style': {
    learning_style: 'projects',
    weekly_hours: '10_20',
    explanation_preference: 'balanced',
  },

  // Steps 6–15: MCQs — all correct answers
  'mcq_variables':      { selectedOptionId: 'b' }, // "53" (string concatenation)
  'mcq_arrays':         { selectedOptionId: 'b' }, // filter()
  'mcq_functions':      { selectedOptionId: 'b' }, // 1, 2 (closure)
  'mcq_async':          { selectedOptionId: 'c' }, // 1, 4, 3, 2 (event loop)
  'mcq_css_layout':     { selectedOptionId: 'c' }, // justify-content + align-items
  'mcq_html_semantics': { selectedOptionId: 'b' }, // nav > ul > li > a
  'mcq_git_basics':     { selectedOptionId: 'b' }, // Stages all modified files
  'mcq_dom':            { selectedOptionId: 'b' }, // First matching element
  'mcq_responsive':     { selectedOptionId: 'b' }, // max-width: 600px
  'mcq_architecture':   { selectedOptionId: 'b' }, // Browser requests → backend responds

  // Steps 16–18: Short Text — good answers
  'short_explain_callback': {
    text: `A callback function is a function that is passed as an argument to another function and is called (executed) at a later point — usually after some operation completes. For example, in JavaScript, when you do array.forEach(function(item) { console.log(item); }), the anonymous function is a callback. Another common example is event listeners: button.addEventListener('click', function() { doSomething(); }). Callbacks are also used heavily in asynchronous operations like setTimeout or older-style fetch calls where the result isn't available immediately.`,
  },
  'short_debug_approach': {
    text: `First, I'd open the browser dev tools and check the console for any error messages — a missing function or null reference error would immediately point me in the right direction. Then I'd inspect the button element to verify it exists in the DOM and check that the event listener was actually attached (visible in the Event Listeners panel). I'd add console.log statements before and inside the handler to confirm execution reaches each point. If the handler isn't firing at all, I'd check that the JS file loaded correctly and the selector matches. I'd also test the function in isolation by calling it directly from the console.`,
  },
  'short_explain_api': {
    text: `A REST API (Representational State Transfer) is a standardized way for a frontend application to communicate with a backend server over HTTP. It uses standard HTTP methods — GET to fetch data, POST to create, PUT/PATCH to update, and DELETE to remove resources. Each resource has a URL endpoint, and the server responds typically with JSON. For example, a React frontend might call GET /api/users/123 to fetch a user's profile, receive a JSON object back, and render that data in the UI. REST APIs are stateless, meaning each request carries all the information the server needs to respond.`,
  },

  // Steps 19–21: Code Challenges — correct implementations
  'code_unique_sorted': {
    code: `function uniqueSorted(nums) {
  return [...new Set(nums)].sort((a, b) => a - b);
}`,
  },
  'code_count_words': {
    code: `function countWords(str) {
  if (!str.trim()) return {};
  return str.toLowerCase().trim().split(/\s+/).reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});
}`,
  },
  'code_reverse_words': {
    code: `function reverseWords(str) {
  return str.trim().split(/\s+/).filter(Boolean).reverse().join(' ');
}`,
  },

  // Steps 22–26: Design — all correct choices and good critiques
  'design_comparison_1': { selectedOption: 'B' }, // Blue CTA button
  'design_comparison_2': { selectedOption: 'B' }, // Hierarchical card layout
  'design_critique': {
    critique: `I'd improve three things. First, the color scheme is the biggest issue — red background with yellow inputs and green button creates a clashing, inaccessible palette with poor contrast ratios. I'd switch to a neutral white or light gray background with a clear, accessible color for the CTA button. Second, Comic Sans is unprofessional and undermines trust for a login form — I'd use a clean sans-serif like Inter or system-ui. Third, the inconsistent input widths create misalignment that looks unpolished and makes the form feel broken — all form elements should share the same width so they visually belong together. I'd also add proper labels above each input for accessibility rather than relying solely on placeholder text.`,
  },
  'design_typography': { selectedOption: 'B' }, // Comfortable 16px/1.6 line-height
  'design_ux_flow': {
    critique: `The two biggest UX problems are mandatory account creation and excessive steps. Forcing users to create an account before they can purchase is a known cart-abandonment driver — many users will simply leave rather than fill out a registration form mid-checkout. The fix is to offer guest checkout prominently. Second, six separate steps is too many for the information being collected. Steps 1, 3, and 4 (shipping method, shipping address, billing address) could be combined into a single screen since they're all related to delivery. That reduces the flow to 3–4 steps, which feels much more manageable. Adding a progress indicator would also reduce anxiety by showing users how close they are to completing the purchase.`,
  },

  // Steps 27–28: Meta Skills
  'meta_explain_thinking': {
    text: `The async JavaScript question (the event loop one with Promises and setTimeout) was the hardest for me. I knew that synchronous code runs first, but I had to think carefully about the microtask queue vs macrotask queue distinction — specifically that Promise callbacks run in the microtask queue before setTimeout callbacks even when the timeout is 0ms. It's a subtle runtime behavior that doesn't come up in day-to-day React work, so I had to reason through it rather than recall it from muscle memory. I'd want to study the JavaScript event loop model more deeply to solidify this.`,
  },
  'meta_ai_reasoning': {
    text: `AI tools like Copilot are genuinely useful for accelerating development on tasks where you already understand the concept but don't remember exact syntax — like how to write a specific regex or configure a webpack option. The benefit is real: you can explore unfamiliar APIs faster and avoid getting stuck on mechanical details, keeping focus on the higher-level problem. The risk is using AI as a substitute for understanding. If you let it write logic you don't fully comprehend, you won't be able to debug it when it breaks or adapt it when requirements change. The healthy approach is to use AI to augment learning — ask it to explain the code it generates rather than just copying it.`,
  },

  // Step 29: Summary (no answer needed)
  'summary': {},
};

async function main() {
  console.log('🚀 Seeding assessment for Trevor M\n');

  // 1. Find the user
  let user = await prisma.user.findFirst({
    where: { email: TREVOR_EMAIL },
  });

  if (!user) {
    console.error(`❌ No user found with email: ${TREVOR_EMAIL}`);
    console.error('Make sure Trevor M has logged in at least once to create a DB record.');
    process.exit(1);
  }
  console.log(`✅ User found: ${user.name} (${user.id})\n`);

  // 2. Clear any existing assessment data for a clean run
  const existingSessions = await prisma.assessmentSession.findMany({
    where: { userId: user.id, sessionType: 'INTAKE' },
  });
  for (const session of existingSessions) {
    await prisma.assessmentResponse.deleteMany({ where: { sessionId: session.id } });
    await prisma.assessmentSession.delete({ where: { id: session.id } });
  }
  await prisma.userSkillMastery.deleteMany({ where: { userId: user.id } });
  await prisma.studentRoadmap.deleteMany({ where: { userId: user.id } });
  console.log('🧹 Cleared previous assessment data\n');

  // 3. Load config and create session
  const { getOrderedSteps } = await import('../src/server/assessment/intakeConfig');
  const { gradeStep } = await import('../src/server/assessment/intakeGrader');
  const steps = getOrderedSteps();

  const session = await prisma.assessmentSession.create({
    data: {
      userId: user.id,
      sessionType: 'INTAKE',
      status: 'IN_PROGRESS',
      currentStep: steps[0].id,
      metadata: {},
    },
  });
  console.log(`📝 Session created: ${session.id}\n`);

  // 4. Process each step
  let totalScore = 0;
  let stepCount = 0;

  for (const step of steps) {
    const answer = ASSESSMENT_ANSWERS[step.id];
    if (!answer || step.kind === 'SUMMARY') {
      console.log(`📊 Step ${step.order}: ${step.title} (${step.kind}) — Skipped`);
      continue;
    }

    try {
      const gradeResult = await gradeStep(step, answer, user.id);

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

      if (gradeResult.skillScores) {
        for (const [skillKey, score] of Object.entries(gradeResult.skillScores)) {
          await prisma.userSkillMastery.upsert({
            where: { userId_skillKey: { userId: user.id, skillKey } },
            update: {
              mastery: score,
              confidence: gradeResult.confidence || 0.7,
              attempts: { increment: 1 },
            },
            create: {
              userId: user.id,
              skillKey,
              mastery: score as number,
              confidence: gradeResult.confidence || 0.7,
              attempts: 1,
            },
          });
        }
      }

      totalScore += gradeResult.score;
      stepCount++;

      await prisma.assessmentSession.update({
        where: { id: session.id },
        data: { currentStep: step.id },
      });

      const icon = gradeResult.passed ? '✅' : '⚠️';
      console.log(`${icon} Step ${step.order}: ${step.title} — Score: ${(gradeResult.score * 100).toFixed(0)}%`);
    } catch (error) {
      console.error(`❌ Step ${step.order}: ${step.title} — Error:`, error);
    }
  }

  // 5. Mark session complete
  await prisma.assessmentSession.update({
    where: { id: session.id },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });

  const avgScore = stepCount > 0 ? totalScore / stepCount : 0;
  console.log(`\n📊 Assessment complete! Average score: ${(avgScore * 100).toFixed(1)}%`);
  console.log(`   Steps graded: ${stepCount}/${steps.length - 1}\n`);

  // 6. Generate roadmap
  const skillMasteries = await prisma.userSkillMastery.findMany({ where: { userId: user.id } });
  const weakSkills = skillMasteries.filter(s => s.mastery < 0.6).map(s => s.skillKey);
  const strongSkills = skillMasteries.filter(s => s.mastery >= 0.7).map(s => s.skillKey);

  console.log(`🗺️  Roadmap — strong skills: ${strongSkills.length}, weak: ${weakSkills.length}`);

  const roadmapItems = [
    {
      title: 'TypeScript Fundamentals',
      description: 'Upgrade JavaScript skills with TypeScript: types, interfaces, generics, and the compiler.',
      itemType: 'COURSE' as const,
      status: 'NOT_STARTED' as const,
      phase: 1,
      order: 1,
      skillKeys: ['prog_variables', 'prog_functions', 'js_es6'],
      difficulty: 2,
      estimatedHours: 15,
    },
    {
      title: 'Advanced React Patterns',
      description: 'Context API, custom hooks, performance optimization, and component composition.',
      itemType: 'COURSE' as const,
      status: 'NOT_STARTED' as const,
      phase: 1,
      order: 2,
      skillKeys: ['js_dom', 'js_async', 'prog_functions'],
      difficulty: 3,
      estimatedHours: 20,
    },
    {
      title: 'Build a Full-Stack Portfolio App',
      description: 'Combine React, Node.js, and a database to build and deploy a production-quality project.',
      itemType: 'PROJECT' as const,
      status: 'NOT_STARTED' as const,
      phase: 1,
      order: 3,
      skillKeys: ['backend_rest', 'backend_database', 'js_async', 'design_layout'],
      difficulty: 3,
      estimatedHours: 25,
    },
    {
      title: 'Backend with Node.js & Express',
      description: 'REST APIs, middleware, authentication patterns, and database integration with Prisma.',
      itemType: 'COURSE' as const,
      status: 'NOT_STARTED' as const,
      phase: 2,
      order: 1,
      skillKeys: ['backend_rest', 'backend_server', 'system_architecture'],
      difficulty: 3,
      estimatedHours: 25,
    },
    {
      title: 'UI/UX Design Principles',
      description: 'Visual hierarchy, spacing, color theory, typography, and accessibility fundamentals.',
      itemType: 'COURSE' as const,
      status: 'NOT_STARTED' as const,
      phase: 2,
      order: 2,
      skillKeys: ['design_visual_hierarchy', 'design_layout', 'design_typography'],
      difficulty: 2,
      estimatedHours: 12,
    },
    {
      title: 'Database Design & PostgreSQL',
      description: 'Schema design, SQL queries, indexing, and ORM usage with Prisma.',
      itemType: 'COURSE' as const,
      status: 'NOT_STARTED' as const,
      phase: 2,
      order: 3,
      skillKeys: ['backend_database', 'system_architecture'],
      difficulty: 3,
      estimatedHours: 18,
    },
    {
      title: 'Deploy & Ship: CI/CD Pipeline',
      description: 'GitHub Actions, Vercel/Railway deployments, environment variables, and monitoring.',
      itemType: 'PROJECT' as const,
      status: 'NOT_STARTED' as const,
      phase: 3,
      order: 1,
      skillKeys: ['dev_git_basics', 'system_architecture'],
      difficulty: 3,
      estimatedHours: 10,
    },
    {
      title: 'Capstone: SaaS Application',
      description: 'Build and launch a complete SaaS product with auth, payments, and a real user base.',
      itemType: 'PROJECT' as const,
      status: 'NOT_STARTED' as const,
      phase: 3,
      order: 2,
      skillKeys: ['backend_rest', 'backend_database', 'js_async', 'design_ux_basics'],
      difficulty: 5,
      estimatedHours: 60,
    },
  ];

  for (const item of roadmapItems) {
    await prisma.studentRoadmap.create({
      data: { userId: user.id, ...item, metadata: {} },
    });
  }

  console.log(`✅ Roadmap generated: ${roadmapItems.length} items\n`);
  console.log('═══════════════════════════════════════════');
  console.log('  Done! Assessment seeded for Trevor M');
  console.log('═══════════════════════════════════════════\n');
  console.log(`📌 User ID:    ${user.id}`);
  console.log(`📌 Session ID: ${session.id}`);
  console.log(`📌 Avg Score:  ${(avgScore * 100).toFixed(1)}%\n`);

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('❌ Script failed:', error);
  await prisma.$disconnect();
  process.exit(1);
});
