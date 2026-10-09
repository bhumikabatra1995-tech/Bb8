# 33C & 34C

Our family's own magical corner: two Delhi houses, side by side, with the
whole family inside, from New York to Vancouver to Delhi.

**The journey:** open the app → tap the door of 33C or 34C → tap your
portrait → the Great Hall. The tabs at the bottom go to Home, Games, the
Atelier, Owl Post and your own card.

| Room | What it does |
| --- | --- |
| **Owl Post** | Letters to one person, a house, or everyone. Wax seals, Howlers that read themselves out loud, and a one-tap "tell them on WhatsApp". |
| **The Atelier** | Fashion studio. Pick a silhouette (ball gown, lehenga, mermaid, A-line, party dress, wizard robe), fabric, pattern and accessories, or **paint straight onto the dress**. Designs walk the runway and go into the family Lookbook, where hearts earn the designer points. |
| **Games** | *Wizard Duel* (live, phone to phone, best of five spells) · *Snitch Chase* (30-second arcade) · *Owl Pictionary* (draw now, everyone guesses whenever they're free). |
| **Pensieve** | Anyone asks the family a question; answers stay sealed until you add your own memory. |
| **House Cup** | Every owl, memory, drawing, design and duel earns points for your house. Resets monthly. |
| **Time-Turner** | Countdown to the next family date, your Google Calendar, and live weather in New York, Vancouver and Delhi. |
| **Marauder's Map** | Leave your footprints wherever you are. Only places people choose to share; nobody is tracked. |

Nothing is pre-written: every letter, question, date and design is the family's own.

## Run it locally

```bash
cd family
npm install
npm run dev        # http://localhost:5173
```

Without any setup it saves to the phone it's running on. To share between
phones, connect the database (below).

## Put it online (about 15 minutes, all free)

### 1. Database: Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor** → paste `supabase/schema.sql` → **Run**. Nothing to edit.
   (To lock the database to a secret join link, see the comment at the top of that file.)
3. **Project Settings → API**: copy the **Project URL** and the **anon public key**.

### 2. Hosting: Vercel
1. [vercel.com](https://vercel.com) → **Add New → Project** → pick this repo.
2. **Root Directory**: `family`. Framework preset: **Vite**.
3. **Environment Variables**:
   - `VITE_SUPABASE_URL`: the Project URL
   - `VITE_SUPABASE_ANON_KEY`: the anon key
   - `GOOGLE_CALENDAR_ICS_URL` (optional, see step 3)
4. **Deploy.**

### 3. Google Calendar (optional)
Make a shared Google Calendar called "33C & 34C" and add birthdays, visits
and festivals to it. Then go to **Settings → that calendar → Secret
address in iCal format**, copy it into `GOOGLE_CALENDAR_ICS_URL` on Vercel,
and redeploy. The address stays on the server, so the calendar stays
private.

### 4. Phone notifications
1. Re-run `supabase/schema.sql` in the SQL Editor (safe to run again; it adds the `push_subs` table).
2. In Vercel → **Settings → Environment Variables**, add `VAPID_PRIVATE_KEY` (the private half of the
   key pair whose public half is `VAPID_PUBLIC` in `src/state/push.ts`), then **Redeploy**.
3. Each person taps **Turn on** on the Home screen. On iPhone (iOS 16.4+) the app must be opened from
   the Home Screen icon first.

### 5. Invite the family
Send everyone the app's address, only inside the family. Then use **Share → Add to Home Screen**
(iPhone, in Safari) or **⋮ → Add to Home screen** (Android) so it opens
like a real app.

## The paintings

Each room can have a painted backdrop, with the candles, owls, light and
sparkle animated live on top. See [`ART.md`](ART.md) for the prompts. Save
the images into `public/art/` with the names listed there. Until a painting
exists, the room uses its drawn backdrop.

## Points

| Action | Points |
| --- | --- |
| Send an owl | 2 |
| Ask the Pensieve / share a memory | 2 / 5 |
| Save a fashion design / each heart it gets | 3 / 1 |
| Guess a drawing / your drawing gets guessed | 3 / 2 |
| Win / play a live duel | 10 / 2 |
| Snitch Chase | 1 per catch (up to 15 a day) |
