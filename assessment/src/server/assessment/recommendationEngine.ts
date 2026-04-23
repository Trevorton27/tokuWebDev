/**
 * Project Recommendation Engine
 *
 * Core logic for generating personalized project recommendations based on
 * student interests, skill gaps, and learning goals.
 *
 * Algorithm Overview:
 * 1. Analyze student profile to identify skill gaps and priorities
 * 2. Score all project templates against student profile
 * 3. Select top 5 projects ensuring diversity across:
 *    - Difficulty levels (growth trajectory)
 *    - Interests (at least one per interest)
 *    - Goal horizons (short, medium, long coverage)
 * 4. Generate personalized explanations for each recommendation
 *
 * @module server/assessment/recommendationEngine
 */

import {
  StudentProfile,
  ProjectRecommendation,
  ProjectTemplate,
  SkillGap,
  RecommendationWeights,
} from './projectRecommendation';

/**
 * Default recommendation weights
 * These control how much each factor contributes to project scoring
 */
const DEFAULT_WEIGHTS: RecommendationWeights = {
  interestWeight: 0.30,      // 30% - Interest alignment
  skillGapWeight: 0.40,      // 40% - Skill gap coverage (highest priority)
  goalWeight: 0.20,          // 20% - Goal alignment
  difficultyWeight: 0.10,    // 10% - Difficulty appropriateness
};

/**
 * Project Templates Database
 *
 * Collection of diverse project templates spanning different:
 * - Technologies and domains
 * - Difficulty levels
 * - Skill areas
 * - Goal horizons
 *
 * These templates are matched against student profiles to generate recommendations.
 */
