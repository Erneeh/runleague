# Deploy RunLeague online (so friends can sign up)

## 1. Put the code on GitHub

1. Create a new repo on [github.com](https://github.com/new).
2. In the `runleague` folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your repo.

## 2. Deploy on Vercel (free)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. **Add New Project** → Import your `runleague` repo.
3. Set **Root Directory** to `runleague` if the repo contains more than this app.
4. **Environment variables** – add these (Settings → Environment Variables, or during import):

   | Name | Value | Notes |
   |------|--------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | From Supabase Dashboard → Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Same place |
   | `STRAVA_CLIENT_SECRET` | Your Strava client secret | Only if you use Strava |
   | `NEXT_PUBLIC_STRAVA_CLIENT_ID` | Your Strava client ID | Only if you use Strava |
   | `NEXT_PUBLIC_STRAVA_REDIRECT_URI` | `https://YOUR_VERCEL_URL/api/strava/callback` | Set after first deploy; see below |

5. Deploy. Vercel will give you a URL like `runleague-xxx.vercel.app`.

## 3. Configure Supabase for the live URL

So login/signup and redirects work for your friends:

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. **Authentication** → **URL Configuration**.
3. Set **Site URL** to your Vercel URL, e.g. `https://runleague-xxx.vercel.app`.
4. Under **Redirect URLs**, add:
   - `https://runleague-xxx.vercel.app/**`
   - `https://YOUR_CUSTOM_DOMAIN/**` (if you add one later).

Save. Your friends can now sign up and log in on the live site.

## 4. (Optional) Strava

If you use Strava:

1. In [Strava API settings](https://www.strava.com/settings/api), set **Authorization Callback Domain** to your Vercel domain, e.g. `runleague-xxx.vercel.app` (no `https://`).
2. In Vercel, set `NEXT_PUBLIC_STRAVA_REDIRECT_URI` to `https://YOUR_VERCEL_DOMAIN/api/strava/callback`.
3. Redeploy so the new env var is applied.

## 5. Share the link

Send your friends the Vercel URL (or your custom domain). They can sign up with email or Google there.

---

**Tip:** For more sign-ups without hitting “email rate limit exceeded”, either turn off **Confirm email** in Supabase (Auth → Providers → Email) for testing, or use **Sign in with Google** (no confirmation email).
