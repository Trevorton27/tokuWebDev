(async () => {
  const startRes = await fetch('/api/assessment/intake/start', { method: 'POST' });
  const startJson = await startRes.json();
  const sid = startJson.data.sessionId;
  console.log('Session:', sid, '| Resuming:', startJson.data.isResuming);

  var answers = {
    background_experience: {
      code_experience: 'Yes — HTML, CSS, JavaScript, and a bit of React.',
      skill_level: 'intermediate',
      projects_built: 'A personal portfolio site and a simple to-do app in React.',
      computer_comfort: 'comfortable',
      learning_goal: 'career_change',
    },
    technical_understanding_concepts: {
      answer: 'A function is a reusable block of code that performs a specific task. You define it once and can call it multiple times. It can take inputs (parameters) and return an output.',
    },
    technical_frontend_backend: {
      answer: 'Frontend is everything the user sees and interacts with in the browser — HTML, CSS, JavaScript, React. Backend is the server-side logic, databases, and APIs that power the app.',
    },
    technical_api_experience: {
      answer: 'Yes — I have used the fetch API to call third-party APIs like OpenWeatherMap to display weather data on a webpage.',
    },
    technical_debugging: {
      answer: 'I start by reading the error message carefully, then add console.log statements to trace where the issue is. If that does not help, I search the error message and check documentation.',
    },
    technical_databases_git: {
      database_familiarity: 'basic',
      git_experience: 'Yes — I use Git and GitHub for version control on my projects. I know add, commit, push, and pull.',
    },
    problem_solving_approach: {
      answer: 'I start by clearly defining what the problem actually is, then break it into smaller pieces. I tackle the smallest piece first and work my way up.',
    },
    problem_solving_confusion: {
      answer: 'I re-read the material, look for a different explanation online, and try to build a simple example to test my understanding.',
    },
    problem_solving_style: {
      guidance_preference: 'mix',
      decomposition_comfort: 'comfortable',
    },
    problem_solving_story: {
      answer: 'I once had a bug where my React component was re-rendering infinitely. I isolated the useEffect, read the docs, and realized I had a missing dependency array. Fixed it and learned a lot about hooks.',
    },
    learning_style_preferences: {
      learning_method: 'doing',
      structure_preference: 'structured',
      repetition_attitude: 'I think repetition is essential for building muscle memory, especially for syntax and patterns.',
      motivation_source: 'clear_goals',
    },
    interests_preferences: {
      primary_interest: ['ai', 'automation', 'business_tools'],
      app_excitement: 'AI-powered productivity tools and developer tools.',
      industry_interests: 'Tech, education, and finance.',
      work_preference: 'mix',
    },
    commitment_goals: {
      weekly_hours: '10_20',
      target_timeline: '3_6_months',
      success_definition: 'Landing a junior developer role and being able to build and ship my own projects confidently.',
    },
    // summary is intentionally omitted — submit manually in the UI
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

  console.log('Ready — reloading to summary. Click "Submit answers" to trigger emails.');
  window.location.reload();
})();