const PROJECT_TEMPLATES: ProjectTemplate[] = [
  // SHORT-TERM BEGINNER PROJECTS (Difficulty 1-2)
  {
    id: 'task-tracker',
    title: 'Task Tracker with Local Storage',
    description: 'Build a task management app that persists data in the browser. Users can add, edit, delete, and mark tasks complete. Features filtering by status and a clean, responsive UI.',
    learningOutcomes: [
      'Master DOM manipulation and event handling',
      'Understand browser storage APIs (localStorage)',
      'Practice state management in vanilla JavaScript',
      'Learn responsive CSS layout techniques',
    ],
    techStack: ['HTML', 'CSS', 'JavaScript', 'LocalStorage API'],
    deliverables: [
      'Functional task CRUD interface',
      'Data persistence across sessions',
      'Filter/sort functionality',
      'Mobile-responsive design',
    ],
    supportingResources: [
      'MDN Web Storage API docs',
      'JavaScript array methods (map, filter, reduce)',
      'CSS Flexbox and Grid layouts',
      'Event delegation patterns',
    ],
    difficulty: 1,
    relatedInterests: ['web-development', 'frontend', 'javascript'],
    skillsCovered: ['js_basics', 'dom_manipulation', 'html_css', 'browser_apis'],
    goalHorizon: 'short',
    category: 'web',
  },
  {
    id: 'weather-dashboard',
    title: 'Weather Dashboard with API Integration',
    description: 'Create a weather dashboard that fetches real-time weather data from a public API. Display current conditions, 5-day forecast, and location search. Handle loading states and errors gracefully.',
    learningOutcomes: [
      'Learn to consume REST APIs with fetch()',
      'Handle asynchronous JavaScript (Promises/async-await)',
      'Implement error handling and loading states',
      'Work with JSON data transformation',
    ],
    techStack: ['HTML', 'CSS', 'JavaScript', 'OpenWeather API', 'Fetch API'],
    deliverables: [
      'Location search with autocomplete',
      'Current weather display with icons',
      '5-day forecast visualization',
      'Error handling for API failures',
    ],
    supportingResources: [
      'Fetch API and async/await patterns',
      'OpenWeather API documentation',
      'JSON parsing and data transformation',
      'Loading spinner and error UI patterns',
    ],
    difficulty: 2,
    relatedInterests: ['web-development', 'apis', 'javascript'],
    skillsCovered: ['js_async', 'api_consumption', 'http_basics', 'json'],
    goalHorizon: 'short',
    category: 'web',
  },
  {
    id: 'portfolio-site',
    title: 'Personal Portfolio with Blog',
    description: 'Build a professional portfolio website showcasing your projects, skills, and blog posts. Implement a static site with routing, responsive design, and SEO optimization.',
    learningOutcomes: [
      'Master semantic HTML and accessibility',
      'Learn CSS layout and animation techniques',
      'Understand static site generation concepts',
      'Practice content structure and SEO basics',
    ],
    techStack: ['HTML', 'CSS', 'JavaScript', 'Markdown', 'Git Pages or Vercel'],
    deliverables: [
      'Home page with project showcase',
      'About page with skills/experience',
      'Blog section with markdown rendering',
      'Contact form with validation',
    ],
    supportingResources: [
      'Semantic HTML elements',
      'CSS animations and transitions',
      'Markdown syntax and parsers',
      'SEO meta tags and Open Graph',
    ],
    difficulty: 2,
    relatedInterests: ['web-development', 'design', 'frontend'],
    skillsCovered: ['html_css', 'responsive_design', 'git_basics', 'deployment'],
    goalHorizon: 'short',
    category: 'web',
  },

  // SHORT-MEDIUM TERM INTERMEDIATE PROJECTS (Difficulty 3)
  {
    id: 'recipe-app-react',
    title: 'Recipe Finder with React and Context API',
    description: 'Build a recipe discovery app using React. Users can search recipes, save favorites, view detailed instructions, and create shopping lists. Implement client-side routing and global state management.',
    learningOutcomes: [
      'Master React fundamentals (components, props, state)',
      'Learn Context API for global state management',
      'Implement React Router for navigation',
      'Practice component composition patterns',
    ],
    techStack: ['React', 'React Router', 'Context API', 'Spoonacular API', 'CSS Modules'],
    deliverables: [
      'Recipe search with filtering',
      'Recipe detail view with instructions',
      'Favorites system with persistence',
      'Shopping list generator',
    ],
    supportingResources: [
      'React hooks (useState, useEffect, useContext)',
      'React Router navigation patterns',
      'Component design patterns',
      'API integration in React',
    ],
    difficulty: 3,
    relatedInterests: ['web-development', 'react', 'frontend', 'apis'],
    skillsCovered: ['react_basics', 'react_hooks', 'state_management', 'routing'],
    goalHorizon: 'medium',
    category: 'web',
  },
  {
    id: 'chat-app-websocket',
    title: 'Real-time Chat Application with WebSockets',
    description: 'Create a real-time chat app where users can join rooms, send messages, and see who\'s online. Implement WebSocket communication, user authentication, and message persistence.',
    learningOutcomes: [
      'Understand WebSocket protocol and real-time communication',
      'Implement user authentication with JWT',
      'Learn event-driven architecture',
      'Practice full-stack development (client + server)',
    ],
    techStack: ['React', 'Node.js', 'Socket.io', 'Express', 'MongoDB', 'JWT'],
    deliverables: [
      'User authentication (signup/login)',
      'Real-time message broadcast',
      'Multiple chat rooms',
      'Online user presence indicators',
    ],
    supportingResources: [
      'WebSocket vs HTTP comparison',
      'Socket.io documentation',
      'JWT authentication patterns',
      'MongoDB schema design',
    ],
    difficulty: 3,
    relatedInterests: ['web-development', 'full-stack', 'backend', 'real-time'],
    skillsCovered: ['websockets', 'authentication', 'node_basics', 'database_basics'],
    goalHorizon: 'medium',
    category: 'full-stack',
  },
  {
    id: 'ecommerce-cart',
    title: 'E-commerce Product Catalog with Cart',
    description: 'Build an online store with product listings, search/filter, shopping cart, and checkout flow. Implement Redux for state management, form validation, and payment integration.',
    learningOutcomes: [
      'Master Redux for complex state management',
      'Implement advanced form handling and validation',
      'Learn payment gateway integration (Stripe)',
      'Practice product catalog patterns',
    ],
    techStack: ['React', 'Redux', 'React Hook Form', 'Stripe', 'Node.js', 'PostgreSQL'],
    deliverables: [
      'Product catalog with search/filter',
      'Shopping cart with quantity management',
      'Checkout flow with validation',
      'Order confirmation and history',
    ],
    supportingResources: [
      'Redux toolkit documentation',
      'Stripe payment integration guide',
      'Form validation best practices',
      'E-commerce UX patterns',
    ],
    difficulty: 3,
    relatedInterests: ['web-development', 'full-stack', 'react', 'ecommerce'],
    skillsCovered: ['redux', 'forms', 'payment_integration', 'database_design'],
    goalHorizon: 'medium',
    category: 'full-stack',
  },

  // MEDIUM-LONG TERM ADVANCED PROJECTS (Difficulty 4-5)
  {
    id: 'social-platform',
    title: 'Social Media Platform with Feed Algorithm',
    description: 'Create a social platform where users can post updates, follow others, like/comment, and receive a personalized feed. Implement user profiles, image uploads, notifications, and a basic recommendation algorithm.',
    learningOutcomes: [
      'Design scalable database schemas with relationships',
      'Implement authentication and authorization (RBAC)',
      'Build recommendation/ranking algorithms',
      'Learn image upload and storage (S3 or Cloudinary)',
    ],
    techStack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'NextAuth.js', 'AWS S3', 'Redis'],
    deliverables: [
      'User profiles with followers/following',
      'Post creation with image uploads',
      'Personalized feed with ranking',
      'Real-time notifications system',
    ],
    supportingResources: [
      'Database normalization and relationships',
      'Feed ranking algorithms',
      'Image optimization and CDN usage',
      'Redis for caching and sessions',
    ],
    difficulty: 4,
    relatedInterests: ['web-development', 'full-stack', 'backend', 'social-media', 'algorithms'],
    skillsCovered: ['database_advanced', 'caching', 'file_upload', 'algorithms', 'scalability'],
    goalHorizon: 'long',
    category: 'full-stack',
  },
  {
    id: 'project-management-saas',
    title: 'Team Project Management SaaS',
    description: 'Build a project management tool (Trello/Asana clone) with teams, projects, tasks, and real-time collaboration. Implement drag-and-drop, role-based permissions, activity feeds, and analytics.',
    learningOutcomes: [
      'Master complex state management at scale',
      'Implement drag-and-drop interfaces',
      'Learn multi-tenancy architecture',
      'Build analytics dashboards with data visualization',
    ],
    techStack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'tRPC', 'React Query', 'Recharts', 'dnd-kit'],
    deliverables: [
      'Team and project management',
      'Kanban board with drag-and-drop',
      'Task assignment and tracking',
      'Analytics dashboard with charts',
    ],
    supportingResources: [
      'Multi-tenancy design patterns',
      'Drag-and-drop library documentation',
      'Data visualization best practices',
      'Performance optimization for large datasets',
    ],
    difficulty: 5,
    relatedInterests: ['web-development', 'full-stack', 'saas', 'productivity'],
    skillsCovered: ['multi_tenancy', 'complex_ui', 'data_visualization', 'performance'],
    goalHorizon: 'long',
    category: 'full-stack',
  },
  {
    id: 'ai-content-generator',
    title: 'AI-Powered Content Generation Platform',
    description: 'Create a SaaS platform that uses AI (OpenAI/Anthropic APIs) to generate content (blog posts, social media, emails). Implement subscription billing, usage tracking, content templates, and a WYSIWYG editor.',
    learningOutcomes: [
      'Integrate AI APIs (OpenAI, Anthropic Claude)',
      'Implement subscription billing (Stripe)',
      'Build usage-based rate limiting',
      'Learn prompt engineering and AI UX patterns',
    ],
    techStack: ['Next.js', 'TypeScript', 'Anthropic API', 'Stripe', 'PostgreSQL', 'Vercel AI SDK', 'Tiptap Editor'],
    deliverables: [
      'AI content generation interface',
      'Content templates and customization',
      'Subscription tiers with usage limits',
      'Rich text editor for refinement',
    ],
    supportingResources: [
      'Anthropic Claude API docs',
      'Prompt engineering best practices',
      'Stripe subscription billing guide',
      'Rate limiting strategies',
    ],
    difficulty: 5,
    relatedInterests: ['web-development', 'ai', 'saas', 'full-stack'],
    skillsCovered: ['ai_integration', 'subscription_billing', 'rate_limiting', 'prompt_engineering'],
    goalHorizon: 'long',
    category: 'full-stack',
  },
  {
    id: 'mobile-fitness-tracker',
    title: 'Cross-Platform Fitness Tracker Mobile App',
    description: 'Build a mobile fitness app with workout tracking, progress charts, social features, and offline support. Implement device sensors (pedometer), push notifications, and data sync.',
    learningOutcomes: [
      'Learn React Native for cross-platform mobile development',
      'Work with device APIs (camera, sensors, location)',
      'Implement offline-first architecture',
      'Master mobile app deployment (App Store/Play Store)',
    ],
    techStack: ['React Native', 'Expo', 'TypeScript', 'SQLite', 'Firebase', 'React Navigation'],
    deliverables: [
      'Workout logging with exercise library',
      'Progress tracking with charts',
      'Social feed and challenges',
      'Offline mode with sync',
    ],
    supportingResources: [
      'React Native documentation',
      'Expo sensor APIs',
      'Offline-first architecture patterns',
      'App store deployment guides',
    ],
    difficulty: 4,
    relatedInterests: ['mobile', 'react-native', 'fitness', 'cross-platform'],
    skillsCovered: ['react_native', 'mobile_apis', 'offline_storage', 'push_notifications'],
    goalHorizon: 'long',
    category: 'mobile',
  },
  {
    id: 'data-analytics-dashboard',
    title: 'Business Analytics Dashboard with ETL Pipeline',
    description: 'Create a data analytics platform that ingests data from multiple sources (APIs, CSV, databases), transforms it, and visualizes insights. Implement scheduled jobs, data warehousing, and interactive charts.',
    learningOutcomes: [
      'Learn ETL (Extract, Transform, Load) patterns',
      'Work with data processing libraries (Pandas-equivalent)',
      'Build interactive data visualizations',
      'Implement scheduled background jobs',
    ],
    techStack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Node.js', 'Recharts', 'BullMQ', 'Prisma'],
    deliverables: [
      'Multi-source data connectors',
      'ETL pipeline with transformations',
      'Interactive dashboard with filters',
      'Scheduled data refresh jobs',
    ],
    supportingResources: [
      'ETL architecture patterns',
      'Data transformation techniques',
      'Chart.js / Recharts documentation',
      'Job queue systems (Bull, BullMQ)',
    ],
    difficulty: 4,
    relatedInterests: ['data', 'analytics', 'backend', 'visualization'],
    skillsCovered: ['etl', 'data_processing', 'background_jobs', 'data_visualization'],
    goalHorizon: 'long',
    category: 'data',
  },
  {
    id: 'devops-ci-cd',
    title: 'CI/CD Pipeline and Infrastructure as Code',
    description: 'Set up a complete DevOps pipeline with automated testing, deployment, monitoring, and infrastructure provisioning. Use Docker, GitHub Actions, Terraform, and cloud services (AWS/GCP).',
    learningOutcomes: [
      'Master containerization with Docker',
      'Learn Infrastructure as Code (Terraform)',
      'Implement CI/CD with GitHub Actions',
      'Set up monitoring and logging (Datadog, LogRocket)',
    ],
    techStack: ['Docker', 'GitHub Actions', 'Terraform', 'AWS/GCP', 'Kubernetes', 'Nginx'],
    deliverables: [
      'Dockerized application with multi-stage builds',
      'GitHub Actions workflows for CI/CD',
      'Terraform scripts for infrastructure',
      'Monitoring dashboards and alerts',
    ],
    supportingResources: [
      'Docker best practices',
      'GitHub Actions workflow syntax',
      'Terraform AWS provider docs',
      'Monitoring and observability principles',
    ],
    difficulty: 4,
    relatedInterests: ['devops', 'infrastructure', 'cloud', 'automation'],
    skillsCovered: ['docker', 'ci_cd', 'terraform', 'cloud_services', 'monitoring'],
    goalHorizon: 'long',
    category: 'devops',
  },
  {
    id: 'blockchain-dapp',
    title: 'Decentralized App (DApp) on Ethereum',
    description: 'Build a decentralized application on Ethereum with smart contracts. Create an NFT marketplace, DAO voting system, or DeFi protocol. Implement wallet integration, contract deployment, and Web3 interactions.',
    learningOutcomes: [
      'Learn Solidity for smart contract development',
      'Understand blockchain fundamentals and gas optimization',
      'Work with Web3 libraries (ethers.js, wagmi)',
      'Implement wallet connections (MetaMask)',
    ],
    techStack: ['Solidity', 'Hardhat', 'React', 'ethers.js', 'IPFS', 'OpenZeppelin'],
    deliverables: [
      'Smart contracts with unit tests',
      'Web3 frontend with wallet integration',
      'Contract deployment to testnet',
      'IPFS integration for decentralized storage',
    ],
    supportingResources: [
      'Solidity documentation',
      'Hardhat development environment',
      'Web3 modal and wagmi hooks',
      'Gas optimization techniques',
    ],
    difficulty: 5,
    relatedInterests: ['blockchain', 'web3', 'crypto', 'decentralization'],
    skillsCovered: ['solidity', 'smart_contracts', 'web3', 'blockchain'],
    goalHorizon: 'long',
    category: 'blockchain',
  },
  {
    id: 'game-development',
    title: 'Browser-Based Multiplayer Game',
    description: 'Create a real-time multiplayer game in the browser using WebGL or Canvas. Implement game physics, collision detection, player synchronization, and leaderboards.',
    learningOutcomes: [
      'Learn game development fundamentals',
      'Implement game physics and collision detection',
      'Build real-time multiplayer synchronization',
      'Work with Canvas or WebGL rendering',
    ],
    techStack: ['TypeScript', 'Canvas API or Three.js', 'Socket.io', 'Node.js', 'Matter.js'],
    deliverables: [
      'Game loop with physics engine',
      'Multiplayer synchronization',
      'Player controls and animations',
      'Leaderboard and matchmaking',
    ],
    supportingResources: [
      'Game development patterns',
      'Canvas rendering techniques',
      'Physics engine documentation',
      'Multiplayer game networking',
    ],
    difficulty: 5,
    relatedInterests: ['game-dev', 'graphics', 'multiplayer', 'physics'],
    skillsCovered: ['game_loop', 'physics', 'rendering', 'real_time_sync'],
    goalHorizon: 'long',
    category: 'game',
  },
];

