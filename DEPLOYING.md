# Deploying Bud to your phone(s)

Goal: get the app on the real internet with a real database, so opening it
on your phone (or a second phone) shows the same pet and tasks. Everything
below is free and none of the services require a credit card.

Pieces you'll set up:
- **Neon** — free hosted Postgres database
- **Render** — free host for the API (`server/`)
- **Vercel** — free host for the web app (`client/`)

## 1. Create a free Postgres database (Neon)

1. Go to https://neon.tech and sign up (GitHub login is easiest).
2. Create a new project (any name, e.g. "bud").
3. On the project dashboard, copy the **connection string** — it looks like
   `postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require`.
   Save it; you'll paste it into Render in the next step.

## 2. Deploy the API (Render)

1. Go to https://render.com and sign up, connecting your GitHub account.
2. Click **New +** → **Web Service**.
3. Pick the `bhumikabatra1995-tech/Bb8` repository and the branch you want
   to deploy (e.g. `claude/adhd-app-wt8l5j`, or `main` after merging).
4. Set **Root Directory** to `server`.
5. **Build Command**:
   ```
   npm install && npx prisma migrate deploy && npm run build
   ```
6. **Start Command**:
   ```
   npm start
   ```
7. Under **Environment Variables**, add:
   - `DATABASE_URL` — the Neon connection string from step 1
   - `JWT_SECRET` — any long random string (mash the keyboard, or generate
     one online — this signs login sessions, keep it secret)
   - `CLIENT_ORIGIN` — leave as `http://localhost:5173` for now, updated in
     step 4
8. Click **Create Web Service** and wait for it to build and go live.
9. Copy its URL, e.g. `https://bud-api-xxxx.onrender.com`.

Render's free tier spins down after inactivity and takes ~30-60 seconds to
wake up on the first request after a while — normal for a free personal app.

## 3. Deploy the frontend (Vercel)

1. Go to https://vercel.com and sign up with GitHub.
2. Click **Add New** → **Project**, and pick the `Bb8` repository.
3. Set **Root Directory** to `client`. Vercel should auto-detect Vite.
4. Under **Environment Variables**, add:
   - `VITE_API_URL` — your Render URL + `/api`, e.g.
     `https://bud-api-xxxx.onrender.com/api`
5. Click **Deploy**. Copy the resulting URL, e.g. `https://bud-xxxx.vercel.app`.

## 4. Connect the two (fix CORS)

1. Back in Render, open your web service → **Environment**.
2. Update `CLIENT_ORIGIN` to your Vercel URL from step 3, exactly as
   written, no trailing slash — e.g. `https://bud-xxxx.vercel.app`.
3. Save. Render redeploys automatically with the new value.

## 5. Install it on your phone

1. Open your Vercel URL in your phone's browser (Safari on iPhone, Chrome
   on Android).
2. Sign up with an email + password — this hatches your pet.
3. Add it to your home screen:
   - **iPhone**: tap the Share icon → **Add to Home Screen**.
   - **Android (Chrome)**: tap the ⋮ menu → **Add to Home screen** / **Install app**.
4. You'll get an app icon that opens Bud full-screen, like a native app.

## 6. Install on a second phone

1. Open the same Vercel URL on the second phone.
2. Log in with the **same email and password** to see the same pet and
   tasks, or sign up with a different email for a separate pet.
3. Add to Home Screen the same way as step 5.

Because both phones talk to the same Render API and Neon database,
completing a task on one phone and reopening (or pulling to refresh) the
app on the other shows the update.

## Updating later

Push new commits to the branch Render and Vercel are watching, and both
redeploy automatically.
