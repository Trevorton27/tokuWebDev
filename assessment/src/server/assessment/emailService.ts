import { Resend } from 'resend';
import { logger } from '@/lib/logger';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'Signal Works <contact@email.signalworksdesign.com>';
const SUPPORT_EMAIL = 'support@signalworksdesign.com';
const BOOKING_URL = 'https://signalworks.com/book';

// ============================================
// TYPES
// ============================================

export interface RoadmapPhase {
  phase: string;
  focus: string;
  goals: string[];
  suggestedResources?: string[];
}

export interface AppToBuild {
  title: string;
  description: string;
  skillsPracticed: string[];
  difficulty?: string;
}

export interface SubmittedAnswer {
  questionId?: string;
  question: string;
  answer: string;
  category?: string;
}

export interface AssessmentEmailPayload {
  name: string;
  email: string;
  score?: number;
  level?: string;
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  proposedRoadmap?: RoadmapPhase[];
  appsToBuild?: AppToBuild[];
  answers?: SubmittedAnswer[];
  roadmapId?: string;
}

// ============================================
// HELPERS
// ============================================

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function bulletListHtml(items: string[] | undefined, fallback?: string): string {
  if (!items || items.length === 0) {
    return fallback ? `<li style="color:#6b7280">${fallback}</li>` : '';
  }
  return items.map((i) => `<li style="margin-bottom:5px">${esc(i)}</li>`).join('');
}

function bulletListText(items: string[] | undefined, fallback?: string): string {
  if (!items || items.length === 0) return fallback ? `  - ${fallback}` : '';
  return items.map((i) => `  - ${i}`).join('\n');
}

function section(title: string, content: string): string {
  return `
  <h2 style="font-size:15px;font-weight:700;color:#111827;margin:28px 0 10px;padding-bottom:6px;border-bottom:1px solid #e5e7eb">${title}</h2>
  ${content}`;
}

// ============================================
// INTERNAL EMAIL (full report → support)
// ============================================

