/**
 * Intake Assessment Configuration - Expanded 27-Step Version
 *
 * TokuWebDev Intake Assessment
 * Total Estimated Time: 55–60 minutes
 * Skill Dimensions: 8 foundational categories with expanded question coverage
 */

import type { SkillDimension } from './skillModel';

// ============================================
// TYPES
// ============================================

export type IntakeStepKind =
  | 'QUESTIONNAIRE'
  | 'MCQ'
  | 'MICRO_MCQ_BURST'  // NEW: 3 rapid-fire MCQs
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

// NEW: Micro MCQ Burst - 3 rapid-fire questions
export interface MicroMcqQuestion {
  id: string;
  question: string;
  options: McqOption[];
  explanation?: string;
}

export interface MicroMcqBurstStepConfig extends BaseStepConfig {
  kind: 'MICRO_MCQ_BURST';
  instructions: string;
  questions: MicroMcqQuestion[];
  // Level interpretation based on correct answers
  levelMapping: {
    beginner: number;      // 0-1 correct
    intermediate: number;  // 2 correct
    advanced: number;      // 3 correct
  };
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
  showRoadmapGeneration?: boolean; // NEW: Whether to show roadmap generation button
}

export type IntakeStepConfig =
  | QuestionnaireStepConfig
  | McqStepConfig
  | MicroMcqBurstStepConfig
  | ShortTextStepConfig
  | CodeStepConfig
  | DesignComparisonStepConfig
  | DesignCritiqueStepConfig
  | SummaryStepConfig;

// ============================================
// INTAKE STEPS CONFIGURATION - 27 STEPS
// ============================================

