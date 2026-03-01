import { chromium, type Browser, type Page } from "playwright";

export interface AuditCheck {
  id: string;
  label: string;
  category: "critical" | "important" | "nice";
  status: "pass" | "warn" | "fail";
  value: string;
  suggestion?: string;
  weight: number;
}

export interface SocialPreview {
  platform: string;
  title: string;
  description: string;
  image: string | null;
  url: string;
}

export interface AuditResult {
  url: string;
  score: number;
  checks: AuditCheck[];
  socialPreviews: SocialPreview[];
  hasPrivacyPolicy: boolean;
  pageTitle: string;
  loadTimeMs: number;
}

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
    browserInstance = await chromium.launch({
      executablePath: executablePath || undefined,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
  }
  return browserInstance;
}

export async function runAudit(url: string): Promise<AuditResult> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (compatible; AuditMyPage/1.0; +https://auditmypage.com)",
  });
  const page = await context.newPage();
  const checks: AuditCheck[] = [];

  const startTime = Date.now();

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
  } catch {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
  }

  const loadTimeMs = Date.now() - startTime;

  const meta = await extractMeta(page);

  // --- Critical checks ---
  checks.push(checkTitle(meta.title));
  checks.push(checkMetaDescription(meta.description));
  checks.push(checkH1(meta.h1s));
  checks.push(checkHttps(url));
  checks.push(checkViewport(meta.viewport));
  checks.push(checkCanonical(meta.canonical));

  // --- Important checks ---
  checks.push(checkOgTitle(meta.ogTitle));
  checks.push(checkOgDescription(meta.ogDescription));
  checks.push(checkOgImage(meta.ogImage));
  checks.push(checkTwitterCard(meta.twitterCard));
  checks.push(checkFavicon(meta.favicon));
  checks.push(checkLang(meta.lang));
  checks.push(checkRobotsMeta(meta.robotsMeta));
  checks.push(checkStructuredData(meta.jsonLd));

  // --- Nice to have ---
  checks.push(checkImageAlts(meta.totalImages, meta.imagesWithAlt));
  checks.push(checkHeadingHierarchy(meta.headings));

  // --- Privacy Policy check (flywheel) ---
  const hasPrivacyPolicy = meta.hasPrivacyPolicyLink;
  checks.push({
    id: "privacy-policy",
    label: "Privacy Policy page",
    category: "important",
    status: hasPrivacyPolicy ? "pass" : "fail",
    value: hasPrivacyPolicy
      ? "Privacy policy link found"
      : "No privacy policy link detected",
    suggestion: hasPrivacyPolicy
      ? undefined
      : "Most jurisdictions legally require a privacy policy. Generate one in 2 minutes.",
    weight: 5,
  });

  const score = calculateScore(checks);

  const socialPreviews = buildSocialPreviews(url, meta);

  await context.close();

  return {
    url,
    score,
    checks,
    socialPreviews,
    hasPrivacyPolicy,
    pageTitle: meta.title || url,
    loadTimeMs,
  };
}

interface PageMeta {
  title: string;
  description: string;
  h1s: string[];
  viewport: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  favicon: string;
  lang: string;
  robotsMeta: string;
  jsonLd: string[];
  totalImages: number;
  imagesWithAlt: number;
  headings: { level: number; text: string }[];
  hasPrivacyPolicyLink: boolean;
}

