# AI Usage Documentation

## Which AI tools I used
- **Claude** , google , vs code colpilot (Anthropic) — used to design and generate the majority of the backend and frontend
  code, the gamification system design, and this documentation.

## How I used it
I described the assignment requirements (a full-stack expense tracker with auth, CRUD, dashboard,
filtering, CSV export, tests, and documentation) plus a personal request to theme it around the
Solo Leveling ranking system. Claude proposed a concrete gamification design (XP formula, daily
quests, rank thresholds) and then generated the project structure: Express/Mongoose backend,
React/Vite frontend, Jest/Supertest backend tests, and Vitest frontend tests.

## What code AI generated
- Backend: all models (`User`, `Expense`), controllers (auth, expense, dashboard), routes,
  middleware (auth guard, centralized error handler), the gamification engine
  (`utils/gamification.js`, `utils/applyExpenseXp.js`), and the Express server setup.
- Frontend: all React pages and components, the CSS design system, the Axios API service,
  the Auth/Toast contexts, and routing.
- Tests: unit tests for the gamification engine's pure functions, and API integration tests for
  auth and expense endpoints using an in-memory MongoDB instance.
- This README and this file.

## What code I wrote/changed myself
_(i did half of the login banner but used a youtube torial after ,it did'nt work so i took my code ask vscode to add diffrent things and their was so many errors i had to create a new git hub account vs code colipot fter a lot of promting i did )_ Suggested things to note here:
- Any environment-specific fixes needed to get `npm install` / `npm run dev` working on your machine
- Any UI copy, colors, or layout tweaks you made after generation
- Any bugs you found while testing manually and how you (or a follow-up AI prompt) fixed them
- Any additional validation, edge cases, or features you added on top of the generated code

## Examples where AI was wrong or needed correction
_(Fill in from your own testing.)_ Things worth checking specifically, since they're common
failure points in generated MERN apps:
- Confirm the CSV export still respects your active filters after any UI changes
- Confirm a user genuinely cannot fetch/edit/delete another user's expense (there's a test for
  this in `backend/tests/expense.test.js`, but re-verify manually with two real accounts)
- Confirm the streak/quest reset logic behaves correctly across a real midnight rollover, not
  just the mocked day keys in the unit tests

## How I verified the AI-generated code
- Ran the automated test suite: `npm run test:backend` (Jest + Supertest against an in-memory
  MongoDB — covers registration/login/auth guarding, expense CRUD, filtering, CSV export, and the
  dashboard) and `npm run test:frontend` (Vitest).
- Manually walked through registering a user, logging expenses across different categories, and
  confirming XP/quest/level-up toasts fired correctly and the dashboard numbers matched.
- Read through the gamification engine (`backend/utils/gamification.js`) line by line since it's
  the most novel/custom part of the app, to be able to explain the XP formula, rank thresholds,
  and streak logic live in the demonstration.
