/**
 * Intake Assessment Configuration
 *
 * Defines all steps in the intake/placement assessment flow.
 * Each step assesses specific skills and contributes to the student's profile.
 */

import type { SkillDimension } from './skillModel';

// ============================================
// TYPES
// ============================================

export type IntakeStepKind =
  | 'QUESTIONNAIRE'
  | 'MCQ'
  | 'SHORT_TEXT'
  | 'CODE'
  | 'DESIGN_COMPARISON'
  | 'DESIGN_CRITIQUE'
  | 'SUMMARY';

export interface BaseStepConfig {
  id: string;
  kind: IntakeStepKind;
  title: string;
  description: string;
  skillKeys: string[]; // Skills this step assesses
  order: number;
  estimatedMinutes: number;
}

export interface QuestionnaireField {
  id: string;
  type: 'text' | 'select' | 'slider' | 'multiselect' | 'url';
  label: string;
  description?: string;
  required: boolean;
  options?: Array<{ value: string; label: string }>;
  min?: number; // For slider
  max?: number; // For slider
  placeholder?: string;
  skillMapping?: {
    skillKey: string;
    // For slider/select: map values to confidence levels
    valueToConfidence?: Record<string, number>;
  };
}

export interface QuestionnaireStepConfig extends BaseStepConfig {
  kind: 'QUESTIONNAIRE';
  fields: QuestionnaireField[];
}

