import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '16 SEO Checks Every Website Needs Before Launch — AuditMyPage',
  description: 'A complete checklist of SEO essentials that most developers forget. From meta tags to structured data.',
  openGraph: {
    title: '16 SEO Checks Every Website Needs Before Launch',
    description: 'A complete checklist of SEO essentials that most developers forget.',
    type: 'article',
  },
}

export default function BlogPost() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-16 prose prose-invert">
      <h1>16 SEO Checks Every Website Needs Before Launch</h1>
      
      <p className="text-gray-400">
        <time>March 2, 2026</time> · 8 min read
      </p>

      <p>
        You've built something awesome. Your code is clean, the design is pixel-perfect, 
        and you're ready to ship. But wait — have you checked your SEO?
      </p>

      <p>
        Most developers forget these critical SEO elements before launch. I've built{' '}
        <a href="https://auditmypage.com">AuditMyPage</a> to catch these issues automatically, 
        but here's the full checklist so you know what to look for:
      </p>

      <h2>1. Title Tag</h2>
      <p>
        Your <code>&lt;title&gt;</code> is the single most important SEO element. Google 
        displays it in search results, and it tells users what your page is about.
      </p>
      <ul>
        <li>Keep it under 60 characters</li>
        <li>Put your most important keywords first</li>
        <li>Make it unique for every page</li>
        <li>Include your brand name at the end</li>
      </ul>

      <h2>2. Meta Description</h2>
      <p>
        While not a direct ranking factor, your meta description shows up in search results 
        and affects click-through rate.
      </p>
      <ul>
        <li>Keep it between 120-160 characters</li>
        <li>Write compelling copy — this is your ad</li>
        <li>Include a call-to-action</li>
        <li>Make it unique per page</li>
      </ul>

      <h2>3. Open Graph Tags</h2>
      <p>
        When someone shares your link on Facebook, LinkedIn, or Slack, Open Graph tags 
        control what they see.
      </p>
      <pre><code>{`<meta property="og:title" content="Your Page Title" />
<meta property="og:description" content="..." />
<meta property="og:image" content="https://..." />
<meta property="og:url" content="https://..." />`}</code></pre>

      <h2>4. Twitter Card Tags</h2>
      <p>Similar to Open Graph, but for Twitter/X:</p>
      <pre><code>{`<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="https://..." />`}</code></pre>

      <h2>5. Favicon</h2>
      <p>
        That little icon in the browser tab? It matters. Missing favicons make your site 
        look unfinished.
      </p>
      <ul>
        <li>Include multiple sizes: 16x16, 32x32, 180x180</li>
        <li>Add an <code>apple-touch-icon</code> for iOS</li>
        <li>Don't forget <code>favicon.ico</code> in your root directory</li>
      </ul>

      <h2>6. SSL Certificate (HTTPS)</h2>
      <p>
        Google penalizes sites without HTTPS. Get a free certificate from Let's Encrypt 
        or Cloudflare.
      </p>

      <h2>7. Canonical URL</h2>
      <p>
        Tell search engines which version of your page is the "real" one to avoid duplicate 
        content issues:
      </p>
      <pre><code>{`<link rel="canonical" href="https://example.com/page" />`}</code></pre>

      <h2>8. Structured Data (JSON-LD)</h2>
      <p>
        Help Google understand your content with structured data. For a business site, 
        use Organization schema:
      </p>
      <pre><code>{`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png"
}
</script>`}</code></pre>

      <h2>9. Robots.txt</h2>
      <p>
        Tell search engines what they can and can't crawl. At minimum, include your sitemap:
      </p>
      <pre><code>{`User-agent: *
Allow: /
Sitemap: https://example.com/sitemap.xml`}</code></pre>

      <h2>10. XML Sitemap</h2>
      <p>
        List all your important pages so Google can find them. Submit it to Google Search Console.
      </p>

      <h2>11. Responsive Design</h2>
      <p>
        Google uses mobile-first indexing. If your site doesn't work on mobile, you won't rank.
      </p>

      <h2>12. Page Speed</h2>
      <p>
        Slow sites rank lower. Use{' '}
        <a href="https://pagespeed.web.dev/" target="_blank" rel="noopener">
          PageSpeed Insights
        </a>{' '}
        to check your performance.
      </p>

      <h2>13. Alt Text on Images</h2>
      <p>
        Describe your images for screen readers and search engines:
      </p>
      <pre><code>{`<img src="product.jpg" alt="Red running shoes on white background" />`}</code></pre>

      <h2>14. Heading Structure</h2>
      <p>
        Use <code>&lt;h1&gt;</code> for your main title (only one per page), then 
        <code>&lt;h2&gt;</code>, <code>&lt;h3&gt;</code> in hierarchical order.
      </p>

      <h2>15. Internal Links</h2>
      <p>
        Link to your other pages. It helps users navigate and distributes SEO value across 
        your site.
      </p>

      <h2>16. Privacy Policy</h2>
      <p>
        Not technically SEO, but legally required if you collect any user data (cookies, 
        analytics, forms). GDPR and CCPA mandate it.
      </p>
      <p>
        You can generate one with{' '}
        <a href="https://auditmypage.com/privacy-policy-generator">
          AuditMyPage's AI privacy policy generator
        </a>{' '}
        — it's free during our launch.
      </p>

      <hr />

      <h2>Automate It</h2>
      <p>
        Checking all this manually is tedious. That's why I built{' '}
        <a href="https://auditmypage.com">AuditMyPage</a> — paste your URL, get a full 
        report in 30 seconds. Plus, you can generate a privacy policy while you're at it.
      </p>
      <p>
        <a href="https://auditmypage.com/audit" className="font-semibold text-blue-400">
          Try it free →
        </a>
      </p>
    </article>
  )
}
