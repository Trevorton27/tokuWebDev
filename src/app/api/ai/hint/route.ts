import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

/**
 * POST /api/ai/hint
 * Generates a hint for a coding challenge using AI (Mocked for now)
 */
export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const body = await req.json();
    const { code, problemDescription, language } = body;

    // Simulate AI Latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple heuristic to generate "smart" mock hints
    let hint = "Try breaking the problem down into smaller steps.";
    
    // TODO: Implement Anthropic API Call
    // 
    // import Anthropic from '@anthropic-ai/sdk';
    // const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    //
    // const msg = await anthropic.messages.create({
    //   model: "claude-3-5-sonnet-20241022",
    //   max_tokens: 300,
    //   messages: [{
    //     role: "user", 
    //     content: `You are a coding tutor. The student is solving: "${problemDescription}".
    //               Their current code is: \n${code}\n.
    //               Provide a helpful, Socratic hint (max 2 sentences) that points them in the right direction without giving the answer.`
    //   }]
    // });
    // hint = msg.content[0].text;

    if (code.includes('function') && !code.includes('return')) {
        hint = "It looks like your function might be missing a return statement.";
    } else if (problemDescription.toLowerCase().includes('array') && !code.includes('map') && !code.includes('filter')) {
        hint = "Consider using array methods like map() or filter() to process the data.";
    } else if (code.length < 50) {
        hint = "You're just getting started! Remember to define your variables first.";
    }

    return NextResponse.json({ success: true, hint });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate hint' },
      { status: 500 }
    );
  }
}
