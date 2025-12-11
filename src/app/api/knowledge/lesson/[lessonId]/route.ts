import { NextResponse } from 'next/server';
import { getLessonContextChunks } from '@/server/knowledge/knowledgeService';

export async function GET(
  _req: Request,
  { params }: { params: { lessonId: string } }
) {
  const chunks = await getLessonContextChunks(params.lessonId);
  return NextResponse.json({ chunks });
}
