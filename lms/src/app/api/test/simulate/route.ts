
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startAssessmentSession, submitStepAnswer, getSessionSummary } from '@/server/assessment/intakeService';
import { INTAKE_STEPS } from '@/server/assessment/intakeConfig';

export const dynamic = 'force-dynamic';

async function runPersona(name: string, level: 'beginner' | 'intermediate' | 'advanced') {
    // 1. Create Dummy User
    const email = `sim_${level}_${Date.now()}@test.com`;
    const user = await prisma.user.create({
        data: {
            email,
            password: 'password',
            role: 'STUDENT',
            name: `${name} Persona`
        }
    });

    // 2. Start Session
    const start = await startAssessmentSession(user.id);
    const sessionId = start.sessionId;
    let currentStepId: string | null = start.firstStep.id;

    // 3. Loop Steps
    let stepsTaken = 0;
    while (currentStepId && currentStepId !== 'summary') {
        const step = INTAKE_STEPS.find(s => s.id === currentStepId);
        if (!step) break;

        // Generate Answer based on Level
        let answer: any = null;

        // -- LOGIC FOR ANSWERS --
        if (step.kind === 'QUESTIONNAIRE') {
            if (step.id === 'level_self_prediction') {
                answer = { predicted_level: level === 'beginner' ? 'complete_beginner' : level === 'intermediate' ? 'intermediate' : 'advanced' };
            } else if (step.id === 'questionnaire_confidence') {
                const conf = level === 'beginner' ? 1 : level === 'intermediate' ? 3 : 5;
                answer = {
                    confidence_programming: conf,
                    confidence_html_css: conf,
                    confidence_javascript: conf,
                    confidence_backend: conf,
                    confidence_git: conf,
                    confidence_design: conf
                };
            } else {
                 // Defaults
                 answer = { programming_experience: 'none', learning_goal: 'career_change', weekly_hours: '10_20' };
            }
        } 
        else if (step.kind === 'MICRO_MCQ_BURST') {
            // Beginner: 0/3, Intermediate: 2/3, Advanced: 3/3
            const opts = {
                probe_const: 'a', // Correct
                probe_flex: 'b',  // Correct
                probe_http: 'c'   // Correct
            };
            const wrongOpts = {
                probe_const: 'b', 
                probe_flex: 'a',
                probe_http: 'a'
            };
            
            if (level === 'beginner') answer = { answers: wrongOpts };
            else if (level === 'intermediate') answer = { answers: { ...opts, probe_http: 'a' } }; // 1 wrong
            else answer = { answers: opts };
        }
        else if (step.kind === 'MCQ') {
            // Find correct option
            const correctOpt = (step as any).options.find((o: any) => o.isCorrect)?.id;
            const wrongOpt = (step as any).options.find((o: any) => !o.isCorrect)?.id;
            
            // Advanced gets all right, Intermediate gets 50%, Beginner gets none
            if (level === 'advanced') answer = { selectedOptionId: correctOpt };
            else if (level === 'beginner') answer = { selectedOptionId: wrongOpt };
            else answer = { selectedOptionId: Math.random() > 0.3 ? correctOpt : wrongOpt };
        }
        else if (step.kind === 'CODE') {
            if (level === 'beginner') {
                answer = { code: '// I do not know how to code yet' };
            } else {
                // Return starter code or simple solution
                // We'll just send "code" - grading checks correctness via test cases usually
                // Since we don't have real code execution in this env perfectly mocked without runCodeService,
                // we depend on `gradeCode` falling back or actually running.
                // Assuming evaluatingSubmission mock or similar works.
                // Let's pass the valid solution if advanced.
                 if (step.id === 'code_unique_sorted') {
                     answer = { code: level === 'advanced' ? 'function uniqueSorted(nums) { return [...new Set(nums)].sort((a,b)=>a-b); }' : 'function uniqueSorted(nums) { return nums; }' };
                 } else {
                     answer = { code: level === 'advanced' ? 'function countWords(str) { return {}; }' : 'function countWords() {}' }; 
                 }
            }
        }
        else if (step.kind === 'SHORT_TEXT') {
            answer = { text: level === 'beginner' ? 'I am not sure.' : 'This is a detailed technical explanation invoking async/await and promises.' };
        }
        else if (step.kind === 'DESIGN_CRITIQUE') {
            answer = { critique: level === 'beginner' ? 'Looks okay.' : 'The contrast is poor and alignment is off. Accessibility issues present.' };
        }
         else if (step.kind === 'CODE_REVIEW') {
            answer = { critique: level === 'advanced' ? 'Missing dependency array in useEffect. Direct DOM manipulation is bad. Onclick should be onClick.' : 'Looks good to me.' };
        }
        else if (step.kind === 'DESIGN_COMPARISON') {
             answer = { selectedOption: 'A' }; // mostly luck or hardcoded
        }

        // 4. Submit
        if (answer) {
           const res = await submitStepAnswer(sessionId, step.id, answer);
           currentStepId = res.nextStep ? res.nextStep.id : 'summary';
           if (res.isComplete) currentStepId = 'summary';
        } else {
            console.warn("Skipping step due to no answer logic", step.id);
            // Force move next to avoid infinite loop
            const next = INTAKE_STEPS.find(s => s.order === step.order + 1);
            currentStepId = next ? next.id : 'summary';
        }
        
        stepsTaken++;
        if (stepsTaken > 40) break; // Safety break
    }

    return await getSessionSummary(sessionId);
}

export async function GET() {
    try {
        const beginner = await runPersona('Beginner', 'beginner');
        const intermediate = await runPersona('Intermediate', 'intermediate');
        const advanced = await runPersona('Advanced', 'advanced');

        return NextResponse.json({
            beginner,
            intermediate,
            advanced
        });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
