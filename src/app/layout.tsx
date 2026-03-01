import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AuditMyPage — Audit your site before you ship",
  description:
    "Free AI-powered SEO audit + privacy policy generator. Check your meta tags, Open Graph, SEO score, and generate a legally-compliant privacy policy in minutes.",
  openGraph: {
    title: "AuditMyPage — Audit your site before you ship",
    description:
      "Free AI-powered SEO audit + privacy policy generator. Get your SEO score and fix issues before launch.",
    url: "https://auditmypage.com",
    siteName: "AuditMyPage",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AuditMyPage — Audit your site before you ship",
    description:
      "Free AI-powered SEO audit. Check meta tags, Open Graph, and more.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        <nav className="border-b border-gray-800">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-white">
              Audit<span className="text-blue-400">My</span>Page
            </a>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="/audit" className="hover:text-white transition-colors">
                SEO Audit
              </a>
              <a
                href="/privacy-policy-generator"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/pricing"
                className="hover:text-white transition-colors"
              >
                Pricing
              </a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-gray-800 mt-20">
          <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
            <p>AuditMyPage — AI-powered site audit and compliance tools</p>
            <div className="flex justify-center gap-4 mt-2">
              <a href="/privacy-policy-generator" className="hover:text-gray-300">
                Privacy Policy
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