function buildInternalHtml(p: AssessmentEmailPayload, timestamp: string): string {
  const tdLabel = 'color:#6b7280;font-size:13px;padding:3px 12px 3px 0;white-space:nowrap;vertical-align:top';
  const tdVal = 'color:#111827;font-size:13px;padding:3px 0;font-weight:500';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';
  const roadmapUrl = p.roadmapId ? `${appUrl}/admin/roadmaps/${p.roadmapId}` : null;

  const scoreRow = p.score !== undefined
    ? `<tr><td style="${tdLabel}">Score</td><td style="${tdVal}">${p.score}%</td></tr>` : '';
  const levelRow = p.level
    ? `<tr><td style="${tdLabel}">Level</td><td style="${tdVal}">${esc(p.level)}</td></tr>` : '';

  const roadmapHtml = !p.proposedRoadmap?.length ? '<p style="color:#6b7280">Not provided.</p>' :
    p.proposedRoadmap.map((phase, i) => `
      <div style="margin-bottom:20px;padding:14px 16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px">
        <p style="margin:0 0 4px;font-weight:700;color:#111827">Phase ${i + 1}: ${esc(phase.phase)}</p>
        <p style="margin:0 0 8px;color:#4b5563;font-size:13px"><strong>Focus:</strong> ${esc(phase.focus)}</p>
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#374151">Goals:</p>
        <ul style="margin:0 0 8px;padding-left:18px;color:#4b5563;font-size:13px">
          ${bulletListHtml(phase.goals)}
        </ul>
        ${phase.suggestedResources?.length ? `
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#374151">Resources:</p>
        <ul style="margin:0;padding-left:18px;color:#4b5563;font-size:13px">
          ${bulletListHtml(phase.suggestedResources)}
        </ul>` : ''}
      </div>`).join('');

  const appsHtml = !p.appsToBuild?.length ? '<p style="color:#6b7280">Not provided.</p>' :
    p.appsToBuild.map((app) => `
      <div style="margin-bottom:16px;padding:14px 16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px">
        <p style="margin:0 0 4px;font-weight:700;color:#111827">${esc(app.title)}${app.difficulty ? ` <span style="font-size:12px;font-weight:400;color:#6b7280">(${esc(app.difficulty)})</span>` : ''}</p>
        <p style="margin:0 0 8px;color:#4b5563;font-size:13px">${esc(app.description)}</p>
        <p style="margin:0 0 4px;font-size:12px;color:#6b7280"><strong>Skills:</strong> ${app.skillsPracticed.map(esc).join(', ')}</p>
      </div>`).join('');

  const answersHtml = !p.answers?.length ? '<p style="color:#6b7280">No answers submitted.</p>' :
    p.answers.map((a, i) => `
      <div style="margin-bottom:18px;border-left:3px solid #4f46e5;padding-left:14px">
        <p style="margin:0 0 2px;font-size:12px;color:#6b7280">
          ${a.category ? `[${esc(a.category)}] ` : ''}${a.questionId ? `ID: ${esc(a.questionId)} · ` : ''}Question ${i + 1}
        </p>
        <p style="margin:0 0 6px;font-weight:600;color:#111827;font-size:14px">${esc(a.question)}</p>
        <p style="margin:0;color:#374151;font-size:13px;white-space:pre-wrap;background:#f9fafb;padding:10px 12px;border-radius:4px">${esc(a.answer)}</p>
      </div>`).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;max-width:720px;margin:0 auto;padding:24px">

  <div style="background:#111827;border-radius:8px 8px 0 0;padding:20px 28px">
    <h1 style="margin:0;color:#fff;font-size:18px">New Assessment Completed</h1>
    <p style="margin:4px 0 0;color:#9ca3af;font-size:13px">Signal Works Design — Internal Report</p>
  </div>

  <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:24px 28px">

    ${section('Student Information', `
      <table style="border-collapse:collapse">
        <tr><td style="${tdLabel}">Name</td><td style="${tdVal}">${esc(p.name)}</td></tr>
        <tr><td style="${tdLabel}">Email</td><td style="${tdVal}"><a href="mailto:${esc(p.email)}" style="color:#4f46e5">${esc(p.email)}</a></td></tr>
        <tr><td style="${tdLabel}">Completed</td><td style="${tdVal}">${timestamp}</td></tr>
      </table>
      ${roadmapUrl ? `
      <div style="margin-top:16px">
        <a href="${roadmapUrl}"
           style="display:inline-block;background:#4f46e5;color:#fff;font-weight:700;padding:10px 22px;border-radius:6px;text-decoration:none;font-size:14px">
          View Full Roadmap in Dashboard →
        </a>
      </div>` : ''}`)}

    ${section('Assessment Summary', `
      <table style="border-collapse:collapse;margin-bottom:14px">
        ${scoreRow}${levelRow}
      </table>
      ${p.summary ? `<p style="color:#4b5563;margin:0 0 14px;line-height:1.6">${esc(p.summary)}</p>` : ''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#16a34a">Strengths</p>
          <ul style="margin:0;padding-left:18px;color:#4b5563;font-size:13px">${bulletListHtml(p.strengths, 'None identified')}</ul>
        </div>
        <div>
          <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#dc2626">Areas to Improve</p>
          <ul style="margin:0;padding-left:18px;color:#4b5563;font-size:13px">${bulletListHtml(p.weaknesses, 'None identified')}</ul>
        </div>
      </div>
      ${p.recommendations?.length ? `
      <p style="margin:14px 0 6px;font-size:13px;font-weight:600;color:#374151">Recommendations</p>
      <ul style="margin:0;padding-left:18px;color:#4b5563;font-size:13px">${bulletListHtml(p.recommendations)}</ul>` : ''}`)}

    ${section('Proposed Study Roadmap', roadmapHtml)}

    ${section('Recommended Apps / Projects to Build', appsHtml)}

    ${section('Full Submitted Answers', answersHtml)}

  </div>
</body></html>`;
}

function buildInternalText(p: AssessmentEmailPayload, timestamp: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';
  const roadmapUrl = p.roadmapId ? `${appUrl}/admin/roadmaps/${p.roadmapId}` : null;

  const lines: string[] = [
    `SIGNAL WORKS DESIGN — INTERNAL ASSESSMENT REPORT`,
    `${'='.repeat(50)}`,
    '',
    `STUDENT INFORMATION`,
    `-`.repeat(30),
    `Name:      ${p.name}`,
    `Email:     ${p.email}`,
    `Completed: ${timestamp}`,
    ...(roadmapUrl ? [`Dashboard:  ${roadmapUrl}`] : []),
    '',
    `ASSESSMENT SUMMARY`,
    `-`.repeat(30),
    ...(p.score !== undefined ? [`Score: ${p.score}%`] : []),
    ...(p.level ? [`Level: ${p.level}`] : []),
    ...(p.summary ? ['', p.summary] : []),
    '',
    `Strengths:`,
    bulletListText(p.strengths, 'None identified'),
    '',
    `Areas to Improve:`,
    bulletListText(p.weaknesses, 'None identified'),
    '',
    `Recommendations:`,
    bulletListText(p.recommendations),
  ];

  if (p.proposedRoadmap?.length) {
    lines.push('', `PROPOSED STUDY ROADMAP`, `-`.repeat(30));
    p.proposedRoadmap.forEach((phase, i) => {
      lines.push(``, `Phase ${i + 1}: ${phase.phase}`, `Focus: ${phase.focus}`);
      lines.push(`Goals:`);
      phase.goals.forEach((g) => lines.push(`  - ${g}`));
      if (phase.suggestedResources?.length) {
        lines.push(`Resources:`);
        phase.suggestedResources.forEach((r) => lines.push(`  - ${r}`));
      }
    });
  }

  if (p.appsToBuild?.length) {
    lines.push('', `RECOMMENDED APPS / PROJECTS`, `-`.repeat(30));
    p.appsToBuild.forEach((app) => {
      lines.push(``, `${app.title}${app.difficulty ? ` (${app.difficulty})` : ''}`);
      lines.push(app.description);
      lines.push(`Skills: ${app.skillsPracticed.join(', ')}`);
    });
  }

  if (p.answers?.length) {
    lines.push('', `FULL SUBMITTED ANSWERS`, `-`.repeat(30));
    p.answers.forEach((a, i) => {
      lines.push(
        ``,
        `Q${i + 1}${a.category ? ` [${a.category}]` : ''}${a.questionId ? ` (ID: ${a.questionId})` : ''}`,
        `Question: ${a.question}`,
        `Answer:`,
        a.answer,
      );
    });
  }

  return lines.join('\n');
}

// ============================================
// STUDENT EMAIL (confirmation only)
// ============================================

function buildStudentHtml(name: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;max-width:600px;margin:0 auto;padding:24px">

  <div style="background:#111827;border-radius:8px 8px 0 0;padding:20px 28px">
    <h1 style="margin:0;color:#fff;font-size:18px">Assessment Complete</h1>
    <p style="margin:4px 0 0;color:#9ca3af;font-size:13px">Signal Works Design</p>
  </div>

  <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:28px">
    <p style="margin:0 0 16px;font-size:16px">Hi <strong>${esc(name)}</strong>,</p>

    <p style="margin:0 0 16px;color:#4b5563;line-height:1.7">
      Thank you for completing your assessment with Signal Works Design. We've received all of your responses and our team will review them carefully.
    </p>

    <p style="margin:0 0 12px;color:#374151;font-weight:600">Based on your answers, we will prepare:</p>
    <ul style="margin:0 0 20px;padding-left:20px;color:#4b5563;line-height:1.8">
      <li>A personalized skills profile based on your current level</li>
      <li>A proposed study roadmap tailored to your goals</li>
      <li>A set of recommended apps and projects to build</li>
    </ul>

    <p style="margin:0 0 20px;color:#4b5563;line-height:1.7">
      We'll go over everything together in your follow-up meeting. If you haven't booked a session yet, you can do so using the link below.
    </p>

    <div style="text-align:center;margin-bottom:28px">
      <a href="${BOOKING_URL}"
         style="display:inline-block;background:#4f46e5;color:#fff;font-weight:700;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:15px">
        Book Your Follow-Up Meeting
      </a>
    </div>

    <p style="margin:0 0 4px;color:#4b5563;line-height:1.7">
      We're looking forward to working with you.
    </p>
    <p style="margin:0;color:#4b5563">— The Signal Works Design Team</p>

    <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb">
    <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">
      Signal Works Design ·
      <a href="mailto:${SUPPORT_EMAIL}" style="color:#9ca3af">${SUPPORT_EMAIL}</a>
    </p>
  </div>
</body></html>`;
}

