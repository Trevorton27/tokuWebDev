/**
 * Generates a DOCX buffer of an AI-generated roadmap using the docx library.
 * DOCX files are accepted by Google Docs for upload and editing.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ShadingType,
  TableRow,
  TableCell,
  Table,
  WidthType,
  convertInchesToTwip,
} from 'docx';
import type { GeneratedRoadmap, RoadmapResource } from './roadmapService';

function resourceLabel(r: RoadmapResource | string): string {
  if (typeof r === 'string') return r;
  return r.url ? `${r.title} — ${r.url}` : r.title;
}

function label(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 18, color: '6B7280' })],
    spacing: { before: 120, after: 40 },
  });
}

function body(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 20 })],
    spacing: { after: 60 },
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 20 })],
    bullet: { level: 0 },
    spacing: { after: 40 },
  });
}

const SETUP_ACCOUNTS = [
  { name: 'GitHub', url: 'github.com', note: 'Free hosting for all your code — required for every project' },
  { name: 'Vercel', url: 'vercel.com', note: 'Deploy your projects live instantly (sign up with GitHub)' },
  { name: 'Claude.ai', url: 'claude.ai', note: 'AI assistant for coding help and explanations' },
  { name: 'Figma', url: 'figma.com', note: 'Design and wireframe your app UI' },
];

const SETUP_SOFTWARE = [
  { name: 'Git', url: 'git-scm.com', note: 'Version control — install this first before anything else' },
  { name: 'Node.js (LTS)', url: 'nodejs.org', note: 'JavaScript runtime required for all web projects' },
  { name: 'VS Code', url: 'code.visualstudio.com', note: 'Code editor used by most professional developers' },
];

const SETUP_EXTENSIONS = [
  { name: 'Prettier - Code Formatter', note: 'Auto-formats your code on save' },
  { name: 'ESLint', note: 'Catches errors and enforces code style' },
  { name: 'GitLens', note: 'See git history and blame inside your editor' },
  { name: 'Error Lens', note: 'Highlights errors inline as you type' },
  { name: 'GitHub Copilot', note: 'AI code completion — free for students' },
];

const SETUP_CLI = [
  { cmd: 'npm install -g @anthropic-ai/claude-code', note: 'Claude Code — AI coding assistant in your terminal' },
  { cmd: 'npm install -g vercel', note: 'Vercel CLI — deploy to production from the command line' },
];

const SETUP_GIT_CONFIG = [
  { cmd: 'git config --global user.name "Your Name"', note: 'Sets your identity for all commits' },
  { cmd: 'git config --global user.email "you@email.com"', note: 'Must match your GitHub email' },
];

export async function generateRoadmapDocx(
  studentName: string,
  roadmap: GeneratedRoadmap,
  score = 100
): Promise<Buffer> {
  const children: Paragraph[] = [];

  // ── Title ────────────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Personalized Learning Roadmap', bold: true, size: 36, color: '111827' })],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.LEFT,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Signal Works Design', size: 18, color: '9CA3AF' })],
      spacing: { after: 240 },
    })
  );

  // ── Student info ─────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Prepared for: ', bold: true, size: 24 }),
        new TextRun({ text: studentName, size: 24 }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Timeline: ', bold: true, size: 20, color: '6B7280' }),
        new TextRun({ text: roadmap.totalDuration, size: 20, color: '6B7280' }),
        new TextRun({ text: '   |   Generated: ', size: 20, color: '6B7280' }),
        new TextRun({
          text: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          size: 20,
          color: '6B7280',
        }),
      ],
      spacing: { after: 120 },
    }),
    body(roadmap.summary)
  );

  if (score < 50) {
    // ── Setup Steps (beginners) ─────────────────────────────
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Your Setup Steps', bold: true, size: 28 })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      })
    );

    children.push(label('1. CREATE ACCOUNTS'));
    for (const { name, url, note } of SETUP_ACCOUNTS) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${name}  `, bold: true, size: 20, color: '4F46E5' }),
          new TextRun({ text: `${url}  —  ${note}`, size: 18, color: '6B7280' }),
        ],
        bullet: { level: 0 },
        spacing: { after: 40 },
      }));
    }

    children.push(label('2. INSTALL SOFTWARE'));
    for (const { name, url, note } of SETUP_SOFTWARE) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${name}  `, bold: true, size: 20, color: '4F46E5' }),
          new TextRun({ text: `${url}  —  ${note}`, size: 18, color: '6B7280' }),
        ],
        bullet: { level: 0 },
        spacing: { after: 40 },
      }));
    }

    children.push(label('3. INSTALL VS CODE EXTENSIONS'));
    for (const { name, note } of SETUP_EXTENSIONS) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${name}  `, bold: true, size: 20, color: '111827' }),
          new TextRun({ text: `— ${note}`, size: 18, color: '6B7280' }),
        ],
        bullet: { level: 0 },
        spacing: { after: 40 },
      }));
    }

    children.push(label('4. INSTALL CLI TOOLS  (run in terminal after Node.js is installed)'));
    for (const { cmd, note } of SETUP_CLI) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `$ ${cmd}`, size: 18, color: '4F46E5', font: 'Courier New' })],
          spacing: { after: 20 },
          indent: { left: convertInchesToTwip(0.15) },
        }),
        new Paragraph({
          children: [new TextRun({ text: `   ${note}`, size: 16, color: '6B7280' })],
          spacing: { after: 60 },
          indent: { left: convertInchesToTwip(0.15) },
        })
      );
    }

    children.push(label('5. CONFIGURE GIT  (run in terminal)'));
    for (const { cmd, note } of SETUP_GIT_CONFIG) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `$ ${cmd}`, size: 18, color: '4F46E5', font: 'Courier New' })],
          spacing: { after: 20 },
          indent: { left: convertInchesToTwip(0.15) },
        }),
        new Paragraph({
          children: [new TextRun({ text: `   ${note}`, size: 16, color: '6B7280' })],
          spacing: { after: 60 },
          indent: { left: convertInchesToTwip(0.15) },
        })
      );
    }
  } else {
    // ── First Step ─────────────────────────────────────────
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'YOUR FIRST STEP', bold: true, size: 20, color: 'FFFFFF' })],
        shading: { type: ShadingType.SOLID, color: '4F46E5' },
        spacing: { before: 200, after: 0 },
        indent: { left: convertInchesToTwip(0.1) },
      }),
      new Paragraph({
        children: [new TextRun({ text: roadmap.firstStep, size: 20, color: 'E0E7FF' })],
        shading: { type: ShadingType.SOLID, color: '4F46E5' },
        spacing: { after: 240 },
        indent: { left: convertInchesToTwip(0.1) },
      })
    );

    // ── Quick Setup Reference ─────────────────────────────
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Before You Begin: Setup', bold: true, size: 28 })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      })
    );

    children.push(label('ACCOUNTS TO CREATE'));
    for (const { name, url, note } of SETUP_ACCOUNTS) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${name}  `, bold: true, size: 20, color: '4F46E5' }),
          new TextRun({ text: `${url}  —  ${note}`, size: 18, color: '6B7280' }),
        ],
        bullet: { level: 0 },
        spacing: { after: 40 },
      }));
    }

    children.push(label('APPS TO DOWNLOAD'));
    for (const { name, url, note } of SETUP_SOFTWARE) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${name}  `, bold: true, size: 20, color: '4F46E5' }),
          new TextRun({ text: `${url}  —  ${note}`, size: 18, color: '6B7280' }),
        ],
        bullet: { level: 0 },
        spacing: { after: 40 },
      }));
    }
  }

  // ── Phases ───────────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Learning Phases', bold: true, size: 28 })],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
    })
  );

  for (let i = 0; i < roadmap.phases.length; i++) {
    const phase = roadmap.phases[i];

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Phase ${i + 1}: ${phase.phase}`, bold: true, size: 22, color: '4F46E5' }),
          new TextRun({ text: `  —  ${phase.duration}`, size: 18, color: '6B7280' }),
        ],
        shading: { type: ShadingType.SOLID, color: 'F3F4F6' },
        spacing: { before: 200, after: 80 },
        indent: { left: convertInchesToTwip(0.1) },
      }),
      label('FOCUS'),
      body(phase.focus)
    );

    children.push(label('GOALS'));
    for (const goal of phase.goals) {
      children.push(bullet(goal));
    }

    if (phase.suggestedResources?.length) {
      children.push(label('RESOURCES'));
      for (const res of phase.suggestedResources) {
        children.push(bullet(resourceLabel(res)));
      }
    }

    if (phase.capstoneProject) {
      children.push(
        label('PHASE PROJECT'),
        body(phase.capstoneProject)
      );
    }
  }

  // ── Projects ─────────────────────────────────────────────
  if (roadmap.projects?.length) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Projects to Build', bold: true, size: 28 })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 120 },
      })
    );

    for (let i = 0; i < roadmap.projects.length; i++) {
      const project = roadmap.projects[i];
      const isCapstone = project.isCapstone;

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Project ${i + 1}: ${project.title}`,
              bold: true,
              size: 22,
              color: isCapstone ? 'FFFFFF' : '4F46E5',
            }),
            new TextRun({
              text: `  ${project.difficulty}${isCapstone ? ' · Capstone' : ''}`,
              size: 18,
              color: isCapstone ? 'E0E7FF' : '6B7280',
            }),
          ],
          shading: { type: ShadingType.SOLID, color: isCapstone ? '4F46E5' : 'F3F4F6' },
          spacing: { before: 200, after: 80 },
          indent: { left: convertInchesToTwip(0.1) },
        }),
        body(project.description)
      );

      if (project.skills?.length) {
        children.push(
          label('SKILLS'),
          body(project.skills.join(' · '))
        );
      }
    }
  }

  // ── Footer ───────────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Signal Works Design  ·  support@signalworksdesign.com', size: 18, color: '6B7280' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 480 },
      border: { top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' } },
    })
  );

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}
