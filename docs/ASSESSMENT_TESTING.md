# Assessment Testing Guide

This document explains how to manually test the assessment intake flow end-to-end, including email delivery verification.

---

## Prerequisites

- Assessment dev server running on `http://localhost:3003`
- Signed in to the app at `http://localhost:3003/sign-in`
- `RESEND_API_KEY` present in `assessment/.env`
- Browser DevTools open (F12 → Console tab)

---

## Step 1 — Reset Your Session

If you have an existing session (completed or in-progress), delete it before starting a fresh test run. Paste this in the browser console:

```javascript
await fetch('/api/assessment/intake/reset', { method: 'DELETE' })
  .then(r => r.json())
  .then(console.log);
```

Expected response:
```json
{ "success": true, "deleted": 1 }
```

> This endpoint is blocked in production (`NODE_ENV === 'production'`). It only works locally.

---

## Step 2 — Auto-Fill All Steps Except the Last

The script at `test-assessment-submit.js` (project root) submits canned answers for all 13 steps, then reloads the page landing you on the summary screen where you can click **Submit answers** manually.

### Copy the script to your clipboard

```bash
cat /home/trey27/Documents/projects/signal-works-lms/test-assessment-submit.js
```

### Paste and run in the browser console

1. Navigate to `http://localhost:3003/assessment`
2. Open DevTools → Console
3. Paste the exact file contents (do not retype — backticks and special characters will break it)
4. Hit Enter

### What it does

- Calls `/api/assessment/intake/start` to get or create a session
- Submits pre-filled answers for each of the 13 steps in order
- Logs `done: <stepId>` for each successful submission
- Reloads the page when done — you land on the summary screen

### Script contents

```javascript
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
```

---

## Step 3 — Submit Manually

After the page reloads you will land on the summary screen showing the skill profile. Click **Submit answers**. This:

1. Calls `/api/assessment/intake/finalize`
2. Generates an AI roadmap via Claude based on the student's answers
3. Sends the internal report email to `support@signalworksdesign.com`
4. Sends the student confirmation email with next steps and booking link

---

## Step 4 — Verify Emails

| Inbox | Expected content |
|---|---|
| `support@signalworksdesign.com` | Full internal report — skill profile, AI-generated roadmap, all answers |
| Student email (e.g. `spiral272@gmail.com`) | Confirmation — thank you, next steps, booking link |

If no emails arrive within 60 seconds, check the terminal running the dev server for error output from `emailService.ts` or `roadmapService.ts`.

---

## Common Issues

### `401 Unauthorized` when running the script
You are not signed in. Navigate to `http://localhost:3003/sign-in`, authenticate, then run the script from the assessment page.

### Page returns to step 1 after script runs
A completed session was not found and a new one was created. Run the reset first, then re-run the script.

### No emails received
1. Confirm `RESEND_API_KEY` is in `assessment/.env`
2. Restart the dev server after adding the key — env vars are read at startup
3. Check terminal logs for `Internal email error` or `Student email failed`

### Script syntax error in console
Copy from the file directly — do not retype. Backticks and special characters break when retyped:
```bash
cat /home/trey27/Documents/projects/signal-works-lms/test-assessment-submit.js
```

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/assessment/intake/start` | Start or resume a session |
| `POST` | `/api/assessment/intake/submit` | Submit answer for a step |
| `GET` | `/api/assessment/intake/current` | Get current step and progress |
| `GET` | `/api/assessment/intake/summary` | Get session summary after completion |
| `POST` | `/api/assessment/intake/finalize` | Send result emails + generate AI roadmap |
| `DELETE` | `/api/assessment/intake/reset` | **Dev only** — delete all sessions for current user |

---

## Canned Answers Reference

| Step ID | Kind | Summary |
|---|---|---|
| `background_experience` | QUESTIONNAIRE | Intermediate, HTML/CSS/JS/React, career change |
| `technical_understanding_concepts` | SHORT_TEXT | Explanation of functions |
| `technical_frontend_backend` | SHORT_TEXT | Frontend vs backend explanation |
| `technical_api_experience` | SHORT_TEXT | Used fetch with OpenWeatherMap |
| `technical_debugging` | SHORT_TEXT | Read errors, console.log, search docs |
| `technical_databases_git` | QUESTIONNAIRE | Basic DB familiarity, uses Git/GitHub |
| `problem_solving_approach` | SHORT_TEXT | Define → break down → tackle smallest piece |
| `problem_solving_confusion` | SHORT_TEXT | Re-read, search, build simple examples |
| `problem_solving_style` | QUESTIONNAIRE | Mix of guidance/independent, comfortable decomposing |
| `problem_solving_story` | SHORT_TEXT | Fixed infinite re-render bug in React |
| `learning_style_preferences` | QUESTIONNAIRE | Hands-on, structured, clear goals |
| `interests_preferences` | QUESTIONNAIRE | AI, automation, business tools, mix of visual/logic |
| `commitment_goals` | QUESTIONNAIRE | 10–20 hrs/week, 3–6 months, junior dev role |