function buildStudentText(name: string): string {
  return [
    `Hi ${name},`,
    '',
    `Thank you for completing your assessment with Signal Works Design. We've received all of your responses and our team will review them carefully.`,
    '',
    `Based on your answers, we will prepare:`,
    `  - A personalized skills profile based on your current level`,
    `  - A proposed study roadmap tailored to your goals`,
    `  - A set of recommended apps and projects to build`,
    '',
    `We'll go over everything together in your follow-up meeting.`,
    `Book your session here: ${BOOKING_URL}`,
    '',
    `We're looking forward to working with you.`,
    `— The Signal Works Design Team`,
    '',
    `Signal Works Design · ${SUPPORT_EMAIL}`,
  ].join('\n');
}

// ============================================
// PUBLIC API
// ============================================

export async function sendAssessmentEmails(
  payload: AssessmentEmailPayload,
  roadmapPdf?: Buffer
): Promise<string | null> {
  const timestamp = new Date().toUTCString();

  const internalEmail: Parameters<typeof resend.emails.send>[0] = {
    from: FROM,
    to: SUPPORT_EMAIL,
    subject: `New Assessment Completed – ${payload.name}`,
    html: buildInternalHtml(payload, timestamp),
    text: buildInternalText(payload, timestamp),
  };

  if (roadmapPdf) {
    internalEmail.attachments = [
      {
        filename: `roadmap-${payload.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        content: roadmapPdf,
      },
    ];
  }

  const [internalResult, studentResult] = await Promise.allSettled([
    resend.emails.send(internalEmail),
    resend.emails.send({
      from: FROM,
      to: payload.email,
      subject: 'Your Assessment Is Complete – Signal Works Design',
      html: buildStudentHtml(payload.name),
      text: buildStudentText(payload.name),
    }),
  ]);

  const errors: string[] = [];

  if (internalResult.status === 'rejected') {
    const msg = `Internal email failed: ${internalResult.reason}`;
    logger.error(msg, { name: payload.name });
    errors.push(msg);
  } else if (internalResult.value.error) {
    const msg = `Internal email error: ${JSON.stringify(internalResult.value.error)}`;
    logger.error(msg, { name: payload.name });
    errors.push(msg);
  } else {
    logger.info('Internal assessment email sent', { id: internalResult.value.data?.id, name: payload.name });
  }

  if (studentResult.status === 'rejected') {
    const msg = `Student email failed: ${studentResult.reason}`;
    logger.error(msg, { email: payload.email });
    errors.push(msg);
  } else if (studentResult.value.error) {
    const msg = `Student email error: ${JSON.stringify(studentResult.value.error)}`;
    logger.error(msg, { email: payload.email });
    errors.push(msg);
  } else {
    logger.info('Student confirmation email sent', { id: studentResult.value.data?.id, email: payload.email });
  }

  return errors.length > 0 ? errors.join(' | ') : null;
}
