import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getSessionSummary } from '@/server/assessment/intakeService';
import { getStepById } from '@/server/assessment/intakeConfig';
import { sendAssessmentEmails } from '@/server/assessment/emailService';
import { generateRoadmap } from '@/server/assessment/roadmapService';
import { generateRoadmapPdf } from '@/server/assessment/roadmapPdf';
import { createAndSendInvite } from '@/lib/consultation';

/**
 * POST /api/assessment/intake/finalize
 *
 * Explicitly sends assessment result emails for the current user's most recent
 * completed or in-progress session. Called from the summary page CTA.
 */
export async function POST() {
  try {
    const user = await requireAuth();

    // Find the most recent session (completed or in-progress)
    const session = await prisma.assessmentSession.findFirst({
      where: { userId: user.id, sessionType: 'INTAKE' },
      orderBy: { startedAt: 'desc' },
      include: { responses: { orderBy: { submittedAt: 'asc' } } },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: 'No assessment session found' }, { status: 404 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, email: true },
    });

    if (!dbUser?.email) {
      return NextResponse.json({ success: false, error: 'User email not found' }, { status: 400 });
    }

    const summary = await getSessionSummary(session.id);
    if (!summary) {
      return NextResponse.json({ success: false, error: 'Could not build session summary' }, { status: 500 });
    }

    const { profileSummary } = summary;
    const overallPct = Math.round(profileSummary.overallScore * 100);
    const level =
      profileSummary.overallScore >= 0.8 ? 'Advanced'
      : profileSummary.overallScore >= 0.6 ? 'Proficient'
      : profileSummary.overallScore >= 0.4 ? 'Developing'
      : 'Beginner';

    const assessed = profileSummary.dimensions.filter((d) => d.assessedRatio > 0);
    const strengths = assessed.filter((d) => d.score >= 0.7).map((d) => `${d.label} (${Math.round(d.score * 100)}%)`);
    const weaknesses = assessed.filter((d) => d.score < 0.4).map((d) => `${d.label} (${Math.round(d.score * 100)}%)`);

    const weakAreas = assessed.filter((d) => d.score < 0.4).sort((a, b) => a.score - b.score);
    const recommendations: string[] = [];
    if (weakAreas.length > 0) {
      recommendations.push(`Focus on strengthening your ${weakAreas[0].label} skills first`);
    }
    recommendations.push(
      profileSummary.overallScore >= 0.6
        ? 'You have a solid foundation — consider tackling a capstone project'
        : 'Start with the fundamentals and build up your skills progressively'
    );
    recommendations.push('Our team will reach out soon to discuss your personalized learning plan');

    const answers = session.responses
      .filter((r) => {
        const raw = r.rawAnswer as any;
        return !raw?._skipped && !raw?._noIdea;
      })
      .map((r) => {
        const stepConfig = getStepById(r.stepId);
        const raw = r.rawAnswer as any;
        const answerText =
          typeof raw === 'string'
            ? raw
            : typeof raw?.answer === 'string'
              ? raw.answer
              : JSON.stringify(raw);
        return {
          questionId: r.stepId,
          question: stepConfig?.title ?? r.stepId,
          answer: answerText,
          category: stepConfig?.kind,
        };
      });

    // Extract personalisation fields from questionnaire responses
    const backgroundRaw = (session.responses.find((r) => r.stepId === 'background_experience')?.rawAnswer as any) ?? {};
    const learningGoal: string | undefined = backgroundRaw?.learning_goal;

    const interestsRaw = (session.responses.find((r) => r.stepId === 'interests_preferences')?.rawAnswer as any) ?? {};
    const primaryInterests: string[] = Array.isArray(interestsRaw?.primary_interest) ? interestsRaw.primary_interest : [];
    const appExcitement: string | undefined = interestsRaw?.app_excitement;
    const industryInterests: string | undefined = interestsRaw?.industry_interests;
    const hobbiesInterests: string[] = [
      ...primaryInterests,
      ...(appExcitement ? [appExcitement] : []),
      ...(industryInterests ? [industryInterests] : []),
    ];

    const styleRaw = (session.responses.find((r) => r.stepId === 'learning_style_preferences')?.rawAnswer as any) ?? {};
    const learningStyle: string | undefined = styleRaw?.learning_method;
    const aiMotivation: string | undefined = styleRaw?.motivation_source;

    const commitmentRaw = (session.responses.find((r) => r.stepId === 'commitment_goals')?.rawAnswer as any) ?? {};
    const weeklyHours: string | undefined = commitmentRaw?.weekly_hours;

    // Generate AI roadmap
    const roadmap = await generateRoadmap({
      name: dbUser.name || 'Student',
      level,
      score: overallPct,
      strengths,
      weaknesses,
      learningGoal,
      hobbiesInterests,
      aiMotivation,
      weeklyHours,
      learningStyle,
    });

    if (!roadmap) {
      logger.error('finalize: generateRoadmap returned null — roadmap will be omitted from email', {
        userId: user.id,
      });
    }

    const proposedRoadmap = roadmap?.phases;
    if (roadmap) {
      recommendations.unshift(`First step: ${roadmap.firstStep}`);
    }

    // Persist roadmap to DB
    let roadmapId: string | undefined;
    if (roadmap) {
      try {
        const saved = await prisma.assessmentRoadmap.upsert({
          where: { sessionId: session.id },
          create: {
            userId: user.id,
            sessionId: session.id,
            level,
            score: overallPct,
            summary: roadmap.summary,
            totalDuration: roadmap.totalDuration,
            firstStep: roadmap.firstStep,
            phases: roadmap.phases as any,
            projects: roadmap.projects as any,
          },
          update: {
            level,
            score: overallPct,
            summary: roadmap.summary,
            totalDuration: roadmap.totalDuration,
            firstStep: roadmap.firstStep,
            phases: roadmap.phases as any,
            projects: roadmap.projects as any,
            generatedAt: new Date(),
          },
        });
        roadmapId = saved.id;
        logger.info('finalize: roadmap persisted to DB', { userId: user.id, roadmapId });
      } catch (dbErr) {
        logger.error('finalize: failed to persist roadmap to DB', dbErr instanceof Error ? dbErr : new Error(String(dbErr)), { userId: user.id });
      }
    }

    // Generate PDF attachment
    let roadmapPdf: Buffer | undefined;
    if (roadmap) {
      try {
        roadmapPdf = await generateRoadmapPdf(dbUser.name || 'Student', roadmap);
        logger.info('finalize: roadmap PDF generated', { userId: user.id, bytes: roadmapPdf.length });
      } catch (pdfErr) {
        logger.error('finalize: failed to generate roadmap PDF', pdfErr, { userId: user.id });
      }
    }

    const error = await sendAssessmentEmails({
      name: dbUser.name || 'Student',
      email: dbUser.email,
      score: overallPct,
      level,
      summary: roadmap?.summary ?? `Completed ${profileSummary.totalSkillsAssessed} of ${profileSummary.totalSkills} skill areas. Overall score: ${overallPct}% (${level}).`,
      strengths: strengths.length > 0 ? strengths : undefined,
      weaknesses: weaknesses.length > 0 ? weaknesses : undefined,
      recommendations,
      proposedRoadmap,
      answers,
      roadmapId,
    }, roadmapPdf);

    if (error) {
      logger.error('finalize: sendAssessmentEmails failed', { error, userId: user.id });
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    logger.info('finalize: emails sent successfully', { userId: user.id, sessionId: session.id });

    // Await invite so it completes before the function terminates on Vercel
    try {
      await createAndSendInvite(dbUser.name ?? undefined, dbUser.email, 'assessment');
      logger.info('finalize: consultation invite sent', { userId: user.id });
    } catch (inviteErr) {
      logger.error('finalize: consultation invite failed', inviteErr instanceof Error ? inviteErr : new Error(String(inviteErr)), { userId: user.id });
    }

    return NextResponse.json({ success: true, roadmapId });
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('POST /api/assessment/intake/finalize failed', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
