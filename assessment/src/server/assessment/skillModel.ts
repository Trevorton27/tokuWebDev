/**
 * Skill Model Configuration
 *
 * Defines the skill taxonomy used for student assessment and mastery tracking.
 * Skills are organized into dimensions, with individual skill tags within each.
 */

// ============================================
// TYPES
// ============================================

export type SkillDimension =
  | 'programming_fundamentals'
  | 'web_foundations'
  | 'javascript'
  | 'backend'
  | 'dev_practices'
  | 'system_thinking'
  | 'design'
  | 'meta';

export interface SkillTagConfig {
  key: string;
  dimension: SkillDimension;
  label: string;
  description: string;
  weight: number; // 0-1, importance weight for dimension aggregation
  prerequisites?: string[]; // skill keys that should be learned first
}

export interface DimensionConfig {
  key: SkillDimension;
  label: string;
  description: string;
  order: number; // display order
}

export interface SkillMasteryData {
  mastery: number; // 0-1
  confidence: number; // 0-1
  attempts: number;
}

export interface SkillProfile {
  userId: string;
  skills: Record<string, SkillMasteryData>;
  dimensions: Record<SkillDimension, {
    score: number; // 0-1 aggregate
    confidence: number; // 0-1 aggregate
    skillCount: number;
    assessedCount: number;
  }>;
  lastUpdated: Date;
}

// ============================================
// DIMENSION CONFIGURATIONS
// ============================================

export const DIMENSIONS: DimensionConfig[] = [
  {
    key: 'programming_fundamentals',
    label: 'Programming Fundamentals',
    description: 'Core programming concepts: variables, data types, control flow, functions, data structures',
    order: 1,
  },
  {
    key: 'web_foundations',
    label: 'Web Foundations',
    description: 'HTML structure, CSS styling, responsive design, accessibility basics',
    order: 2,
  },
  {
    key: 'javascript',
    label: 'JavaScript/TypeScript',
    description: 'JS language features, DOM manipulation, async programming, TypeScript',
    order: 3,
  },
  {
    key: 'backend',
    label: 'Backend Fundamentals',
    description: 'APIs, databases, server-side logic, authentication, deployment',
    order: 4,
  },
  {
    key: 'dev_practices',
    label: 'Developer Practices',
    description: 'Git, testing, debugging, code organization, documentation',
    order: 5,
  },
  {
    key: 'system_thinking',
    label: 'System Thinking',
    description: 'Architecture, problem decomposition, tradeoffs, scalability considerations',
    order: 6,
  },
  {
    key: 'design',
    label: 'Design Sense',
    description: 'Visual hierarchy, layout, typography, color, UX basics',
    order: 7,
  },
  {
    key: 'meta',
    label: 'Meta Skills',
    description: 'Learning ability, explanation clarity, problem-solving approach, self-assessment accuracy',
    order: 8,
  },
];

// ============================================
// SKILL TAG CONFIGURATIONS
// ============================================