/**
 * Analyze Skill Gaps
 *
 * Identifies which skills need improvement based on assessment scores.
 * Lower scores = higher priority gaps.
 *
 * @param assessmentScores - Map of skill keys to mastery scores (0.0 to 1.0)
 * @returns Array of skill gaps sorted by priority (highest first)
 */
function analyzeSkillGaps(assessmentScores: { [skillKey: string]: number }): SkillGap[] {
  const gaps: SkillGap[] = [];

  for (const [skillKey, mastery] of Object.entries(assessmentScores)) {
    // Priority is inverse of mastery (lower mastery = higher priority)
    // Skills below 0.6 are considered gaps
    if (mastery < 0.6) {
      gaps.push({
        skillKey,
        currentMastery: mastery,
        priority: 1 - mastery, // 0.3 mastery = 0.7 priority
        dimension: inferDimension(skillKey),
      });
    }
  }

  // Sort by priority (highest first)
  return gaps.sort((a, b) => b.priority - a.priority);
}

/**
 * Infer Skill Dimension
 *
 * Maps a skill key to its dimension (Programming, Web, JavaScript, etc.)
 * This is a simplified heuristic based on naming conventions.
 *
 * @param skillKey - Skill key from assessment
 * @returns Dimension name
 */
function inferDimension(skillKey: string): string {
  if (skillKey.includes('js_') || skillKey.includes('javascript')) return 'JavaScript';
  if (skillKey.includes('react') || skillKey.includes('vue') || skillKey.includes('angular')) return 'Web';
  if (skillKey.includes('node') || skillKey.includes('backend') || skillKey.includes('api')) return 'Backend';
  if (skillKey.includes('html') || skillKey.includes('css')) return 'Web';
  if (skillKey.includes('database') || skillKey.includes('sql')) return 'Backend';
  if (skillKey.includes('git') || skillKey.includes('testing')) return 'Dev Practices';
  if (skillKey.includes('design') || skillKey.includes('ux')) return 'Design';
  return 'Programming';
}

