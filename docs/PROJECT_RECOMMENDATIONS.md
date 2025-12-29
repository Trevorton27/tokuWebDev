# Project Recommendation System

## Overview

The Project Recommendation System generates personalized project suggestions for students based on their:
- **Interests**: Topics and technologies they care about
- **Assessment Scores**: Skill mastery levels across multiple dimensions
- **Learning Goals**: Short-term, medium-term, and long-term objectives

The system recommends 5 tailored projects that:
- Progress in difficulty for a growth trajectory
- Address skill gaps without overwhelming the student
- Align with stated interests
- Connect to goal time horizons
- Avoid trivial CRUD clones

---

## Table of Contents

1. [Architecture](#architecture)
2. [Data Model](#data-model)
3. [API Endpoints](#api-endpoints)
4. [Example Usage](#example-usage)
5. [Recommendation Algorithm](#recommendation-algorithm)
6. [Project Templates](#project-templates)
7. [Integration with Assessment Flow](#integration-with-assessment-flow)
8. [Testing](#testing)

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                   Assessment Completion                      │
│  (Extracts goals & interests from questionnaire responses)  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      User Profile                            │
│   • interests: string[]                                      │
│   • shortTermGoal, mediumTermGoal, longTermGoal: string     │
│   • UserSkillMastery records: { skillKey: mastery }         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Recommendation Engine                           │
│  1. Analyze skill gaps                                       │
│  2. Score project templates                                  │
│  3. Select diverse top 5 projects                            │
│  4. Generate personalized explanations                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            API Response: 5 Projects                          │
│  • Title, Description                                        │
│  • Learning Outcomes                                         │
│  • Tech Stack, Deliverables                                  │
│  • Recommendation Reason                                     │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
src/
├── server/assessment/
│   ├── projectRecommendation.ts       # TypeScript types/interfaces
│   ├── recommendationEngine.ts        # Core recommendation logic
│   ├── profileExtraction.ts           # Extract profile from assessment
│   └── __tests__/
│       └── recommendationEngine.test.ts
│
├── app/api/assessment/projects/recommend/
│   └── route.ts                       # API endpoint (GET/POST)
│
└── prisma/schema.prisma               # User model with interests/goals
```

---

## Data Model

### User Model Extensions

```prisma
model User {
  // ... existing fields ...

  // Project Recommendation Fields
  interests        String[]  @default([])  // Interest tags
  shortTermGoal    String?                 // Short-term learning goal
  mediumTermGoal   String?                 // Medium-term learning goal
  longTermGoal     String?                 // Long-term learning goal
}
```

### TypeScript Interfaces

#### StudentProfile

```typescript
interface StudentProfile {
  interests: string[];                    // e.g., ["web-development", "react"]
  assessmentScores: { [skill: string]: number };  // e.g., { "js_basics": 0.75 }
  goals: {
    shortTerm: string;   // e.g., "Build first full-stack app"
    mediumTerm: string;  // e.g., "Get junior dev job"
    longTerm: string;    // e.g., "Become senior engineer"
  };
}
```

#### ProjectRecommendation

```typescript
interface ProjectRecommendation {
  title: string;
  description: string;
  learningOutcomes: string[];
  techStack: string[];
  deliverables: string[];
  supportingResources: string[];
  recommendationReason: string;
  difficulty: number;              // 1-5
  alignedInterests: string[];
  goalHorizon: 'short' | 'medium' | 'long';
  targetedSkills: string[];
}
```

---

## API Endpoints

### POST /api/assessment/projects/recommend

Generate project recommendations with a custom profile.

#### Request Body

```json
{
  "profile": {
    "interests": ["web-development", "react"],
    "assessmentScores": {
      "js_basics": 0.75,
      "react_basics": 0.45,
      "node_basics": 0.30,
      "html_css": 0.80
    },
    "goals": {
      "shortTerm": "Build my first full-stack app",
      "mediumTerm": "Get a junior developer job",
      "longTerm": "Become a senior engineer"
    }
  },
  "count": 5,           // Optional: default 5
  "minDifficulty": 1,   // Optional: default 1
  "maxDifficulty": 5    // Optional: default 5
}
```

#### Response

```json
{
  "success": true,
  "projects": [
    {
      "title": "Task Tracker with Local Storage",
      "description": "Build a task management app that persists data in the browser...",
      "learningOutcomes": [
        "Master DOM manipulation and event handling",
        "Understand browser storage APIs (localStorage)",
        "Practice state management in vanilla JavaScript"
      ],
      "techStack": ["HTML", "CSS", "JavaScript", "LocalStorage API"],
      "deliverables": [
        "Functional task CRUD interface",
        "Data persistence across sessions",
        "Filter/sort functionality",
        "Mobile-responsive design"
      ],
      "supportingResources": [
        "MDN Web Storage API docs",
        "JavaScript array methods (map, filter, reduce)",
        "CSS Flexbox and Grid layouts"
      ],
      "recommendationReason": "This project aligns with your interest in web-development, addresses skill gaps in dom manipulation and browser apis, supports your short-term goal, offers an appropriate challenge at difficulty level 1/5.",
      "difficulty": 1,
      "alignedInterests": ["web-development"],
      "goalHorizon": "short",
      "targetedSkills": ["dom_manipulation", "browser_apis"]
    },
    // ... 4 more projects
  ],
  "metadata": {
    "generatedAt": "2025-12-29T22:30:00.000Z",
    "skillsAnalyzed": 4,
    "interestsMatched": 2
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Missing required field: profile"
}
```

Status codes:
- `200`: Success
- `400`: Bad request (validation error)
- `401`: Unauthorized
- `500`: Server error

---

### GET /api/assessment/projects/recommend

Get project recommendations using the authenticated user's stored profile.

#### Query Parameters

- `count` (optional): Number of projects to return (default: 5)
- `minDifficulty` (optional): Minimum difficulty level (default: 1)
- `maxDifficulty` (optional): Maximum difficulty level (default: 5)

#### Example Request

```bash
GET /api/assessment/projects/recommend?count=5
Authorization: Bearer <token>
```

#### Response

Same as POST endpoint.

#### Error Response (Profile Not Found)

```json
{
  "success": false,
  "error": "User profile not found. Please complete the assessment first."
}
```

Status code: `404`

---

## Example Usage

### 1. Using cURL (POST with custom profile)

```bash
curl -X POST https://your-domain.com/api/assessment/projects/recommend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "profile": {
      "interests": ["web-development", "react"],
      "assessmentScores": {
        "js_basics": 0.75,
        "react_basics": 0.45
      },
      "goals": {
        "shortTerm": "Build React app",
        "mediumTerm": "Get hired",
        "longTerm": "Senior engineer"
      }
    },
    "count": 3
  }'
```

### 2. Using cURL (GET with user profile)

```bash
curl -X GET "https://your-domain.com/api/assessment/projects/recommend?count=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Using JavaScript/TypeScript (Frontend)

```typescript
import axios from 'axios';

// Option 1: POST with custom profile
const customProfile = {
  interests: ['web-development', 'react'],
  assessmentScores: {
    js_basics: 0.75,
    react_basics: 0.45,
    node_basics: 0.30,
  },
  goals: {
    shortTerm: 'Build my first React app',
    mediumTerm: 'Get a junior dev job',
    longTerm: 'Become a senior engineer',
  },
};

const response = await axios.post('/api/assessment/projects/recommend', {
  profile: customProfile,
  count: 5,
});

console.log(response.data.projects);

// Option 2: GET using authenticated user's profile
const response2 = await axios.get('/api/assessment/projects/recommend?count=5');
console.log(response2.data.projects);
```

### 4. Displaying Recommendations in React

```tsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function ProjectRecommendations() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get(
          '/api/assessment/projects/recommend?count=5'
        );
        setProjects(response.data.projects);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) return <div>Loading recommendations...</div>;

  return (
    <div className="recommendations">
      <h2>Recommended Projects for You</h2>
      {projects.map((project, index) => (
        <div key={index} className="project-card">
          <h3>{project.title}</h3>
          <p className="difficulty">Difficulty: {project.difficulty}/5</p>
          <p>{project.description}</p>

          <div className="tech-stack">
            <strong>Tech Stack:</strong>
            {project.techStack.join(', ')}
          </div>

          <div className="learning-outcomes">
            <strong>What you'll learn:</strong>
            <ul>
              {project.learningOutcomes.map((outcome, i) => (
                <li key={i}>{outcome}</li>
              ))}
            </ul>
          </div>

          <div className="reason">
            <strong>Why this project?</strong>
            <p>{project.recommendationReason}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Recommendation Algorithm

### 1. Skill Gap Analysis

Identifies skills where the student has low mastery (< 0.6):

```typescript
// Skills with mastery < 0.6 are considered gaps
const skillGaps = [
  { skillKey: 'react_basics', mastery: 0.45, priority: 0.55 },
  { skillKey: 'node_basics', mastery: 0.30, priority: 0.70 },
];
```

### 2. Project Scoring

Each project template is scored using weighted factors:

```typescript
const weights = {
  interestWeight: 0.30,      // 30% - Interest alignment
  skillGapWeight: 0.40,      // 40% - Skill gap coverage (highest)
  goalWeight: 0.20,          // 20% - Goal alignment
  difficultyWeight: 0.10,    // 10% - Difficulty appropriateness
};

// Final score = sum of (factor_score * weight)
```

#### Interest Alignment Score

```typescript
// Percentage of student's interests that match this project
score = matching_interests / total_student_interests
```

#### Skill Gap Coverage Score

```typescript
// Weighted sum of priorities for gaps this project covers
score = sum(gap.priority for covered gaps) / sum(all gap priorities)
```

#### Goal Alignment Score

```typescript
// Does the project's goal horizon match a student goal?
score = 0.7 if goal is set for this horizon, else 0.3
```

#### Difficulty Appropriateness Score

```typescript
// How close is project difficulty to student's ideal level?
ideal_difficulty = 1 + (average_mastery * 4)  // Maps 0-1 to 1-5
gap = abs(project.difficulty - ideal_difficulty)
score = max(0, 1 - gap / 4)
```

### 3. Diversity Selection

After scoring, projects are selected to ensure:

- **Goal Horizon Diversity**: Coverage of short, medium, and long-term goals
- **Interest Coverage**: At least one project per student interest
- **Category Variety**: Mix of web, mobile, data, devops, etc.

### 4. Difficulty Ordering

Final recommendations are sorted by difficulty (ascending) to create a growth trajectory.

---

## Project Templates

The system includes **15 diverse project templates** spanning:

### Difficulty Distribution

- **Beginner (1-2)**: Task Tracker, Weather Dashboard, Portfolio Site
- **Intermediate (3)**: Recipe App, Chat App, E-commerce Cart
- **Advanced (4-5)**: Social Platform, SaaS Tools, AI Apps, Mobile Apps, Blockchain DApps

### Category Distribution

- **Web Development**: Frontend and full-stack web apps
- **Mobile**: React Native cross-platform apps
- **Data**: Analytics dashboards and ETL pipelines
- **DevOps**: CI/CD and infrastructure as code
- **Blockchain**: Smart contracts and DApps
- **Game Development**: Browser-based multiplayer games
- **AI**: AI-powered content generation

### Adding New Project Templates

To add a new project template, edit `src/server/assessment/recommendationEngine.ts`:

```typescript
const PROJECT_TEMPLATES: ProjectTemplate[] = [
  // ... existing templates ...
  {
    id: 'your-project-id',
    title: 'Your Project Title',
    description: 'Detailed description...',
    learningOutcomes: ['Outcome 1', 'Outcome 2'],
    techStack: ['Tech 1', 'Tech 2'],
    deliverables: ['Deliverable 1', 'Deliverable 2'],
    supportingResources: ['Resource 1', 'Resource 2'],
    difficulty: 3,  // 1-5
    relatedInterests: ['web-development', 'react'],
    skillsCovered: ['js_basics', 'react_basics'],
    goalHorizon: 'medium',  // 'short' | 'medium' | 'long'
    category: 'web',
  },
];
```

---

## Integration with Assessment Flow

### Automatic Profile Extraction

When a student completes the intake assessment, the system automatically:

1. **Extracts Goals** from questionnaire responses:
   - `learning_goal` field (career_change, skill_upgrade, freelance, etc.)
   - Maps to short/medium/long-term goals

2. **Infers Interests** from:
   - Technology preferences
   - Project type preferences
   - Experience level

3. **Saves to User Model**:
   ```typescript
   await prisma.user.update({
     where: { id: userId },
     data: {
       interests: extractedInterests,
       shortTermGoal: 'Build first full-stack app',
       mediumTermGoal: 'Get junior dev job',
       longTermGoal: 'Become senior engineer',
     },
   });
   ```

### Example Goal Mappings

| Learning Goal   | Short-Term                  | Medium-Term                | Long-Term                      |
|-----------------|-----------------------------|----------------------------|--------------------------------|
| career_change   | -                           | Transition into tech       | Become software engineer       |
| skill_upgrade   | Learn new tech              | Advance technical skills   | -                              |
| freelance       | Build portfolio             | Start freelancing          | Run freelance business         |
| side_projects   | Build personal projects     | Create project portfolio   | -                              |
| startup         | Build MVP                   | Launch product             | Build and scale startup        |
| curiosity       | Learn programming basics    | Build confidence with code | -                              |

### Interest Inference Rules

| Questionnaire Answer | Inferred Interests                    |
|----------------------|---------------------------------------|
| career_change        | web-development, full-stack           |
| freelance            | web-development, full-stack           |
| startup              | web-development, full-stack, saas     |
| side_projects        | web-development, react                |
| project_type: web_app| web-development, full-stack           |
| project_type: mobile | mobile, react-native                  |
| project_type: api    | backend, apis                         |
| project_type: data   | data, analytics                       |
| project_type: game   | game-dev, graphics                    |

---

## Testing

### Running Tests

```bash
# Run all recommendation engine tests
npm test -- recommendationEngine.test.ts

# Run with coverage
npm test -- --coverage recommendationEngine.test.ts
```

### Test Coverage

The test suite includes **17 test cases** covering:

1. **Basic Functionality**
   - Returns 5 projects by default
   - Projects ordered by difficulty
   - All required fields present

2. **Scoring Logic**
   - Interest alignment prioritization
   - Skill gap targeting
   - Goal horizon diversity

3. **Profile Handling**
   - Beginner profiles (low scores)
   - Advanced profiles (high scores)
   - Edge cases (empty interests, goals, minimal scores)

4. **Customization**
   - Custom count parameter
   - Difficulty range filtering

5. **Output Quality**
   - Personalized recommendation reasons
   - Valid tech stacks and deliverables
   - Category diversity

### Example Test

```typescript
it('should prioritize projects matching student interests', () => {
  const profile: StudentProfile = {
    interests: ['react', 'web-development'],
    assessmentScores: {
      js_basics: 0.7,
      react_basics: 0.3,
    },
    goals: {
      shortTerm: 'Master React',
      mediumTerm: 'Build React apps',
      longTerm: 'Expert in React',
    },
  };

  const recommendations = generateRecommendations(profile, 5);

  // At least one project should align with React interest
  const hasReactProject = recommendations.some((rec) =>
    rec.alignedInterests.includes('react')
  );
  expect(hasReactProject).toBe(true);
});
```

### Test Results

```
✓ should return 5 projects by default
✓ should return projects ordered by difficulty (ascending)
✓ should include all required fields in each recommendation
✓ should prioritize projects matching student interests
✓ should target skill gaps in recommendations
✓ should provide diverse goal horizon coverage
✓ should handle beginner profile (low scores)
✓ should handle advanced profile (high scores)
✓ should handle empty interests gracefully
✓ should handle empty goals gracefully
✓ should handle minimal assessment scores
✓ should respect custom count parameter
✓ should generate personalized recommendation reasons
✓ should handle edge case: no assessment scores
✓ should ensure diversity in project categories
✓ should include tech stack for each project
✓ should provide concrete deliverables for each project

Test Suites: 1 passed
Tests: 17 passed
```

---

## Troubleshooting

### Common Issues

#### 1. "User profile not found" error

**Cause**: Student hasn't completed the assessment yet.

**Solution**: Ensure the student completes the intake assessment first. The profile extraction happens automatically on completion.

#### 2. No interests or goals extracted

**Cause**: Questionnaire responses don't include standard fields.

**Solution**: Check `intakeConfig.ts` questionnaire step includes:
- `learning_goal` field
- `tech_interests` or `interests` field
- `project_preference` field

#### 3. Projects don't match student profile

**Cause**: Scoring weights may need adjustment.

**Solution**: Modify weights in `recommendationEngine.ts`:

```typescript
const DEFAULT_WEIGHTS = {
  interestWeight: 0.30,    // Increase for more interest matching
  skillGapWeight: 0.40,    // Increase to focus more on weak skills
  goalWeight: 0.20,        // Increase for more goal alignment
  difficultyWeight: 0.10,  // Increase to better match difficulty level
};
```

#### 4. Too many beginner or advanced projects

**Cause**: Project template database is skewed.

**Solution**: Add more templates in the needed difficulty range to `PROJECT_TEMPLATES` array.

---

## Future Enhancements

Potential improvements to the recommendation system:

1. **Machine Learning Integration**
   - Train ML model on student outcomes
   - Predict project success probability
   - Optimize weights based on completion rates

2. **Dynamic Project Generation**
   - Use AI (Claude, GPT) to generate custom projects
   - Tailor to specific skill combinations
   - Create unique projects per student

3. **Collaborative Filtering**
   - Recommend projects similar students enjoyed
   - Track project completion and ratings
   - "Students like you also liked..."

4. **Progress Tracking**
   - Mark projects as started/completed
   - Update recommendations based on progress
   - Suggest next project in sequence

5. **Community Projects**
   - Allow students to submit project ideas
   - Peer voting on project quality
   - Crowdsourced project templates

6. **Industry Alignment**
   - Tag projects with job market demand
   - Link to real job postings
   - Company-sponsored project tracks

---

## References

- [TypeScript Types](../src/server/assessment/projectRecommendation.ts)
- [Recommendation Engine](../src/server/assessment/recommendationEngine.ts)
- [API Endpoint](../src/app/api/assessment/projects/recommend/route.ts)
- [Test Suite](../src/server/assessment/__tests__/recommendationEngine.test.ts)
- [Profile Extraction](../src/server/assessment/profileExtraction.ts)

---

## Support

For questions or issues:
- File a GitHub issue
- Contact the development team
- Check the main [ARCHITECTURE.md](../ARCHITECTURE.md) for system overview
