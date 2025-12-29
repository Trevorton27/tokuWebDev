# Signal Works LMS - Architecture & Documentation

> A modern, AI-powered Learning Management System built with Next.js 14+

**Version**: 0.1.0 (MVP Phase)
**Estimated Time for Full Assessment**: 55-60 minutes
**Skill Dimensions Tracked**: 8 foundational categories

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Folder Structure](#2-folder-structure)
3. [Tech Stack](#3-tech-stack)
4. [Core Domains](#4-core-domains)
5. [Database Schema](#5-database-schema)
6. [API Routes](#6-api-routes)
7. [Assessment System](#7-assessment-system)
8. [AI & RAG Integration](#8-ai--rag-integration)
9. [Python Integration Opportunities](#9-python-integration-opportunities)
10. [Development Workflow](#10-development-workflow)

---

## 1. Project Overview

Signal Works LMS integrates three core domains:

| Domain | Purpose |
|--------|---------|
| **LMS** | Course and lesson management with enrollment tracking |
| **Assessment** | Adaptive coding challenges with AI tutoring and mastery tracking |
| **Knowledge RAG** | Semantic search and document indexing for intelligent content retrieval |

### Key Features

- **27-Step Intake Assessment** - Comprehensive skill evaluation
- **Adaptive Learning Paths** - Personalized roadmaps based on assessment
- **AI Tutor** - Claude-powered assistance with RAG context
- **Real-time Code Execution** - JDoodle sandbox integration
- **Multi-role Support** - Student, Instructor, Admin dashboards
- **Dark/Light Mode** - Full theme support across all pages

---

## 2. Folder Structure

```
signal-works-lms/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (public)/login/           # Public routes
│   │   ├── (student)/                # Student-protected routes
│   │   ├── admin/                    # Admin dashboard
│   │   │   ├── analytics/
│   │   │   ├── courses/
│   │   │   ├── engagement/
│   │   │   ├── instructors/
│   │   │   ├── lessons/
│   │   │   ├── roadmaps/
│   │   │   └── students/
│   │   ├── api/                      # Backend API routes (33+ endpoints)
│   │   │   ├── admin/                # Admin management APIs
│   │   │   ├── assessment/           # Assessment & AI tutor APIs
│   │   │   ├── knowledge/            # RAG search APIs
│   │   │   ├── lms/                  # Course/enrollment APIs
│   │   │   └── roadmap/              # Learning path APIs
│   │   ├── assessment/intake/        # Intake assessment wizard
│   │   ├── instructor/               # Instructor views
│   │   ├── student/                  # Student dashboard
│   │   │   ├── roadmap/
│   │   │   ├── skills/
│   │   │   └── courses/
│   │   ├── sign-in/ & sign-up/       # Clerk authentication
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Landing page
│   │
│   ├── components/                   # Reusable UI components
│   │   ├── ClientProviders.tsx       # Theme + language providers
│   │   ├── admin/                    # Admin-specific components
│   │   └── courses/                  # Course display components
│   │
│   ├── modules/                      # Feature modules (domain-organized)
│   │   ├── common/                   # NavBar, ThemeToggle, LayoutShell
│   │   ├── student/components/       # 11 dashboard widgets
│   │   │   ├── ActiveChallenges.tsx
│   │   │   ├── AIRecommendations.tsx
│   │   │   ├── CalendarEvents.tsx
│   │   │   ├── CurrentFocus.tsx
│   │   │   ├── MyCourses.tsx
│   │   │   ├── Notifications.tsx
│   │   │   ├── OnboardingCheck.tsx
│   │   │   ├── ProjectSummary.tsx
│   │   │   ├── QuickNav.tsx
│   │   │   ├── RoadmapProgress.tsx
│   │   │   └── StudyStreak.tsx
│   │   ├── assessment/ui/            # Assessment components
│   │   │   ├── ChallengeRunner.tsx
│   │   │   ├── SkillRadar.tsx
│   │   │   ├── TutorChat.tsx
│   │   │   └── intake/               # 8 intake step components
│   │   ├── instructor/components/    # Course editing
│   │   └── lms/ui/                   # LMS components
│   │
│   ├── server/                       # Backend business logic
│   │   ├── lms/                      # LMS domain services
│   │   │   ├── courseService.ts
│   │   │   ├── lessonService.ts
│   │   │   ├── enrollmentService.ts
│   │   │   ├── roadmapService.ts
│   │   │   └── curriculumConfig.ts
│   │   ├── assessment/               # Assessment domain services
│   │   │   ├── challengeService.ts
│   │   │   ├── skillModel.ts         # Skill taxonomy (60+ skills)
│   │   │   ├── skillProfileService.ts
│   │   │   ├── masteryService.ts
│   │   │   ├── adaptiveService.ts
│   │   │   ├── runCodeService.ts     # JDoodle integration
│   │   │   ├── aiService.ts          # Claude AI tutor
│   │   │   ├── intakeService.ts
│   │   │   ├── intakeConfig.ts       # 27-step configuration
│   │   │   └── intakeGrader.ts       # Assessment grading
│   │   ├── knowledge/                # Knowledge RAG services
│   │   │   ├── knowledgeService.ts   # Document indexing & search
│   │   │   └── embeddingService.ts   # Voyage AI embeddings
│   │   └── auth/
│   │       └── userSyncService.ts    # Clerk user sync
│   │
│   ├── lib/                          # Utilities & client wrappers
│   │   ├── types.ts                  # Shared TypeScript types
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── logger.ts                 # Structured logging
│   │   ├── auth.ts                   # Auth helpers
│   │   ├── assessmentClient.ts       # Assessment API client
│   │   ├── lmsClient.ts              # LMS API client
│   │   ├── intakeClient.ts           # Intake API client
│   │   ├── knowledgeClient.ts        # Knowledge API client
│   │   ├── theme/ThemeContext.tsx    # Dark/light mode
│   │   └── i18n/translations.ts      # Internationalization
│   │
│   └── styles/globals.css            # Global styles + Tailwind
│
├── prisma/
│   ├── schema.prisma                 # Database schema (15 models)
│   ├── migrations/                   # Migration history
│   └── seed-courses.ts               # Database seeding
│
├── docs/                             # Architecture documentation
│   ├── architecture.md
│   ├── database-schema.md
│   ├── system-flow.md
│   └── domains/                      # Domain-specific docs
│
├── tests/                            # Test files
├── public/                           # Static assets
├── ASSESSMENT_CHALLENGES.md          # Intake assessment docs
├── package.json                      # Dependencies
├── tailwind.config.ts                # Tailwind configuration
└── tsconfig.json                     # TypeScript configuration
```

---

## 3. Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.0 | React framework with App Router |
| React | 18.3.0 | UI library |
| TypeScript | 5.5.0 | Type safety |
| Tailwind CSS | 3.4.0 | Utility-first styling |

### Database & ORM
| Technology | Purpose |
|------------|---------|
| PostgreSQL | Primary database |
| Prisma | ORM with migrations |
| pgvector | Vector embeddings (optional) |

### Authentication
| Technology | Purpose |
|------------|---------|
| Clerk | User authentication & management |
| Clerk Webhooks | User sync on signup/update |

### External APIs
| Service | Purpose |
|---------|---------|
| Anthropic Claude | AI tutor (claude-3-5-sonnet-latest) |
| Voyage AI | Vector embeddings (voyage-2) |
| JDoodle | Code execution sandbox |

### Development Tools
| Tool | Purpose |
|------|---------|
| Jest | Unit testing |
| ESLint | Code linting |
| Zod | Schema validation |

---

## 4. Core Domains

### 4.1 LMS Domain

Manages courses, lessons, and enrollments.

```
Services:
├── courseService.ts      # CRUD operations for courses
├── lessonService.ts      # Lesson management
├── enrollmentService.ts  # Student enrollment logic
├── roadmapService.ts     # Learning path generation
└── curriculumConfig.ts   # Predefined curriculum structure
```

**Key Features:**
- Course publishing workflow
- Progress tracking (0-100%)
- Enrollment status management (ACTIVE, COMPLETED, DROPPED)
- Instructor course creation

### 4.2 Assessment Domain

Handles skill assessment, coding challenges, and adaptive recommendations.

```
Services:
├── challengeService.ts      # Challenge CRUD
├── skillModel.ts            # 8 dimensions, 60+ skills
├── skillProfileService.ts   # User skill profiles
├── masteryService.ts        # Mastery tracking
├── adaptiveService.ts       # Personalized recommendations
├── runCodeService.ts        # JDoodle code execution
├── aiService.ts             # Claude AI tutor with RAG
├── intakeService.ts         # Assessment session management
├── intakeConfig.ts          # 27-step configuration
└── intakeGrader.ts          # Response grading (AI + rules)
```

**Skill Dimensions (8 categories):**
1. Programming Fundamentals
2. Web Foundations (HTML/CSS)
3. JavaScript/TypeScript
4. Backend Development
5. Dev Practices (Git, Testing)
6. System Thinking (Architecture)
7. UI/UX Design
8. Meta Skills (Communication, Learning)

### 4.3 Knowledge RAG Domain

Provides semantic search and document retrieval for AI tutoring.

```
Services:
├── knowledgeService.ts   # Document indexing & search
└── embeddingService.ts   # Voyage AI vector embeddings
```

**Features:**
- Document chunking (500 tokens, 50 overlap)
- Vector similarity search
- Context injection for AI tutor
- Multi-document type support (LESSON, DOCUMENTATION, SOLUTION, etc.)

---

## 5. Database Schema

### Core Models

```prisma
// User & Authentication
User {
  id, clerkId, email, name, role (STUDENT | INSTRUCTOR | ADMIN)
  enrollments[], attempts[], skillMasteries[], assessmentSessions[]
}

// LMS
Course { id, title, description, published, instructorId, lessons[] }
Lesson { id, title, content, order, courseId, videoUrl, duration }
Enrollment { userId, courseId, status, progress, enrolledAt, completedAt }

// Assessment
Challenge { id, slug, title, difficulty, language, starterCode, testCases[] }
TestCase { id, challengeId, input, expectedOutput, isHidden, weight }
Attempt { userId, challengeId, code, passed, score, timeSpent, hintsUsed }

// Mastery Tracking
MasteryEvent { userId, skillTag, event (ATTEMPT | SUCCESS | FAILURE | HINT) }
UserSkillMastery { userId, skillKey, mastery (0-1), confidence (0-1) }

// Assessment Sessions
AssessmentSession { userId, sessionType, status, currentStep, stepData }
AssessmentResponse { sessionId, stepId, rawAnswer, gradeResult, skillUpdates }

// Knowledge RAG
Document { id, title, content, type, chunks[] }
DocumentChunk { documentId, content, chunkIndex, embedding (Float[]) }

// Learning Paths
StudentRoadmap { userId, title, itemType, status, phase, skillKeys[] }
```

---

## 6. API Routes

### LMS APIs (`/api/lms/`)
```
GET    /courses                  # List all courses
GET    /courses/available        # Available for enrollment
GET    /courses/[courseId]       # Course details
GET    /courses/[id]/lessons     # Course lessons
POST   /enrollments              # Enroll student
GET    /enrollments              # User enrollments
POST   /enrollments/unenroll     # Unenroll
GET    /lessons/[lessonId]       # Lesson details
```

### Assessment APIs (`/api/assessment/`)
```
GET    /challenges               # List challenges (filtered)
GET    /challenges/[slug]        # Challenge details
POST   /run-code                 # Execute code (JDoodle)
POST   /mastery                  # Record mastery event
GET    /recommendations          # Personalized recommendations
POST   /chat                     # AI tutor conversation
POST   /intake/start             # Start assessment
GET    /intake/current           # Current session state
POST   /intake/submit            # Submit step answer
GET    /intake/summary           # Assessment results
```

### Knowledge APIs (`/api/knowledge/`)
```
POST   /ingest                   # Index document
POST   /search                   # Semantic search
GET    /lesson/[lessonId]        # Lesson documents
```

### Admin APIs (`/api/admin/`)
```
GET    /analytics                # System metrics
GET    /engagement               # Student activity
GET    /courses                  # Course management
POST   /enrollments              # Manage enrollments
POST   /roadmaps                 # Manage roadmaps
GET    /roadmaps/[studentId]     # Student roadmap
POST   /users                    # User management
```

---

## 7. Assessment System

### 27-Step Intake Assessment

| Section | Steps | Duration |
|---------|-------|----------|
| **0: Level Qualification** | 1-2 | 2 min |
| **1: Background** | 3-5 | 10 min |
| **2: MCQs** | 6-15 | 10 min |
| **3: Short Text** | 16-18 | 9 min |
| **4: Coding** | 19-21 | 24 min |
| **5: Design** | 22-26 | 13 min |
| **6: Meta Skills** | 27-28 | 4 min |
| **7: Summary** | 29 | 2 min |

### Step Types (8 kinds)

1. **QUESTIONNAIRE** - Background info, sliders
2. **MCQ** - Single multiple choice
3. **MICRO_MCQ_BURST** - 3 rapid-fire questions
4. **SHORT_TEXT** - AI-graded text response
5. **CODE** - Coding challenge with test cases
6. **DESIGN_COMPARISON** - A/B design choice
7. **DESIGN_CRITIQUE** - Evaluate a design
8. **SUMMARY** - Results + roadmap generation

### Mastery Calculation

```typescript
// Mastery is calculated as weighted average
mastery = (score * confidence * weight) / totalWeight

// Confidence sources:
- MCQ: 0.6-0.9 (by difficulty)
- Code: 0.9 (automated testing)
- Short Text: 0.7 (AI grading)
- Questionnaire: 0.2 (self-report)
```

---

## 8. AI & RAG Integration

### AI Tutor Flow

```
1. User asks question in TutorChat
2. System loads challenge context
3. Retrieves user's skill profile (weak areas)
4. Searches knowledge base (top 3 results)
5. Builds context-rich prompt:
   - Challenge description
   - User skill level
   - Relevant documentation
   - Adaptive hint strategy
6. Calls Claude API (claude-3-5-sonnet-latest)
7. Returns response with source citations
```

### RAG System

```
Document Indexing:
1. Parse document content
2. Chunk into segments (500 tokens, 50 overlap)
3. Generate embeddings via Voyage AI
4. Store in DocumentChunk with vector

Semantic Search:
1. Generate query embedding
2. Vector similarity search
3. Filter by document type/tags
4. Return top N results with context
```

---

## 9. Python Integration Opportunities

Python can significantly enhance the data processing, analytics, and ML capabilities of this LMS. Here are recommended integration points:

### 9.1 Data Analytics & Reporting

**Current Gap**: Admin analytics are basic aggregations
**Python Solution**: Advanced analytics pipeline

```python
# Recommended: FastAPI microservice for analytics

# Student Performance Analytics
- Learning velocity analysis (progress over time)
- Cohort comparison and benchmarking
- Dropout risk prediction
- Engagement score calculation

# Course Effectiveness
- Completion rate analysis by course/instructor
- Lesson difficulty scoring
- Content engagement heatmaps
- A/B testing analysis for content variations

# Libraries:
- pandas: Data manipulation
- scikit-learn: ML models for predictions
- matplotlib/plotly: Visualization
- jupyter: Interactive analysis
```

**Integration**: REST API or message queue (Redis/RabbitMQ)

### 9.2 Advanced Skill Assessment

**Current Gap**: Rule-based skill scoring
**Python Solution**: ML-based skill inference

```python
# Skill Proficiency Prediction
class SkillPredictor:
    """
    Uses historical attempt data to predict
    true skill levels with confidence intervals
    """

    # Features:
    - Time-to-solution analysis
    - Error pattern recognition
    - Hint usage patterns
    - Code quality metrics (cyclomatic complexity, etc.)

    # Models:
    - Bayesian Knowledge Tracing (BKT)
    - Deep Knowledge Tracing (DKT)
    - Item Response Theory (IRT)

# Libraries:
- pyBKT: Bayesian knowledge tracing
- tensorflow/pytorch: Deep learning models
- statsmodels: Statistical analysis
```

### 9.3 Code Analysis & Plagiarism Detection

**Current Gap**: Only test case validation
**Python Solution**: Deep code analysis

```python
# Code Quality Analysis
- AST parsing for structural analysis
- Code similarity detection (MOSS-like)
- Style consistency checking
- Complexity metrics (cyclomatic, cognitive)
- Security vulnerability scanning

# Plagiarism Detection
- Token-based similarity
- AST-based matching
- Cross-submission comparison

# Libraries:
- ast: Python AST parsing
- esprima/acorn: JavaScript parsing
- radon: Code metrics
- copydetect: Plagiarism detection
```

### 9.4 Personalized Learning Recommendations

**Current Gap**: Rule-based recommendations
**Python Solution**: ML-powered recommendation engine

```python
# Recommendation System
class LearningRecommender:
    """
    Collaborative filtering + content-based
    hybrid recommendation system
    """

    # Approaches:
    1. Collaborative filtering (similar learners)
    2. Content-based (skill prerequisites)
    3. Sequence-aware (learning path optimization)
    4. Knowledge graph traversal

    # Features:
    - Next-best-action prediction
    - Difficulty calibration
    - Time-optimal path generation
    - Spaced repetition scheduling

# Libraries:
- surprise: Collaborative filtering
- lightfm: Hybrid recommendations
- networkx: Knowledge graphs
- optuna: Hyperparameter optimization
```

### 9.5 Natural Language Processing

**Current Gap**: Basic text grading via Claude API
**Python Solution**: Local NLP processing

```python
# Text Analysis Pipeline
- Response quality scoring (without API calls)
- Technical term extraction
- Explanation coherence analysis
- Sentiment analysis for feedback

# Automated Rubric Scoring
- Fine-tuned models for educational assessment
- Multi-criteria scoring
- Consistency checking across graders

# Libraries:
- transformers: Hugging Face models
- spacy: NLP pipeline
- sentence-transformers: Semantic similarity
- textstat: Readability metrics
```

### 9.6 Data Pipeline & ETL

**Current Gap**: Direct database queries
**Python Solution**: Robust data pipeline

```python
# ETL Pipeline
class LMSDataPipeline:
    """
    Extract, transform, load pipeline for
    analytics and reporting
    """

    # Components:
    1. Data extraction from PostgreSQL
    2. Transformation & cleaning
    3. Aggregation & feature engineering
    4. Load to data warehouse / analytics DB

    # Scheduling:
    - Daily aggregations
    - Weekly reports
    - Real-time event streaming

# Libraries:
- apache-airflow: Workflow orchestration
- prefect: Modern ETL
- dbt: Data transformation
- great_expectations: Data validation
```

### 9.7 Embedding & Vector Operations

**Current Gap**: External API for embeddings
**Python Solution**: Local embedding generation

```python
# Local Embeddings
- Run embedding models locally (sentence-transformers)
- Batch processing for large document sets
- Custom fine-tuned embeddings for educational content
- Reduced API costs and latency

# Vector Operations
- Efficient similarity search (FAISS, Annoy)
- Clustering for content organization
- Dimensionality reduction for visualization

# Libraries:
- sentence-transformers: Local embeddings
- faiss: Efficient vector search
- umap-learn: Dimensionality reduction
- hdbscan: Clustering
```

### 9.8 Suggested Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Signal Works LMS                          │
│                    (Next.js + Node.js)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST API / Message Queue
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Python Analytics Service                     │
│                      (FastAPI)                               │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Analytics  │  │    ML        │  │    NLP       │      │
│  │   Pipeline   │  │  Predictions │  │  Processing  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Code       │  │  Recommender │  │  Embeddings  │      │
│  │   Analysis   │  │    Engine    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Shared Database + Redis
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL                              │
│              (Shared with main application)                  │
└─────────────────────────────────────────────────────────────┘
```

### 9.9 Implementation Priority

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| **High** | Analytics Dashboard Backend | Medium | High |
| **High** | Local Embeddings | Low | Medium |
| **High** | Code Quality Analysis | Medium | High |
| **Medium** | Skill Prediction (BKT/DKT) | High | High |
| **Medium** | Recommendation Engine | High | High |
| **Medium** | Data Pipeline (Airflow) | Medium | Medium |
| **Low** | Plagiarism Detection | Medium | Medium |
| **Low** | NLP Text Grading | High | Medium |

### 9.10 Quick Start: Python Analytics Service

```python
# api/main.py
from fastapi import FastAPI
from sqlalchemy import create_engine
import pandas as pd

app = FastAPI(title="LMS Analytics Service")

# Connect to shared PostgreSQL
engine = create_engine(os.environ["DATABASE_URL"])

@app.get("/analytics/student/{student_id}")
async def get_student_analytics(student_id: str):
    """Comprehensive student performance analysis"""

    # Query attempts and mastery data
    df = pd.read_sql(f"""
        SELECT * FROM "Attempt"
        WHERE "userId" = '{student_id}'
    """, engine)

    return {
        "total_attempts": len(df),
        "success_rate": df["passed"].mean(),
        "avg_time": df["timeSpent"].mean(),
        "skill_progression": calculate_progression(df),
        "recommendations": get_recommendations(df)
    }

@app.get("/analytics/cohort")
async def get_cohort_analytics():
    """Cross-student comparison and benchmarking"""
    # ...

@app.post("/predict/dropout-risk")
async def predict_dropout_risk(student_id: str):
    """ML-based dropout risk prediction"""
    # ...
```

---

## 10. Development Workflow

### Setup

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma migrate dev

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run start            # Production server
npm run lint             # ESLint
npm test                 # Jest tests
npm run test:watch       # Watch mode
npm run prisma:studio    # Database GUI
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# AI Services
ANTHROPIC_API_KEY=sk-ant-...
AI_TUTOR_MODEL=claude-3-5-sonnet-latest

# Embeddings
EMBEDDINGS_API_KEY=...
EMBEDDINGS_MODEL=voyage-2

# Code Execution
JDOODLE_CLIENT_ID=...
JDOODLE_CLIENT_SECRET=...
```

---

## 11. Google Docs Roadmap Integration (New Feature)

### Overview

The Google Docs Roadmap integration allows instructors and admins to create personalized curriculum roadmaps in Google Docs and assign them to individual students. This provides a flexible, instructor-controlled alternative to the automated roadmap system.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Google Cloud Platform                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Service Account: toku-web-doc-reader              │  │
│  │  Email: ...@toku-web-doc-storage.iam.gserviceacc  │  │
│  │  Permissions: Read-only access to shared docs     │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         │ Google Docs API (read-only)
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Instructor's Google Doc                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Title: "John Doe's Learning Roadmap"             │  │
│  │  Shared with: Service Account Email               │  │
│  │  Document ID: 1AkKlxCz5F2Zi...                    │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         │ Assigned via Admin UI
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Database (User Table)                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │  User: John Doe (STUDENT)                         │  │
│  │  roadmapDocumentId: "1AkKlxCz5F2Zi..."            │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         │ Student views /student/curriculum
                         ▼
┌─────────────────────────────────────────────────────────┐
│           Student Curriculum Page                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │  1. Fetch user's roadmapDocumentId                │  │
│  │  2. Call Google Docs API via service account     │  │
│  │  3. Convert Doc structure to HTML                │  │
│  │  4. Render with Tailwind styling                 │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/googleDocs.ts` | Google Docs API client and HTML converter |
| `src/app/api/roadmap/document/route.ts` | Student endpoint to fetch assigned doc |
| `src/app/api/admin/students/[studentId]/roadmap-document/route.ts` | Admin endpoint to assign docs |
| `src/app/admin/students/page.tsx` | Admin UI with "Configure" button |
| `src/app/student/curriculum/page.tsx` | Student view of assigned curriculum |
| `src/app/roadmap/page.tsx` | Public roadmap page (interactive) |

### Setup Instructions

1. **Google Cloud Setup**:
   ```bash
   # 1. Create project in Google Cloud Console
   # 2. Enable Google Docs API
   # 3. Create service account
   # 4. Download JSON credentials
   ```

2. **Environment Variables**:
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL=account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

3. **Share Documents**:
   - Open Google Doc
   - Click "Share"
   - Add service account email
   - Set permission: "Viewer"

### Admin Workflow

1. Navigate to `/admin/students`
2. Find student in table
3. Click "Configure" button (or "View" if already assigned)
4. Enter Google Doc ID in modal
5. Click "Save"

**Google Doc ID Extraction**:
```
URL: https://docs.google.com/document/d/1AkKlxCz5F2ZihNYQuQ9XP-TAVBWP84h5Hh9flVJ4a8I/edit
ID:  1AkKlxCz5F2ZihNYQuQ9XP-TAVBWP84h5Hh9flVJ4a8I
```

### Student Experience

1. Student logs in
2. Navigates to `/student/curriculum`
3. System checks if `roadmapDocumentId` is assigned
4. If assigned:
   - Fetches document via Google Docs API
   - Converts to HTML
   - Displays formatted content
5. If not assigned:
   - Shows message to contact instructor

### API Endpoints

#### PUT `/api/admin/students/[studentId]/roadmap-document`
Assigns a Google Doc to a student.

**Request**:
```json
{
  "roadmapDocumentId": "1AkKlxCz5F2ZihNYQuQ9XP-TAVBWP84h5Hh9flVJ4a8I"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Roadmap document assigned successfully",
  "student": {
    "id": "cm1abc123",
    "email": "student@example.com",
    "name": "John Doe",
    "roadmapDocumentId": "1AkKlxCz5F2ZihNYQuQ9XP-TAVBWP84h5Hh9flVJ4a8I"
  }
}
```

#### GET `/api/admin/students/[studentId]/roadmap-document`
Retrieves student's assigned roadmap document ID.

#### GET `/api/roadmap/document`
Student endpoint to fetch their assigned document content.

**Response**:
```json
{
  "success": true,
  "title": "John Doe's Learning Roadmap",
  "content": "<h1>...</h1><p>...</p>",
  "documentId": "1AkKlxCz5F2ZihNYQuQ9XP-TAVBWP84h5Hh9flVJ4a8I",
  "lastModified": "123456"
}
```

### Important: Clerk ID vs Database ID

The API routes accept **both** Clerk IDs and database IDs for the `studentId` parameter:

- **Clerk ID**: `user_abc123` (from admin UI)
- **Database ID**: `cm1abc123` (internal)

Routes use `findFirst` with `OR` condition to support both:

```typescript
const student = await prisma.user.findFirst({
  where: {
    OR: [
      { id: studentId },       // Database ID
      { clerkId: studentId },  // Clerk ID
    ],
  },
});
```

This ensures compatibility when the admin UI passes Clerk IDs.

### HTML Conversion

The `convertGoogleDocToHTML()` function supports:

✅ **Supported**:
- Headings (H1-H4)
- Paragraphs
- Bold, italic, underline
- Hyperlinks (with security attributes)
- Tables
- Line breaks

❌ **Not Yet Supported**:
- Images
- Ordered/unordered lists
- Text colors
- Background colors
- Advanced table styling
- Footnotes

### Security Considerations

1. **Read-Only Access**: Service account has `documents.readonly` scope
2. **Link Security**: External links include `rel="noopener noreferrer"`
3. **Input Validation**: Document ID format is validated with regex
4. **Role Checking**: Only ADMIN and INSTRUCTOR can assign documents
5. **Student Privacy**: Students can only view their own assigned document

### Future Enhancements

- Support for images and lists in HTML conversion
- Version tracking (track when document was last updated)
- Document templates for common roadmap types
- Bulk assignment interface
- Document preview in admin UI
- Real-time collaboration tracking

---

## Summary

Signal Works LMS is a comprehensive learning platform with:

- **Frontend**: Next.js 14 with React 18, TypeScript, Tailwind CSS
- **Backend**: API routes with Prisma ORM, PostgreSQL
- **Authentication**: Clerk integration with role-based access
- **AI Integration**: Claude for tutoring, Voyage AI for embeddings
- **Assessment**: 27-step adaptive assessment with mastery tracking

**Python can extend capabilities** in:
- Advanced analytics and reporting
- ML-based skill prediction
- Code quality analysis
- Personalized recommendations
- Local embedding generation
- Data pipeline orchestration

The modular architecture supports easy integration of a Python microservice for data-intensive operations while keeping the user-facing application in the Node.js ecosystem.
