// Beginner test script — paste into browser console at localhost:3000/assessment (or :3003)
// Profile: no programming experience, wants to learn, expected score <=30%
// Run AFTER signing in. Resets sessions AND skill masteries so prior runs don't inflate score.
// When done, click "Submit answers" manually on the summary page.

(async () => {
  // Full reset — clears sessions, responses, roadmaps, and UserSkillMastery
  var resetRes = await fetch('/api/assessment/intake/reset', { method: 'DELETE' });
  var resetJson = await resetRes.json();
  console.log('Reset:', JSON.stringify(resetJson));

  const startRes = await fetch('/api/assessment/intake/start', { method: 'POST' });
  const startJson = await startRes.json();
  const sid = startJson.data.sessionId;
  console.log('Session:', sid, '| Resuming:', startJson.data.isResuming);

  var answers = {
    background_experience: {
      code_experience: 'No. Never written code.',
      skill_level: 'beginner',
      projects_built: 'No.',
      computer_comfort: 'not_comfortable',
      learning_goal: 'career_change',
    },
    technical_understanding_concepts: {
      // Completely wrong — no understanding of functions
      answer: 'I have no idea. I do not know what a function is.',
    },
    technical_frontend_backend: {
      // Completely wrong
      answer: 'I do not know.',
    },
    technical_api_experience: {
      // No knowledge
      answer: 'No. I do not know what an API is.',
    },
    technical_debugging: {
      // No knowledge
      answer: 'I have never debugged code. I would not know where to start.',
    },
    technical_databases_git: {
      database_familiarity: 'none',
      git_experience: 'No. Never used Git.',
    },
    problem_solving_approach: {
      // No structured approach
      answer: 'I would guess randomly.',
    },
    problem_solving_confusion: {
      // Gives up immediately
      answer: 'I give up.',
    },
    problem_solving_style: {
      guidance_preference: 'fully_guided',
      decomposition_comfort: 'not_comfortable',
    },
    problem_solving_story: {
      // No experience
      answer: 'I cannot think of one.',
    },
    learning_style_preferences: {
      learning_method: 'watching',
      structure_preference: 'structured',
      repetition_attitude: 'I need lots of repetition.',
      motivation_source: 'clear_goals',
    },
    interests_preferences: {
      primary_interest: ['business_tools'],
      app_excitement: 'A simple booking app for my business.',
      industry_interests: 'Small business.',
      work_preference: 'visual',
    },
    commitment_goals: {
      weekly_hours: '5_10',
      target_timeline: '6_12_months',
      success_definition: 'Build one simple app on my own.',
    },
  };

  var stepOrder = [
    'background_experience',
    'technical_understanding_concepts',
    'technical_frontend_backend',
    'technical_api_experience',
    'technical_debugging',
    'technical_databases_git',
    'problem_solving_approach',
    'problem_solving_confusion',
    'problem_solving_style',
    'problem_solving_story',
    'learning_style_preferences',
    'interests_preferences',
    'commitment_goals',
  ];

  for (var i = 0; i < stepOrder.length; i++) {
    var stepId = stepOrder[i];
    var answer = answers[stepId];
    var res = await fetch('/api/assessment/intake/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sid, stepId: stepId, answer: answer }),
    });
    var json = await res.json();
    console.log('done: ' + stepId + (json.data && json.data.isComplete ? ' <- COMPLETE' : ''));
    if (json.data && json.data.isComplete) break;
  }

  console.log('Ready — reloading to summary. Click "Submit answers" to trigger emails + roadmap generation.');
  window.location.reload();
})();
