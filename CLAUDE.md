# AuditMyPage

AI-powered SEO audit tool + privacy policy generator. First product built by the Jarvis autonomous agent.

**Domain:** https://auditmypage.com
**Repository:** https://github.com/RoiGit-AI/auditmypage

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | SQLite via sql.js (pure WASM) |
| AI | Claude API (@anthropic-ai/sdk) |
| Payments | Stripe Checkout (one-time) |
| Scraping | Playwright (headless Chromium) |
| Runtime | Node.js 22 (Alpine in Docker) |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── audit/route.ts          # POST — run SEO audit
│   │   ├── checkout/route.ts       # POST — create Stripe session
│   │   ├── claim-policy/route.ts    # POST — claim free policy (streams NDJSON)
│   │   ├── generate-policy/route.ts # POST — generate policy preview
│   │   ├── policy/[id]/route.ts    # GET — fetch policy data
│   │   └── webhook/route.ts        # POST — Stripe webhook handler
│   ├── audit/
│   │   ├── page.tsx                # Landing page (re-export)
│   │   └── [id]/page.tsx           # Audit results (SSR)
│   ├── privacy-policy/[id]/page.tsx # Policy viewer (client)
│   ├── privacy-policy-generator/page.tsx # Policy wizard
│   ├── pricing/page.tsx            # Pricing comparison
│   ├── health/route.ts             # Health check
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Landing page
│   └── globals.css                 # Tailwind import
├── components/
│   ├── AuditResults.tsx            # Full audit display
│   ├── PolicyWizard.tsx            # 5-step form wizard
│   └── ScoreGauge.tsx              # Circular score display
├── lib/
│   ├── audit-engine.ts             # Playwright scraper + 16 checks
│   ├── db.ts                       # sql.js wrapper + migrations
│   ├── policy-generator.ts         # Claude API policy generation
│   ├── stripe.ts                   # Stripe client + checkout
│   └── utils.ts                    # Helpers (nanoid, URL validation)
├── types/
│   └── sql.js.d.ts                 # Custom type declarations
└── instrumentation.ts              # Node 25 localStorage fix
```

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm start        # Start production server
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Claude API key for policy generation |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `DATABASE_PATH` | Path to SQLite database file (default: `./data/auditmypage.db`) |
| `SITE_URL` | Public URL (e.g., `https://auditmypage.com`) |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` | Path to system Chromium (Docker: `/usr/bin/chromium-browser`) |

## Revenue Model

- **SEO Audit:** Free (drives traffic and surfaces missing privacy policy)
- **Privacy Policy:** $19 one-time via Stripe Checkout
- **Flywheel:** Audit flags missing policy → CTA links to generator → revenue

## Key Patterns

- **Lazy client initialization:** Stripe and Anthropic clients are lazy-initialized (not module-scope) to avoid build-time env var errors
- **sql.js (not better-sqlite3):** Pure WASM SQLite — no native compilation needed, works on all platforms
- **Async getDb():** Database initialization is async (WASM loading), all consumers await it
- **Server components for SEO:** Audit result pages are server-rendered for shareable URLs
- **Instrumentation file:** Patches Node 25's broken `localStorage` global on the server
- **Streaming policy generation:** `claim-policy` route uses `generatePolicyStream()` with Anthropic SDK's `.messages.stream()` — returns NDJSON (`text/event-stream`) with `delta`, `done`, and `error` events. Frontend consumes via `getReader()` and renders tokens progressively. Non-streaming `generatePolicy()` still used by the Stripe webhook path.
