# Signal Works LMS

A modern, AI-powered Learning Management System with adaptive assessment and intelligent tutoring capabilities.

## Features

### Core LMS
- Course and lesson management
- Student enrollment and progress tracking
- Rich content delivery (text, video, markdown)
- Instructor dashboard (planned)

### Adaptive Assessment
- Coding challenge system with multi-language support
- Personalized challenge recommendations based on skill level
- Real-time code execution via JDoodle API
- Mastery tracking and skill proficiency analysis
- Adaptive difficulty adjustment

### AI Tutoring
- Context-aware AI tutor powered by Claude (Anthropic)
- Retrieval-Augmented Generation (RAG) for accurate responses
- Progressive hint system
- Source citations from knowledge base
- Adaptive explanations based on student level

### Knowledge RAG
- Semantic search across documentation and lessons
- Vector embeddings for intelligent content retrieval
- Document indexing and chunking
- Multi-modal knowledge base (lessons, docs, solutions)

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Anthropic Claude API (Chat & Reasoning)
- **Embeddings**: Voyage AI (Vector embeddings)
- **Code Execution**: JDoodle API
- **Vector Search**: PostgreSQL pgvector or Pinecone

## Project Structure

```
signal-works-lms/
├── docs/                    # Architecture and domain documentation
├── prisma/                  # Database schema and migrations
├── public/                  # Static assets
├── src/
│   ├── app/                # Next.js App Router pages and API routes
│   ├── lib/                # Utilities and client wrappers
│   ├── modules/            # UI components organized by domain
│   ├── server/             # Business logic services
│   └── styles/             # Global styles
└── tests/                  # Test files
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- Anthropic API key (for AI tutoring)
- Voyage AI API key (for embeddings)
- JDoodle API credentials (for code execution)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd signal-works-lms
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - `DATABASE_URL`: PostgreSQL connection string
   - `ANTHROPIC_API_KEY`: Your Anthropic API key
   - `EMBEDDINGS_API_KEY`: Your Voyage AI API key (for embeddings)
   - `JDOODLE_CLIENT_ID` & `JDOODLE_CLIENT_SECRET`: JDoodle credentials
   - Authentication settings (depending on provider)

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Optional: PostgreSQL pgvector Setup

For production-grade vector search:

```sql
CREATE EXTENSION vector;
```

Update the DocumentChunk model in `prisma/schema.prisma` to use pgvector types.

## Development

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
```

### Database Commands

```bash
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
```

### Building for Production

```bash
npm run build
npm start
```

## Architecture

### Domain-Driven Design

The application is organized into three main domains:

1. **LMS Domain** (`src/server/lms/`)
   - Course management
   - Lesson delivery
   - Enrollment tracking

2. **Assessment Domain** (`src/server/assessment/`)
   - Challenge management
   - Code execution
   - Mastery tracking
   - Adaptive recommendations
   - AI tutoring

3. **Knowledge RAG Domain** (`src/server/knowledge/`)
   - Document indexing
   - Semantic search
   - Embedding generation

### Key Design Patterns

- **Service Layer**: Business logic separated from API routes
- **Client Wrappers**: Type-safe API clients for frontend
- **Separation of Concerns**: Clear boundaries between UI, API, and business logic
- **Repository Pattern**: Prisma as data access layer

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

## Configuration

### Authentication

Currently uses placeholder auth. To implement:

1. Choose an auth provider (NextAuth.js, Clerk, Auth0, etc.)
2. Update `src/lib/auth.ts` with provider-specific logic
3. Add provider configuration to environment variables
4. Implement login/signup UI in `src/app/(public)/login/page.tsx`

### External Services

#### JDoodle (Code Execution)
- Sign up at [jdoodle.com](https://www.jdoodle.com/)
- Get API credentials
- Add to `.env`

#### Anthropic (AI Tutoring)
- Get API key from [console.anthropic.com](https://console.anthropic.com/)
- Add `ANTHROPIC_API_KEY` to `.env`
- Configure model in `AI_TUTOR_MODEL` environment variable
- Default model: `claude-3-5-sonnet-latest`

#### Voyage AI (Embeddings)
- Get API key from [voyageai.com](https://www.voyageai.com/)
- Add `EMBEDDINGS_API_KEY` to `.env`
- Configure model in `EMBEDDINGS_MODEL` environment variable
- Default model: `voyage-2`
- Note: Anthropic does not provide embeddings, so we use Voyage AI as recommended partner

#### Vector Database (Optional)
- **PostgreSQL pgvector**: Free, self-hosted
- **Pinecone**: Managed service, easier setup
- See [docs/domains/knowledge_rag.md](docs/domains/knowledge_rag.md) for setup

## API Documentation

### LMS API

- `GET /api/lms/courses` - List all courses
- `GET /api/lms/courses/[id]` - Get course details
- `POST /api/lms/courses` - Create course (auth required)
- `GET /api/lms/enrollments` - Get user enrollments
- `POST /api/lms/enrollments` - Enroll in course

### Assessment API

- `GET /api/assessment/challenges` - List challenges (with filters)
- `GET /api/assessment/challenges/[slug]` - Get challenge details
- `POST /api/assessment/run-code` - Execute code
- `POST /api/assessment/mastery` - Record attempt
- `GET /api/assessment/recommendations` - Get personalized challenges
- `POST /api/assessment/chat` - AI tutor chat

### Knowledge API

- `POST /api/knowledge/search` - Semantic search
- `POST /api/knowledge/ingest` - Index document (admin only)

## Roadmap

### Phase 1: MVP (Current)
- [x] Core LMS functionality
- [x] Basic assessment system
- [x] AI tutor integration
- [x] Knowledge RAG foundation
- [ ] Authentication implementation
- [ ] Sample courses and challenges

### Phase 2: Enhancement
- [ ] Advanced analytics dashboard
- [ ] Peer code review
- [ ] Discussion forums
- [ ] Certificates and badges
- [ ] Mobile responsive optimization

### Phase 3: Scale
- [ ] Multi-tenancy support
- [ ] Advanced adaptive algorithms
- [ ] Collaborative features
- [ ] Integration marketplace
- [ ] Performance optimization

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For questions and support:
- Create an issue in the repository
- Check the [documentation](docs/)
- Review the [system flow](docs/system-flow.md)

## Acknowledgments

- Next.js team for the amazing framework
- Anthropic for Claude AI capabilities
- Voyage AI for embeddings
- Prisma for the excellent ORM
- JDoodle for code execution API
# signal-works-lms
