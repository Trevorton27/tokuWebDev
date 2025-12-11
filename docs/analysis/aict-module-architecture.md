# AICT (AI-Coding Tutor) Module Architecture Analysis

## Purpose
The AICT module extends a simple LMS with adaptive, AI-powered coding assessment and tutoring capabilities.

## Why Separate from Core LMS?
1. **Complexity**: AI/adaptive systems are more complex than content delivery
2. **Scalability**: Can scale independently (different infrastructure needs)
3. **Reusability**: Could be used standalone or with other LMS platforms
4. **Technology**: Requires specialized services (code execution, vector DB, LLM APIs)

## Core Components

### 1. Adaptive Challenge Engine
**Purpose**: Select optimal challenges for each learner

**Key Features**:
- Mastery tracking per skill/concept
- Difficulty adjustment based on performance
- Personalized recommendations
- Micro-drills for weak areas

**Data Models**:
- Challenges (with difficulty, tags, test cases)
- Attempts (user performance history)
- Mastery events (skill proficiency tracking)

### 2. Code Execution Sandbox
**Purpose**: Safely run and evaluate user code

**Key Features**:
- Multi-language support (Python, JS, Java, C++)
- Test case validation
- Security (sandboxed execution)
- Performance metrics

**Implementation**:
- External API (JDoodle, Judge0)
- Custom Docker containers (future)
- WebAssembly (browser-based, future)

### 3. AI Tutor (RAG-powered)
**Purpose**: Provide context-aware tutoring

**Key Features**:
- Retrieval-Augmented Generation
- Challenge-specific hints
- Error explanation
- Code review feedback
- Adaptive to user level

**Components**:
- Knowledge base (vector DB)
- Embedding service (OpenAI)
- LLM integration (GPT-4)
- Context builder (challenge + user + docs)

### 4. Knowledge Base (RAG)
**Purpose**: Intelligent content retrieval

**Key Features**:
- Semantic search
- Document indexing (lessons, docs, solutions)
- Source attribution
- Multi-modal content

**Technology**:
- Vector embeddings (OpenAI)
- Vector DB (Pinecone or pgvector)
- Chunking strategy

## Integration with LMS

### Tight Integration Points
```
LMS Lesson → "Practice Now" button → AICT Challenge
  ↓
Challenge tags match lesson topics
  ↓
AI Tutor can reference lesson content
  ↓
Mastery data informs course recommendations
```

### Loose Coupling
- AICT has own database tables
- Separate API namespace (/api/assessment/*)
- Can function independently
- Shared user authentication only

## Data Flow: Student Attempt

```
1. Student selects challenge from recommendations
   ↓ (GET /api/assessment/recommendations)

2. Adaptive service queries mastery profile
   ↓

3. Returns personalized challenge list
   ↓

4. Student writes code and runs tests
   ↓ (POST /api/assessment/run-code)

5. Code execution service → JDoodle API
   ↓

6. Results compared with test cases
   ↓

7. Record attempt + update mastery
   ↓ (POST /api/assessment/mastery)

8. Adaptive engine adjusts recommendations
   ↓

9. If stuck, student asks AI tutor
   ↓ (POST /api/assessment/chat)

10. RAG service searches knowledge base
    ↓

11. AI generates response with context
    ↓

12. Student receives help with citations
```

## Advantages of This Architecture

### Modularity
- Can add to existing LMS
- Can replace components (e.g., swap vector DB)
- Can scale parts independently

### Flexibility
- Different challenge types
- Multiple programming languages
- Customizable adaptive algorithms
- Pluggable AI models

### Intelligence
- Personalized learning paths
- Real-time feedback
- Context-aware tutoring
- Data-driven insights

## Challenges & Considerations

### Cost
- API calls (LLM, embeddings, code execution)
- Vector database hosting
- Compute for scaling

### Latency
- Code execution can be slow
- LLM responses take time
- Need caching strategies

### Accuracy
- Test case coverage
- LLM hallucinations
- Adaptive algorithm tuning

### Security
- Code execution risks
- Prompt injection attacks
- Data privacy (user code)

## Future Enhancements

### Short-term
- More languages and frameworks
- Better test case generation
- Progressive hint system
- Code quality metrics

### Long-term
- Collaborative challenges
- Project-based assessments
- Visual programming support
- Real-time pair programming with AI
- Automated challenge generation
- Multi-modal tutoring (voice, video)

## When to Use AICT Module

**Good fit**:
- Coding bootcamps
- Technical interview prep
- CS education
- Developer upskilling

**Not ideal for**:
- Non-coding content
- Very large scale (cost)
- Offline/low-bandwidth environments

## Comparison: Simple LMS vs AICT-Enhanced

| Feature | Simple LMS | AICT-Enhanced |
|---------|-----------|---------------|
| Content delivery | ✓ | ✓ |
| Quizzes | Basic | Adaptive coding |
| Feedback | Manual | AI-powered |
| Personalization | None | High |
| Interactivity | Low | High |
| Complexity | Low | High |
| Cost | Low | Medium-High |
| Learning outcomes | Good | Excellent |