/**
 * Score Interest Alignment
 *
 * Calculates how well a project aligns with student interests.
 * Returns a score from 0.0 to 1.0.
 *
 * @param project - Project template
 * @param interests - Student's interest tags
 * @returns Alignment score (0.0 to 1.0)
 */
function scoreInterestAlignment(project: ProjectTemplate, interests: string[]): number {
  if (interests.length === 0) return 0.5; // Neutral if no interests

  // Count how many of the student's interests match this project
  const matchingInterests = interests.filter((interest) =>
    project.relatedInterests.includes(interest)
  );

  // Score = (matching interests / total student interests)
  // Example: 2 out of 3 interests match = 0.67
  return matchingInterests.length / interests.length;
}

/**
 * Score Skill Gap Coverage
 *
 * Calculates how well a project addresses the student's skill gaps.
 * Returns a score from 0.0 to 1.0.
 *
 * @param project - Project template
 * @param skillGaps - Student's identified skill gaps
 * @returns Coverage score (0.0 to 1.0)
 */
function scoreSkillGapCoverage(project: ProjectTemplate, skillGaps: SkillGap[]): number {
  if (skillGaps.length === 0) return 0.5; // Neutral if no gaps

  // Sum up the priority of gaps that this project covers
  let coverageScore = 0;
  let totalPriority = 0;

  for (const gap of skillGaps) {
    totalPriority += gap.priority;
    if (project.skillsCovered.includes(gap.skillKey)) {
      coverageScore += gap.priority;
    }
  }

  // Score = (weighted coverage / total priority)
  return totalPriority > 0 ? coverageScore / totalPriority : 0;
}

