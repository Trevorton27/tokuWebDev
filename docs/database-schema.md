# Database Schema Documentation

## Overview

The Signal Works LMS database schema is organized into three primary domains: User Authentication, Learning Management System (LMS), Assessment System, and Knowledge RAG. The schema uses PostgreSQL with Prisma ORM and supports a comprehensive adaptive learning platform with AI-powered features.

## Domain: User & Authentication

### User Model

The `User` model is the central entity representing all platform users, including students, instructors, and administrators.

**Core Fields:**
- `id`: Unique identifier using CUID for distributed systems compatibility
- `email`: Unique email address for authentication and communication
- `password`: Hashed password for secure authentication
- `role`: Enum defining user type (STUDENT, INSTRUCTOR, ADMIN)
- `avatarUrl`: Optional profile picture URL

**Relationships:**
- Creates courses (instructors/admins only)
- Enrolls in courses (students)
- Records challenge attempts and mastery events
- Links to all user-generated content and progress tracking

**Indexes:** Email is indexed for fast authentication lookups.

## Domain: Learning Management System (LMS)

### Course Model

Represents structured learning content created by instructors.

**Core Fields:**
- `title`: Course name
- `description`: Detailed course overview
- `thumbnailUrl`: Course image for catalog display
- `instructorId`: Creator and owner of the course
- `published`: Visibility flag - only published courses appear to students

**Functionality:**
- Courses are containers for sequential lessons
- Tracks creation and modification timestamps
- Supports multiple enrollments from different students
- Cascade deletion removes all related lessons and enrollments when deleted

**Business Logic:**
- Draft courses (published=false) are only visible to instructors
- Published courses appear in the student catalog
- Instructors can update content while maintaining enrollments

**Indexes:** Optimized for filtering by instructor and publication status.

### Lesson Model

Individual learning units within a course, presented in sequential order.

**Core Fields:**
- `courseId`: Parent course reference
- `title`: Lesson name
- `content`: Rich text or markdown content
- `order`: Sequence position (1, 2, 3, etc.)
- `videoUrl`: Optional video content link
- `duration`: Estimated completion time in minutes

**Functionality:**
- Lessons are ordered sequentially within courses
- Supports multimedia content (text, video)
- Can be linked to knowledge base documents for RAG
- Cascade deletion when parent course is removed

**Design Considerations:**
- Order field enables custom sequencing and reordering
- Large text content stored efficiently in PostgreSQL TEXT type
- Optional video integration for blended learning

**Indexes:** Composite index on courseId and order for efficient sequential access.

### Enrollment Model

Tracks student participation and progress in courses.

**Core Fields:**
- `userId`: Student enrolled in the course
- `courseId`: Course the student is taking
- `enrolledAt`: Timestamp of enrollment
- `completedAt`: Optional completion timestamp
- `progress`: Percentage completion (0-100)

**Functionality:**
- Prevents duplicate enrollments (unique constraint on userId + courseId)
- Tracks completion timeline from enrollment to finish
- Progress updates enable resume functionality
- Cascade deletion when user or course is removed

**Business Logic:**
- Students can only enroll once per course
- Progress automatically calculated based on lesson completion
- Completion timestamp set when progress reaches 100%

**Indexes:** Optimized for user dashboard queries and course analytics.

## Domain: Assessment System

### Challenge Model

Coding exercises with automated testing and adaptive difficulty.

**Core Fields:**
- `slug`: URL-friendly unique identifier
- `title` & `description`: Challenge presentation
- `difficulty`: BEGINNER, INTERMEDIATE, or ADVANCED
- `language`: Programming language (JavaScript, Python, Java, C++, TypeScript, Go, Rust)
- `starterCode`: Initial code template
- `solution`: Reference implementation
- `tags`: Skill categories (arrays, loops, recursion)
- `hints`: Progressive help system

**Functionality:**
- Challenges are filterable by difficulty, language, and tags
- Support multiple programming languages
- Include starter code to reduce friction
- Tag-based system enables adaptive recommendations

**Design Considerations:**
- Slug enables SEO-friendly URLs
- Tags power the adaptive learning algorithm
- Hints support scaffolded learning

**Indexes:** Optimized for filtering by difficulty and language.

### TestCase Model

Automated validation criteria for challenge solutions.

**Core Fields:**
- `challengeId`: Parent challenge reference
- `input`: Test input data
- `expectedOutput`: Correct output
- `isHidden`: Visibility flag (hidden tests prevent gaming)
- `weight`: Scoring importance (enables partial credit)

