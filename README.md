# Bud — an ADHD companion app

A task manager built around a virtual pet: knock out real tasks (especially the
boring "life admin" ones) and your pet gains XP, gets happier, and evolves
through stages (egg → hatchling → kid → teen → adult). Miss too many days and
its happiness gently fades, giving a reason to come back without ever
punishing you into a shame spiral.

## Stack

- **server/** — Express + TypeScript API, Prisma ORM on Postgres, JWT auth.
- **client/** — React + TypeScript + Vite, Tailwind CSS, responsive and
  installable as a home-screen app (PWA) on both iOS and Android.

Accounts + cloud sync: tasks and pet state live in a shared Postgres
database per user, so logging in from any device (or a second phone) shows
the same pet and task list. See "Deploying" below to get this running on
real phones instead of just localhost.

## Running locally

You need a Postgres database to point at — either install Postgres locally,
or just use a free hosted one (e.g. [Neon](https://neon.tech)) even for dev.

### 1. Server

```bash
cd server
cp .env.example .env   # set DATABASE_URL to your Postgres connection string,
                        # and JWT_SECRET to any long random string
npm install
npx prisma migrate dev
npm run dev             # http://localhost:4000
```

### 2. Client

```bash
cd client
cp .env.example .env    # points at the local API by default
npm install
npm run dev              # http://localhost:5173
```

Sign up with any email/password (8+ characters) to hatch your pet.

## Features

- Add, edit, delete, and complete tasks with a category and effort level
  (quick / medium / big).
- Mark a task "repeats daily" for routines like meds or checking the mail —
  it automatically reappears unchecked each morning.
- A pet that levels up, gains happiness, and evolves through visual stages
  (egg → hatchling → kid → teen → adult) as you complete tasks, plus a daily
  streak counter.
- Installable as a home-screen app on both iOS and Android (PWA manifest +
  icons), and works as a normal responsive site in any browser.
- Rate-limited auth endpoints and standard security headers (helmet) on the
  API.

## How the pet mechanics work

- Each task has an effort level (quick / medium / big) that determines the
  XP and happiness reward on completion.
- Every 100 XP is a level; level thresholds map to visual stages in
  `server/src/pet.ts` (`stageForLevel`).
- Completing a task on a new calendar day (relative to the last completed
  task) increments a streak; skipping a day resets it.
- Happiness decays a little per idle day but never drops below a floor, so
  a missed day never feels like starting over.
- Recurring tasks reset to incomplete lazily (checked on fetch, no cron
  needed) once their `completedAt` is no longer "today".

## Tests

```bash
cd server
npm test   # unit tests for the pet leveling/reward logic
```

## Deploying (so it works on your phone, with data that persists)

See `DEPLOYING.md` for the full step-by-step walkthrough: free hosted
Postgres (Neon) + free API host (Render) + free static host (Vercel) for
the client, then "Add to Home Screen" on each phone.

## Production notes

- `JWT_SECRET` must be set to a long random value outside local dev.
- `CLIENT_ORIGIN` on the server must exactly match the deployed frontend's
  URL (CORS will otherwise reject requests from it).
