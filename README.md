# FitTrack

A mobile-first macro and workout tracker built for personal use. Tracks daily calories/protein against goals calculated from your BMR, and logs workouts (exercise, sets, reps, weight). Installable as an app on your phone (PWA) — no app store needed.

## What's inside

- **client/** — React + Tailwind, mobile-first UI, installable PWA
- **server/** — Express API + PostgreSQL (via Prisma ORM)
- Preloaded database of ~100 common Indian foods (calories/protein/carbs/fat per 100g)
- AI fallback: if a food isn't in the list, the app asks Claude to estimate its macros and saves it for next time
- Simple single-user auth (email + password), gated signup so strangers can't create accounts on your public URL
- BMR/TDEE calculation (Mifflin-St Jeor) with bulk / lean / maintain goal presets

## 1. Deploy to Railway (recommended — gives you a permanent URL)

1. **Push this project to GitHub.** Create a new repo on github.com, then from this folder:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/fittrack.git
   git push -u origin main
   ```

2. **Create a Railway project.** Go to [railway.app](https://railway.app), sign in with GitHub, click **New Project → Deploy from GitHub repo**, and pick your `fittrack` repo.

3. **Add a Postgres database.** In your Railway project, click **New → Database → Add PostgreSQL**. Railway automatically creates a `DATABASE_URL` variable and makes it available to your other service — you don't need to copy it manually as long as both services are in the same project (Railway auto-injects it as a shared variable reference; if it doesn't appear automatically, go to your app service → Variables → add `DATABASE_URL` and reference the Postgres plugin's connection string).

4. **Set environment variables** on your app service (Settings → Variables):
   - `JWT_SECRET` — a long random string. Generate one locally with `openssl rand -hex 32`.
   - `SIGNUP_SECRET` — a passphrase you make up. You'll need to type this once when you create your account, so random visitors to your URL can't sign up.
   - `ANTHROPIC_API_KEY` — optional, only needed for AI food estimation. Get one at console.anthropic.com. Leave it unset and the app still works fine with the preloaded food list; the AI fallback button will just show a message instead.
   - `NODE_ENV=production`

5. **Deploy.** Railway will run `npm run build` (builds the React app and generates the Prisma client) then `npm start` (syncs the database schema, seeds the Indian foods list, and starts the server). Your app will be live at the `.up.railway.app` URL Railway gives you — go to Settings → Networking → Generate Domain if one isn't shown yet.

6. **Create your account.** Open the URL on your phone, tap "Create an account", enter your email, a password, and the `SIGNUP_SECRET` you set above.

7. **Install it on your phone:**
   - **iPhone (Safari):** open the URL → tap the Share icon → "Add to Home Screen"
   - **Android (Chrome):** open the URL → tap the ⋮ menu → "Add to Home screen" / "Install app"

   It'll behave like a native app: its own icon, full-screen, no browser bar.

## About your data

- All data lives in the Railway Postgres database, which persists independently of your app deploys — redeploying or restarting the app never touches your data.
- Railway's Postgres plugin includes automatic daily backups on paid plans; on the free tier, consider periodically exporting a backup yourself (`Settings → Backups` in the Postgres plugin, or `pg_dump` using the connection string).
- Because this app has real login/password protection and a gated signup secret, it's safe to leave the URL public — nobody can access your data without your password.

## 2. Running locally (optional, for development)

You'll need Node.js 18+ and a local or cloud Postgres database.

```bash
# Server
cd server
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, SIGNUP_SECRET
npm install
npx prisma db push
npm run seed
npm run dev             # runs on http://localhost:4000

# Client (in a separate terminal)
cd client
npm install
npm run dev              # runs on http://localhost:5173, proxies /api to :4000
```

## Notes on the nutrition data

The preloaded food macros are typical/average values for common Indian dishes and ingredients — actual values vary by recipe, portion, and preparation. Treat them as good estimates for daily tracking, not lab-precise figures. You can always add a custom food manually with your own measured values via the AI-lookup screen if you know more accurate numbers.
