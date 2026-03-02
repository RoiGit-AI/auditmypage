"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleAudit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    let auditUrl = url.trim();
    if (!auditUrl) return;
    if (!auditUrl.startsWith("http")) auditUrl = "https://" + auditUrl;

    setLoading(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: auditUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/audit/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audit failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Hero */}
      <section className="pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          Audit your site
          <br />
          <span className="text-blue-400">before you ship</span>
        </h1>
        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
          Free AI-powered SEO audit in 30 seconds. Check meta tags, Open Graph,
          social previews, and more. Plus: generate a privacy policy in 2
          minutes.
        </p>

        <form onSubmit={handleAudit} className="mt-8 max-w-xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter your URL — e.g. example.com"
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {loading ? "Auditing..." : "Audit — Free"}
            </button>
          </div>
          {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
        </form>
      </section>

      {/* Features */}
      <section className="py-16 grid md:grid-cols-3 gap-8">
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="text-lg font-semibold">SEO Score</h3>
          <p className="mt-2 text-sm text-gray-400">
            Get a 0-100 score with actionable issues. Title, description, Open
            Graph, structured data, and 15+ checks.
          </p>
        </div>
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
          <div className="text-3xl mb-3">👁️</div>
          <h3 className="text-lg font-semibold">Social Previews</h3>
          <p className="mt-2 text-sm text-gray-400">
            See exactly how your page looks on Google, Facebook, Twitter, and
            LinkedIn before you share it.
          </p>
        </div>
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
          <div className="text-3xl mb-3">📜</div>
          <h3 className="text-lg font-semibold">Privacy Policy</h3>
          <p className="mt-2 text-sm text-gray-400">
            AI-generated, customized privacy policy. Free during launch
            (normally $19). Covers GDPR, CCPA, and more.
          </p>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold">Why audit before you ship?</h2>
        <div className="mt-8 grid md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
          <div className="flex gap-3">
            <span className="text-green-400 mt-1">✓</span>
            <div>
              <p className="font-medium">Better search rankings</p>
              <p className="text-sm text-gray-400">
                Proper meta tags and structure help Google understand and rank
                your pages.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-green-400 mt-1">✓</span>
            <div>
              <p className="font-medium">Better social sharing</p>
              <p className="text-sm text-gray-400">
                Correct Open Graph tags mean your links look great when shared on
                social media.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-green-400 mt-1">✓</span>
            <div>
              <p className="font-medium">Legal compliance</p>
              <p className="text-sm text-gray-400">
                GDPR and CCPA require a privacy policy. Avoid fines by having
                one from day one.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-green-400 mt-1">✓</span>
            <div>
              <p className="font-medium">Professional first impression</p>
              <p className="text-sm text-gray-400">
                Missing favicons, broken meta tags, and no SSL make your site
                look amateur.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
