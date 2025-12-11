/**
 * Curriculum Configuration
 *
 * Defines the catalog of learning resources available for roadmap generation.
 * Resources are organized by phase and target specific skills.
 */

import type { SkillDimension } from '@/server/assessment/skillModel';

// ============================================
// TYPES
// ============================================

export type ResourceType = 'PROJECT' | 'EXERCISE' | 'READING' | 'DESIGN' | 'COURSE' | 'MILESTONE';

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  phase: 1 | 2 | 3; // Which phase this belongs to
  skillKeys: string[]; // Skills this targets
  difficulty: 1 | 2 | 3 | 4 | 5; // 1=beginner, 5=advanced
  estimatedHours: number;
  prerequisites?: string[]; // Resource IDs that should come first
  metadata?: {
    challengeSlug?: string; // Link to existing challenge
    courseId?: string; // Link to existing course
    externalUrl?: string; // External resource URL
    tags?: string[];
  };
}

export interface PhaseConfig {
  phase: 1 | 2 | 3;
  title: string;
  description: string;
  focusAreas: SkillDimension[];
  estimatedWeeks: number;
}

// ============================================
// PHASE CONFIGURATIONS
// ============================================

export const PHASES: PhaseConfig[] = [
  {
    phase: 1,
    title: 'Foundations',
    description: 'Build a solid foundation in programming basics, HTML/CSS, and JavaScript fundamentals.',
    focusAreas: ['programming_fundamentals', 'web_foundations', 'dev_practices'],
    estimatedWeeks: 4,
  },
  {
    phase: 2,
    title: 'Dynamic Web Development',
    description: 'Create interactive web applications with JavaScript, learn async programming, and start with backend basics.',
    focusAreas: ['javascript', 'backend', 'design'],
    estimatedWeeks: 6,
  },
  {
    phase: 3,
    title: 'Full-Stack & Polish',
    description: 'Build complete full-stack applications, refine your skills, and develop professional practices.',
    focusAreas: ['backend', 'system_thinking', 'meta'],
    estimatedWeeks: 6,
  },
];

// ============================================
// LEARNING RESOURCES CATALOG
// ============================================