/**
 * Score Goal Alignment
 *
 * Calculates how well a project aligns with student goals.
 * Returns a score from 0.0 to 1.0.
 *
 * Simple heuristic: Does the project's goal horizon match any of the student's goals?
 * Could be enhanced with NLP to analyze goal text similarity.
 *
 * @param project - Project template
 * @param goals - Student's learning goals
 * @returns Alignment score (0.0 to 1.0)
 */
function scoreGoalAlignment(
  project: ProjectTemplate,
  goals: { shortTerm: string; mediumTerm: string; longTerm: string }
): number {
  // For now, just check if goal horizon matches and goal text is not empty
  const goalText = goals[`${project.goalHorizon}Term` as keyof typeof goals];

  if (!goalText || goalText.trim() === '') return 0.3; // Low score if no goal set

  // If goal is set, give base score of 0.7
  // Could enhance with keyword matching or semantic similarity
  return 0.7;
}

/**
 * Score Difficulty Appropriateness
 *
 * Calculates how appropriate the project difficulty is for the student.
 * Prefers projects slightly above current skill level for growth.
 *
 * @param project - Project template
 * @param averageMastery - Student's average mastery across all skills
 * @returns Appropriateness score (0.0 to 1.0)
 */
function scoreDifficultyAppropriateness(project: ProjectTemplate, averageMastery: number): number {
  // Map mastery (0.0-1.0) to appropriate difficulty (1-5)
  // 0.0-0.3 mastery → prefer difficulty 1-2
  // 0.3-0.5 mastery → prefer difficulty 2-3
  // 0.5-0.7 mastery → prefer difficulty 3-4
  // 0.7-1.0 mastery → prefer difficulty 4-5

  const idealDifficulty = 1 + averageMastery * 4; // Maps 0-1 to 1-5
  const difficultyGap = Math.abs(project.difficulty - idealDifficulty);

  // Score inversely proportional to gap (closer = better)
  // Max gap is 4, so normalize: score = 1 - (gap / 4)
  return Math.max(0, 1 - difficultyGap / 4);
}