export interface McqOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface McqStepConfig extends BaseStepConfig {
  kind: 'MCQ';
  question: string;
  options: McqOption[];
  explanation?: string; // Shown after answering
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface ShortTextStepConfig extends BaseStepConfig {
  kind: 'SHORT_TEXT';
  question: string;
  rubric: string; // Grading rubric for AI
  maxScore: number; // e.g., 3 for 0-3 scale
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
}

export interface CodeStepConfig extends BaseStepConfig {
  kind: 'CODE';
  problemDescription: string;
  starterCode: string;
  language: 'javascript' | 'typescript';
  testCases: Array<{
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }>;
  hints?: string[];
  // Optional: reference to existing Challenge slug
  challengeSlug?: string;
}

export interface DesignComparisonStepConfig extends BaseStepConfig {
  kind: 'DESIGN_COMPARISON';
  prompt: string;
  optionA: {
    description: string;
    imageUrl?: string; // Optional image
    inlineHtml?: string; // Or inline HTML mockup
  };
  optionB: {
    description: string;
    imageUrl?: string;
    inlineHtml?: string;
  };
  correctOption: 'A' | 'B';
  explanation: string;
}

export interface DesignCritiqueStepConfig extends BaseStepConfig {
  kind: 'DESIGN_CRITIQUE';
  prompt: string;
  designDescription: string;
  imageUrl?: string;
  inlineHtml?: string;
  rubric: string; // AI grading rubric
  lookingFor: string[]; // Key points to identify
}

export interface SummaryStepConfig extends BaseStepConfig {
  kind: 'SUMMARY';
}

export type IntakeStepConfig =
  | QuestionnaireStepConfig
  | McqStepConfig
  | ShortTextStepConfig
  | CodeStepConfig
  | DesignComparisonStepConfig
  | DesignCritiqueStepConfig
  | SummaryStepConfig;

// ============================================
// INTAKE STEPS CONFIGURATION
// ============================================

export const INTAKE_STEPS: IntakeStepConfig[] = [
  // ----------------------------------------
  // SECTION 1: QUESTIONNAIRE (Background)
  // ----------------------------------------
  {
    id: 'questionnaire_background',
    kind: 'QUESTIONNAIRE',
    title: 'About You',
    description: 'Tell us about your background and experience with programming.',
    skillKeys: [], // Skills will be mapped from individual fields
    order: 1,
    estimatedMinutes: 5,
    fields: [
      {
        id: 'programming_experience',
        type: 'select',
        label: 'How much programming experience do you have?',
        required: true,
        options: [
          { value: 'none', label: 'No experience - complete beginner' },
          { value: 'self_taught_beginner', label: 'Some self-taught (< 6 months)' },
          { value: 'self_taught_intermediate', label: 'Self-taught (6+ months)' },
          { value: 'bootcamp', label: 'Completed a bootcamp' },
          { value: 'cs_student', label: 'CS student or graduate' },
          { value: 'professional', label: 'Professional developer' },
        ],
      },
      {
        id: 'technologies_used',
        type: 'multiselect',
        label: 'Which technologies have you used? (Select all that apply)',
        required: false,
        options: [
          { value: 'html_css', label: 'HTML/CSS' },
          { value: 'javascript', label: 'JavaScript' },
          { value: 'typescript', label: 'TypeScript' },
          { value: 'react', label: 'React' },
          { value: 'nodejs', label: 'Node.js' },
          { value: 'python', label: 'Python' },
          { value: 'databases', label: 'Databases (SQL/NoSQL)' },
          { value: 'git', label: 'Git/GitHub' },
          { value: 'other', label: 'Other languages/frameworks' },
        ],
      },
      {
        id: 'github_url',
        type: 'url',
        label: 'GitHub profile URL (optional)',
        description: 'We can analyze your public repos to better understand your experience.',
        required: false,
        placeholder: 'https://github.com/username',
      },
      {
        id: 'learning_goal',
        type: 'select',
        label: 'What is your primary learning goal?',
        required: true,
        options: [
          { value: 'career_change', label: 'Career change into tech' },
          { value: 'skill_upgrade', label: 'Upgrade existing skills' },
          { value: 'freelance', label: 'Freelance/contract work' },
          { value: 'side_projects', label: 'Build side projects' },
          { value: 'startup', label: 'Build a startup' },
          { value: 'curiosity', label: 'General curiosity/learning' },
        ],
      },
    ],
  } as QuestionnaireStepConfig,

  {
    id: 'questionnaire_confidence',
    kind: 'QUESTIONNAIRE',
    title: 'Self-Assessment',
    description: 'Rate your confidence in the following areas (1 = no experience, 5 = very confident).',
    skillKeys: [
      'prog_variables', 'prog_control_flow', 'prog_functions', 'prog_arrays',
      'html_structure', 'css_layout',
      'js_dom', 'js_async',
      'backend_rest', 'backend_database',
      'dev_git_basics', 'dev_debugging',
      'design_visual_hierarchy', 'design_layout',
    ],
    order: 2,
    estimatedMinutes: 3,
    fields: [
      {
        id: 'confidence_programming',
        type: 'slider',
        label: 'Programming basics (variables, loops, functions)',
        min: 1,
        max: 5,
        required: true,
        skillMapping: {
          skillKey: 'prog_fundamentals_aggregate',
          valueToConfidence: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 },
        },
      },
      {
        id: 'confidence_html_css',
        type: 'slider',
        label: 'HTML & CSS',
        min: 1,
        max: 5,
        required: true,
        skillMapping: {
          skillKey: 'web_foundations_aggregate',
          valueToConfidence: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 },
        },
      },
      {
        id: 'confidence_javascript',
        type: 'slider',
        label: 'JavaScript',
        min: 1,
        max: 5,
        required: true,
        skillMapping: {
          skillKey: 'javascript_aggregate',
          valueToConfidence: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 },
        },
      },
      {
        id: 'confidence_backend',
        type: 'slider',
        label: 'Backend / APIs / Databases',
        min: 1,
        max: 5,
        required: true,
        skillMapping: {
          skillKey: 'backend_aggregate',
          valueToConfidence: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 },
        },
      },
      {
        id: 'confidence_git',
        type: 'slider',
        label: 'Git & version control',
        min: 1,
        max: 5,
        required: true,
        skillMapping: {
          skillKey: 'dev_git_basics',
          valueToConfidence: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 },
        },
      },
      {
        id: 'confidence_design',
        type: 'slider',
        label: 'UI/UX Design sense',
        min: 1,
        max: 5,
        required: true,
        skillMapping: {
          skillKey: 'design_aggregate',
          valueToConfidence: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 },
        },
      },
    ],
  } as QuestionnaireStepConfig,

  // ----------------------------------------
  // SECTION 2: CONCEPTUAL MCQs
  // ----------------------------------------
  {
    id: 'mcq_variables',
    kind: 'MCQ',
    title: 'Programming Concepts',
    description: 'Answer this question about variables and data types.',
    skillKeys: ['prog_variables'],
    order: 10,
    estimatedMinutes: 1,
    difficulty: 'beginner',
    question: 'What will be the value of `result` after this code runs?\n\n```javascript\nlet x = 5;\nlet y = "3";\nlet result = x + y;\n```',
    options: [
      { id: 'a', text: '8 (number)', isCorrect: false },
      { id: 'b', text: '"53" (string)', isCorrect: true },
      { id: 'c', text: '"35" (string)', isCorrect: false },
      { id: 'd', text: 'Error', isCorrect: false },
    ],
    explanation: 'When you add a number and a string in JavaScript, the number is converted to a string and concatenated. So 5 + "3" = "53".',
  } as McqStepConfig,

  {
    id: 'mcq_arrays',
    kind: 'MCQ',
    title: 'Arrays',
    description: 'Answer this question about array methods.',
    skillKeys: ['prog_arrays', 'js_array_methods'],
    order: 11,
    estimatedMinutes: 1,
    difficulty: 'beginner',
    question: 'Which array method would you use to create a new array with only the even numbers from `[1, 2, 3, 4, 5, 6]`?',
    options: [
      { id: 'a', text: 'map()', isCorrect: false },
      { id: 'b', text: 'filter()', isCorrect: true },
      { id: 'c', text: 'reduce()', isCorrect: false },
      { id: 'd', text: 'forEach()', isCorrect: false },
    ],
    explanation: 'filter() creates a new array with elements that pass a test. map() transforms each element, reduce() accumulates values, and forEach() just iterates without returning a new array.',
  } as McqStepConfig,

  {
    id: 'mcq_functions',
    kind: 'MCQ',
    title: 'Functions',
    description: 'Answer this question about function scope.',
    skillKeys: ['prog_functions', 'js_closures'],
    order: 12,
    estimatedMinutes: 1,
    difficulty: 'intermediate',
    question: 'What will this code output?\n\n```javascript\nfunction outer() {\n  let count = 0;\n  return function inner() {\n    count++;\n    return count;\n  };\n}\n\nconst counter = outer();\nconsole.log(counter());\nconsole.log(counter());\n```',
    options: [
      { id: 'a', text: '1, 1', isCorrect: false },
      { id: 'b', text: '1, 2', isCorrect: true },
      { id: 'c', text: '0, 1', isCorrect: false },
      { id: 'd', text: 'undefined, undefined', isCorrect: false },
    ],
    explanation: 'This demonstrates closures. The inner function "closes over" the count variable, maintaining its value between calls. Each call to counter() increments and returns the count.',
  } as McqStepConfig,

  {
    id: 'mcq_async',
    kind: 'MCQ',
    title: 'Async Programming',
    description: 'Answer this question about asynchronous JavaScript.',
    skillKeys: ['js_async'],
    order: 13,
    estimatedMinutes: 1,
    difficulty: 'intermediate',
    question: 'What is the output order of this code?\n\n```javascript\nconsole.log("1");\nsetTimeout(() => console.log("2"), 0);\nPromise.resolve().then(() => console.log("3"));\nconsole.log("4");\n```',
    options: [
      { id: 'a', text: '1, 2, 3, 4', isCorrect: false },
      { id: 'b', text: '1, 4, 2, 3', isCorrect: false },
      { id: 'c', text: '1, 4, 3, 2', isCorrect: true },
      { id: 'd', text: '1, 3, 4, 2', isCorrect: false },
    ],
    explanation: 'Synchronous code runs first (1, 4). Then microtasks (Promises) run before macrotasks (setTimeout), so 3 comes before 2.',
  } as McqStepConfig,

  {
    id: 'mcq_css_layout',
    kind: 'MCQ',
    title: 'CSS Layout',
    description: 'Answer this question about CSS Flexbox.',
    skillKeys: ['css_layout'],
    order: 14,
    estimatedMinutes: 1,
    difficulty: 'beginner',
    question: 'Which CSS property would you use to center a flex item both horizontally and vertically within its container?',
    options: [
      { id: 'a', text: 'text-align: center; vertical-align: middle;', isCorrect: false },
      { id: 'b', text: 'margin: auto;', isCorrect: false },
      { id: 'c', text: 'justify-content: center; align-items: center;', isCorrect: true },
      { id: 'd', text: 'position: absolute; top: 50%; left: 50%;', isCorrect: false },
    ],
    explanation: 'In Flexbox, justify-content controls the main axis (horizontal by default) and align-items controls the cross axis (vertical by default). Setting both to center perfectly centers the item.',
  } as McqStepConfig,

  {
    id: 'mcq_html_semantics',
    kind: 'MCQ',
    title: 'HTML Semantics',
    description: 'Answer this question about semantic HTML.',
    skillKeys: ['html_semantics', 'html_structure'],
    order: 15,
    estimatedMinutes: 1,
    difficulty: 'beginner',
    question: 'Which is the most semantically appropriate way to mark up a navigation menu?',
    options: [
      { id: 'a', text: '<div class="nav"><div class="nav-item">Home</div></div>', isCorrect: false },
      { id: 'b', text: '<nav><ul><li><a href="/">Home</a></li></ul></nav>', isCorrect: true },
      { id: 'c', text: '<span class="navigation">Home | About | Contact</span>', isCorrect: false },
      { id: 'd', text: '<p><a href="/">Home</a> <a href="/about">About</a></p>', isCorrect: false },
    ],
    explanation: 'The <nav> element semantically indicates navigation, <ul>/<li> properly represents a list of links, and <a> elements make them clickable. This helps screen readers and SEO.',
  } as McqStepConfig,

  // ----------------------------------------
  // SECTION 3: SHORT TEXT EXPLANATIONS
  // ----------------------------------------
  {
    id: 'short_explain_callback',
    kind: 'SHORT_TEXT',
    title: 'Explain a Concept',
    description: 'Explain in your own words.',
    skillKeys: ['meta_explanation', 'js_async', 'prog_functions'],
    order: 20,
    estimatedMinutes: 3,
    question: 'In your own words, explain what a "callback function" is and give a simple example of when you might use one.',
    rubric: `Grade on 0-3 scale:
0: No understanding shown, wrong or irrelevant answer
1: Basic understanding - mentions that it's a function passed to another function, but explanation unclear or example missing/wrong
2: Good understanding - correctly explains callbacks are functions passed as arguments to be called later, gives a reasonable example (event handlers, array methods, async operations)
3: Excellent - clear explanation with correct terminology, good example, may mention async context or higher-order functions`,
    maxScore: 3,
    minLength: 50,
    maxLength: 500,
    placeholder: 'A callback function is...',
  } as ShortTextStepConfig,

  {
    id: 'short_debug_approach',
    kind: 'SHORT_TEXT',
    title: 'Debugging Approach',
    description: 'Describe your problem-solving process.',
    skillKeys: ['meta_problem_solving', 'dev_debugging'],
    order: 21,
    estimatedMinutes: 3,
    question: 'You\'re working on a web page and a button click isn\'t working as expected. Describe the steps you would take to debug this issue.',
    rubric: `Grade on 0-3 scale:
0: No useful debugging approach
1: Basic - mentions checking console or looking at code, but no systematic approach
2: Good - mentions multiple debugging steps: check console for errors, verify event listener is attached, use console.log/breakpoints, check if element exists
3: Excellent - systematic approach including: inspect element, check console errors, verify JS loaded, check event binding, use debugger/breakpoints, check for typos in selectors, test in isolation`,
    maxScore: 3,
    minLength: 50,
    maxLength: 500,
    placeholder: 'First, I would...',
  } as ShortTextStepConfig,

  // ----------------------------------------
  // SECTION 4: CODING TASKS
  // ----------------------------------------
  {
    id: 'code_unique_sorted',
    kind: 'CODE',
    title: 'Coding Challenge: Unique Sorted',
    description: 'Implement a function to process an array.',
    skillKeys: ['prog_arrays', 'prog_algorithms', 'js_array_methods'],
    order: 30,
    estimatedMinutes: 8,
    problemDescription: `Implement a function \`uniqueSorted\` that takes an array of numbers and returns a new array containing only the unique values, sorted in ascending order.

**Examples:**
- \`uniqueSorted([3, 1, 2, 1, 3])\` → \`[1, 2, 3]\`
- \`uniqueSorted([5, 5, 5])\` → \`[5]\`
- \`uniqueSorted([])\` → \`[]\``,
    starterCode: `function uniqueSorted(nums) {
  // Your code here
}`,
    language: 'javascript',
    testCases: [
      { input: '[3, 1, 2, 1, 3]', expectedOutput: '[1,2,3]', isHidden: false },
      { input: '[5, 5, 5]', expectedOutput: '[5]', isHidden: false },
      { input: '[]', expectedOutput: '[]', isHidden: false },
      { input: '[1]', expectedOutput: '[1]', isHidden: true },
      { input: '[9, 1, 5, 1, 9, 5, 2]', expectedOutput: '[1,2,5,9]', isHidden: true },
    ],
    hints: [
      'Consider using a Set to remove duplicates',
      'Array.from() or spread operator can convert a Set back to an array',
      'The sort() method can sort numbers, but remember it sorts as strings by default',
    ],
  } as CodeStepConfig,

  {
    id: 'code_count_words',
    kind: 'CODE',
    title: 'Coding Challenge: Word Count',
    description: 'Implement a function to count word occurrences.',
    skillKeys: ['prog_strings', 'prog_objects', 'prog_algorithms'],
    order: 31,
    estimatedMinutes: 8,
    problemDescription: `Implement a function \`countWords\` that takes a string and returns an object with each word as a key and its count as the value. Words should be case-insensitive.

**Examples:**
- \`countWords("hello world hello")\` → \`{ hello: 2, world: 1 }\`
- \`countWords("The the THE")\` → \`{ the: 3 }\`
- \`countWords("")\` → \`{}\``,
    starterCode: `function countWords(str) {
  // Your code here
}`,
    language: 'javascript',
    testCases: [
      { input: '"hello world hello"', expectedOutput: '{"hello":2,"world":1}', isHidden: false },
      { input: '"The the THE"', expectedOutput: '{"the":3}', isHidden: false },
      { input: '""', expectedOutput: '{}', isHidden: false },
      { input: '"one"', expectedOutput: '{"one":1}', isHidden: true },
      { input: '"a b c a b a"', expectedOutput: '{"a":3,"b":2,"c":1}', isHidden: true },
    ],
    hints: [
      'Use toLowerCase() to handle case-insensitivity',
      'split() can break a string into an array of words',
      'Consider edge cases like empty strings',
    ],
  } as CodeStepConfig,

  // ----------------------------------------
  // SECTION 5: DESIGN ASSESSMENT
  // ----------------------------------------
  {
    id: 'design_comparison_1',
    kind: 'DESIGN_COMPARISON',
    title: 'Design Comparison',
    description: 'Compare two button designs and choose the better one.',
    skillKeys: ['design_visual_hierarchy', 'design_ux_basics'],
    order: 40,
    estimatedMinutes: 2,
    prompt: 'Which button design is more effective for a primary call-to-action (like "Sign Up")?',
    optionA: {
      description: 'A gray button with small, light gray text, no padding distinction from surrounding elements',
      inlineHtml: `<button style="background: #e0e0e0; color: #999; padding: 8px 16px; border: none; font-size: 12px;">Sign Up</button>`,
    },
    optionB: {
      description: 'A blue button with white text, clear padding, and slightly rounded corners',
      inlineHtml: `<button style="background: #2563eb; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 16px; font-weight: 600;">Sign Up</button>`,
    },
    correctOption: 'B',
    explanation: 'Option B is more effective because it has high contrast (blue background with white text), appropriate size for a primary action, and clear visual weight that draws attention. Option A lacks contrast and visual prominence.',
  } as DesignComparisonStepConfig,

  {
    id: 'design_comparison_2',
    kind: 'DESIGN_COMPARISON',
    title: 'Layout Comparison',
    description: 'Compare two card layouts.',
    skillKeys: ['design_layout', 'design_visual_hierarchy'],
    order: 41,
    estimatedMinutes: 2,
    prompt: 'Which card layout better presents a blog post preview?',
    optionA: {
      description: 'Title, date, and excerpt all in similar sized gray text, tightly packed together',
      inlineHtml: `<div style="padding: 12px; border: 1px solid #ddd; font-family: sans-serif;">
        <div style="color: #666; font-size: 14px;">How to Learn JavaScript</div>
        <div style="color: #666; font-size: 14px;">December 10, 2025</div>
        <div style="color: #666; font-size: 14px;">This article covers the basics of JavaScript programming and helps you get started with web development.</div>
      </div>`,
    },
    optionB: {
      description: 'Large bold title, subtle date below, excerpt with comfortable spacing',
      inlineHtml: `<div style="padding: 20px; border: 1px solid #ddd; font-family: sans-serif;">
        <div style="color: #111; font-size: 20px; font-weight: 600; margin-bottom: 8px;">How to Learn JavaScript</div>
        <div style="color: #888; font-size: 13px; margin-bottom: 12px;">December 10, 2025</div>
        <div style="color: #444; font-size: 15px; line-height: 1.5;">This article covers the basics of JavaScript programming and helps you get started with web development.</div>
      </div>`,
    },
    correctOption: 'B',
    explanation: 'Option B creates clear visual hierarchy: the title stands out as the most important element, the date is de-emphasized as metadata, and the excerpt is readable with good line height. Spacing separates distinct pieces of information.',
  } as DesignComparisonStepConfig,

  {
    id: 'design_critique',
    kind: 'DESIGN_CRITIQUE',
    title: 'Design Critique',
    description: 'Analyze a design and suggest improvements.',
    skillKeys: ['design_critique', 'design_visual_hierarchy', 'design_layout', 'meta_explanation'],
    order: 42,
    estimatedMinutes: 4,
    prompt: 'Look at this login form design. What are 2-3 things you would improve and why?',
    designDescription: 'A login form with: red background, yellow input fields, green submit button, all text in Comic Sans, no labels (just placeholder text), inputs and button are different widths, no spacing between elements.',
    inlineHtml: `<div style="background: #ff4444; padding: 20px; width: 300px; font-family: 'Comic Sans MS', cursive;">
      <input style="background: #ffff00; border: none; padding: 8px; width: 200px; margin-bottom: 2px;" placeholder="email">
      <input style="background: #ffff00; border: none; padding: 8px; width: 180px; margin-bottom: 2px;" placeholder="password" type="password">
      <button style="background: #00ff00; border: none; padding: 8px; width: 250px;">login</button>
    </div>`,
    rubric: `Grade on 0-3 scale:
0: No valid critique points, or completely off-topic
1: Identifies 1 issue but explanation is weak or suggestions unclear
2: Identifies 2-3 valid issues with reasonable explanations (color contrast, typography, spacing, alignment, accessibility, visual hierarchy)
3: Identifies multiple issues with clear explanations of WHY they're problems and specific improvement suggestions. May mention: color accessibility/contrast, professional typography, consistent alignment, proper spacing, label accessibility, visual harmony`,
    lookingFor: [
      'Color contrast issues (red/yellow/green clash)',
      'Typography choice (Comic Sans unprofessional)',
      'Inconsistent widths/alignment',
      'Lack of spacing between elements',
      'No visible labels (accessibility issue)',
      'Visual hierarchy problems',
    ],
  } as DesignCritiqueStepConfig,

  // ----------------------------------------
  // SECTION 6: SUMMARY
  // ----------------------------------------
  {
    id: 'summary',
    kind: 'SUMMARY',
    title: 'Assessment Complete',
    description: 'Review your skill profile and get personalized recommendations.',
    skillKeys: [],
    order: 100,
    estimatedMinutes: 2,
  } as SummaryStepConfig,
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all steps in order
 */
