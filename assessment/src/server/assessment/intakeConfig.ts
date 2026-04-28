/**
 * Intake Assessment Configuration - Expanded 27-Step Version
 *
 * Signal Works Design Intake Assessment
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
  | 'CODE_REVIEW'
  | 'SUMMARY';

export interface BaseStepConfig {
  id: string;
  kind: IntakeStepKind;
  title: string;
  description: string;
  skillKeys: string[]; // Skills this step assesses
  order: number;
  estimatedMinutes: number;
  skipRules?: {
    dependsOnStepId: string;
    condition: 'CORRECT' | 'SCORE_GT';
    value?: number;
  };
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

export interface CodeReviewStepConfig extends BaseStepConfig {
  kind: 'CODE_REVIEW';
  prompt: string;
  codeSnippet: string;
  language: 'javascript' | 'typescript' | 'python';
  rubric: string;
  lookingFor: string[]; // Issues to find
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
  | CodeReviewStepConfig
  | SummaryStepConfig;

// ============================================
// INTAKE STEPS CONFIGURATION
// ============================================

export const INTAKE_STEPS: IntakeStepConfig[] = [

  // ============================================
  // SECTION 1 — Background & Experience
  // ============================================
  {
    id: 'background_experience',
    kind: 'QUESTIONNAIRE',
    title: 'Background & Experience',
    description: 'Help us understand where you are starting from.',
    skillKeys: [],
    order: 1,
    estimatedMinutes: 5,
    fields: [
      {
        id: 'code_experience',
        type: 'text',
        label: 'Have you written code before? If yes, what languages or tools have you used?',
        required: false,
        placeholder: 'e.g. Yes — HTML, CSS, a bit of Python. Or: No, this is my first time.',
      },
      {
        id: 'skill_level',
        type: 'select',
        label: 'How would you describe your current skill level?',
        required: true,
        options: [
          { value: 'beginner', label: 'Beginner — little to no experience' },
          { value: 'some_experience', label: 'Some experience — familiar with basics' },
          { value: 'intermediate', label: 'Intermediate — built small projects' },
          { value: 'advanced', label: 'Advanced — comfortable with full-stack development' },
        ],
      },
      {
        id: 'projects_built',
        type: 'text',
        label: 'Have you built any projects? If yes, briefly describe them.',
        required: false,
        placeholder: 'e.g. A personal portfolio site, a to-do app in React...',
      },
      {
        id: 'computer_comfort',
        type: 'select',
        label: 'How comfortable are you with using a computer for technical tasks (installing software, using the terminal, etc.)?',
        required: true,
        options: [
          { value: 'not_comfortable', label: 'Not comfortable — I avoid the terminal' },
          { value: 'somewhat', label: 'Somewhat comfortable — I can follow instructions' },
          { value: 'comfortable', label: 'Comfortable — I use it regularly' },
          { value: 'very_comfortable', label: 'Very comfortable — I configure my own environment' },
        ],
      },
      {
        id: 'learning_goal',
        type: 'select',
        label: 'What is your primary goal for learning software development?',
        required: true,
        options: [
          { value: 'career_change', label: 'Career change into tech' },
          { value: 'skill_upgrade', label: 'Skill upgrade' },
          { value: 'hobby', label: 'Hobby / personal interest' },
          { value: 'build_product', label: 'Build a product or startup' },
          { value: 'other', label: 'Other' },
        ],
      },
    ],
  } as QuestionnaireStepConfig,

  // ============================================
  // SECTION 2 — Technical Understanding
  // ============================================
  {
    id: 'technical_understanding_concepts',
    kind: 'SHORT_TEXT',
    title: 'What Does a Function Do?',
    description: 'Section 2 of 6 — Technical Understanding',
    skillKeys: ['js_basics', 'programming_fundamentals'],
    order: 2,
    estimatedMinutes: 2,
    question: 'What does a "function" do in programming? Explain it in your own words.',
    rubric: `0: No answer or completely incorrect
1: Vague — mentions "it does something" or "it runs code" without explanation
2: Reasonable — explains it groups reusable code or takes inputs and returns outputs
3: Clear — explains purpose (reusability, abstraction) and optionally gives an example`,
    maxScore: 3,
    minLength: 20,
    maxLength: 400,
    placeholder: 'A function is...',
  } as ShortTextStepConfig,

  {
    id: 'technical_frontend_backend',
    kind: 'SHORT_TEXT',
    title: 'Frontend vs Backend',
    description: 'Section 2 of 6 — Technical Understanding',
    skillKeys: ['sys_architecture', 'web_foundations'],
    order: 3,
    estimatedMinutes: 2,
    question: 'What is the difference between frontend and backend development?',
    rubric: `0: No answer or completely incorrect
1: Mentions one side only (e.g. "frontend is the website")
2: Distinguishes both — frontend is what the user sees, backend handles data/logic
3: Clear and complete — includes examples (React, Node.js, databases, APIs)`,
    maxScore: 3,
    minLength: 20,
    maxLength: 400,
    placeholder: 'Frontend is... Backend is...',
  } as ShortTextStepConfig,

  {
    id: 'technical_api_experience',
    kind: 'SHORT_TEXT',
    title: 'APIs',
    description: 'Section 2 of 6 — Technical Understanding',
    skillKeys: ['backend_apis'],
    order: 4,
    estimatedMinutes: 2,
    question: 'Have you worked with APIs before? If yes, how did you use them?',
    rubric: `0: No answer
1: Says yes or no without explanation
2: Gives a basic example (e.g. fetching data from a weather API)
3: Demonstrates understanding of request/response, endpoints, or authentication`,
    maxScore: 3,
    minLength: 10,
    maxLength: 400,
    placeholder: 'Yes / No — and if yes, describe how...',
  } as ShortTextStepConfig,

  {
    id: 'technical_debugging',
    kind: 'SHORT_TEXT',
    title: 'Debugging Approach',
    description: 'Section 2 of 6 — Technical Understanding',
    skillKeys: ['developer_practices'],
    order: 5,
    estimatedMinutes: 2,
    question: 'How do you typically approach debugging when something doesn\'t work?',
    rubric: `0: No answer or "I give up"
1: Generic — "I search Google"
2: Describes a process — checking errors, adding logs, isolating the problem
3: Methodical — read error messages, isolate cause, check docs, test hypotheses`,
    maxScore: 3,
    minLength: 20,
    maxLength: 400,
    placeholder: 'First I look at the error message, then...',
  } as ShortTextStepConfig,

  {
    id: 'technical_databases_git',
    kind: 'QUESTIONNAIRE',
    title: 'Databases & Version Control',
    description: 'Section 2 of 6 — Technical Understanding',
    skillKeys: ['backend_apis', 'developer_practices'],
    order: 6,
    estimatedMinutes: 2,
    fields: [
      {
        id: 'database_familiarity',
        type: 'select',
        label: 'What is your familiarity with databases?',
        required: true,
        options: [
          { value: 'none', label: 'None — I\'ve never used one' },
          { value: 'basic', label: 'Basic — I know what they are' },
          { value: 'moderate', label: 'Moderate — I\'ve written queries or used an ORM' },
          { value: 'advanced', label: 'Advanced — I design and manage schemas' },
        ],
      },
      {
        id: 'git_experience',
        type: 'text',
        label: 'Have you used Git or version control tools? Describe your experience.',
        required: false,
        placeholder: 'e.g. Yes — I use GitHub for my projects. Or: No, not yet.',
      },
    ],
  } as QuestionnaireStepConfig,

  // ============================================
  // SECTION 3 — Problem Solving & Aptitude
  // ============================================
  {
    id: 'problem_solving_approach',
    kind: 'SHORT_TEXT',
    title: 'Problem-Solving Approach',
    description: 'Section 3 of 6 — Problem Solving & Aptitude',
    skillKeys: ['sys_decomposition', 'sys_tradeoffs'],
    order: 7,
    estimatedMinutes: 2,
    question: 'When faced with a difficult problem, what is your usual approach?',
    rubric: `0: No answer
1: Vague — "I think about it"
2: Structured — breaks it down, looks things up, asks for help
3: Methodical — defines the problem clearly, isolates variables, iterates`,
    maxScore: 3,
    minLength: 20,
    maxLength: 400,
    placeholder: 'I usually start by...',
  } as ShortTextStepConfig,

  {
    id: 'problem_solving_confusion',
    kind: 'SHORT_TEXT',
    title: 'Handling Confusion',
    description: 'Section 3 of 6 — Problem Solving & Aptitude',
    skillKeys: ['sys_decomposition', 'sys_tradeoffs'],
    order: 8,
    estimatedMinutes: 2,
    question: 'How do you handle not understanding something immediately?',
    rubric: `0: No answer or gives up immediately
1: Passive — waits for someone to explain
2: Active — re-reads, searches, or tries different approaches
3: Reflective — identifies the gap, finds multiple resources, tests understanding`,
    maxScore: 3,
    minLength: 20,
    maxLength: 400,
    placeholder: 'When I don\'t understand something, I...',
  } as ShortTextStepConfig,

  {
    id: 'problem_solving_style',
    kind: 'QUESTIONNAIRE',
    title: 'Problem Solving Style',
    description: 'Section 3 of 6 — Problem Solving & Aptitude',
    skillKeys: ['sys_decomposition', 'sys_tradeoffs'],
    order: 9,
    estimatedMinutes: 2,
    fields: [
      {
        id: 'guidance_preference',
        type: 'select',
        label: 'Which do you prefer?',
        required: true,
        options: [
          { value: 'step_by_step', label: 'Step-by-step guidance' },
          { value: 'independent', label: 'Figuring things out independently' },
          { value: 'mix', label: 'A mix of both depending on the situation' },
        ],
      },
      {
        id: 'decomposition_comfort',
        type: 'select',
        label: 'How comfortable are you with breaking large problems into smaller parts?',
        required: true,
        options: [
          { value: 'not_comfortable', label: 'Not comfortable — I struggle with where to start' },
          { value: 'somewhat', label: 'Somewhat — I can do it with guidance' },
          { value: 'comfortable', label: 'Comfortable — I do this naturally' },
          { value: 'very_comfortable', label: 'Very comfortable — it\'s second nature to me' },
        ],
      },
    ],
  } as QuestionnaireStepConfig,

  {
    id: 'problem_solving_story',
    kind: 'SHORT_TEXT',
    title: 'A Challenging Problem',
    description: 'Section 3 of 6 — Problem Solving & Aptitude',
    skillKeys: ['sys_decomposition', 'sys_tradeoffs'],
    order: 10,
    estimatedMinutes: 3,
    question: 'Describe a time you solved a challenging problem — technical or non-technical.',
    rubric: `0: No answer or off-topic
1: Vague story without problem-solving detail
2: Describes the problem and what they did to solve it
3: Clear narrative with problem, approach, outcome, and reflection`,
    maxScore: 3,
    minLength: 30,
    maxLength: 500,
    placeholder: 'There was a time when...',
  } as ShortTextStepConfig,

  // ============================================
  // SECTION 4 — Learning Style & Personality
  // ============================================
  {
    id: 'learning_style_preferences',
    kind: 'QUESTIONNAIRE',
    title: 'Learning Style & Personality',
    description: 'Section 4 of 6 — Help us personalize your experience.',
    skillKeys: [],
    order: 11,
    estimatedMinutes: 3,
    fields: [
      {
        id: 'learning_method',
        type: 'select',
        label: 'How do you learn best?',
        required: true,
        options: [
          { value: 'reading', label: 'Reading documentation and articles' },
          { value: 'watching', label: 'Watching video tutorials' },
          { value: 'doing', label: 'Hands-on practice and building' },
          { value: 'teaching', label: 'Teaching or explaining to others' },
          { value: 'mix', label: 'A mix of all of the above' },
        ],
      },
      {
        id: 'structure_preference',
        type: 'select',
        label: 'Do you prefer structured plans or flexible exploration?',
        required: true,
        options: [
          { value: 'structured', label: 'Structured plans — I like clear steps and milestones' },
          { value: 'flexible', label: 'Flexible exploration — I prefer to follow my curiosity' },
          { value: 'mix', label: 'A mix of both' },
        ],
      },
      {
        id: 'repetition_attitude',
        type: 'text',
        label: 'How do you feel about repetition and practice?',
        required: false,
        placeholder: 'e.g. I find it helpful to repeat things until they click...',
      },
      {
        id: 'motivation_source',
        type: 'select',
        label: 'What motivates you more?',
        required: true,
        options: [
          { value: 'clear_goals', label: 'Clear goals and measurable progress' },
          { value: 'creativity', label: 'Creative freedom and open-ended challenges' },
          { value: 'external_pressure', label: 'Deadlines and accountability' },
          { value: 'curiosity', label: 'Personal curiosity and intrinsic interest' },
        ],
      },
    ],
  } as QuestionnaireStepConfig,

  // ============================================
  // SECTION 5 — Interests & Preferences
  // ============================================
  {
    id: 'interests_preferences',
    kind: 'QUESTIONNAIRE',
    title: 'Interests & Preferences',
    description: 'Section 5 of 6 — We\'ll use this to recommend projects you\'ll actually enjoy building.',
    skillKeys: [],
    order: 12,
    estimatedMinutes: 3,
    fields: [
      {
        id: 'primary_interest',
        type: 'multiselect',
        label: 'Which of the following interests you most? (Select all that apply)',
        required: false,
        options: [
          { value: 'design', label: 'Design & UI' },
          { value: 'data', label: 'Data & analytics' },
          { value: 'automation', label: 'Automation & scripting' },
          { value: 'ai', label: 'AI & machine learning' },
          { value: 'business_tools', label: 'Business tools & productivity' },
          { value: 'games', label: 'Games' },
          { value: 'education', label: 'Education' },
          { value: 'social_apps', label: 'Social apps & communities' },
        ],
      },
      {
        id: 'app_excitement',
        type: 'text',
        label: 'What type of apps would you be most excited to build?',
        required: false,
        placeholder: 'e.g. A fitness tracker, an AI writing assistant, a marketplace...',
      },
      {
        id: 'industry_interests',
        type: 'text',
        label: 'What industries or topics interest you? (e.g. fitness, finance, education, gaming, travel)',
        required: false,
        placeholder: 'e.g. I\'m really into finance and fitness...',
      },
      {
        id: 'work_preference',
        type: 'select',
        label: 'Do you prefer working on:',
        required: true,
        options: [
          { value: 'visual', label: 'Visual interfaces — design, UX, frontend' },
          { value: 'logic', label: 'Logic-heavy systems — backend, data, algorithms' },
          { value: 'mix', label: 'A mix of both' },
        ],
      },
    ],
  } as QuestionnaireStepConfig,

  // ============================================
  // SECTION 6 — Commitment & Goals
  // ============================================
  {
    id: 'commitment_goals',
    kind: 'QUESTIONNAIRE',
    title: 'Commitment & Goals',
    description: 'Section 6 of 6 — Help us set realistic expectations for your learning plan.',
    skillKeys: [],
    order: 13,
    estimatedMinutes: 3,
    fields: [
      {
        id: 'weekly_hours',
        type: 'select',
        label: 'How many hours per week can you realistically dedicate to learning?',
        required: true,
        options: [
          { value: 'under_5', label: 'Less than 5 hours' },
          { value: '5_10', label: '5–10 hours' },
          { value: '10_20', label: '10–20 hours' },
          { value: '20_plus', label: '20+ hours (intensive)' },
        ],
      },
      {
        id: 'target_timeline',
        type: 'select',
        label: 'What is your target timeline to reach your goal?',
        required: true,
        options: [
          { value: '1_3_months', label: '1–3 months' },
          { value: '3_6_months', label: '3–6 months' },
          { value: '6_12_months', label: '6–12 months' },
          { value: '12_plus_months', label: '12+ months — I\'m in no rush' },
        ],
      },
      {
        id: 'success_definition',
        type: 'text',
        label: 'What would success look like for you after completing this program?',
        required: false,
        placeholder: 'e.g. Getting my first developer job, launching my own app, confidently building projects...',
      },
    ],
  } as QuestionnaireStepConfig,

  // ============================================
  // SUMMARY
  // ============================================
  {
    id: 'summary',
    kind: 'SUMMARY',
    title: 'Assessment Complete',
    description: 'Review your profile and submit your answers.',
    skillKeys: [],
    order: 14,
    estimatedMinutes: 1,
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
