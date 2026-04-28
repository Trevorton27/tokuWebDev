/**
 * AI Roadmap Generation Service
 *
 * Uses Claude to generate a personalized phased learning roadmap
 * based on the student's completed assessment data.
 */

import Anthropic from '@anthropic-ai/sdk';
import { logger } from '@/lib/logger';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.AI_TUTOR_MODEL || 'claude-sonnet-4-6';

export interface RoadmapResource {
  title: string;
  url: string;
}

export interface RoadmapPhase {
  phase: string;
  duration: string;
  focus: string;
  goals: string[];
  suggestedResources: (RoadmapResource | string)[];
  capstoneProject?: string;
}

export interface RoadmapProject {
  title: string;
  description: string;
  skills: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  isCapstone: boolean;
}

export interface GeneratedRoadmap {
  summary: string;
  totalDuration: string;
  phases: RoadmapPhase[];
  projects: RoadmapProject[];
  firstStep: string;
}

export interface RoadmapInput {
  name: string;
  level: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  learningGoal?: string;
  hobbiesInterests?: string[];
  aiMotivation?: string;
  weeklyHours?: string;
  learningStyle?: string;
}

export async function editRoadmapWithAI(
  current: GeneratedRoadmap,
  instruction: string
): Promise<GeneratedRoadmap | null> {
  const prompt = `You are a senior software engineering educator. An admin wants to edit a student's personalized learning roadmap.

CURRENT ROADMAP (JSON):
${JSON.stringify(current, null, 2)}

ADMIN INSTRUCTION:
${instruction}

Apply the admin's instruction to produce an updated roadmap. Keep all fields that were not mentioned unchanged. Preserve the same JSON structure exactly.

Respond with ONLY valid JSON in this exact shape:
{
  "summary": "...",
  "totalDuration": "...",
  "phases": [
    {
      "phase": "...",
      "duration": "...",
      "focus": "...",
      "goals": ["..."],
      "suggestedResources": [{ "title": "...", "url": "..." }],
      "capstoneProject": "..."
    }
  ],
  "projects": [
    {
      "title": "...",
      "description": "...",
      "skills": ["..."],
      "difficulty": "Beginner",
      "isCapstone": false
    }
  ],
  "firstStep": "..."
}`;

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 5000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      logger.error('editRoadmapWithAI: no JSON found in Claude response');
      return null;
    }

    try {
      return JSON.parse(jsonMatch[0]) as GeneratedRoadmap;
    } catch {
      logger.error('editRoadmapWithAI: JSON parse failed');
      return null;
    }
  } catch (err) {
    logger.error('editRoadmapWithAI: Claude API error', err instanceof Error ? err : new Error(String(err)));
    return null;
  }
}

export async function generateRoadmap(input: RoadmapInput): Promise<GeneratedRoadmap | null> {
  const hobbiesLine = input.hobbiesInterests?.length
    ? `Hobbies/interests: ${input.hobbiesInterests.join(', ')}`
    : '';
  const motivationLine = input.aiMotivation
    ? `Why they want to learn AI-powered dev: ${input.aiMotivation}`
    : '';
  const weeklyLine = input.weeklyHours
    ? `Available study time: ${input.weeklyHours} hours/week`
    : '';

  const prompt = `You are a senior software engineering educator. Based on the student profile below, generate a personalized phased learning roadmap for AI-powered software development.

STUDENT PROFILE:
- Name: ${input.name}
- Current level: ${input.level}
- Assessment score: ${input.score}%
- Strengths: ${input.strengths.length > 0 ? input.strengths.join(', ') : 'None identified yet'}
- Areas to improve: ${input.weaknesses.length > 0 ? input.weaknesses.join(', ') : 'None identified'}
- Primary goal: ${input.learningGoal || 'Not specified'}
${hobbiesLine}
${motivationLine}
${weeklyLine}

Generate a roadmap with 3-4 phases. Each phase should build on the previous. Tailor everything to their hobbies, interests, personality, and level. Emphasize AI-powered development tools and techniques throughout.

Also generate exactly 5 projects the student should build during the course:
- Projects 1-4: progressively more complex, each building on the previous, aligned to the student's interests and the phase curriculum
- Project 5: a comprehensive AI-powered capstone that integrates everything learned, is the most ambitious of the 5, and is directly tied to their interests/goals

For suggestedResources, include 2-4 real, specific learning resources per phase. Each resource must be a real website or course that actually exists — use well-known platforms such as freeCodeCamp, MDN Web Docs, The Odin Project, Coursera, Udemy, YouTube, official docs (react.dev, nextjs.org, docs.python.org, etc.), or similar. Include the real, correct URL for each resource.

Respond with ONLY valid JSON in this exact shape:
{
  "summary": "One sentence overview of this student's path",
  "totalDuration": "e.g. 4-6 months",
  "phases": [
    {
      "phase": "Phase name",
      "duration": "e.g. 3-4 weeks",
      "focus": "Main skill area",
      "goals": ["Goal 1", "Goal 2", "Goal 3"],
      "suggestedResources": [
        { "title": "Resource name", "url": "https://example.com/path" }
      ],
      "capstoneProject": "Optional project idea tied to their interests"
    }
  ],
  "projects": [
    {
      "title": "Project title",
      "description": "2-3 sentence description of what they will build and why it matters",
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "difficulty": "Beginner",
      "isCapstone": false
    }
  ],
  "firstStep": "Concrete first action they should take today"
}`;

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 5000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('[roadmapService] stop_reason:', message.stop_reason, '| response length:', text.length);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[roadmapService] No JSON found in response. Raw text:', text.substring(0, 500));
      logger.error('roadmapService: no JSON found in Claude response');
      return null;
    }

    let roadmap: GeneratedRoadmap;
    try {
      roadmap = JSON.parse(jsonMatch[0]) as GeneratedRoadmap;
    } catch (parseErr) {
      console.error('[roadmapService] JSON parse failed:', parseErr);
      console.error('[roadmapService] Matched JSON (first 500 chars):', jsonMatch[0].substring(0, 500));
      return null;
    }
    logger.info('roadmapService: roadmap generated', { name: input.name, phases: roadmap.phases.length });
    return roadmap;
  } catch (err) {
    console.error('[roadmapService] Claude API error:', err);
    logger.error('roadmapService: failed to generate roadmap', err instanceof Error ? err : new Error(String(err)), { model: MODEL });
    return null;
  }
}