**Functionality:**
- Enables automated code evaluation
- Hidden test cases prevent solution hardcoding
- Weighted scoring for nuanced assessment
- Cascade deletion with parent challenge

**Business Logic:**
- Visible tests help students understand requirements
- Hidden tests validate edge cases and completeness
- Weights enable complex scoring strategies

### Attempt Model

Records of student challenge submissions and performance.

**Core Fields:**
- `userId` & `challengeId`: Student and challenge identification
- `code`: Submitted solution
- `passed`: Binary success indicator
- `score`: Percentage score (0-100)
- `timeSpent`: Duration in seconds
- `hintsUsed`: Number of hints accessed
- `attemptedAt`: Submission timestamp

**Functionality:**
- Complete submission history for analytics
- Tracks performance metrics beyond pass/fail
- Enables learning pattern analysis
- Cascade deletion with user or challenge removal

**Analytics Applications:**
- Time-to-solution analysis
- Hint effectiveness measurement
- Retry pattern identification
- Skill progression tracking

**Indexes:** Optimized for user history, challenge analytics, and temporal queries.

### MasteryEvent Model

Granular tracking of skill development and learning events.

**Core Fields:**
- `userId`: Student being tracked
- `skillTag`: Specific skill (matches challenge tags)
- `event`: Event type (ATTEMPT, SUCCESS, FAILURE, HINT)
- `metadata`: Additional context (JSON)
- `timestamp`: Event occurrence time

**Functionality:**
- Powers adaptive recommendation algorithm
- Tracks skill-level proficiency over time
- Enables intervention triggers (e.g., struggling detection)
- Supports learning analytics and research

**Adaptive Learning:**
- SUCCESS events increase skill proficiency
- FAILURE events identify weak areas
- ATTEMPT frequency indicates engagement
- HINT usage suggests difficulty calibration needs

**Indexes:** Composite index on userId + skillTag for proficiency calculations, timestamp for temporal analysis.

## Domain: Knowledge RAG (Retrieval-Augmented Generation)

### Document Model

Source content for the AI knowledge base.

**Core Fields:**
- `title`: Document name
- `content`: Full document text
- `type`: Content category (LESSON, DOCUMENTATION, SOLUTION, ARTICLE, DISCUSSION)
- `sourceUrl`: Original location reference
- `metadata`: Flexible JSON for additional attributes
- `lessonId`: Optional link to lesson content

**Functionality:**
- Centralizes knowledge base content
- Supports multiple content types
- Enables bidirectional lesson integration
- Tracks creation and updates

**RAG Integration:**
- Documents are chunked and embedded for semantic search
- Type classification enables filtered retrieval
- Metadata supports advanced search criteria

**Indexes:** Type-based filtering for targeted searches.

### DocumentChunk Model

Segmented document pieces with vector embeddings for semantic search.

**Core Fields:**
- `documentId`: Parent document reference
- `content`: Text segment
- `chunkIndex`: Position in original document
- `embedding`: Vector representation (Float array)
- `metadata`: Chunk-specific context

**Functionality:**
- Enables semantic similarity search
- Supports efficient retrieval at scale
- Maintains document context through indexing
- Powers RAG-based AI tutor responses

**Vector Search:**
- Embeddings generated via Voyage AI
- Cosine similarity for relevance ranking
- Can integrate with pgvector for optimized queries
- Chunk size (~500 tokens) balances context and precision

**Technical Considerations:**
- Float array stores 1024-dimensional vectors (Voyage-2)
- Production deployments should use pgvector extension
- Indexing strategy critical for search performance

## Relationships & Data Integrity

**Cascade Deletion:**
- Removing a user deletes all enrollments, attempts, and mastery events
- Removing a course deletes lessons, enrollments, and linked documents
- Removing a challenge deletes test cases and attempts
- Removing a document deletes all chunks

**Referential Integrity:**
- Foreign key constraints enforce valid relationships
- Unique constraints prevent duplicate enrollments
- Indexes optimize common query patterns

## Schema Design Principles

1. **Domain Separation**: Clear boundaries between LMS, Assessment, and Knowledge domains
2. **Audit Trail**: Timestamps on all entities for compliance and analytics
3. **Soft State**: Progress and mastery calculated from immutable events
4. **Scalability**: Indexed for common queries, extensible metadata fields
5. **AI-Ready**: Tags and embeddings support machine learning features

This schema supports a comprehensive adaptive learning platform with automated assessment, AI-powered tutoring, and data-driven personalization.
