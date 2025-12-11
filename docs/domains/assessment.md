# Assessment Domain

## Overview
The Assessment domain provides adaptive coding challenges, code execution, mastery tracking, and AI tutoring capabilities.

## Data Models

### Challenge
```typescript
{
  id: string
  slug: string  // URL-friendly identifier
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  language: 'javascript' | 'python' | 'java' | 'cpp'
  starterCode: string
  solution: string
  testCases: TestCase[]
  tags: string[]  // ['arrays', 'loops', 'recursion']
  hints: string[]
  createdAt: Date
}
```

### TestCase
```typescript
{
  id: string
  challengeId: string
  input: string
  expectedOutput: string
  isHidden: boolean  // Hidden test cases not shown to user
  weight: number  // For scoring
}
```

### Attempt
```typescript
{
  id: string
  userId: string
  challengeId: string
  code: string
  passed: boolean
  score: number
  timeSpent: number  // seconds
  hintsUsed: number
  attemptedAt: Date
}
```

### MasteryEvent
```typescript
{
  id: string
  userId: string
  skillTag: string  // e.g., 'arrays', 'loops'
  event: 'attempt' | 'success' | 'failure' | 'hint'
  metadata: JSON
  timestamp: Date
}
```

## Services

### challengeService.ts
- `listChallenges(filters)`: Get challenges with filters (difficulty, tags, language)
- `getChallengeBySlug(slug)`: Get challenge details
- `searchChallenges(query)`: Search by title/description
- `getRelatedChallenges(challengeId)`: Similar challenges

### runCodeService.ts
- `runCodeWithJDoodle(code, language, input)`: Execute code via JDoodle API
- `evaluateSubmission(challengeId, code)`: Run all test cases
- `validateOutput(actual, expected)`: Compare outputs

### masteryService.ts
- `recordAttempt(userId, challengeId, data)`: Log attempt
- `recordMasteryEvent(userId, skillTag, event)`: Track skill progress
- `getMasteryProfile(userId)`: Get user's skill proficiency
- `getWeakAreas(userId)`: Identify skills needing improvement

### adaptiveService.ts
- `getRecommendedChallenges(userId, limit)`: Personalized challenge list
- `selectNextChallenge(userId, currentContext)`: Choose optimal next challenge
- `generateMicroDrill(userId, skillTag)`: Create targeted mini-challenge
- `adjustDifficulty(userId, performance)`: Adapt challenge difficulty

### aiService.ts
- `getTutorReply(userId, challengeId, messages, context)`: AI tutor response
- `generateHint(challengeId, userCode, level)`: Progressive hints
- `explainError(code, error)`: Error explanation
- `reviewSolution(code, challengeId)`: Code review feedback

## API Endpoints

### Challenges
- `GET /api/assessment/challenges`: List challenges with filters
- `GET /api/assessment/challenges/[slug]`: Get challenge details

### Code Execution
- `POST /api/assessment/run-code`: Execute code and return results
  - Body: `{ code, language, input?, testCases? }`

### Mastery Tracking
- `POST /api/assessment/mastery`: Record attempt/mastery event
  - Body: `{ challengeId, code, passed, timeSpent, hintsUsed }`

### Adaptive Learning
- `GET /api/assessment/recommendations`: Get personalized challenges
  - Query params: `?userId=X&limit=10`

### AI Tutor
- `POST /api/assessment/chat`: Chat with AI tutor
  - Body: `{ challengeId, messages, userCode? }`

## UI Components

### ChallengeList.tsx
- Recommended challenges section
- All challenges grid with filters
- Difficulty badges
- Progress indicators
- "Start Challenge" buttons

### ChallengeRunner.tsx
- Challenge description panel
- Code editor (Monaco or CodeMirror)
- Language selector
- Run button
- Test cases input/output
- Submit button

### TestResults.tsx
- Test case results (pass/fail)
- Stdout/stderr display
- Execution time
- Score calculation
- "Next Challenge" suggestion

### TutorChat.tsx
- Chat interface with AI tutor
- Message history
- Context-aware responses
- Code snippet rendering
- Source citations from RAG
- "Ask for Hint" quick action

### RoadmapSidebar.tsx
- App roadmap/project context
- Current feature being built
- "Generate Challenge" button
- Skill tree visualization (future)

## Code Execution Flow

```
User writes code → Click "Run"
  ↓
POST /api/assessment/run-code
  ↓
runCodeService.ts → JDoodle API
  ↓
JDoodle executes in sandbox
  ↓
Returns: { stdout, stderr, time, memory }
  ↓
Compare with expected outputs
  ↓
Display results in TestResults.tsx
```

## Adaptive Learning Algorithm

```typescript
function getRecommendedChallenges(userId) {
  // 1. Get user's mastery profile
  const profile = getMasteryProfile(userId);

  // 2. Identify weak areas
  const weakSkills = getWeakAreas(userId);

  // 3. Find challenges targeting weak skills
  const targetedChallenges = findChallengesBySkills(weakSkills);

  // 4. Adjust difficulty based on recent performance
  const difficulty = adjustDifficulty(userId);

  // 5. Filter and rank
  const ranked = rankByRelevance(targetedChallenges, profile, difficulty);

  // 6. Ensure variety (mix of skills)
  return diversify(ranked, limit);
}
```

## Integration Points

### With LMS Domain
- Challenges linked to specific lessons
- Course completion triggers challenge recommendations
- Lesson context passed to AI tutor

### With Knowledge RAG
- AI tutor queries knowledge base for explanations
- Challenge solutions indexed for search
- Related documentation surfaced in hints

## Future Enhancements
- Peer code review
- Collaborative challenges
- Live coding sessions
- Challenge creation by instructors
- Automated difficulty calibration
- Gamification (badges, leaderboards)
