# Hunter's Ledger — Personal Expense Tracker

A full-stack personal expense tracker, themed around the "Hunter" ranking system from *Solo Leveling*.
Every expense you log is treated like a completed quest: you earn XP, level up, climb Hunter ranks
(E → D → C → B → A → S), keep daily streaks alive, and clear daily quests.

## Project Overview

Users register, log in, and manage their own private expenses. The dashboard summarizes spending
by month/year and category, shows recent activity, and displays the gamification "status window."
The expenses page supports full CRUD, filtering, sorting, pagination, and CSV export.

## Features

- Secure registration/login/logout with hashed passwords (bcrypt) and JWT stored in an HTTP-only cookie
- Optional "Sign in with Google" (OAuth) alongside plain email/password
- Light / Dark / System theme, remembered across visits
- Ambient animated background on the login/register screens (drop in your own video, or it falls back to a generated animation automatically)
- Each user can only see and manage their own expenses (authorization enforced server-side)
- Expense CRUD: amount, category, date, optional description
- Dashboard: total this month, total this year, spend-by-category pie chart, 5 most recent expenses
- Filtering by category, date range, min/max amount; sorting by date or amount, both directions
- CSV export of the currently filtered expense list
- Gamification layer:
  - XP for every logged expense
  - 3 daily quests ("Log a Kill", "Track the Hunt", "Categorize the Loot")
  - Streaks with a capped daily bonus
  - Levels (100 XP/level) and Ranks E → S
  - "System window" toast notifications on XP gain / quest complete / level-up
- Responsive UI, loading states, validation messages, empty states

## Tech Stack

**Backend:** Node.js, Express, MongoDB + Mongoose, JWT auth, bcryptjs, morgan (logging), Jest + Supertest + mongodb-memory-server for tests

**Frontend:** React 18 (Vite), React Router, Recharts (charts), Axios, Vitest for tests

**Styling:** Hand-rolled CSS design system (no UI framework) — dark "status window" aesthetic with
Rajdhani (display), Inter (body), and JetBrains Mono (numbers/data)

## Project Structure

```
expense-tracker/
├── backend/
│   ├── config/db.js
│   ├── controllers/        # auth, expense, dashboard
│   ├── middleware/         # auth + centralized error handling
│   ├── models/             # User, Expense
│   ├── routes/
│   ├── utils/              # gamification engine, token, csv
│   ├── tests/              # unit tests + API integration tests
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/     # Sidebar, ExpenseForm, ProtectedRoute
│       ├── context/        # AuthContext, ToastContext
│       ├── pages/          # Login, Register, Dashboard, Expenses, Profile
│       ├── services/api.js
│       └── utils/gamification.js
├── package.json             # root scripts to run both together
└── README.md / AI_USAGE.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account (recommended — see
  Step 2 below, it takes about 3 minutes and needs no downloads or installs)

### 1. Install dependencies
```bash
npm run install:all
```
(or manually: `cd backend && npm install`, then `cd ../frontend && npm install`)

### 2. Set up a database (MongoDB Atlas — do this first, it's quick)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account
2. Create a free "M0" cluster (takes ~1-3 minutes to provision)
3. **Database Access** (left sidebar) → Add a database user → set a username/password, remember them
4. **Network Access** (left sidebar) → Add IP Address → "Allow access from anywhere" (fine for a
   student project)
5. Go back to your cluster → **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
   ```
6. Replace `<username>` and `<password>` with the ones you set (URL-encode special characters
   like `@` or `#` in the password), and add a database name at the end, e.g.:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/hunters-ledger
   ```

### 3. Environment variables
```bash
cp backend/.env.example backend/.env
```
Open `backend/.env` and paste your Atlas connection string as `MONGO_URI`. Set `JWT_SECRET` to
any random string.

> **Alternative (not recommended, but available):** leaving `MONGO_URI=memory` tries to start a
> temporary in-memory database automatically with zero setup. This works well on unrestricted
> home networks, but **commonly fails on corporate/school laptops** because it needs to download a
> MongoDB binary and gets blocked by firewalls or antivirus. If you see an error like `Could not
> start the in-memory database` when running the app, that's this — switch to Atlas above instead
> of troubleshooting it further.

### 4. Run the app
```bash
npm run dev
```
This runs the backend on `http://localhost:5000` and the frontend (Vite) on `http://localhost:5173`,
with the frontend proxying `/api` calls to the backend. Open `http://localhost:5173` and register
a Hunter account — you're in.

### 5. Running tests
```bash
npm run test:backend   # Jest + Supertest + in-memory MongoDB — no real DB needed
npm run test:frontend  # Vitest
npm test               # both
```

### 6. Production build
```bash
npm run build
```
Then set `NODE_ENV=production` and run `npm start --prefix backend` — the Express server will also
serve the built frontend from `frontend/dist`.

## Google Sign-In setup (optional)

The app works completely fine without this — plain email/password registration always works.
Only set this up if you specifically want the "Continue with Google" button to be functional.

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create a project (or pick an
   existing one)
2. **APIs & Services → OAuth consent screen** → set it up as "External", fill in the required
   fields (app name, your email) — you can leave it in "Testing" mode for a class project
3. **APIs & Services → Credentials** → **Create Credentials → OAuth client ID**
4. Application type: **Web application**
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (for local dev)
   - your Vercel URL once deployed, e.g. `https://hunters-ledger.vercel.app`