/**
 * Calculate Overall Project Score
 *
 * Combines all scoring factors with weights to produce a final score.
 *
 * @param project - Project template
 * @param profile - Student profile
 * @param skillGaps - Identified skill gaps
 * @param weights - Scoring weights
 * @returns Overall score (0.0 to 1.0)
 */
function calculateProjectScore(
  project: ProjectTemplate,
  profile: StudentProfile,
  skillGaps: SkillGap[],
  weights: RecommendationWeights
): number {
  const interestScore = scoreInterestAlignment(project, profile.interests);
  const skillGapScore = scoreSkillGapCoverage(project, skillGaps);
  const goalScore = scoreGoalAlignment(project, profile.goals);

  const averageMastery =
    Object.values(profile.assessmentScores).reduce((sum, score) => sum + score, 0) /
    Math.max(1, Object.keys(profile.assessmentScores).length);
  const difficultyScore = scoreDifficultyAppropriateness(project, averageMastery);

  // Weighted sum
  return (
    interestScore * weights.interestWeight +
    skillGapScore * weights.skillGapWeight +
    goalScore * weights.goalWeight +
    difficultyScore * weights.difficultyWeight
  );
}

/**
 * Generate Recommendation Reason
 *
 * Creates a personalized explanation for why a project was recommended.
 *
 * @param project - Project template
 * @param profile - Student profile
 * @param skillGaps - Identified skill gaps
 * @returns Explanation text
 */