export const INTAKE_STEPS: IntakeStepConfig[] = [
  // ============================================
  // SECTION 0: LEVEL QUALIFICATION (2 steps)
  // Goal: Detect student level early to influence branching
  // ============================================

  // Challenge 0A — Self-Predicted Level
  {
    id: 'level_self_prediction',
    kind: 'QUESTIONNAIRE',
    title: 'Your Experience Level',
    description: 'Help us understand where you are in your coding journey.',
    skillKeys: [],
    order: 1,
    estimatedMinutes: 0.5,
    fields: [
      {
        id: 'predicted_level',
        type: 'select',
        label: 'How would you describe your current programming experience?',
        description: 'This helps us tailor the assessment to your level.',
        required: true,
        options: [
          { value: 'complete_beginner', label: 'Complete beginner - I\'ve never written code' },
          { value: 'beginner', label: 'Beginner - Some familiarity with coding concepts' },
          { value: 'intermediate', label: 'Intermediate - I\'ve built small apps or projects' },
          { value: 'advanced', label: 'Advanced - Comfortable with React/backend development' },
          { value: 'professional', label: 'Professional developer - Working in the industry' },
        ],
        skillMapping: {
          skillKey: 'predicted_level',
          valueToConfidence: {
            'complete_beginner': 1,
            'beginner': 2,
            'intermediate': 3,
            'advanced': 4,
            'professional': 5,
          },
        },
      },
    ],
  } as QuestionnaireStepConfig,

  // Challenge 0B — Quick Skill Probe (Micro MCQ Burst)
  {
    id: 'quick_skill_probe',
    kind: 'MICRO_MCQ_BURST',
    title: 'Quick Skill Check',
    description: 'Answer these 3 quick questions to help us calibrate your assessment.',
    skillKeys: ['prog_variables', 'css_layout', 'backend_rest'],
    order: 2,
    estimatedMinutes: 1.5,
    instructions: 'Answer all 3 questions. This helps us understand your baseline knowledge.',
    questions: [
      {
        id: 'probe_const',
        question: 'What does `const` prevent in JavaScript?',
        options: [
          { id: 'a', text: 'Reassignment', isCorrect: true },
          { id: 'b', text: 'Redeclaration', isCorrect: false },
          { id: 'c', text: 'Property mutation', isCorrect: false },
          { id: 'd', text: 'All of the above', isCorrect: false },
        ],
        explanation: 'const prevents reassignment of the variable binding, but doesn\'t prevent mutation of object properties.',
      },
      {
        id: 'probe_flex',
        question: 'What does `flex: 1` do to an element?',
        options: [
          { id: 'a', text: 'Sets width to 100px', isCorrect: false },
          { id: 'b', text: 'Allows element to grow to fill available space', isCorrect: true },
          { id: 'c', text: 'Centers the text', isCorrect: false },
          { id: 'd', text: 'Sets the font size', isCorrect: false },
        ],
        explanation: 'flex: 1 is shorthand for flex-grow: 1, allowing the element to expand and fill available space in a flex container.',
      },
      {
        id: 'probe_http',
        question: 'Which HTTP method is idempotent?',
        options: [
          { id: 'a', text: 'POST', isCorrect: false },
          { id: 'b', text: 'PATCH', isCorrect: false },
          { id: 'c', text: 'PUT', isCorrect: true },
          { id: 'd', text: 'None of the above', isCorrect: false },
        ],
        explanation: 'PUT is idempotent - making the same request multiple times produces the same result. POST creates new resources each time.',
      },
    ],
    levelMapping: {
      beginner: 1,      // 0-1 correct
      intermediate: 2,  // 2 correct
      advanced: 3,      // 3 correct
    },
  } as MicroMcqBurstStepConfig,

  // ============================================
  // SECTION 1: BACKGROUND QUESTIONNAIRES (3 steps)
  // ============================================

  // Challenge 1 — About You
  {
    id: 'questionnaire_background',
    kind: 'QUESTIONNAIRE',
    title: 'About You',
    description: 'Tell us about your background and experience with programming.',
    skillKeys: [],
    order: 3,
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

  // Challenge 2 — Self-Assessment (Sliders)
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
    order: 4,
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

  // Challenge 3 — Learning Style & Speed (NEW)
  {
    id: 'questionnaire_learning_style',
    kind: 'QUESTIONNAIRE',
    title: 'Learning Preferences',
    description: 'Help us personalize your learning experience.',
    skillKeys: ['meta_learning', 'meta_communication'],
    order: 5,
    estimatedMinutes: 2,
    fields: [
      {
        id: 'learning_style',
        type: 'select',
        label: 'How do you prefer to learn new programming concepts?',
        required: true,
        options: [
          { value: 'videos', label: 'Video tutorials and walkthroughs' },
          { value: 'reading', label: 'Reading documentation and articles' },
          { value: 'projects', label: 'Building projects hands-on' },
          { value: 'ai_assisted', label: 'AI-assisted Q&A and exploration' },
          { value: 'mixed', label: 'A mix of all approaches' },
        ],
        skillMapping: {
          skillKey: 'meta_learning',
        },
      },
      {
        id: 'weekly_hours',
        type: 'select',
        label: 'How many hours per week can you commit to learning?',
        required: true,
        options: [
          { value: 'under_5', label: 'Less than 5 hours' },
          { value: '5_10', label: '5-10 hours' },
          { value: '10_20', label: '10-20 hours' },
          { value: '20_plus', label: '20+ hours (intensive study)' },
        ],
      },
      {
        id: 'explanation_preference',
        type: 'select',
        label: 'Do you prefer detailed explanations or concise summaries?',
        required: true,
        options: [
          { value: 'detailed', label: 'Detailed explanations with examples' },
          { value: 'concise', label: 'Concise summaries, I\'ll dive deeper when needed' },
          { value: 'balanced', label: 'A balance of both' },
        ],
        skillMapping: {
          skillKey: 'meta_communication',
        },
      },
    ],
  } as QuestionnaireStepConfig,

  // ============================================
  // SECTION 2: MULTIPLE CHOICE — EXTENDED (9 steps)
  // ============================================

  // Challenge 4 — Type Coercion
  {
    id: 'mcq_variables',
    kind: 'MCQ',
    title: 'Programming Concepts',
    description: 'Answer this question about variables and data types.',
    skillKeys: ['prog_variables'],
    order: 6,
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

  // Challenge 5 — Array Methods
  {
    id: 'mcq_arrays',
    kind: 'MCQ',
    title: 'Arrays',
    description: 'Answer this question about array methods.',
    skillKeys: ['prog_arrays', 'js_array_methods'],
    order: 7,
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

  // Challenge 6 — Closures
  {
    id: 'mcq_functions',
    kind: 'MCQ',
    title: 'Functions',
    description: 'Answer this question about function scope.',
    skillKeys: ['prog_functions', 'js_closures'],
    order: 8,
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

  // Challenge 7 — Event Loop
  {
    id: 'mcq_async',
    kind: 'MCQ',
    title: 'Async Programming',
    description: 'Answer this question about asynchronous JavaScript.',
    skillKeys: ['js_async'],
    order: 9,
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

  // Challenge 8 — Flexbox
  {
    id: 'mcq_css_layout',
    kind: 'MCQ',
    title: 'CSS Layout',
    description: 'Answer this question about CSS Flexbox.',
    skillKeys: ['css_layout'],
    order: 10,
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

  // Challenge 9 — HTML Semantics (moved from 8 to make room for new MCQs)
  {
    id: 'mcq_html_semantics',
    kind: 'MCQ',
    title: 'HTML Semantics',
    description: 'Answer this question about semantic HTML.',
    skillKeys: ['html_semantics', 'html_structure'],
    order: 11,
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

  // Challenge 10 — Git Basics (NEW)
  {
    id: 'mcq_git_basics',
    kind: 'MCQ',
    title: 'Git Basics',
    description: 'Answer this question about Git version control.',
    skillKeys: ['dev_git_basics'],
    order: 12,
    estimatedMinutes: 1,
    difficulty: 'beginner',
    question: 'What does `git add .` do?',
    options: [
      { id: 'a', text: 'Commits all files with the message "."', isCorrect: false },
      { id: 'b', text: 'Stages all modified and untracked files', isCorrect: true },
      { id: 'c', text: 'Pushes changes to GitHub', isCorrect: false },
      { id: 'd', text: 'Reverts the last commit', isCorrect: false },
    ],
    explanation: 'git add . stages all changes (modified, new, deleted files) in the current directory and subdirectories. It prepares them for the next commit but doesn\'t actually commit them.',
  } as McqStepConfig,

  // Challenge 11 — DOM Manipulation (NEW)
  {
    id: 'mcq_dom',
    kind: 'MCQ',
    title: 'DOM Manipulation',
    description: 'Answer this question about working with the DOM.',
    skillKeys: ['js_dom'],
    order: 13,
    estimatedMinutes: 1,
    difficulty: 'beginner',
    question: 'What does `document.querySelector(\'.btn\')` return?',
    options: [
      { id: 'a', text: 'A NodeList of all matching elements', isCorrect: false },
      { id: 'b', text: 'The first matching element', isCorrect: true },
      { id: 'c', text: 'All matching elements as an array', isCorrect: false },
      { id: 'd', text: 'Throws an error if no element found', isCorrect: false },
    ],
    explanation: 'querySelector returns the first element matching the CSS selector, or null if none found. Use querySelectorAll to get all matching elements as a NodeList.',
  } as McqStepConfig,

  // Challenge 12 — Responsive Design (NEW)
  {
    id: 'mcq_responsive',
    kind: 'MCQ',
    title: 'Responsive Design',
    description: 'Answer this question about responsive CSS.',
    skillKeys: ['css_responsive'],
    order: 14,
    estimatedMinutes: 1,
    difficulty: 'beginner',
    question: 'Which media query targets screens smaller than 600px?',
    options: [
      { id: 'a', text: '@media (width < 600px)', isCorrect: false },
      { id: 'b', text: '@media (max-width: 600px)', isCorrect: true },
      { id: 'c', text: '@media mobile', isCorrect: false },
      { id: 'd', text: '@media screen-small', isCorrect: false },
    ],
    explanation: 'max-width: 600px applies styles when the viewport is 600px or smaller. This is the standard syntax supported in all browsers. The comparison syntax (width < 600px) is newer and has limited support.',
  } as McqStepConfig,

  // Challenge 13 — Architecture Basics (NEW)
  {
    id: 'mcq_architecture',
    kind: 'MCQ',
    title: 'Architecture Basics',
    description: 'Answer this question about system architecture.',
    skillKeys: ['system_architecture'],
    order: 15,
    estimatedMinutes: 1,
    difficulty: 'intermediate',
    question: 'Which best describes "client–server architecture"?',
    options: [
      { id: 'a', text: 'Two users sharing files directly', isCorrect: false },
      { id: 'b', text: 'Browser requests → backend responds', isCorrect: true },
      { id: 'c', text: 'Components communicating inside React', isCorrect: false },
      { id: 'd', text: 'A database sending data directly to UI', isCorrect: false },
    ],
    explanation: 'Client-server architecture is a model where clients (browsers, apps) send requests to a server, which processes them and sends responses. This is the foundation of web applications.',
  } as McqStepConfig,

  // ============================================
  // SECTION 3: SHORT TEXT EXPLANATIONS (3 steps)
  // ============================================

  // Challenge 14 — Explain Callbacks
  {
    id: 'short_explain_callback',
    kind: 'SHORT_TEXT',
    title: 'Explain a Concept',
    description: 'Explain in your own words.',
    skillKeys: ['meta_explanation', 'js_async', 'prog_functions'],
    order: 16,
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

  // Challenge 15 — Debugging Steps
  {
    id: 'short_debug_approach',
    kind: 'SHORT_TEXT',
    title: 'Debugging Approach',
    description: 'Describe your problem-solving process.',
    skillKeys: ['meta_problem_solving', 'dev_debugging'],
    order: 17,
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

  // Challenge 16 — Explain an API (NEW)
  {
    id: 'short_explain_api',
    kind: 'SHORT_TEXT',
    title: 'API Concepts',
    description: 'Explain a fundamental web development concept.',
    skillKeys: ['backend_rest', 'meta_explanation'],
    order: 18,
    estimatedMinutes: 3,
    question: 'In your own words, explain what a REST API is and give one example of how a frontend might use it.',
    rubric: `Grade on 0-3 scale:
0: No understanding shown, wrong or irrelevant answer, confuses API with something else
1: Basic understanding - knows API is for communication between systems but explanation is vague or example is weak
2: Good understanding - correctly explains REST API as a way for client/frontend to communicate with server/backend using HTTP methods, gives reasonable example (fetching user data, submitting forms)
3: Excellent - clear explanation of REST principles (stateless, resource-based, HTTP methods), good practical example with specific endpoint or data flow, may mention JSON, CRUD operations`,
    maxScore: 3,
    minLength: 50,
    maxLength: 500,
    placeholder: 'A REST API is...',
  } as ShortTextStepConfig,

  // ============================================
  // SECTION 4: CODING CHALLENGES (3 steps)
  // ============================================

  // Challenge 17 — uniqueSorted
  {
    id: 'code_unique_sorted',
    kind: 'CODE',
    title: 'Coding Challenge: Unique Sorted',
    description: 'Implement a function to process an array.',
    skillKeys: ['prog_arrays', 'prog_algorithms', 'js_array_methods'],
    order: 19,
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

  // Challenge 18 — countWords
  {
    id: 'code_count_words',
    kind: 'CODE',
    title: 'Coding Challenge: Word Count',
    description: 'Implement a function to count word occurrences.',
    skillKeys: ['prog_strings', 'prog_objects', 'prog_algorithms'],
    order: 20,
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

  // Challenge 19 — Reverse Words in a Sentence (NEW)
  {
    id: 'code_reverse_words',
    kind: 'CODE',
    title: 'Coding Challenge: Reverse Words',
    description: 'Implement a function to reverse word order in a sentence.',
    skillKeys: ['prog_strings', 'prog_algorithms'],
    order: 21,
    estimatedMinutes: 8,
    problemDescription: `Implement a function \`reverseWords\` that reverses the order of words in a sentence.

**Examples:**
- \`reverseWords("hello world")\` → \`"world hello"\`
- \`reverseWords("a b c")\` → \`"c b a"\`
- \`reverseWords("one")\` → \`"one"\`
- \`reverseWords("")\` → \`""\``,
    starterCode: `function reverseWords(str) {
  // Your code here
}`,
    language: 'javascript',
    testCases: [
      { input: '"hello world"', expectedOutput: '"world hello"', isHidden: false },
      { input: '"a b c"', expectedOutput: '"c b a"', isHidden: false },
      { input: '""', expectedOutput: '""', isHidden: false },
      { input: '"one"', expectedOutput: '"one"', isHidden: true },
      { input: '"the quick brown fox"', expectedOutput: '"fox brown quick the"', isHidden: true },
      { input: '"  spaced  out  "', expectedOutput: '"out spaced"', isHidden: true },
    ],
    hints: [
      'Use split() to break the string into an array of words',
      'reverse() can reverse an array',
      'join() can combine an array back into a string',
      'Consider handling extra whitespace with trim() and filter()',
    ],
  } as CodeStepConfig,

  // ============================================
  // SECTION 5: DESIGN ASSESSMENT (5 steps)
  // ============================================

  // Challenge 20 — CTA Button Comparison
  {
    id: 'design_comparison_1',
    kind: 'DESIGN_COMPARISON',
    title: 'Design Comparison',
    description: 'Compare two button designs and choose the better one.',
    skillKeys: ['design_visual_hierarchy', 'design_ux_basics'],
    order: 22,
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

  // Challenge 21 — Card Layout Comparison
  {
    id: 'design_comparison_2',
    kind: 'DESIGN_COMPARISON',
    title: 'Layout Comparison',
    description: 'Compare two card layouts.',
    skillKeys: ['design_layout', 'design_visual_hierarchy'],
    order: 23,
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

  // Challenge 22 — Login Form Critique
  {
    id: 'design_critique',
    kind: 'DESIGN_CRITIQUE',
    title: 'Design Critique',
    description: 'Analyze a design and suggest improvements.',
    skillKeys: ['design_critique', 'design_visual_hierarchy', 'design_layout', 'meta_explanation'],
    order: 24,
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

  // Challenge 23 — Typography Judgment (NEW)
  {
    id: 'design_typography',
    kind: 'DESIGN_COMPARISON',
    title: 'Typography Judgment',
    description: 'Evaluate text readability.',
    skillKeys: ['design_typography'],
    order: 25,
    estimatedMinutes: 2,
    prompt: 'Which body text style is more readable for long-form content?',
    optionA: {
      description: 'Small text with tight line spacing',
      inlineHtml: `<div style="font-family: sans-serif; padding: 16px; background: #fff; border: 1px solid #ddd;">
        <p style="font-size: 12px; line-height: 1.1; color: #333; margin: 0;">
          When building web applications, readability is crucial for user experience. Users should be able to scan and comprehend content quickly without straining their eyes. This is especially important for documentation, blog posts, and educational content where users spend extended periods reading.
        </p>
      </div>`,
    },
    optionB: {
      description: 'Comfortable text size with generous line spacing',
      inlineHtml: `<div style="font-family: sans-serif; padding: 16px; background: #fff; border: 1px solid #ddd;">
        <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0;">
          When building web applications, readability is crucial for user experience. Users should be able to scan and comprehend content quickly without straining their eyes. This is especially important for documentation, blog posts, and educational content where users spend extended periods reading.
        </p>
      </div>`,
    },
    correctOption: 'B',
    explanation: 'Option B uses a comfortable 16px font size and 1.6 line-height, which are widely accepted as optimal for body text readability. The tighter 12px/1.1 combination in Option A causes eye strain and makes it difficult to track lines.',
  } as DesignComparisonStepConfig,

  // Challenge 24 — UX Flow Evaluation (NEW)
  {
    id: 'design_ux_flow',
    kind: 'DESIGN_CRITIQUE',
    title: 'UX Flow Evaluation',
    description: 'Analyze a user experience flow.',
    skillKeys: ['design_ux_basics', 'design_critique'],
    order: 26,
    estimatedMinutes: 3,
    prompt: 'You see a checkout flow with 5 steps and mandatory account creation before purchase. What would you improve and why?',
    designDescription: `E-commerce checkout flow:
Step 1: Select shipping method
Step 2: Create account (required)
Step 3: Enter shipping address
Step 4: Enter billing address
Step 5: Enter payment details
Step 6: Review and confirm

Issues to identify:
- Mandatory account creation adds friction
- Too many separate steps
- Could combine related information
- Guest checkout not available`,
    rubric: `Grade on 0-3 scale:
0: No useful critique or completely off-topic
1: Identifies one issue (like account requirement) but doesn't explain the UX impact
2: Identifies 2-3 issues with reasonable explanations about user friction, dropout risk, or step consolidation
3: Identifies multiple issues with clear UX rationale: mentions cart abandonment risk, suggests guest checkout, recommends combining steps (shipping/billing), explains why fewer steps = higher conversion`,
    lookingFor: [
      'Mandatory account creation as friction point',
      'Too many steps increase dropout/abandonment',
      'Guest checkout should be available',
      'Shipping and billing could be combined',
      'Progress indicator would help',
      'Auto-fill and smart defaults would reduce effort',
    ],
  } as DesignCritiqueStepConfig,

  // ============================================
  // SECTION 6: META SKILLS & EXPLANATION (2 steps)
  // ============================================

  // Challenge 25 — Explain Your Thinking (NEW)
  {
    id: 'meta_explain_thinking',
    kind: 'SHORT_TEXT',
    title: 'Reflect on Your Learning',
    description: 'Share your thought process.',
    skillKeys: ['meta_communication', 'meta_explanation'],
    order: 27,
    estimatedMinutes: 2,
    question: 'Which question so far in this assessment felt the hardest, and what made it difficult for you?',
    rubric: `Grade on 0-3 scale:
0: No reflection, just says "none" or irrelevant response
1: Names a question but doesn't explain why it was hard
2: Names a specific question and gives a reasonable explanation of the challenge (unfamiliar concept, tricky wording, time pressure, etc.)
3: Thoughtful reflection that shows self-awareness about learning gaps, explains the specific challenge clearly, and may mention what they'd need to learn to do better`,
    maxScore: 3,
    minLength: 30,
    maxLength: 400,
    placeholder: 'The hardest question for me was...',
  } as ShortTextStepConfig,

  // Challenge 26 — AI-Assisted Reasoning (NEW)
  {
    id: 'meta_ai_reasoning',
    kind: 'SHORT_TEXT',
    title: 'AI in Learning',
    description: 'Share your perspective on AI-assisted learning.',
    skillKeys: ['meta_learning'],
    order: 28,
    estimatedMinutes: 2,
    question: 'How do you think AI tools (like ChatGPT or Copilot) should be used when learning to code? Give one benefit and one risk.',
    rubric: `Grade on 0-3 scale:
0: No understanding of AI tools in learning context, or completely off-topic
1: Mentions benefit OR risk but not both, or gives superficial answer
2: Identifies both a benefit (faster answers, code examples, explanations) and a risk (dependency, not learning fundamentals, incorrect info) with brief explanations
3: Thoughtful analysis with nuanced benefit (e.g., "accelerates learning specific syntax while working on real projects") and risk (e.g., "can skip understanding fundamentals if used as a crutch"), shows awareness of balanced approach`,
    maxScore: 3,
    minLength: 50,
    maxLength: 400,
    placeholder: 'I think AI tools can be helpful for...',
  } as ShortTextStepConfig,

  // ============================================
  // SECTION 7: FINAL SUMMARY (1 step with roadmap generation)
  // ============================================

  // Challenge 27 — Skill Profile Summary + Roadmap Generation
  {
    id: 'summary',
    kind: 'SUMMARY',
    title: 'Assessment Complete',
    description: 'Review your skill profile and generate your personalized learning plan.',
    skillKeys: [],
    order: 100,
    estimatedMinutes: 2,
    showRoadmapGeneration: true,
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

/**
 * Get total number of steps
 */
export function getTotalSteps(): number {
  return INTAKE_STEPS.length;
}
