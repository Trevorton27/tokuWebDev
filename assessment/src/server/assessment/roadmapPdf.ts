/**
 * Generates a PDF buffer of an AI-generated roadmap using pdfkit.
 */

import PDFDocument from 'pdfkit';
import type { GeneratedRoadmap, RoadmapProject, RoadmapResource } from './roadmapService';

function resourceLabel(r: RoadmapResource | string): string {
  if (typeof r === 'string') return r;
  return r.url ? `${r.title} — ${r.url}` : r.title;
}

export async function generateRoadmapPdf(
  studentName: string,
  roadmap: GeneratedRoadmap
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const BLACK = '#111827';
    const PURPLE = '#4f46e5';
    const GRAY = '#6b7280';
    const LIGHT_GRAY = '#f3f4f6';
    const PAGE_WIDTH = doc.page.width - 100; // margins

    // ── Header ──────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 80).fill(BLACK);
    doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold')
      .text('Personalized Learning Roadmap', 50, 25);
    doc.fillColor('#9ca3af').fontSize(10).font('Helvetica')
      .text('Signal Works Design', 50, 50);

    doc.moveDown(3);

    // ── Student + Summary ────────────────────────────────────
    doc.fillColor(BLACK).fontSize(13).font('Helvetica-Bold')
      .text(`Prepared for: ${studentName}`);
    doc.moveDown(0.3);
    doc.fillColor(GRAY).fontSize(10).font('Helvetica')
      .text(`Timeline: ${roadmap.totalDuration}`, { continued: true })
      .text(`   |   Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`)
    doc.moveDown(0.5);
    doc.fillColor(BLACK).fontSize(11).font('Helvetica')
      .text(roadmap.summary, { width: PAGE_WIDTH, lineGap: 3 });

    doc.moveDown(1);

    // ── First Step ───────────────────────────────────────────
    doc.font('Helvetica').fontSize(10);
    const firstStepTextH = doc.heightOfString(roadmap.firstStep, { width: PAGE_WIDTH - 24 });
    const firstStepBoxH = 14 + firstStepTextH + 20;
    const firstStepTop = doc.y;
    doc.rect(50, firstStepTop, PAGE_WIDTH, firstStepBoxH).fill(PURPLE);
    doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold')
      .text('YOUR FIRST STEP', 62, firstStepTop + 10);
    doc.fillColor('#e0e7ff').fontSize(10).font('Helvetica')
      .text(roadmap.firstStep, 62, firstStepTop + 24, { width: PAGE_WIDTH - 24 });
    doc.text('', 50, firstStepTop + firstStepBoxH);
    doc.moveDown(1);

    // ── Phases ───────────────────────────────────────────────
    doc.fillColor(BLACK).fontSize(14).font('Helvetica-Bold').text('Learning Phases');
    doc.moveDown(0.5);

    roadmap.phases.forEach((phase, i) => {
      // Phase header bar — dynamic height to avoid text overflow
      const phaseLabel = `Phase ${i + 1}: ${phase.phase}`;
      doc.font('Helvetica-Bold').fontSize(11);
      const phaseTitleH = doc.heightOfString(phaseLabel, { width: PAGE_WIDTH - 80 });
      const phaseBarH = Math.max(28, phaseTitleH + 16);
      const barY = doc.y;
      doc.rect(50, barY, PAGE_WIDTH, phaseBarH).fill(LIGHT_GRAY);
      doc.fillColor(PURPLE).fontSize(11).font('Helvetica-Bold')
        .text(phaseLabel, 62, barY + 8, { width: PAGE_WIDTH - 80 });
      doc.fillColor(GRAY).fontSize(9).font('Helvetica')
        .text(phase.duration, 62 + PAGE_WIDTH - 80, barY + 8 + (phaseTitleH - 11) / 2, { width: 70, align: 'right' });
      doc.text('', 50, barY + phaseBarH);
      doc.moveDown(0.8);
      doc.fillColor(GRAY).fontSize(9).font('Helvetica-Bold')
        .text('FOCUS', { continued: true });
      doc.font('Helvetica').fillColor(BLACK)
        .text(`  ${phase.focus}`);

      doc.moveDown(0.4);
      doc.fillColor(GRAY).fontSize(9).font('Helvetica-Bold').text('GOALS');
      phase.goals.forEach((goal) => {
        doc.fillColor(BLACK).fontSize(10).font('Helvetica')
          .text(`• ${goal}`, { indent: 12, width: PAGE_WIDTH - 12, lineGap: 2 });
      });

      if (phase.suggestedResources?.length) {
        doc.moveDown(0.4);
        doc.fillColor(GRAY).fontSize(9).font('Helvetica-Bold').text('RESOURCES');
        phase.suggestedResources.forEach((res) => {
          doc.fillColor(PURPLE).fontSize(10).font('Helvetica')
            .text(`• ${resourceLabel(res)}`, { indent: 12, width: PAGE_WIDTH - 12, lineGap: 2 });
        });
      }

      if (phase.capstoneProject) {
        doc.moveDown(0.4);
        doc.fillColor(GRAY).fontSize(9).font('Helvetica-Bold')
          .text('CAPSTONE PROJECT', { continued: true });
        doc.font('Helvetica').fillColor(BLACK)
          .text(`  ${phase.capstoneProject}`);
      }

      doc.moveDown(1.2);

      // Page break if near bottom
      if (doc.y > doc.page.height - 120 && i < roadmap.phases.length - 1) {
        doc.addPage();
      }
    });

    // ── Projects ─────────────────────────────────────────────
    if (roadmap.projects?.length) {
      // Page break before projects section
      if (doc.y > doc.page.height - 200) {
        doc.addPage();
      }

      doc.fillColor(BLACK).fontSize(14).font('Helvetica-Bold').text('Projects to Build');
      doc.moveDown(0.5);

      roadmap.projects.forEach((project: RoadmapProject, i: number) => {
        // Page break if near bottom
        if (doc.y > doc.page.height - 160) {
          doc.addPage();
        }

        const isCapstone = project.isCapstone;
        const barColor = isCapstone ? PURPLE : LIGHT_GRAY;
        const labelColor = isCapstone ? '#ffffff' : PURPLE;
        const projectLabel = `Project ${i + 1}: ${project.title}`;
        doc.font('Helvetica-Bold').fontSize(11);
        const projectTitleH = doc.heightOfString(projectLabel, { width: PAGE_WIDTH - 80 });
        const projectBarH = Math.max(28, projectTitleH + 16);
        const barY = doc.y;

        doc.rect(50, barY, PAGE_WIDTH, projectBarH).fill(barColor);
        doc.fillColor(labelColor).fontSize(11).font('Helvetica-Bold')
          .text(projectLabel, 62, barY + 8, { width: PAGE_WIDTH - 80 });
        doc.fillColor(isCapstone ? '#e0e7ff' : GRAY).fontSize(9).font('Helvetica')
          .text(`${project.difficulty}${isCapstone ? ' · Capstone' : ''}`, 62 + PAGE_WIDTH - 80, barY + 8, { width: 70, align: 'right' });
        doc.text('', 50, barY + projectBarH);
        doc.moveDown(0.8);
        doc.fillColor(BLACK).fontSize(10).font('Helvetica')
          .text(project.description, { width: PAGE_WIDTH, lineGap: 3 });

        if (project.skills?.length) {
          doc.moveDown(0.4);
          doc.fillColor(GRAY).fontSize(9).font('Helvetica-Bold')
            .text('SKILLS', { continued: true });
          doc.font('Helvetica').fillColor(BLACK)
            .text(`  ${project.skills.join(' · ')}`);
        }

        doc.moveDown(1.2);
      });
    }

    // ── Footer ───────────────────────────────────────────────
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(50 + PAGE_WIDTH, doc.y).strokeColor('#e5e7eb').stroke();
    doc.moveDown(0.5);
    doc.fillColor(GRAY).fontSize(9).font('Helvetica')
      .text('Signal Works Design  ·  support@signalworksdesign.com', {
        align: 'center',
        width: PAGE_WIDTH,
      });

    doc.end();
  });
}