async function extractMeta(page: Page): Promise<PageMeta> {
  return page.evaluate(() => {
    const getMeta = (name: string) =>
      document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
        ?.getAttribute("content") || "";

    const links = Array.from(document.querySelectorAll("a"));
    const privacyKeywords = ["privacy policy", "privacy", "datenschutz", "política de privacidad"];
    const hasPrivacyPolicyLink = links.some((a) => {
      const text = (a.textContent || "").toLowerCase().trim();
      const href = (a.getAttribute("href") || "").toLowerCase();
      return (
        privacyKeywords.some((kw) => text.includes(kw)) ||
        href.includes("privacy") ||
        href.includes("datenschutz")
      );
    });

    const images = document.querySelectorAll("img");
    const headingEls = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

    return {
      title: document.title || "",
      description: getMeta("description"),
      h1s: Array.from(document.querySelectorAll("h1")).map(
        (el) => el.textContent?.trim() || ""
      ),
      viewport: getMeta("viewport"),
      canonical:
        document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "",
      ogTitle: getMeta("og:title"),
      ogDescription: getMeta("og:description"),
      ogImage: getMeta("og:image"),
      ogUrl: getMeta("og:url"),
      twitterCard: getMeta("twitter:card"),
      twitterTitle: getMeta("twitter:title"),
      twitterDescription: getMeta("twitter:description"),
      twitterImage: getMeta("twitter:image"),
      favicon:
        document.querySelector('link[rel="icon"], link[rel="shortcut icon"]')
          ?.getAttribute("href") || "",
      lang: document.documentElement.lang || "",
      robotsMeta: getMeta("robots"),
      jsonLd: Array.from(
        document.querySelectorAll('script[type="application/ld+json"]')
      ).map((el) => el.textContent || ""),
      totalImages: images.length,
      imagesWithAlt: Array.from(images).filter(
        (img) => img.getAttribute("alt")?.trim()
      ).length,
      headings: Array.from(headingEls).map((el) => ({
        level: parseInt(el.tagName[1]),
        text: el.textContent?.trim() || "",
      })),
      hasPrivacyPolicyLink,
    };
  });
}

function checkTitle(title: string): AuditCheck {
  const len = title.length;
  if (!title)
    return { id: "title", label: "Title tag", category: "critical", status: "fail", value: "Missing", weight: 15 };
  if (len < 30)
    return { id: "title", label: "Title tag", category: "critical", status: "warn", value: `"${title}" (${len} chars — too short, aim for 50-60)`, weight: 15 };
  if (len > 60)
    return { id: "title", label: "Title tag", category: "critical", status: "warn", value: `"${title}" (${len} chars — too long, aim for 50-60)`, weight: 15 };
  return { id: "title", label: "Title tag", category: "critical", status: "pass", value: `"${title}" (${len} chars)`, weight: 15 };
}

function checkMetaDescription(desc: string): AuditCheck {
  const len = desc.length;
  if (!desc)
    return { id: "meta-desc", label: "Meta description", category: "critical", status: "fail", value: "Missing", weight: 12 };
  if (len < 120)
    return { id: "meta-desc", label: "Meta description", category: "critical", status: "warn", value: `${len} chars — too short, aim for 150-160`, weight: 12 };
  if (len > 160)
    return { id: "meta-desc", label: "Meta description", category: "critical", status: "warn", value: `${len} chars — too long, aim for 150-160`, weight: 12 };
  return { id: "meta-desc", label: "Meta description", category: "critical", status: "pass", value: `${len} chars`, weight: 12 };
}

function checkH1(h1s: string[]): AuditCheck {
  if (h1s.length === 0)
    return { id: "h1", label: "H1 heading", category: "critical", status: "fail", value: "Missing — every page needs one H1", weight: 10 };
  if (h1s.length > 1)
    return { id: "h1", label: "H1 heading", category: "critical", status: "warn", value: `${h1s.length} found — should have exactly one`, weight: 10 };
  return { id: "h1", label: "H1 heading", category: "critical", status: "pass", value: `"${h1s[0]}"`, weight: 10 };
}

function checkHttps(url: string): AuditCheck {
  const isHttps = url.startsWith("https://");
  return { id: "https", label: "HTTPS", category: "critical", status: isHttps ? "pass" : "fail", value: isHttps ? "Secure" : "Not using HTTPS", weight: 10 };
}

function checkViewport(viewport: string): AuditCheck {
  return { id: "viewport", label: "Viewport meta", category: "critical", status: viewport ? "pass" : "fail", value: viewport || "Missing — required for mobile", weight: 8 };
}

function checkCanonical(canonical: string): AuditCheck {
  return { id: "canonical", label: "Canonical URL", category: "critical", status: canonical ? "pass" : "warn", value: canonical || "Not set", weight: 5 };
}

function checkOgTitle(val: string): AuditCheck {
  return { id: "og-title", label: "og:title", category: "important", status: val ? "pass" : "fail", value: val || "Missing", weight: 5 };
}