export const SKILL_TAGS: SkillTagConfig[] = [
  // ----------------------------------------
  // PROGRAMMING FUNDAMENTALS
  // ----------------------------------------
  {
    key: 'prog_variables',
    dimension: 'programming_fundamentals',
    label: 'Variables & Data Types',
    description: 'Understanding variables, primitive types, type coercion',
    weight: 1.0,
  },
  {
    key: 'prog_operators',
    dimension: 'programming_fundamentals',
    label: 'Operators & Expressions',
    description: 'Arithmetic, comparison, logical operators, expressions',
    weight: 0.8,
    prerequisites: ['prog_variables'],
  },
  {
    key: 'prog_control_flow',
    dimension: 'programming_fundamentals',
    label: 'Control Flow',
    description: 'Conditionals (if/else, switch), loops (for, while)',
    weight: 1.0,
    prerequisites: ['prog_operators'],
  },
  {
    key: 'prog_functions',
    dimension: 'programming_fundamentals',
    label: 'Functions',
    description: 'Function declaration, parameters, return values, scope',
    weight: 1.0,
    prerequisites: ['prog_control_flow'],
  },
  {
    key: 'prog_arrays',
    dimension: 'programming_fundamentals',
    label: 'Arrays & Lists',
    description: 'Array creation, indexing, iteration, common methods',
    weight: 1.0,
    prerequisites: ['prog_functions'],
  },
  {
    key: 'prog_objects',
    dimension: 'programming_fundamentals',
    label: 'Objects & Maps',
    description: 'Object literals, property access, iteration, nested structures',
    weight: 1.0,
    prerequisites: ['prog_arrays'],
  },
  {
    key: 'prog_strings',
    dimension: 'programming_fundamentals',
    label: 'String Manipulation',
    description: 'String methods, template literals, parsing, formatting',
    weight: 0.8,
    prerequisites: ['prog_variables'],
  },
  {
    key: 'prog_algorithms',
    dimension: 'programming_fundamentals',
    label: 'Basic Algorithms',
    description: 'Sorting, searching, simple recursion, time complexity awareness',
    weight: 0.9,
    prerequisites: ['prog_arrays', 'prog_functions'],
  },

  // ----------------------------------------
  // WEB FOUNDATIONS
  // ----------------------------------------
  {
    key: 'html_structure',
    dimension: 'web_foundations',
    label: 'HTML Structure',
    description: 'Semantic HTML, document structure, common elements',
    weight: 1.0,
  },
  {
    key: 'html_forms',
    dimension: 'web_foundations',
    label: 'HTML Forms',
    description: 'Form elements, inputs, validation attributes, accessibility',
    weight: 0.9,
    prerequisites: ['html_structure'],
  },
  {
    key: 'html_semantics',
    dimension: 'web_foundations',
    label: 'Semantic Markup',
    description: 'Choosing appropriate elements, ARIA basics, screen reader considerations',
    weight: 0.8,
    prerequisites: ['html_structure'],
  },
  {
    key: 'css_selectors',
    dimension: 'web_foundations',
    label: 'CSS Selectors',
    description: 'Element, class, ID, combinators, specificity',
    weight: 1.0,
  },
  {
    key: 'css_box_model',
    dimension: 'web_foundations',
    label: 'Box Model',
    description: 'Margin, padding, border, sizing, display property',
    weight: 1.0,
    prerequisites: ['css_selectors'],
  },
  {
    key: 'css_layout',
    dimension: 'web_foundations',
    label: 'CSS Layout',
    description: 'Flexbox, Grid, positioning, responsive patterns',
    weight: 1.0,
    prerequisites: ['css_box_model'],
  },
  {
    key: 'css_responsive',
    dimension: 'web_foundations',
    label: 'Responsive Design',
    description: 'Media queries, mobile-first, fluid typography, viewport units',
    weight: 0.9,
    prerequisites: ['css_layout'],
  },
  {
    key: 'css_animations',
    dimension: 'web_foundations',
    label: 'CSS Animations',
    description: 'Transitions, keyframes, transforms, performance',
    weight: 0.6,
    prerequisites: ['css_selectors'],
  },

  // ----------------------------------------
  // JAVASCRIPT/TYPESCRIPT
  // ----------------------------------------
  {
    key: 'js_dom',
    dimension: 'javascript',
    label: 'DOM Manipulation',
    description: 'Selecting elements, modifying content, event handling',
    weight: 1.0,
    prerequisites: ['prog_functions', 'html_structure'],
  },
  {
    key: 'js_events',
    dimension: 'javascript',
    label: 'Event Handling',
    description: 'Event listeners, bubbling/capturing, delegation, custom events',
    weight: 0.9,
    prerequisites: ['js_dom'],
  },
  {
    key: 'js_async',
    dimension: 'javascript',
    label: 'Async Programming',
    description: 'Promises, async/await, error handling, parallel execution',
    weight: 1.0,
    prerequisites: ['prog_functions'],
  },
  {
    key: 'js_fetch',
    dimension: 'javascript',
    label: 'Fetch & APIs',
    description: 'HTTP requests, JSON handling, error states, loading states',
    weight: 1.0,
    prerequisites: ['js_async'],
  },
  {
    key: 'js_modules',
    dimension: 'javascript',
    label: 'Modules & Imports',
    description: 'ES modules, import/export, module organization',
    weight: 0.8,
    prerequisites: ['prog_functions'],
  },
  {
    key: 'js_closures',
    dimension: 'javascript',
    label: 'Closures & Scope',
    description: 'Lexical scope, closures, this binding, arrow functions',
    weight: 0.8,
    prerequisites: ['prog_functions'],
  },
  {
    key: 'js_array_methods',
    dimension: 'javascript',
    label: 'Array Methods',
    description: 'map, filter, reduce, find, sort, chaining',
    weight: 1.0,
    prerequisites: ['prog_arrays', 'prog_functions'],
  },
  {
    key: 'ts_basics',
    dimension: 'javascript',
    label: 'TypeScript Basics',
    description: 'Type annotations, interfaces, type inference, generics basics',
    weight: 0.9,
    prerequisites: ['prog_objects', 'js_modules'],
  },
  {
    key: 'ts_advanced',
    dimension: 'javascript',
    label: 'TypeScript Advanced',
    description: 'Union/intersection types, utility types, discriminated unions',
    weight: 0.7,
    prerequisites: ['ts_basics'],
  },

  // ----------------------------------------
  // BACKEND
  // ----------------------------------------
  {
    key: 'backend_rest',
    dimension: 'backend',
    label: 'REST APIs',
    description: 'HTTP methods, status codes, RESTful design, request/response',
    weight: 1.0,
    prerequisites: ['js_fetch'],
  },
  {
    key: 'backend_routing',
    dimension: 'backend',
    label: 'Server Routing',
    description: 'Route handlers, params, query strings, middleware',
    weight: 1.0,
    prerequisites: ['backend_rest'],
  },
  {
    key: 'backend_database',
    dimension: 'backend',
    label: 'Database Basics',
    description: 'CRUD operations, queries, relations, ORMs',
    weight: 1.0,
    prerequisites: ['prog_objects'],
  },
  {
    key: 'backend_auth',
    dimension: 'backend',
    label: 'Authentication',
    description: 'Sessions, tokens, OAuth basics, password handling',
    weight: 0.9,
    prerequisites: ['backend_routing'],
  },
  {
    key: 'backend_validation',
    dimension: 'backend',
    label: 'Input Validation',
    description: 'Server-side validation, sanitization, error responses',
    weight: 0.8,
    prerequisites: ['backend_routing'],
  },
  {
    key: 'backend_deployment',
    dimension: 'backend',
    label: 'Deployment Basics',
    description: 'Environment variables, hosting, basic CI/CD concepts',
    weight: 0.7,
    prerequisites: ['backend_routing'],
  },

  // ----------------------------------------
  // DEV PRACTICES
  // ----------------------------------------
  {
    key: 'dev_git_basics',
    dimension: 'dev_practices',
    label: 'Git Basics',
    description: 'Commits, branches, merging, basic workflow',
    weight: 1.0,
  },
  {
    key: 'dev_git_collab',
    dimension: 'dev_practices',
    label: 'Git Collaboration',
    description: 'Pull requests, code review, conflict resolution',
    weight: 0.8,
    prerequisites: ['dev_git_basics'],
  },
  {
    key: 'dev_testing',
    dimension: 'dev_practices',
    label: 'Testing',
    description: 'Unit tests, test runners, basic TDD concepts',
    weight: 0.9,
    prerequisites: ['prog_functions'],
  },
  {
    key: 'dev_debugging',
    dimension: 'dev_practices',
    label: 'Debugging',
    description: 'Console debugging, breakpoints, reading stack traces',
    weight: 1.0,
    prerequisites: ['prog_functions'],
  },
  {
    key: 'dev_code_org',
    dimension: 'dev_practices',
    label: 'Code Organization',
    description: 'File structure, naming conventions, separation of concerns',
    weight: 0.8,
    prerequisites: ['prog_functions'],
  },
  {
    key: 'dev_documentation',
    dimension: 'dev_practices',
    label: 'Documentation',
    description: 'README files, code comments, JSDoc/TSDoc',
    weight: 0.6,
    prerequisites: ['prog_functions'],
  },

  // ----------------------------------------
  // SYSTEM THINKING
  // ----------------------------------------
  {
    key: 'sys_decomposition',
    dimension: 'system_thinking',
    label: 'Problem Decomposition',
    description: 'Breaking problems into smaller parts, identifying sub-tasks',
    weight: 1.0,
  },
  {
    key: 'sys_data_flow',
    dimension: 'system_thinking',
    label: 'Data Flow',
    description: 'Understanding how data moves through a system, state management',
    weight: 1.0,
    prerequisites: ['prog_functions'],
  },
  {
    key: 'sys_tradeoffs',
    dimension: 'system_thinking',
    label: 'Tradeoff Analysis',
    description: 'Evaluating options, considering constraints, making decisions',
    weight: 0.8,
  },
  {
    key: 'sys_architecture',
    dimension: 'system_thinking',
    label: 'Architecture Basics',
    description: 'Component boundaries, API design, separation of concerns',
    weight: 0.8,
    prerequisites: ['sys_decomposition', 'sys_data_flow'],
  },
  {
    key: 'sys_performance',
    dimension: 'system_thinking',
    label: 'Performance Awareness',
    description: 'Identifying bottlenecks, caching concepts, optimization basics',
    weight: 0.6,
    prerequisites: ['sys_architecture'],
  },

  // ----------------------------------------
  // DESIGN
  // ----------------------------------------
  {
    key: 'design_visual_hierarchy',
    dimension: 'design',
    label: 'Visual Hierarchy',
    description: 'Size, contrast, spacing to guide attention',
    weight: 1.0,
  },
  {
    key: 'design_layout',
    dimension: 'design',
    label: 'Layout Principles',
    description: 'Alignment, proximity, whitespace, grids',
    weight: 1.0,
  },
  {
    key: 'design_typography',
    dimension: 'design',
    label: 'Typography',
    description: 'Font selection, sizing, line height, readability',
    weight: 0.8,
  },
  {
    key: 'design_color',
    dimension: 'design',
    label: 'Color Usage',
    description: 'Color harmony, contrast ratios, semantic colors',
    weight: 0.8,
  },
  {
    key: 'design_ux_basics',
    dimension: 'design',
    label: 'UX Basics',
    description: 'User flows, affordances, feedback, error states',
    weight: 0.9,
  },
  {
    key: 'design_critique',
    dimension: 'design',
    label: 'Design Critique',
    description: 'Evaluating designs, identifying improvements, vocabulary',
    weight: 0.7,
  },

  // ----------------------------------------
  // META SKILLS
  // ----------------------------------------
  {
    key: 'meta_self_assessment',
    dimension: 'meta',
    label: 'Self-Assessment',
    description: 'Accurate evaluation of own abilities, identifying gaps',
    weight: 0.8,
  },
  {
    key: 'meta_explanation',
    dimension: 'meta',
    label: 'Explanation Clarity',
    description: 'Articulating concepts clearly, teaching ability',
    weight: 0.9,
  },
  {
    key: 'meta_problem_solving',
    dimension: 'meta',
    label: 'Problem-Solving Approach',
    description: 'Systematic approach, hypothesis testing, iteration',
    weight: 1.0,
  },
  {
    key: 'meta_learning',
    dimension: 'meta',
    label: 'Learning Ability',
    description: 'Adapting to new concepts, research skills, resourcefulness',
    weight: 0.9,
  },
  {
    key: 'meta_persistence',
    dimension: 'meta',
    label: 'Persistence',
    description: 'Working through difficulty, not giving up on hard problems',
    weight: 0.7,
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all skill tags for a specific dimension
 */
export function getSkillsByDimension(dimension: SkillDimension): SkillTagConfig[] {
  return SKILL_TAGS.filter((tag) => tag.dimension === dimension);
}

/**
 * Get a skill tag config by its key
 */
export function getSkillByKey(key: string): SkillTagConfig | undefined {
  return SKILL_TAGS.find((tag) => tag.key === key);
}

/**
 * Get dimension config by key
 */
export function getDimensionByKey(key: SkillDimension): DimensionConfig | undefined {
  return DIMENSIONS.find((d) => d.key === key);
}

/**
 * Get all skill keys as a Set for validation
 */
export function getAllSkillKeys(): Set<string> {
  return new Set(SKILL_TAGS.map((tag) => tag.key));
}

/**
 * Get all dimension keys
 */
export function getAllDimensionKeys(): SkillDimension[] {
  return DIMENSIONS.map((d) => d.key);
}

/**
 * Map legacy/challenge tags to skill keys
 * This helps bridge existing challenge tags with the new skill model
 */
export const TAG_TO_SKILL_MAP: Record<string, string[]> = {
  // Challenge tags -> Skill keys mapping
  arrays: ['prog_arrays', 'js_array_methods'],
  loops: ['prog_control_flow'],
  recursion: ['prog_algorithms', 'prog_functions'],
  strings: ['prog_strings'],
  objects: ['prog_objects'],
  functions: ['prog_functions'],
  sorting: ['prog_algorithms'],
  searching: ['prog_algorithms'],
  dom: ['js_dom'],
  events: ['js_events'],
  async: ['js_async'],
  promises: ['js_async'],
  fetch: ['js_fetch'],
  api: ['js_fetch', 'backend_rest'],
  html: ['html_structure'],
  css: ['css_selectors', 'css_box_model'],
  flexbox: ['css_layout'],
  grid: ['css_layout'],
  responsive: ['css_responsive'],
  typescript: ['ts_basics'],
  types: ['ts_basics'],
  git: ['dev_git_basics'],
  testing: ['dev_testing'],
  debugging: ['dev_debugging'],
  database: ['backend_database'],
  rest: ['backend_rest'],
  auth: ['backend_auth'],
};

/**
 * Convert challenge tags to skill keys
 */
export function mapTagsToSkillKeys(tags: string[]): string[] {
  const skillKeys = new Set<string>();
  const allSkillKeys = getAllSkillKeys();

  for (const tag of tags) {
    const lowerTag = tag.toLowerCase();

    // Check if it's already a valid skill key
    if (allSkillKeys.has(lowerTag)) {
      skillKeys.add(lowerTag);
      continue;
    }

    // Check the mapping
    const mapped = TAG_TO_SKILL_MAP[lowerTag];
    if (mapped) {
      mapped.forEach((sk) => skillKeys.add(sk));
    }
  }

  return Array.from(skillKeys);
}
