# System Flow

## User Journey: Learning with Adaptive Assessment

### 1. Course Enrollment
```
Student → Courses Page → Browse Courses → Enroll
  ↓
API: POST /api/lms/enrollments
  ↓
enrollmentService.ts creates enrollment record
  ↓
Student sees course in "My Courses"
```

### 2. Lesson Viewing
```
Student → My Courses → Select Course → View Lessons
  ↓
API: GET /api/lms/courses/[courseId]
  ↓
courseService.ts fetches course + lessons
  ↓
Student reads lesson content → "Practice with AI" button
```

### 3. Adaptive Challenge Recommendation
```
Student → Assessment Page
  ↓
API: GET /api/assessment/recommendations
  ↓
adaptiveService.ts analyzes user's mastery data
  ↓
Returns personalized challenge list based on:
  - Current skill level
  - Mastery gaps
  - Learning progression
```

### 4. Code Challenge Execution
```
Student → Selects Challenge → Writes Code → Run
  ↓
API: POST /api/assessment/run-code
  ↓
runCodeService.ts sends code to JDoodle API
  ↓
Returns: stdout, stderr, execution time
  ↓
TestResults.tsx displays verdicts (pass/fail)
  ↓
API: POST /api/assessment/mastery (record attempt)
  ↓
masteryService.ts updates mastery metrics
```

### 5. AI Tutor Interaction
```
Student → Stuck on challenge → Asks AI Tutor
  ↓
API: POST /api/assessment/chat
  ↓
aiService.ts:
  1. Retrieves user's current challenge context
  2. Searches knowledge base via knowledgeService.ts
  3. Gets adaptive hints based on mastery level
  4. Sends prompt to OpenAI with RAG context
  ↓
Returns: AI response + source citations
  ↓
TutorChat.tsx displays response with sources
```

## Knowledge RAG Flow

### Document Ingestion
```
Admin → Upload Documentation
  ↓
API: POST /api/knowledge/ingest
  ↓
knowledgeService.ts:
  1. Chunks document into sections
  2. Calls embeddingService.ts for each chunk
  3. Stores embeddings in vector DB
  4. Links to original document in Prisma
```

### Semantic Search
```
Student/Tutor → Search Query
  ↓
API: POST /api/knowledge/search
  ↓
knowledgeService.ts:
  1. Generates embedding for query
  2. Performs vector similarity search
  3. Retrieves top K relevant chunks
  4. Returns with metadata + source links
```

## Adaptive Learning Loop

```
┌─────────────────────────────────────┐
│   Student Attempts Challenge        │
└──────────┬──────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   Record Attempt Metrics             │
│   - Success/Failure                  │
│   - Time taken                       │
│   - Hints used                       │
└──────────┬──────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   Update Mastery Model               │
│   - Skill proficiency scores         │
│   - Concept understanding            │
│   - Difficulty progression           │
└──────────┬──────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   Adaptive Recommendation Engine     │
│   - Select next challenge            │
│   - Adjust difficulty                │
│   - Focus on weak areas              │
└──────────┬──────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   Present Recommended Challenges     │
└─────────────────────────────────────┘
```

## API Request Flows

### Student Dashboard Load
```
1. GET /api/lms/enrollments → My courses
2. GET /api/assessment/recommendations → Suggested challenges
3. (Optional) GET /api/assessment/challenges → All available challenges
```

### Challenge Solving Session
```
1. GET /api/assessment/challenges/[slug] → Challenge details
2. POST /api/assessment/run-code → Execute code (multiple times)
3. POST /api/assessment/chat → Ask AI tutor (as needed)
4. POST /api/assessment/mastery → Record final submission
```

### Course Content Creation (Future)
```
1. POST /api/lms/courses → Create course
2. POST /api/lms/courses/[id]/lessons → Add lessons
3. POST /api/knowledge/ingest → Index lesson content
4. POST /api/assessment/challenges → Create practice challenges
```
