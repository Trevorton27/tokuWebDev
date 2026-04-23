import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

/**
 * POST /api/ai/generate-project
 * Generates a personalized project brief using Anthropic Claude 3.5 Sonnet
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await requireAuth();
    
    // Fetch user interests and skill masteries to identify weak areas
    const user = await prisma.user.findUnique({
        where: { id: authUser.id },
        include: {
            skillMasteries: {
                where: { mastery: { lt: 0.6 } },
                orderBy: { mastery: 'asc' },
                take: 5
            }
        }
    });

    if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const interests = user.interests.length > 0 ? user.interests.join(', ') : 'General Web Development';
    const weakSkills = user.skillMasteries.length > 0 
        ? user.skillMasteries.map(s => s.skillKey).join(', ') 
        : 'Advanced React patterns, System Architecture'; // Default if no weak skills found (e.g. new user)

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    const systemPrompt = `You are an expert coding mentor. Generate a personalized side-project for a student.
    Return ONLY valid JSON. No markdown formatting, no explanations.
    Structure:
    {
        "title": "Project Title",
        "description": "Brief description connecting to student interests",
        "techStack": ["Tech 1", "Tech 2"],
        "difficulty": "Beginner" | "Intermediate" | "Advanced",
        "milestones": [
            { "title": "Milestone 1", "description": "Details" }
        ]
    }`;

    const userPrompt = `Student Interests: [${interests}]
    Areas to Improve (Weak Skills): [${weakSkills}]
    
    Generate a project that combines their interests with practicing their weak skills.`;

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }]
      // Removed duplicate 'messages' key and pre-fill trick as it complicates the array structure
    });

    // Handle response content
    let content = '';
    if (msg.content[0].type === 'text') {
        content = msg.content[0].text;
    }

    // Attempt to parse JSON (handling potential markdown fences just in case)
    const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
    const projectBrief = JSON.parse(jsonStr);

    return NextResponse.json({ success: true, project: projectBrief });

  } catch (error: any) {
    console.error('Project Generation Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate project' },
      { status: 500 }
    );
  }
}
