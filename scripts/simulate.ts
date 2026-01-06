
import prisma from '../src/lib/prisma';
import { startAssessmentSession, submitStepAnswer, getSessionSummary } from '../src/server/assessment/intakeService';
import { INTAKE_STEPS } from '../src/server/assessment/intakeConfig';

async function runPersona(name: string, level: 'beginner' | 'intermediate' | 'advanced') {
    console.log(`Running persona: ${name} (${level})`);
    
    // 1. Create Dummy User
    const email = `sim_${level}_${Date.now()}@test.com`;
    // Check if user exists first to be safe (though random email handles it)
    const user = await prisma.user.create({
        data: {
            email,
            password: 'password',
            role: 'STUDENT',
            name: `${name} Persona`
        }
    });
    console.log(`Created user ${user.id}`);

    // 2. Start Session
    const start = await startAssessmentSession(user.id);
    const sessionId = start.sessionId;
    let currentStepId: string | null = start.firstStep.id;

    console.log(`Started session ${sessionId}`);

    // 3. Loop Steps
    let stepsTaken = 0;
    while (currentStepId && currentStepId !== 'summary') {
        const step = INTAKE_STEPS.find(s => s.id === currentStepId);
        if (!step) break;

        // Generate Answer
        let answer: any = null;

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
                 answer = { programming_experience: 'none', learning_goal: 'career_change', weekly_hours: '10_20' };
            }
        } 
        else if (step.kind === 'MICRO_MCQ_BURST') {
            const opts = { probe_const: 'a', probe_flex: 'b', probe_http: 'c' };
            const wrongOpts = { probe_const: 'b', probe_flex: 'a', probe_http: 'a' };
            
            if (level === 'beginner') answer = { answers: wrongOpts };
            else if (level === 'intermediate') answer = { answers: { ...opts, probe_http: 'a' } };
            else answer = { answers: opts };
        }
        else if (step.kind === 'MCQ') {
            const correctOpt = (step as any).options.find((o: any) => o.isCorrect)?.id;
            const wrongOpt = (step as any).options.find((o: any) => !o.isCorrect)?.id;
            
            if (level === 'advanced') answer = { selectedOptionId: correctOpt };
            else if (level === 'beginner') answer = { selectedOptionId: wrongOpt };
            else answer = { selectedOptionId: Math.random() > 0.3 ? correctOpt : wrongOpt };
        }
        else if (step.kind === 'CODE') {
            if (level === 'beginner') {
                answer = { code: '// I do not know how to code yet' };
            } else {
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
             answer = { selectedOption: 'A' };
        }
        
        console.log(`Submitting step ${step.id}`);

        if (answer) {
           const res = await submitStepAnswer(sessionId, step.id, answer);
           currentStepId = res.nextStep ? res.nextStep.id : 'summary';
           if (res.isComplete) currentStepId = 'summary';
        } else {
            console.warn("Skipping step due to no answer logic", step.id);
            const next = INTAKE_STEPS.find(s => s.order === step.order + 1);
            currentStepId = next ? next.id : 'summary';
        }
        
        stepsTaken++;
        if (stepsTaken > 40) break;
    }

    const summary = await getSessionSummary(sessionId);

    // Replicate Logic from intakeClient.ts
    function generateRecommendations(profileSummary: any): string[] {
        const recommendations: string[] = [];
        const weakAreas = profileSummary.dimensions
            .filter((d: any) => d.score < 0.4)
            .sort((a: any, b: any) => a.score - b.score);

        if (weakAreas.length > 0) {
            recommendations.push(`Focus on strengthening your ${weakAreas[0].label} skills first`);
        }

        const lowConfidence = profileSummary.dimensions.filter(
            (d: any) => d.confidence < 0.3 && d.assessedRatio < 0.5
        );
        if (lowConfidence.length > 0) {
            recommendations.push(
            `Complete more assessments in ${lowConfidence.map((d: any) => d.label).join(', ')} to get a better skill estimate`
            );
        }

        if (profileSummary.overallScore >= 0.6) {
            recommendations.push('You have a solid foundation - consider tackling more advanced projects');
        } else {
            recommendations.push('Start with the fundamentals and build up your skills progressively');
        }

        return recommendations;
    }

    return {
        ...summary,
        recommendations: summary ? generateRecommendations(summary.profileSummary) : []
    };
}

async function main() {
    try {
        const beginner = await runPersona('Beginner', 'beginner');
        const intermediate = await runPersona('Intermediate', 'intermediate');
        const advanced = await runPersona('Advanced', 'advanced');

        console.log('--- BEGIN SIMULATION OUTPUT ---');
        console.log(JSON.stringify({ beginner, intermediate, advanced }, null, 2));
        console.log('--- END SIMULATION OUTPUT ---');
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
