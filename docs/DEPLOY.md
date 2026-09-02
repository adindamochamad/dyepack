# Deploy & environment

## Live site

**Production:** https://dyepack-liard.vercel.app  
**Vercel project:** `adindamo/dyepack`

## Option A — Vercel ↔ GitHub (recommended)

Auto-deploy on every push to `main`.

1. Open [Vercel → Account → Authentication](https://vercel.com/account/settings/authentication)
2. **Connect** your GitHub account (`adindamochamad`)
3. Open [Vercel → dyepack → Settings → Git](https://vercel.com/adindamo/dyepack/settings/git)
4. Connect repository `adindamochamad/dyepack`, production branch `main`

Or from CLI (after GitHub is connected on Vercel):

```bash
vercel git connect https://github.com/adindamochamad/dyepack
```

## Option B — GitHub Actions deploy

If Vercel GitHub OAuth is blocked, use a deploy token:

1. Create a token at [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Add to GitHub repo secrets: **Settings → Secrets → `VERCEL_TOKEN`**
3. Push to `main` — workflow `.github/workflows/deploy.yml` runs `vercel deploy --prod`

CI (test + typecheck + build) always runs via `.github/workflows/ci.yml`.

## OPENAI_API_KEY (optional)

Only needed for **live LLM mode** on `/api/agent`. The split demo uses scripted mode and does not require a key.

**Local:**

```bash
cp .env.example .env.local
# set OPENAI_API_KEY=sk-...
```

**Vercel:**

```bash
vercel env add OPENAI_API_KEY production
```

Check status: `GET /api/health` → `{ "liveLLM": true }` when configured.

## Manual deploy

```bash
vercel deploy --prod
```

## WebMCP smoke (local only)

Requires Google Chrome 149+ installed locally — not available in GitHub Actions runners.

```bash
pnpm smoke:browser
SMOKE_URL=https://dyepack-liard.vercel.app pnpm smoke:browser
```

Skip in CI: `SKIP_SMOKE_BROWSER=1 pnpm smoke:browser` (exits 0).
