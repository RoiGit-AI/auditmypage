# AuditMyPage — Deployment Guide

## Overview

AuditMyPage runs as a Docker container on Jarvis's Hetzner VPS (`46.224.133.155`). The CI/CD pipeline builds a Docker image on push to `main`, pushes to GHCR, and triggers Coolify redeployment.

## Step-by-Step Deployment

### 1. Create GitHub Repository

On Jarvis's GitHub account (`RoiGit-AI`):

```bash
gh repo create RoiGit-AI/auditmypage --public --source=. --remote=origin --push
```

Or create via GitHub UI and push:

```bash
cd projects/jarvis/auditmypage
git init
git add .
git commit -m "Initial commit — AuditMyPage MVP"
git remote add origin git@github.com:RoiGit-AI/auditmypage.git
git push -u origin main
```

### 2. Set GitHub Secrets

```bash
# Coolify API token (from Jarvis's server)
gh secret set COOLIFY_TOKEN --repo RoiGit-AI/auditmypage

# Coolify webhook URL (set after creating Coolify app in step 4)
gh secret set COOLIFY_WEBHOOK_URL --repo RoiGit-AI/auditmypage
```

### 3. Configure DNS (Cloudflare)

Add these DNS records in Cloudflare for `auditmypage.com`:

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| A | `@` | `46.224.133.155` | Proxied |
| A | `www` | `46.224.133.155` | Proxied |

### 4. Create Coolify Application

1. SSH into Jarvis's VPS: `ssh -i ~/.ssh/jarvis openclaw@46.224.133.155`
2. Open Coolify dashboard (tunnel: `ssh -L 18789:localhost:18789 ...`)
3. Create new application:
   - Source: GitHub (GHCR image `ghcr.io/roigit-ai/auditmypage:latest`)
   - Port: `3000`
   - Health check: `GET /health`
   - Domain: `auditmypage.com`
4. Add environment variables:
   - `ANTHROPIC_API_KEY` — Jarvis's Anthropic API key
   - `STRIPE_SECRET_KEY` — from Stripe dashboard
   - `STRIPE_WEBHOOK_SECRET` — from Stripe webhook setup
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — from Stripe dashboard
   - `DATABASE_PATH` — `/app/data/auditmypage.db`
   - `SITE_URL` — `https://auditmypage.com`
5. Add persistent volume: mount `/app/data` to a host directory for SQLite persistence
6. Copy the Coolify webhook URL and set it as `COOLIFY_WEBHOOK_URL` GitHub secret

### 5. Set Up Stripe

1. Create Stripe account (or use Jarvis's existing one)
2. Create webhook endpoint: `https://auditmypage.com/api/webhook`
3. Subscribe to event: `checkout.session.completed`
4. Copy the webhook signing secret to Coolify env vars

### 6. Verify Deployment

```bash
# Check health
curl https://auditmypage.com/health

# Check landing page
curl -s https://auditmypage.com | head -20
```

## Architecture

```
GitHub (push to main)
  → GitHub Actions (build Docker image)
  → GHCR (push image)
  → Coolify webhook (trigger redeploy)
  → VPS (pull image, start container)
  → Cloudflare (DNS + CDN proxy)
  → auditmypage.com
```

## Persistent Data

The SQLite database is stored at `/app/data/auditmypage.db` inside the container. **Mount `/app/data` as a persistent volume** in Coolify to prevent data loss on redeployment.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Playwright timeout | Chromium is bundled in Docker via `apk add chromium`. Check `/usr/bin/chromium-browser` exists |
| SQLite permission error | Ensure `/app/data` is writable (owned by node user) |
| Stripe webhook fails | Verify `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint secret |
| Build fails on GHCR push | Check GitHub package permissions (Settings → Packages → Read/Write) |
