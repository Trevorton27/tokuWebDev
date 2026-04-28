// Intermediate test script — paste into browser console at localhost:3000/assessment (or :3003)
// Profile: some HTML/CSS/JS experience, no frameworks, partial understanding of concepts
// Expected score: 40–59% (Developing level)
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
      code_experience: 'Yes — I have written some HTML and CSS and basic JavaScript from tutorials.',
      skill_level: 'beginner', // self-reports lower than actual partial ability
      projects_built: 'A static webpage for a school project. Nothing with real functionality.',
      computer_comfort: 'somewhat_comfortable',
      learning_goal: 'career_change',
    },
    technical_understanding_concepts: {
      // Partially correct — knows the word but explanation is shallow
      answer: 'A function is like a little block of code that does something. You write it once and use it again. I think you can give it a value and it gives something back.',
    },
    technical_frontend_backend: {
      // Surface-level — knows the terms, misses the depth
      answer: 'Frontend is the visual stuff you see on a website, like buttons and menus. Backend is where the data is stored, I think. I am not really sure how they communicate.',
    },
    technical_api_experience: {
      // Has heard of it, followed a tutorial once but does not really understand
      answer: 'I have seen APIs mentioned in tutorials. I once copy-pasted some code that fetched weather data but I did not fully understand what it was doing.',
    },
    technical_debugging: {
      // Limited debugging — only console.log, no systematic approach
      answer: 'I usually add console.log everywhere and look at the browser console. If that does not work I Google the error message and hope one of the Stack Overflow answers works.',
    },
    technical_databases_git: {
      database_familiarity: 'none',
      git_experience: 'I have used Git a little. I know how to commit and push to GitHub but I get confused with branches and merging.',
    },
    problem_solving_approach: {
      // Vague — some instinct but no real system
      answer: 'I usually just start trying things and see what happens. Sometimes I read through the code to find where it might be going wrong, but I do not have a set process.',
    },
    problem_solving_confusion: {
      // Looks things up but relies heavily on copying answers
      answer: 'I search YouTube or Google for an explanation. I try to find someone who had the same problem and copy their solution. I do not always understand why it works.',
    },
    problem_solving_style: {
      guidance_preference: 'semi_guided',
      decomposition_comfort: 'somewhat_comfortable',
    },
    problem_solving_story: {
      // Has a real (but small) experience
      answer: 'I once could not get a CSS layout to look right on mobile. I kept changing numbers randomly until something worked. I later found out about flexbox and that would have helped a lot.',
    },
    learning_style_preferences: {
      learning_method: 'watching',
      structure_preference: 'structured',
      repetition_attitude: 'I need to see examples multiple times before I feel comfortable using something myself.',
      motivation_source: 'clear_goals',
    },
    interests_preferences: {
      primary_interest: ['business_tools', 'automation'],
      app_excitement: 'A tool that helps me organize my tasks automatically.',
      industry_interests: 'Small business and e-commerce.',
      work_preference: 'visual',
    },
    commitment_goals: {
      weekly_hours: '5_10',
      target_timeline: '6_12_months',
      success_definition: 'Be able to build a simple web app on my own without following a tutorial step by step.',
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
