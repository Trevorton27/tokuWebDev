/**
 * AI service - AI tutor with RAG integration
 */

import axios from 'axios';
import { logger } from '@/lib/logger';
import type { ChatMessage, TutorResponse } from '@/lib/types';
import { getChallengeById } from './challengeService';
import { getMasteryProfile } from './masteryService';
import { searchKnowledge } from '../knowledge/knowledgeService';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const AI_TUTOR_API_URL =
  process.env.AI_TUTOR_API_URL || 'https://api.anthropic.com/v1/messages';
const AI_TUTOR_MODEL = process.env.AI_TUTOR_MODEL || 'claude-3-5-sonnet-latest';

/**
 * Get AI tutor response with RAG and adaptive context
 */
export async function getTutorReply(
  userId: string,
  challengeId: string,
  messages: ChatMessage[],
  userCode?: string
): Promise<TutorResponse> {
  try {
    // 1. Get challenge context
    const challenge = await getChallengeById(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // 2. Get user's mastery profile for adaptive hints
    const masteryProfile = await getMasteryProfile(userId);

    // 3. Extract latest user question
    const latestMessage = messages[messages.length - 1];
    const question = latestMessage.content;

    // 4. Search knowledge base for relevant content
    const knowledgeResults = await searchKnowledge(question, {
      tags: challenge.tags,
      limit: 3,
    });

    // 5. Build context-rich prompt
    const systemPrompt = buildSystemPrompt(challenge, masteryProfile, knowledgeResults);

    // 6. Check if Anthropic is configured
    if (!ANTHROPIC_API_KEY) {
      logger.warn('Anthropic API key not configured, using mock response');
      return mockTutorResponse(question, knowledgeResults);
    }

    // 7. Call Anthropic Messages API
    // Convert messages to Anthropic format (no system role in messages array)
    const anthropicMessages = [
      ...messages,
      ...(userCode ? [{ role: 'user', content: `My current code:\n\`\`\`\n${userCode}\n\`\`\`` }] : []),
    ];

    const response = await axios.post(
      AI_TUTOR_API_URL,
      {
        model: AI_TUTOR_MODEL,
        system: systemPrompt,  // System prompt is a separate parameter in Anthropic
        messages: anthropicMessages,
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data.content[0].text;

    // 8. Extract sources from knowledge results
    const sources = knowledgeResults.map((result) => ({
      title: result.metadata.title,
      url: result.metadata.sourceUrl,
      type: result.metadata.type,
    }));

    logger.info('AI tutor response generated', { userId, challengeId, messageCount: messages.length });

    return { reply, sources };
  } catch (error) {
    logger.error('AI tutor failed', error, { userId, challengeId });

    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`AI service error: ${error.response.data.error?.message || 'Unknown error'}`);
    }

    throw new Error('Failed to get AI tutor response');
  }
}

/**
 * Build system prompt with context
 */
function buildSystemPrompt(
  challenge: any,
  masteryProfile: any,
  knowledgeResults: any[]
): string {
  const relevantDocs = knowledgeResults.map((r) => r.content).join('\n\n');

  return `You are an expert coding tutor helping a student solve a programming challenge.

Challenge: ${challenge.title}
Difficulty: ${challenge.difficulty}
Topics: ${challenge.tags.join(', ')}
Description: ${challenge.description}

Student's Skill Level:
${formatMasteryProfile(masteryProfile, challenge.tags)}

Relevant Documentation:
${relevantDocs || 'No additional documentation available.'}

Guidelines:
- Provide hints and guidance, not complete solutions
- Adapt explanations to the student's skill level
- Use Socratic questioning to guide learning
- Reference the documentation when helpful
- Encourage independent problem-solving
- Be supportive and constructive
- If student is stuck, break down the problem into smaller steps
`;
}

/**
 * Format mastery profile for context
 */
function formatMasteryProfile(profile: any, relevantTags: string[]): string {
  if (!profile.skills || Object.keys(profile.skills).length === 0) {
    return '- New to these topics (beginner level)';
  }

  const relevant = relevantTags
    .map((tag) => {
      const skill = profile.skills[tag];
      if (!skill) return `- ${tag}: Not yet attempted`;

      const level =
        skill.proficiency < 40 ? 'Beginner' : skill.proficiency < 70 ? 'Intermediate' : 'Advanced';
      return `- ${tag}: ${level} (${skill.proficiency}% proficiency, ${skill.attempts} attempts)`;
    })
    .join('\n');

  return relevant || '- Limited experience with these specific topics';
}

/**
 * Mock tutor response for development
 */
function mockTutorResponse(question: string, knowledgeResults: any[]): TutorResponse {
  const sources = knowledgeResults.map((result) => ({
    title: result.metadata.title,
    url: result.metadata.sourceUrl,
    type: result.metadata.type,
  }));

  return {
    reply: `This is a mock AI tutor response. Configure Anthropic API key for real responses.\n\nYour question: "${question}"\n\nI found ${knowledgeResults.length} relevant resources to help answer your question.`,
    sources,
  };
}