function checkOgDescription(val: string): AuditCheck {
  return { id: "og-desc", label: "og:description", category: "important", status: val ? "pass" : "fail", value: val || "Missing", weight: 5 };
}

function checkOgImage(val: string): AuditCheck {
  return { id: "og-image", label: "og:image", category: "important", status: val ? "pass" : "fail", value: val || "Missing — social shares will have no image", weight: 5 };
}

function checkTwitterCard(val: string): AuditCheck {
  return { id: "twitter-card", label: "Twitter Card", category: "important", status: val ? "pass" : "warn", value: val || "Not set", weight: 3 };
}

function checkFavicon(val: string): AuditCheck {
  return { id: "favicon", label: "Favicon", category: "important", status: val ? "pass" : "warn", value: val ? "Found" : "Missing", weight: 2 };
}

function checkLang(val: string): AuditCheck {
  return { id: "lang", label: "HTML lang attribute", category: "important", status: val ? "pass" : "warn", value: val || "Not set", weight: 3 };
}

function checkRobotsMeta(val: string): AuditCheck {
  const isBlocked = val.includes("noindex");
  if (isBlocked)
    return { id: "robots", label: "Robots meta", category: "important", status: "warn", value: `"${val}" — page is blocked from indexing`, weight: 5 };
  return { id: "robots", label: "Robots meta", category: "important", status: "pass", value: val || "Not set (default: indexable)", weight: 5 };
}

function checkStructuredData(jsonLd: string[]): AuditCheck {
  return { id: "structured-data", label: "Structured data (JSON-LD)", category: "important", status: jsonLd.length > 0 ? "pass" : "warn", value: jsonLd.length > 0 ? `${jsonLd.length} block(s) found` : "None found", weight: 3 };
}

function checkImageAlts(total: number, withAlt: number): AuditCheck {
  if (total === 0) return { id: "img-alt", label: "Image alt text", category: "nice", status: "pass", value: "No images found", weight: 2 };
  const pct = Math.round((withAlt / total) * 100);
  const status = pct === 100 ? "pass" : pct >= 50 ? "warn" : "fail";
  return { id: "img-alt", label: "Image alt text", category: "nice", status, value: `${withAlt}/${total} images have alt text (${pct}%)`, weight: 2 };
}

function checkHeadingHierarchy(headings: { level: number; text: string }[]): AuditCheck {
  if (headings.length === 0)
    return { id: "headings", label: "Heading hierarchy", category: "nice", status: "warn", value: "No headings found", weight: 2 };
  let skipped = false;
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level > headings[i - 1].level + 1) {
      skipped = true;
      break;
    }
  }
  return { id: "headings", label: "Heading hierarchy", category: "nice", status: skipped ? "warn" : "pass", value: skipped ? "Heading levels are skipped (e.g., H1 → H3)" : `${headings.length} headings, proper hierarchy`, weight: 2 };
}

function calculateScore(checks: AuditCheck[]): number {
  let totalWeight = 0;
  let earnedWeight = 0;
  for (const check of checks) {
    totalWeight += check.weight;
    if (check.status === "pass") earnedWeight += check.weight;
    else if (check.status === "warn") earnedWeight += check.weight * 0.5;
  }
  return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
}

function buildSocialPreviews(url: string, meta: PageMeta): SocialPreview[] {
  return [
    {
      platform: "Google",
      title: meta.title || url,
      description: meta.description || "No description set",
      image: null,
      url,
    },
    {
      platform: "Facebook",
      title: meta.ogTitle || meta.title || url,
      description: meta.ogDescription || meta.description || "",
      image: meta.ogImage || null,
      url: meta.ogUrl || url,
    },
    {
      platform: "Twitter / X",
      title: meta.twitterTitle || meta.ogTitle || meta.title || url,
      description: meta.twitterDescription || meta.ogDescription || meta.description || "",
      image: meta.twitterImage || meta.ogImage || null,
      url,
    },
    {
      platform: "LinkedIn",
      title: meta.ogTitle || meta.title || url,
      description: meta.ogDescription || meta.description || "",
      image: meta.ogImage || null,
      url,
    },
  ];
}
