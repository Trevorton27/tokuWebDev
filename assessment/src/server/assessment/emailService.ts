import { Resend } from 'resend';
import { logger } from '@/lib/logger';
import type { SessionSummary } from './intakeService';

const resend = new Resend(process.env.RESEND_API_KEY);

const SUPPORT_EMAIL = 'support@signalworksdesign.com';
const RECIPIENT = SUPPORT_EMAIL;
const FROM =
  process.env.NODE_ENV === 'development'
    ? 'Signal Works <onboarding@resend.dev>'
    : 'Signal Works <contact@email.signalworksdesign.com>';

// ============================================
// STUDENT EMAIL TYPES
// ============================================

export interface StudentEmailPayload {
  name: string;
  email: string;
  score?: number;       // 0–100
  level?: string;       // e.g. "Beginner", "Developing", "Proficient", "Advanced"
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
}

function getSkillLabel(mastery: number): string {
  if (mastery >= 0.7) return 'Strong';
  if (mastery >= 0.4) return 'Developing';
  return 'Beginner';
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function buildEmailText(
  studentName: string,
  studentEmail: string,
  summary: SessionSummary
): string {
  const { profileSummary, stepResults, completedAt } = summary;

  const lines: string[] = [
    `Assessment Results — ${studentName}`,
    `Email: ${studentEmail}`,
    `Completed: ${completedAt.toUTCString()}`,
    '',
    '=== SKILL PROFILE ===',
    `Overall Score: ${formatPercent(profileSummary.overallScore)}`,
    `Skills Assessed: ${profileSummary.totalSkillsAssessed} / ${profileSummary.totalSkills}`,
    '',
  ];

  for (const dim of profileSummary.dimensions) {
    if (dim.assessedRatio > 0) {
      lines.push(
        `${dim.label}: ${formatPercent(dim.score)} (${getSkillLabel(dim.score)}) — confidence ${formatPercent(dim.confidence)}`
      );
    }
  }

  lines.push('', '=== STEP RESULTS ===');
  for (const step of stepResults) {
    const grade = step.gradeResult;
    if (!grade) {
      lines.push(`• ${step.stepTitle}: Not graded`);
    } else {
      const status = grade.passed ? 'PASS' : 'FAIL';
      lines.push(`• ${step.stepTitle}: ${status} (score: ${formatPercent(grade.score)})`);
      if (grade.feedback) {
        lines.push(`  Feedback: ${grade.feedback}`);
      }
    }
  }

  return lines.join('\n');
}

function buildEmailHtml(
  studentName: string,
  studentEmail: string,
  summary: SessionSummary
): string {
  const { profileSummary, stepResults, completedAt } = summary;

  const dimensionRows = profileSummary.dimensions
    .filter((d) => d.assessedRatio > 0)
    .map((dim) => {
      const label = getSkillLabel(dim.score);
      const color = dim.score >= 0.7 ? '#16a34a' : dim.score >= 0.4 ? '#ca8a04' : '#dc2626';
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${dim.label}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">
            <span style="color:${color};font-weight:600">${label}</span>
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${formatPercent(dim.score)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${formatPercent(dim.confidence)}</td>
        </tr>`;
    })
    .join('');

  const stepRows = stepResults
    .map((step) => {
      const grade = step.gradeResult;
      if (!grade) return `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${step.stepTitle}</td><td colspan="2" style="padding:6px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280">Not graded</td></tr>`;
      const statusColor = grade.passed ? '#16a34a' : '#dc2626';
      return `
        <tr>
          <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${step.stepTitle}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:${statusColor};font-weight:600">${grade.passed ? 'PASS' : 'FAIL'}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${formatPercent(grade.score)}</td>
        </tr>
        ${grade.feedback ? `<tr><td colspan="3" style="padding:4px 12px 10px;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb"><em>${grade.feedback}</em></td></tr>` : ''}`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;max-width:680px;margin:0 auto;padding:24px">
  <div style="background:#4f46e5;border-radius:8px 8px 0 0;padding:24px 28px">
    <h1 style="margin:0;color:#fff;font-size:22px">Assessment Results</h1>
    <p style="margin:4px 0 0;color:#c7d2fe;font-size:14px">Signal Works Design</p>
  </div>
  <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:24px 28px">

    <table style="width:100%;margin-bottom:24px">
      <tr><td style="color:#6b7280;font-size:13px;padding:2px 0">Student</td><td style="font-weight:600">${studentName}</td></tr>
      <tr><td style="color:#6b7280;font-size:13px;padding:2px 0">Email</td><td><a href="mailto:${studentEmail}" style="color:#4f46e5">${studentEmail}</a></td></tr>
      <tr><td style="color:#6b7280;font-size:13px;padding:2px 0">Completed</td><td>${completedAt.toUTCString()}</td></tr>
      <tr><td style="color:#6b7280;font-size:13px;padding:2px 0">Overall Score</td><td style="font-weight:600">${formatPercent(profileSummary.overallScore)}</td></tr>
      <tr><td style="color:#6b7280;font-size:13px;padding:2px 0">Skills Assessed</td><td>${profileSummary.totalSkillsAssessed} / ${profileSummary.totalSkills}</td></tr>
    </table>

    <h2 style="font-size:16px;margin:0 0 12px;color:#374151">Skill Profile</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px">
      <thead>
        <tr style="background:#f9fafb">
          <th style="text-align:left;padding:8px 12px;font-size:13px;color:#6b7280;font-weight:500">Dimension</th>
          <th style="padding:8px 12px;font-size:13px;color:#6b7280;font-weight:500">Level</th>
          <th style="padding:8px 12px;font-size:13px;color:#6b7280;font-weight:500">Score</th>
          <th style="padding:8px 12px;font-size:13px;color:#6b7280;font-weight:500">Confidence</th>
        </tr>
      </thead>
      <tbody>${dimensionRows}</tbody>
    </table>

    <h2 style="font-size:16px;margin:0 0 12px;color:#374151">Step Results</h2>
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="background:#f9fafb">
          <th style="text-align:left;padding:8px 12px;font-size:13px;color:#6b7280;font-weight:500">Step</th>
          <th style="padding:8px 12px;font-size:13px;color:#6b7280;font-weight:500">Result</th>
          <th style="padding:8px 12px;font-size:13px;color:#6b7280;font-weight:500">Score</th>
        </tr>
      </thead>
      <tbody>${stepRows}</tbody>
    </table>
  </div>
</body>
</html>`;
}

export async function sendAssessmentResultsEmail(
  studentName: string,
  studentEmail: string,
  summary: SessionSummary
): Promise<void> {
  try {
    const subject = `${studentName} — Assessment Results`;

    const { error } = await resend.emails.send({
      from: FROM,
      to: RECIPIENT,
      replyTo: studentEmail,
      subject,
      text: buildEmailText(studentName, studentEmail, summary),
      html: buildEmailHtml(studentName, studentEmail, summary),
    });

    if (error) {
      logger.error('Resend failed to send assessment results email', error, {
        studentEmail,
        subject,
      });
    } else {
      logger.info('Assessment results email sent', { studentName, studentEmail });
    }
  } catch (err) {
    logger.error('sendAssessmentResultsEmail threw unexpectedly', err, { studentEmail });
  }
}

// ============================================
// STUDENT-FACING EMAIL
// ============================================

function buildStudentEmailHtml(p: StudentEmailPayload): string {
  const bulletList = (items: string[] | undefined, fallback: string) =>
    items && items.length > 0
      ? items.map((i) => `<li style="margin-bottom:6px">${i}</li>`).join('')
      : `<li style="color:#6b7280">${fallback}</li>`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;max-width:640px;margin:0 auto;padding:24px">
  <div style="background:#111827;border-radius:8px 8px 0 0;padding:24px 28px">
    <h1 style="margin:0;color:#fff;font-size:20px">Your Assessment Results</h1>
    <p style="margin:4px 0 0;color:#9ca3af;font-size:13px">Signal Works Design</p>
  </div>
  <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:28px">

    <p style="margin:0 0 20px;font-size:16px">Hello <strong>${p.name}</strong>,</p>
    <p style="margin:0 0 24px;color:#4b5563">
      Thank you for completing your assessment. Here's a summary of your results.
    </p>

    ${p.score !== undefined || p.level ? `
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;margin-bottom:24px;display:flex;gap:24px">
      ${p.score !== undefined ? `<div><p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Overall Score</p><p style="margin:4px 0 0;font-size:28px;font-weight:700;color:#4f46e5">${p.score}%</p></div>` : ''}
      ${p.level ? `<div><p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Level</p><p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#111827">${p.level}</p></div>` : ''}
    </div>` : ''}

    ${p.summary ? `
    <h2 style="font-size:15px;margin:0 0 8px;color:#374151">Summary</h2>
    <p style="margin:0 0 24px;color:#4b5563;line-height:1.6">${p.summary}</p>` : ''}

    <h2 style="font-size:15px;margin:0 0 10px;color:#374151">💪 Strengths</h2>
    <ul style="margin:0 0 24px;padding-left:20px;color:#4b5563;line-height:1.6">
      ${bulletList(p.strengths, 'Continue building on your current skills')}
    </ul>

    <h2 style="font-size:15px;margin:0 0 10px;color:#374151">📈 Areas to Improve</h2>
    <ul style="margin:0 0 24px;padding-left:20px;color:#4b5563;line-height:1.6">
      ${bulletList(p.weaknesses, 'Keep practicing — improvement takes consistent effort')}
    </ul>

    <h2 style="font-size:15px;margin:0 0 10px;color:#374151">🗺️ Recommended Next Steps</h2>
    <ul style="margin:0 0 28px;padding-left:20px;color:#4b5563;line-height:1.6">
      ${bulletList(p.recommendations, 'Your personalized roadmap will be available in your dashboard')}
    </ul>

    <div style="background:#4f46e5;border-radius:8px;padding:20px 24px;text-align:center">
      <p style="margin:0 0 12px;color:#e0e7ff;font-size:14px">Ready to start your learning journey?</p>
      <a href="https://signalworksdesign.com" style="display:inline-block;background:#fff;color:#4f46e5;font-weight:700;padding:10px 24px;border-radius:6px;text-decoration:none;font-size:14px">
        Go to Dashboard
      </a>
    </div>

    <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;text-align:center">
      Signal Works Design · <a href="mailto:support@signalworksdesign.com" style="color:#9ca3af">support@signalworksdesign.com</a>
    </p>
  </div>
</body>
</html>`;
}

function buildStudentEmailText(p: StudentEmailPayload): string {
  const list = (items: string[] | undefined) =>
    items && items.length > 0 ? items.map((i) => `  - ${i}`).join('\n') : '  - N/A';

  return [
    `Hello ${p.name},`,
    '',
    'Thank you for completing your assessment. Here are your results.',
    '',
    p.score !== undefined ? `Overall Score: ${p.score}%` : '',
    p.level ? `Level: ${p.level}` : '',
    '',
    p.summary ? `Summary:\n${p.summary}\n` : '',
    'Strengths:',
    list(p.strengths),
    '',
    'Areas to Improve:',
    list(p.weaknesses),
    '',
    'Recommended Next Steps:',
    list(p.recommendations),
    '',
    '—',
    'Signal Works Design',
    'support@signalworksdesign.com',
  ]
    .filter((l) => l !== undefined)
    .join('\n');
}

export async function sendStudentAssessmentEmail(payload: StudentEmailPayload): Promise<void> {
  try {
    const subject = 'Your Assessment Results – Signal Works';

    const { error } = await resend.emails.send({
      from: FROM,
      to: payload.email,
      cc: SUPPORT_EMAIL,
      subject,
      text: buildStudentEmailText(payload),
      html: buildStudentEmailHtml(payload),
    });

    if (error) {
      logger.error('Resend failed to send student assessment email', error, {
        studentEmail: payload.email,
      });
    } else {
      logger.info('Student assessment email sent', { name: payload.name, email: payload.email });
    }
  } catch (err) {
    logger.error('sendStudentAssessmentEmail threw unexpectedly', err, { email: payload.email });
  }
}
