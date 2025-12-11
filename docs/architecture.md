# System Architecture

## Overview

Signal Works LMS is a modern learning management system built with Next.js 14+ that integrates three core domains:

1. **LMS (Learning Management System)**: Course and lesson management with enrollment tracking
2. **Assessment System**: Adaptive coding challenges with AI tutoring and mastery tracking
3. **Knowledge RAG**: Semantic search and document indexing for intelligent content retrieval

## Tech Stack

### Frontend
- **Next.js 14+**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **React**: UI components

### Backend
- **Next.js API Routes**: RESTful API endpoints
- **Prisma**: Database ORM and migrations
- **PostgreSQL**: Primary database

### External Services
- **JDoodle API**: Code execution sandbox
- **OpenAI API**: Embeddings and AI tutoring
- **Vector Database**: Knowledge embeddings storage (optional: Pinecone or PostgreSQL pgvector)

## Architecture Patterns

### Domain-Driven Design
The application is organized into three main domains:
- `src/server/lms/`: LMS business logic
- `src/server/assessment/`: Assessment and adaptive learning logic
- `src/server/knowledge/`: RAG and semantic search logic

### Separation of Concerns
- **UI Layer** (`src/modules/`): React components organized by domain
- **Service Layer** (`src/server/`): Business logic and data access
- **API Layer** (`src/app/api/`): HTTP endpoints and request handling
- **Data Layer** (`prisma/`): Database schema and migrations

### Client-Server Communication
- API routes handle HTTP requests and validation
- Services contain reusable business logic
- Client-side components use API client wrappers from `src/lib/`

## Data Flow

1. User interacts with UI components in `src/modules/`
2. Components call API client functions from `src/lib/`
3. API routes in `src/app/api/` receive requests
4. Routes delegate to service layer in `src/server/`
5. Services interact with database via Prisma
6. Services may call external APIs (JDoodle, OpenAI)
7. Response flows back through the layers

## Security Considerations

- Authentication middleware protects routes
- Input validation using Zod schemas
- Environment variables for sensitive configuration
- Secure code execution via JDoodle sandbox
- Rate limiting on AI API calls (TODO)

## Scalability

- Stateless API design for horizontal scaling
- Database connection pooling via Prisma
- Caching strategies for frequently accessed data (TODO)
- Vector search optimization for knowledge retrieval

## Deployment

- Next.js can be deployed to Vercel, Railway, or any Node.js host
- PostgreSQL database required
- Environment variables configured per environment
- Prisma migrations run on deployment
