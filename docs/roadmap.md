# AuditMyPage — Roadmap

## Completed

| Feature | Date | Notes |
|---------|------|-------|
| MVP — SEO Audit + Privacy Policy Generator | 2026-03-01 | Full build with 16+ SEO checks, 5-step policy wizard, Stripe checkout, dark theme |

## Pending

### High Priority

- [ ] **Favicon and OG image** — Create and add `favicon.ico`, `apple-touch-icon.png`, and default OG image
- [ ] **Google Analytics** — Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` and GoogleAnalytics component
- [ ] **Uptime Kuma monitor** — Add HTTP(s) monitor for `/health` endpoint
- [ ] **Rate limiting** — Add rate limiting to `/api/audit` to prevent abuse (e.g., 10 audits/IP/hour)
- [ ] **Error handling UX** — Better error states on audit page (timeout, unreachable URL, etc.)

### Medium Priority

- [ ] **PDF export** — Generate downloadable PDF for audit results
- [ ] **Email delivery** — Send policy to customer's email after purchase
- [ ] **Sitemap + robots.txt** — Add `sitemap.xml` and `robots.txt` for SEO
- [ ] **Lighthouse integration** — Add performance metrics from Lighthouse to audit
- [ ] **Re-audit button** — Allow re-running an audit from the results page

### Low Priority / Future Ideas

- [ ] **Bulk audit** — Audit multiple pages of a site at once
- [ ] **Scheduled monitoring** — Weekly re-audit with email alerts on score changes
- [ ] **Terms of Service generator** — Second paid product ($19)
- [ ] **Cookie consent generator** — Third paid product ($9)
- [ ] **API access** — Paid API for developers to run audits programmatically
