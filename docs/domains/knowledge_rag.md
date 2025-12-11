# Knowledge RAG Domain

## Overview
The Knowledge RAG (Retrieval-Augmented Generation) domain provides semantic search and intelligent content retrieval using vector embeddings. It powers the AI tutor with relevant context from documentation, lessons, and solutions.

## Data Models

### Document
```typescript
{
  id: string
  title: string
  content: string
  type: 'lesson' | 'documentation' | 'solution' | 'article'
  sourceUrl?: string
  metadata: JSON  // { author, tags, difficulty, etc. }
  createdAt: Date
  updatedAt: Date
  chunks: DocumentChunk[]
}
```

### DocumentChunk
```typescript
{
  id: string
  documentId: string
  content: string
  chunkIndex: number
  embedding: number[]  // Vector embedding (1536 dimensions for OpenAI)
  metadata: JSON
}
```

### VectorSearch (Query Model)
```typescript
{
  query: string
  filters?: {
    type?: string[]
    tags?: string[]
    difficulty?: string
  }
  limit?: number
  minScore?: number
}
```

## Services

### embeddingService.ts
- `getEmbedding(text)`: Generate vector embedding via OpenAI
- `batchGetEmbeddings(texts[])`: Generate multiple embeddings
- `validateEmbedding(embedding)`: Check dimensions/format

### knowledgeService.ts
- `indexDocument(document)`: Chunk and index document
  - Splits document into semantic chunks
  - Generates embeddings for each chunk
  - Stores in vector database
- `searchKnowledge(query, filters?, limit?)`: Semantic search
  - Generates query embedding
  - Performs cosine similarity search
  - Returns top-K relevant chunks with metadata
- `updateDocument(id, content)`: Re-index document
- `deleteDocument(id)`: Remove from index
- `getDocumentById(id)`: Retrieve document + chunks
- `getRelatedDocuments(documentId)`: Find similar content

## API Endpoints

### Document Ingestion
- `POST /api/knowledge/ingest`
  - Body: `{ title, content, type, metadata? }`
  - Chunks, embeds, and stores document

### Semantic Search
- `POST /api/knowledge/search`
  - Body: `{ query, filters?, limit?, minScore? }`
  - Returns: `{ results: [{ content, score, metadata, source }] }`

## Chunking Strategy

### Text Chunking
```typescript
function chunkDocument(content: string, maxChunkSize = 500) {
  // 1. Split by paragraphs or semantic boundaries
  // 2. Maintain chunk size ~500 tokens
  // 3. Include overlap between chunks (50 tokens)
  // 4. Preserve code blocks intact
  // 5. Keep context (headings) in metadata

  return chunks;
}
```

### Example Chunking
```
Original Document: "React Hooks Guide" (2000 words)
  ↓
Chunk 1: Introduction + useState (400 tokens)
Chunk 2: useState + useEffect (450 tokens)  // 50 token overlap
Chunk 3: useEffect + useContext (420 tokens)
Chunk 4: useContext + Custom Hooks (380 tokens)
...
Each chunk embedded separately
```

## Vector Search Process

```
1. User Query: "How do I use async functions in React?"
   ↓
2. Generate query embedding via embeddingService
   ↓
3. Compute cosine similarity with all stored embeddings
   ↓
4. Rank by similarity score
   ↓
5. Filter by threshold (e.g., score > 0.7)
   ↓
6. Return top K results (e.g., K=5)
   ↓
7. Include source metadata for citations
```

## Integration with AI Tutor

```typescript
async function getTutorReply(userId, challengeId, messages) {
  // 1. Extract user's question
  const question = messages[messages.length - 1].content;

  // 2. Get challenge context
  const challenge = await getChallengeBySlug(challengeId);

  // 3. Search knowledge base
  const relevantDocs = await searchKnowledge(question, {
    type: ['lesson', 'documentation'],
    tags: challenge.tags,
    limit: 3
  });

  // 4. Get user's mastery context
  const masteryProfile = await getMasteryProfile(userId);

  // 5. Build prompt with RAG context
  const prompt = buildPrompt({
    question,
    challenge,
    relevantDocs,
    masteryProfile,
    conversationHistory: messages
  });

  // 6. Call LLM (OpenAI)
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
      { role: 'user', content: prompt }
    ]
  });

  // 7. Return response + citations
  return {
    reply: response.choices[0].message.content,
    sources: relevantDocs.map(doc => ({
      title: doc.metadata.title,
      url: doc.metadata.sourceUrl
    }))
  };
}
```

## Vector Database Options

### Option 1: PostgreSQL with pgvector
```sql
CREATE EXTENSION vector;

CREATE TABLE document_chunks (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  content TEXT,
  embedding vector(1536),
  metadata JSONB
);

CREATE INDEX ON document_chunks USING ivfflat (embedding vector_cosine_ops);

-- Query
SELECT content, 1 - (embedding <=> query_embedding) AS score
FROM document_chunks
WHERE 1 - (embedding <=> query_embedding) > 0.7
ORDER BY score DESC
LIMIT 5;
```

### Option 2: Pinecone (External Service)
```typescript
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({ apiKey });
const index = pinecone.index('signal-works-knowledge');

// Index
await index.upsert([{
  id: chunk.id,
  values: embedding,
  metadata: { content, documentId, type }
}]);

// Search
const results = await index.query({
  vector: queryEmbedding,
  topK: 5,
  includeMetadata: true
});
```

## Embedding Models

### OpenAI text-embedding-3-small
- Dimensions: 1536
- Cost: $0.02 / 1M tokens
- Performance: Fast, high quality

### OpenAI text-embedding-3-large
- Dimensions: 3072
- Cost: $0.13 / 1M tokens
- Performance: Higher accuracy

## Document Types & Sources

### Lesson Content
- Automatically indexed when lesson created
- Type: `lesson`
- Tags: Derived from course/lesson metadata

### Challenge Solutions
- Indexed after admin review
- Type: `solution`
- Tags: Challenge tags + language

### Documentation
- External docs (React, Python, etc.)
- Type: `documentation`
- Manually curated or scraped

### User-Generated
- Forum discussions (future)
- Type: `discussion`
- Community-sourced knowledge

## Search Optimization

### Hybrid Search (Future)
```typescript
async function hybridSearch(query) {
  // 1. Vector similarity search
  const vectorResults = await vectorSearch(query);

  // 2. Keyword search (BM25)
  const keywordResults = await fullTextSearch(query);

  // 3. Merge and re-rank
  return mergeResults(vectorResults, keywordResults);
}
```

### Caching Strategy
- Cache popular queries (Redis)
- Cache embeddings for common questions
- Invalidate on document updates

## Future Enhancements
- Multi-modal embeddings (code + text + images)
- User feedback on search relevance
- Personalized search (user history)
- Real-time document updates
- Cross-lingual search
- Graph-based knowledge connections