function generateRecommendationReason(
  project: ProjectTemplate,
  profile: StudentProfile,
  skillGaps: SkillGap[]
): string {
  const reasons: string[] = [];

  // Interest alignment
  const matchingInterests = profile.interests.filter((interest) =>
    project.relatedInterests.includes(interest)
  );
  if (matchingInterests.length > 0) {
    reasons.push(
      `aligns with your interest in ${matchingInterests.join(', ')}`
    );
  }

  // Skill gap coverage
  const coveredGaps = skillGaps
    .filter((gap) => project.skillsCovered.includes(gap.skillKey))
    .slice(0, 2); // Top 2 gaps
  if (coveredGaps.length > 0) {
    const gapNames = coveredGaps.map((g) => g.skillKey.replace(/_/g, ' ')).join(' and ');
    reasons.push(`addresses skill gaps in ${gapNames}`);
  }

  // Goal alignment
  const goalHorizonText = project.goalHorizon === 'short' ? 'short-term' :
                          project.goalHorizon === 'medium' ? 'medium-term' : 'long-term';
  const goalText = profile.goals[`${project.goalHorizon}Term` as keyof typeof profile.goals];
  if (goalText && goalText.trim() !== '') {
    reasons.push(`supports your ${goalHorizonText} goal`);
  }

  // Difficulty
  reasons.push(`offers an appropriate challenge at difficulty level ${project.difficulty}/5`);

  return `This project ${reasons.join(', ')}.`;
}

/**
 * Generate Project Recommendations
 *
 * Main function that generates personalized project recommendations.
 *
 * Algorithm:
 * 1. Analyze skill gaps
 * 2. Score all project templates
 * 3. Select diverse set of top-scoring projects
 * 4. Generate personalized explanations
 *
 * @param profile - Student profile with interests, scores, goals
 * @param count - Number of projects to recommend (default: 5)
 * @param weights - Optional custom scoring weights
 * @returns Array of recommended projects
 */
export function generateRecommendations(
  profile: StudentProfile,
  count: number = 5,
  weights: RecommendationWeights = DEFAULT_WEIGHTS
): ProjectRecommendation[] {
  // Step 1: Analyze skill gaps
  const skillGaps = analyzeSkillGaps(profile.assessmentScores);

  // Step 2: Score all project templates
  const scoredProjects = PROJECT_TEMPLATES.map((project) => ({
    project,
    score: calculateProjectScore(project, profile, skillGaps, weights),
  }));

  // Step 3: Sort by score and select top projects with diversity constraints
  scoredProjects.sort((a, b) => b.score - a.score);

  const selectedProjects: ProjectRecommendation[] = [];
  const usedGoalHorizons = new Set<string>();
  const usedInterests = new Set<string>();
  const usedCategories = new Set<string>();

  for (const { project } of scoredProjects) {
    if (selectedProjects.length >= count) break;

    // Diversity check: try to cover different goal horizons, interests, categories
    const hasNewGoalHorizon = !usedGoalHorizons.has(project.goalHorizon);
    const hasNewInterest = project.relatedInterests.some(
      (interest) => profile.interests.includes(interest) && !usedInterests.has(interest)
    );
    const hasNewCategory = !usedCategories.has(project.category);

    // Select if: top-scored OR adds diversity
    if (
      selectedProjects.length < 3 || // Always take top 3
      hasNewGoalHorizon ||
      hasNewInterest ||
      hasNewCategory
    ) {
      const targetedSkills = skillGaps
        .filter((gap) => project.skillsCovered.includes(gap.skillKey))
        .map((gap) => gap.skillKey);

      const alignedInterests = profile.interests.filter((interest) =>
        project.relatedInterests.includes(interest)
      );

      selectedProjects.push({
        title: project.title,
        description: project.description,
        learningOutcomes: project.learningOutcomes,
        techStack: project.techStack,
        deliverables: project.deliverables,
        supportingResources: project.supportingResources,
        recommendationReason: generateRecommendationReason(project, profile, skillGaps),
        difficulty: project.difficulty,
        alignedInterests,
        goalHorizon: project.goalHorizon,
        targetedSkills,
      });

      // Track diversity
      usedGoalHorizons.add(project.goalHorizon);
      project.relatedInterests.forEach((i) => usedInterests.add(i));
      usedCategories.add(project.category);
    }
  }

  // Step 4: Sort by difficulty (growth trajectory)
  selectedProjects.sort((a, b) => a.difficulty - b.difficulty);

  return selectedProjects;
}