6. Click Create — copy the **Client ID** it gives you (looks like `123-abc.apps.googleusercontent.com`)
7. Paste that same Client ID into **both**:
   - `backend/.env` → `GOOGLE_CLIENT_ID=...`
   - `frontend/.env` → `VITE_GOOGLE_CLIENT_ID=...` (create this file if it doesn't exist yet, based on `frontend/.env.example`)
8. Restart `npm run dev` — the Google button will now appear on the Login/Register pages

If you skip this entirely, `GOOGLE_CLIENT_ID`/`VITE_GOOGLE_CLIENT_ID` stay blank and the Google
button simply doesn't render — no errors, no broken UI.

## Ambient background video (optional)

The login/register screens support a looping muted background video for atmosphere. See
`frontend/public/README.md` for how to add your own (with links to free, legal sources). If you
don't add one, it automatically falls back to a generated animated gradient — nothing to configure.

## Theme (Light / Dark / System)

Click the theme button in the sidebar (or top-right on the login/register screens) to cycle
System → Light → Dark. Your choice is remembered in the browser across visits.

## Deployment (Local Test → GitHub → Deploy)

Follow this order — don't deploy before it works locally.

### Step 1 — Confirm it runs locally
```bash
npm run install:all
cp backend/.env.example backend/.env
npm run dev
```
Open `http://localhost:5173`, register an account, log an expense, check the dashboard. If that
all works, you're safe to deploy.

### Step 2 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Hunter's Ledger expense tracker"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```
(Create the empty repo on GitHub first, without a README, so there's no merge conflict.)

### Step 3 — Deploy the backend (Render, Railway, or similar)
**Vercel cannot run this backend** — it's a persistent Express server, not a serverless function,
so it needs a real Node host. Render's free tier is the simplest:

1. [render.com](https://render.com) → New → Web Service → connect your GitHub repo
2. **Root directory:** `backend`
3. **Build command:** `npm install`
4. **Start command:** `npm start`
5. Add environment variables (Render dashboard → Environment):
   - `NODE_ENV=production`
   - `JWT_SECRET=<a long random string>`
   - `MONGO_URI=<your MongoDB Atlas connection string>` — get a free one at
     [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register); don't use `memory` in
     production or your data disappears on every restart
   - `CLIENT_URL=` *(fill in after Step 4, once you know your Vercel URL)*
   - `GOOGLE_CLIENT_ID=` *(optional, only if you set up Google Sign-In)*
6. Deploy, then copy the URL Render gives you, e.g. `https://hunters-ledger-api.onrender.com`

### Step 4 — Deploy the frontend to Vercel
1. [vercel.com](https://vercel.com) → New Project → import the same GitHub repo
2. **Root directory:** `frontend`
3. Framework preset: Vite (auto-detected)
4. Add environment variable:
   - `VITE_API_URL=https://hunters-ledger-api.onrender.com/api` (your Render URL + `/api`)
   - `VITE_GOOGLE_CLIENT_ID=` *(optional, only if you set up Google Sign-In)*
5. Deploy, then copy the URL Vercel gives you, e.g. `https://hunters-ledger.vercel.app`

### Step 5 — Connect them
Go back to Render → your backend's environment variables → set:
```
CLIENT_URL=https://hunters-ledger.vercel.app
```
and redeploy the backend so CORS allows requests from your live frontend.

### Step 6 — Verify
Open your Vercel URL, register, log an expense, refresh the page and confirm you're still logged
in (this confirms the cross-domain cookie is working).

> **Live deployment URL:** _add your Vercel link here once deployed_

## API Documentation

All routes are prefixed with `/api`. Authenticated routes require the `jwt` HTTP-only cookie set by
login/register.

| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register a new user | Public |
| POST | `/auth/login` | Log in | Public |
| POST | `/auth/logout` | Log out (clears cookie) | Private |
| GET | `/auth/profile` | Get current user + gamification status | Private |
| PUT | `/auth/profile` | Update name/email/password/budget | Private |
| GET | `/expenses` | List expenses (supports `category`, `startDate`, `endDate`, `minAmount`, `maxAmount`, `sortBy`, `order`, `page`, `limit`) | Private |
| POST | `/expenses` | Create an expense (awards XP/quests) | Private |
| GET | `/expenses/:id` | Get one expense | Private |
| PUT | `/expenses/:id` | Update an expense | Private |
| DELETE | `/expenses/:id` | Delete an expense | Private |
| GET | `/expenses/export` | Export filtered expenses as CSV | Private |
| GET | `/dashboard` | Monthly/yearly totals, category breakdown, recent expenses, quest state | Private |

Errors return `{ "message": "..." }` with the correct HTTP status (400 validation, 401 unauthenticated,
404 not found/foreign resource, 500 unexpected).

## Screenshots

_Add screenshots of the Login page, Dashboard, and Expenses page here once you run the app locally._

## Future Improvements

- Email verification and password reset flow
- Recurring expenses and monthly budget alerts (budget field already exists on the user model)
- Multi-currency support
- Receipt image upload with OCR
- PWA support / offline logging
- CI pipeline (GitHub Actions) running `npm test` on every PR
- Expense tags in addition to categories
- Weekly leaderboard among friends (opt-in, since it's a personal finance app)

## Notes on the Gamification System

This was a deliberate design choice, not just decoration: it maps directly onto the assignment's
required features so nothing is "extra" complexity for its own sake:
- Logging an expense (the required "create" action) triggers XP + quest evaluation
- The dashboard's required stats now double as the Hunter status window
- Daily quests encourage the habit the app is meant to build: actually tracking your spending