export function getOrderedSteps(): IntakeStepConfig[] {
  return [...INTAKE_STEPS].sort((a, b) => a.order - b.order);
}

/**
 * Get step by ID
 */
export function getStepById(stepId: string): IntakeStepConfig | undefined {
  return INTAKE_STEPS.find((s) => s.id === stepId);
}

/**
 * Get the first step
 */
export function getFirstStep(): IntakeStepConfig {
  return getOrderedSteps()[0];
}

/**
 * Get the next step after the given step ID
 */
export function getNextStep(currentStepId: string): IntakeStepConfig | null {
  const ordered = getOrderedSteps();
  const currentIndex = ordered.findIndex((s) => s.id === currentStepId);

  if (currentIndex === -1 || currentIndex >= ordered.length - 1) {
    return null;
  }

  return ordered[currentIndex + 1];
}

/**
 * Get total estimated time for the assessment
 */
export function getTotalEstimatedMinutes(): number {
  return INTAKE_STEPS.reduce((sum, step) => sum + step.estimatedMinutes, 0);
}

/**
 * Get steps by kind
 */
export function getStepsByKind(kind: IntakeStepKind): IntakeStepConfig[] {
  return INTAKE_STEPS.filter((s) => s.kind === kind);
}

/**
 * Check if a step is the last step
 */
export function isLastStep(stepId: string): boolean {
  const ordered = getOrderedSteps();
  return ordered[ordered.length - 1].id === stepId;
}

/**
 * Get progress percentage for a given step
 */
export function getStepProgress(stepId: string): number {
  const ordered = getOrderedSteps();
  const index = ordered.findIndex((s) => s.id === stepId);

  if (index === -1) return 0;

  return Math.round(((index + 1) / ordered.length) * 100);
}