export const LEARNING_RESOURCES: LearningResource[] = [
  // ============================================
  // PHASE 1: FOUNDATIONS
  // ============================================

  // --- Programming Fundamentals ---
  {
    id: 'read_variables_types',
    title: 'Understanding Variables and Data Types',
    description: 'Learn about variables, primitive types, and how JavaScript handles data.',
    type: 'READING',
    phase: 1,
    skillKeys: ['prog_variables'],
    difficulty: 1,
    estimatedHours: 1,
  },
  {
    id: 'ex_variables_practice',
    title: 'Variables Practice Exercises',
    description: 'Practice declaring and using variables with different data types.',
    type: 'EXERCISE',
    phase: 1,
    skillKeys: ['prog_variables', 'prog_operators'],
    difficulty: 1,
    estimatedHours: 2,
    prerequisites: ['read_variables_types'],
  },
  {
    id: 'read_control_flow',
    title: 'Control Flow: Conditionals and Loops',
    description: 'Master if/else statements, switch cases, and loop structures.',
    type: 'READING',
    phase: 1,
    skillKeys: ['prog_control_flow'],
    difficulty: 1,
    estimatedHours: 2,
    prerequisites: ['read_variables_types'],
  },
  {
    id: 'ex_control_flow_challenges',
    title: 'Control Flow Coding Challenges',
    description: 'Solve problems using conditionals and loops.',
    type: 'EXERCISE',
    phase: 1,
    skillKeys: ['prog_control_flow', 'prog_operators'],
    difficulty: 2,
    estimatedHours: 3,
    prerequisites: ['read_control_flow'],
  },
  {
    id: 'read_functions',
    title: 'Functions and Scope',
    description: 'Learn to write reusable code with functions, parameters, and return values.',
    type: 'READING',
    phase: 1,
    skillKeys: ['prog_functions'],
    difficulty: 1,
    estimatedHours: 2,
    prerequisites: ['read_control_flow'],
  },
  {
    id: 'ex_functions_practice',
    title: 'Function Writing Exercises',
    description: 'Practice writing functions to solve various problems.',
    type: 'EXERCISE',
    phase: 1,
    skillKeys: ['prog_functions'],
    difficulty: 2,
    estimatedHours: 3,
    prerequisites: ['read_functions'],
  },
  {
    id: 'read_arrays_objects',
    title: 'Arrays and Objects',
    description: 'Work with collections of data using arrays and objects.',
    type: 'READING',
    phase: 1,
    skillKeys: ['prog_arrays', 'prog_objects'],
    difficulty: 2,
    estimatedHours: 2,
    prerequisites: ['read_functions'],
  },
  {
    id: 'ex_array_methods',
    title: 'Array Methods Deep Dive',
    description: 'Master map, filter, reduce, and other array methods.',
    type: 'EXERCISE',
    phase: 1,
    skillKeys: ['prog_arrays', 'js_array_methods'],
    difficulty: 2,
    estimatedHours: 4,
    prerequisites: ['read_arrays_objects'],
  },

  // --- Web Foundations ---
  {
    id: 'read_html_basics',
    title: 'HTML Fundamentals',
    description: 'Learn semantic HTML structure and common elements.',
    type: 'READING',
    phase: 1,
    skillKeys: ['html_structure', 'html_semantics'],
    difficulty: 1,
    estimatedHours: 2,
  },
  {
    id: 'ex_html_structure',
    title: 'Build a Semantic HTML Page',
    description: 'Create a well-structured HTML page using semantic elements.',
    type: 'EXERCISE',
    phase: 1,
    skillKeys: ['html_structure', 'html_semantics'],
    difficulty: 1,
    estimatedHours: 2,
    prerequisites: ['read_html_basics'],
  },
  {
    id: 'read_css_basics',
    title: 'CSS Fundamentals',
    description: 'Learn selectors, the box model, and basic styling.',
    type: 'READING',
    phase: 1,
    skillKeys: ['css_selectors', 'css_box_model'],
    difficulty: 1,
    estimatedHours: 2,
  },
  {
    id: 'ex_css_styling',
    title: 'Style a Landing Page',
    description: 'Apply CSS to style a basic landing page.',
    type: 'EXERCISE',
    phase: 1,
    skillKeys: ['css_selectors', 'css_box_model'],
    difficulty: 2,
    estimatedHours: 3,
    prerequisites: ['read_css_basics', 'ex_html_structure'],
  },
  {
    id: 'read_css_layout',
    title: 'CSS Layout with Flexbox and Grid',
    description: 'Master modern CSS layout techniques.',
    type: 'READING',
    phase: 1,
    skillKeys: ['css_layout'],
    difficulty: 2,
    estimatedHours: 3,
    prerequisites: ['read_css_basics'],
  },
  {
    id: 'ex_flexbox_grid',
    title: 'Layout Challenges',
    description: 'Build common layouts using Flexbox and Grid.',
    type: 'EXERCISE',
    phase: 1,
    skillKeys: ['css_layout'],
    difficulty: 2,
    estimatedHours: 4,
    prerequisites: ['read_css_layout'],
  },
  {
    id: 'read_responsive',
    title: 'Responsive Design',
    description: 'Learn to build mobile-friendly websites with media queries.',
    type: 'READING',
    phase: 1,
    skillKeys: ['css_responsive'],
    difficulty: 2,
    estimatedHours: 2,
    prerequisites: ['read_css_layout'],
  },

  // --- Dev Practices ---
  {
    id: 'read_git_basics',
    title: 'Git Fundamentals',
    description: 'Learn version control with Git: commits, branches, and basic workflow.',
    type: 'READING',
    phase: 1,
    skillKeys: ['dev_git_basics'],
    difficulty: 1,
    estimatedHours: 2,
  },
  {
    id: 'ex_git_workflow',
    title: 'Git Workflow Practice',
    description: 'Practice common Git commands and workflows.',
    type: 'EXERCISE',
    phase: 1,
    skillKeys: ['dev_git_basics'],
    difficulty: 1,
    estimatedHours: 2,
    prerequisites: ['read_git_basics'],
  },
  {
    id: 'read_debugging',
    title: 'Debugging Techniques',
    description: 'Learn to find and fix bugs using browser dev tools.',
    type: 'READING',
    phase: 1,
    skillKeys: ['dev_debugging'],
    difficulty: 2,
    estimatedHours: 2,
    prerequisites: ['read_functions'],
  },

  // --- Phase 1 Project ---
  {
    id: 'proj_portfolio_v1',
    title: 'Project: Personal Portfolio Site',
    description: 'Build a responsive personal portfolio website using HTML, CSS, and basic JavaScript.',
    type: 'PROJECT',
    phase: 1,
    skillKeys: ['html_structure', 'css_layout', 'css_responsive', 'dev_git_basics'],
    difficulty: 2,
    estimatedHours: 10,
    prerequisites: ['ex_flexbox_grid', 'read_responsive', 'ex_git_workflow'],
  },
  {
    id: 'milestone_phase1',
    title: 'Milestone: Foundations Complete',
    description: 'You have completed Phase 1! You now understand programming basics, HTML/CSS, and Git.',
    type: 'MILESTONE',
    phase: 1,
    skillKeys: [],
    difficulty: 1,
    estimatedHours: 0,
    prerequisites: ['proj_portfolio_v1'],
  },

  // ============================================
  // PHASE 2: DYNAMIC WEB DEVELOPMENT
  // ============================================

  // --- JavaScript ---
  {
    id: 'read_dom',
    title: 'DOM Manipulation',
    description: 'Learn to interact with web pages using JavaScript.',
    type: 'READING',
    phase: 2,
    skillKeys: ['js_dom', 'js_events'],
    difficulty: 2,
    estimatedHours: 3,
    prerequisites: ['milestone_phase1'],
  },
  {
    id: 'ex_dom_practice',
    title: 'Interactive DOM Exercises',
    description: 'Build interactive components with DOM manipulation.',
    type: 'EXERCISE',
    phase: 2,
    skillKeys: ['js_dom', 'js_events'],
    difficulty: 2,
    estimatedHours: 4,
    prerequisites: ['read_dom'],
  },
  {
    id: 'read_async',
    title: 'Asynchronous JavaScript',
    description: 'Master Promises, async/await, and handling asynchronous operations.',
    type: 'READING',
    phase: 2,
    skillKeys: ['js_async'],
    difficulty: 3,
    estimatedHours: 3,
    prerequisites: ['read_dom'],
  },
  {
    id: 'ex_async_challenges',
    title: 'Async Programming Challenges',
    description: 'Practice with Promises and async/await patterns.',
    type: 'EXERCISE',
    phase: 2,
    skillKeys: ['js_async'],
    difficulty: 3,
    estimatedHours: 4,
    prerequisites: ['read_async'],
  },
  {
    id: 'read_fetch_api',
    title: 'Working with APIs',
    description: 'Learn to fetch data from APIs and handle responses.',
    type: 'READING',
    phase: 2,
    skillKeys: ['js_fetch', 'backend_rest'],
    difficulty: 2,
    estimatedHours: 2,
    prerequisites: ['read_async'],
  },
  {
    id: 'ex_api_integration',
    title: 'API Integration Project',
    description: 'Build an app that consumes a public API.',
    type: 'EXERCISE',
    phase: 2,
    skillKeys: ['js_fetch', 'js_async'],
    difficulty: 3,
    estimatedHours: 5,
    prerequisites: ['read_fetch_api'],
  },
  {
    id: 'read_modules',
    title: 'JavaScript Modules',
    description: 'Organize code with ES modules and imports.',
    type: 'READING',
    phase: 2,
    skillKeys: ['js_modules', 'dev_code_org'],
    difficulty: 2,
    estimatedHours: 1,
    prerequisites: ['ex_dom_practice'],
  },

  // --- Design ---
  {
    id: 'read_design_principles',
    title: 'Design Principles for Developers',
    description: 'Learn visual hierarchy, layout principles, and typography basics.',
    type: 'READING',
    phase: 2,
    skillKeys: ['design_visual_hierarchy', 'design_layout', 'design_typography'],
    difficulty: 2,
    estimatedHours: 2,
  },
  {
    id: 'design_critique_practice',
    title: 'Design Critique Exercises',
    description: 'Practice evaluating and improving UI designs.',
    type: 'DESIGN',
    phase: 2,
    skillKeys: ['design_critique', 'design_visual_hierarchy'],
    difficulty: 2,
    estimatedHours: 2,
    prerequisites: ['read_design_principles'],
  },
  {
    id: 'read_ux_basics',
    title: 'UX Fundamentals',
    description: 'Understand user flows, affordances, and feedback.',
    type: 'READING',
    phase: 2,
    skillKeys: ['design_ux_basics'],
    difficulty: 2,
    estimatedHours: 2,
    prerequisites: ['read_design_principles'],
  },

  // --- Backend Intro ---
  {
    id: 'read_rest_concepts',
    title: 'REST API Concepts',
    description: 'Understand HTTP methods, status codes, and RESTful design.',
    type: 'READING',
    phase: 2,
    skillKeys: ['backend_rest'],
    difficulty: 2,
    estimatedHours: 2,
  },
  {
    id: 'read_node_intro',
    title: 'Introduction to Node.js',
    description: 'Get started with server-side JavaScript.',
    type: 'READING',
    phase: 2,
    skillKeys: ['backend_routing'],
    difficulty: 2,
    estimatedHours: 2,
    prerequisites: ['read_modules'],
  },

  // --- Phase 2 Project ---
  {
    id: 'proj_weather_app',
    title: 'Project: Weather Dashboard',
    description: 'Build an interactive weather app using APIs, async JavaScript, and good design principles.',
    type: 'PROJECT',
    phase: 2,
    skillKeys: ['js_dom', 'js_fetch', 'js_async', 'design_visual_hierarchy', 'css_layout'],
    difficulty: 3,
    estimatedHours: 12,
    prerequisites: ['ex_api_integration', 'design_critique_practice'],
  },
  {
    id: 'milestone_phase2',
    title: 'Milestone: Dynamic Web Dev Complete',
    description: 'You have completed Phase 2! You can now build interactive web applications.',
    type: 'MILESTONE',
    phase: 2,
    skillKeys: [],
    difficulty: 1,
    estimatedHours: 0,
    prerequisites: ['proj_weather_app'],
  },

  // ============================================
  // PHASE 3: FULL-STACK & POLISH
  // ============================================

  // --- Backend ---
  {
    id: 'read_nextjs_api',
    title: 'Building APIs with Next.js',
    description: 'Create API routes and handle requests in Next.js.',
    type: 'READING',
    phase: 3,
    skillKeys: ['backend_routing', 'backend_rest'],
    difficulty: 3,
    estimatedHours: 3,
    prerequisites: ['milestone_phase2'],
  },
  {
    id: 'ex_api_routes',
    title: 'Build REST API Endpoints',
    description: 'Practice building CRUD API routes.',
    type: 'EXERCISE',
    phase: 3,
    skillKeys: ['backend_routing', 'backend_validation'],
    difficulty: 3,
    estimatedHours: 4,
    prerequisites: ['read_nextjs_api'],
  },
  {
    id: 'read_database_basics',
    title: 'Database Fundamentals with Prisma',
    description: 'Learn to work with databases using Prisma ORM.',
    type: 'READING',
    phase: 3,
    skillKeys: ['backend_database'],
    difficulty: 3,
    estimatedHours: 3,
    prerequisites: ['read_nextjs_api'],
  },
  {
    id: 'ex_database_crud',
    title: 'Database CRUD Operations',
    description: 'Implement full CRUD functionality with Prisma.',
    type: 'EXERCISE',
    phase: 3,
    skillKeys: ['backend_database'],
    difficulty: 3,
    estimatedHours: 4,
    prerequisites: ['read_database_basics'],
  },
  {
    id: 'read_auth',
    title: 'Authentication Basics',
    description: 'Understand authentication patterns and implement user auth.',
    type: 'READING',
    phase: 3,
    skillKeys: ['backend_auth'],
    difficulty: 3,
    estimatedHours: 3,
    prerequisites: ['ex_database_crud'],
  },

  // --- TypeScript ---
  {
    id: 'read_typescript',
    title: 'TypeScript Essentials',
    description: 'Add type safety to your JavaScript projects.',
    type: 'READING',
    phase: 3,
    skillKeys: ['ts_basics'],
    difficulty: 3,
    estimatedHours: 4,
    prerequisites: ['milestone_phase2'],
  },
  {
    id: 'ex_typescript_refactor',
    title: 'Refactor to TypeScript',
    description: 'Convert JavaScript code to TypeScript.',
    type: 'EXERCISE',
    phase: 3,
    skillKeys: ['ts_basics'],
    difficulty: 3,
    estimatedHours: 3,
    prerequisites: ['read_typescript'],
  },

  // --- System Thinking ---
  {
    id: 'read_architecture',
    title: 'Application Architecture',
    description: 'Learn about component design, data flow, and separation of concerns.',
    type: 'READING',
    phase: 3,
    skillKeys: ['sys_architecture', 'sys_data_flow', 'sys_decomposition'],
    difficulty: 3,
    estimatedHours: 3,
  },
  {
    id: 'read_testing',
    title: 'Testing Your Code',
    description: 'Write unit tests and understand test-driven development.',
    type: 'READING',
    phase: 3,
    skillKeys: ['dev_testing'],
    difficulty: 3,
    estimatedHours: 3,
    prerequisites: ['read_typescript'],
  },
  {
    id: 'ex_testing_practice',
    title: 'Testing Practice',
    description: 'Write tests for existing code.',
    type: 'EXERCISE',
    phase: 3,
    skillKeys: ['dev_testing'],
    difficulty: 3,
    estimatedHours: 4,
    prerequisites: ['read_testing'],
  },

  // --- Git Collaboration ---
  {
    id: 'read_git_collab',
    title: 'Git Collaboration',
    description: 'Work with pull requests, code review, and team workflows.',
    type: 'READING',
    phase: 3,
    skillKeys: ['dev_git_collab'],
    difficulty: 2,
    estimatedHours: 2,
  },

  // --- Phase 3 Project ---
  {
    id: 'proj_fullstack_app',
    title: 'Capstone: Full-Stack Application',
    description: 'Build a complete full-stack application with authentication, database, API, and polished UI.',
    type: 'PROJECT',
    phase: 3,
    skillKeys: [
      'backend_routing', 'backend_database', 'backend_auth',
      'ts_basics', 'sys_architecture', 'design_ux_basics',
    ],
    difficulty: 4,
    estimatedHours: 25,
    prerequisites: ['read_auth', 'ex_typescript_refactor', 'ex_testing_practice'],
  },
  {
    id: 'milestone_phase3',
    title: 'Milestone: Full-Stack Developer',
    description: 'Congratulations! You have completed the full-stack development path.',
    type: 'MILESTONE',
    phase: 3,
    skillKeys: [],
    difficulty: 1,
    estimatedHours: 0,
    prerequisites: ['proj_fullstack_app'],
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all resources for a specific phase
 */
export function getResourcesByPhase(phase: 1 | 2 | 3): LearningResource[] {
  return LEARNING_RESOURCES.filter((r) => r.phase === phase);
}

/**
 * Get resource by ID
 */
export function getResourceById(id: string): LearningResource | undefined {
  return LEARNING_RESOURCES.find((r) => r.id === id);
}

/**
 * Get resources that target specific skills
 */
export function getResourcesForSkills(skillKeys: string[]): LearningResource[] {
  const skillSet = new Set(skillKeys);
  return LEARNING_RESOURCES.filter((r) =>
    r.skillKeys.some((sk) => skillSet.has(sk))
  );
}

/**
 * Get resources by type
 */
export function getResourcesByType(type: ResourceType): LearningResource[] {
  return LEARNING_RESOURCES.filter((r) => r.type === type);
}

/**
 * Get phase configuration
 */
export function getPhaseConfig(phase: 1 | 2 | 3): PhaseConfig | undefined {
  return PHASES.find((p) => p.phase === phase);
}

/**
 * Calculate total estimated hours for a set of resources
 */
export function calculateTotalHours(resourceIds: string[]): number {
  return resourceIds.reduce((total, id) => {
    const resource = getResourceById(id);
    return total + (resource?.estimatedHours || 0);
  }, 0);
}

/**
 * Check if prerequisites are met for a resource given completed resource IDs
 */
export function prerequisitesMet(resourceId: string, completedIds: Set<string>): boolean {
  const resource = getResourceById(resourceId);
  if (!resource || !resource.prerequisites) return true;

  return resource.prerequisites.every((prereq) => completedIds.has(prereq));
}
