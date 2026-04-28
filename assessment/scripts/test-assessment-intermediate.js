// Intermediate test script — paste into browser console at localhost:3000/assessment (or :3003)
// Profile: knows HTML/CSS/JS basics, built a couple of small projects, no frameworks or backend
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
      code_experience: 'Yes — I have written HTML, CSS, and JavaScript. I built a few static websites and a simple to-do app following a tutorial.',
      skill_level: 'some_experience',
      projects_built: 'A personal portfolio website and a to-do list app in vanilla JavaScript. Nothing with a backend.',
      computer_comfort: 'somewhat', // valid: not_comfortable | somewhat | comfortable | very_comfortable
      learning_goal: 'career_change',
    },
    technical_understanding_concepts: {
      // Scores 2/3 — explains reusability and inputs/outputs but no deep abstraction
      text: 'A function is a reusable block of code that you can call whenever you need it. You can pass values into it and it can return a result. It helps avoid repeating the same code in multiple places.',
    },
    technical_frontend_backend: {
      // Scores 2/3 — distinguishes both clearly but no specific framework examples
      text: 'Frontend is everything the user sees and interacts with in the browser, like buttons, forms, and layouts built with HTML, CSS, and JavaScript. Backend is the server side that handles data storage, business logic, and sending responses to the frontend. I have only worked on the frontend so far.',
    },
    technical_api_experience: {
      // Scores 2/3 — gives a real example, basic fetch usage, doesn't show deep understanding
      text: 'Yes, I have used the fetch function in JavaScript to call a weather API and display the temperature on a webpage. I passed in a URL and read the response as JSON. I am not sure about authentication or how headers work.',
    },
    technical_debugging: {
      // Scores 2/3 — describes a real process, not fully methodical
      text: 'I start by reading the error in the browser console. Then I add console.log statements around the area I think is broken to see what values I am working with. If I am still stuck, I search the error message on Google or Stack Overflow.',
    },
    technical_databases_git: {
      database_familiarity: 'basic', // valid: none | basic | moderate | advanced
      git_experience: 'Yes, I use Git for my projects. I know how to initialize a repo, add, commit, and push to GitHub. I have used branches a couple of times but I get confused with merge conflicts.',
    },
    problem_solving_approach: {
      // Scores 2/3 — structured but not fully methodical
      text: 'I try to understand what the problem is asking before I start. Then I break it into smaller steps and work through each one. If I get stuck I look at similar examples online or re-read the documentation.',
    },
    problem_solving_confusion: {
      // Scores 2/3 — looks things up but relies on copying solutions
      text: 'I search for a different explanation, usually on YouTube or MDN. Sometimes I find a Stack Overflow answer that matches my problem and adapt it. I do not always fully understand why the solution works.',
    },
    problem_solving_style: {
      guidance_preference: 'mix', // valid: step_by_step | independent | mix
      decomposition_comfort: 'somewhat', // valid: not_comfortable | somewhat | comfortable | very_comfortable
    },
    problem_solving_story: {
      // Has a real but small experience
      text: 'I was building a to-do app and my delete button was removing the wrong item from the list. I used console.log to print the index each time the button was clicked and realized I had an off-by-one error in my array. Fixing the index solved it.',
    },
    learning_style_preferences: {
      learning_method: 'doing', // valid: watching | reading | doing | mix
      structure_preference: 'structured',
      repetition_attitude: 'Repetition helps me remember syntax and patterns. I usually practice new concepts several times before I feel comfortable using them.',
      motivation_source: 'clear_goals',
    },
    interests_preferences: {
      primary_interest: ['business_tools', 'automation'],
      app_excitement: 'A tool that automates repetitive tasks for small businesses.',
      industry_interests: 'Small business and e-commerce.',
      work_preference: 'visual',
    },
    commitment_goals: {
      weekly_hours: '10_20',
      target_timeline: '6_12_months',
      success_definition: 'Be able to build a complete web app on my own — frontend and backend — without following a tutorial step by step.',
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
