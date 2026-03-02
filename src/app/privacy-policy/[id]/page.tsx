"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";

interface PolicyData {
  id: string;
  paid: boolean;
  preview: string;
  markdown?: string;
  html?: string;
  businessName: string;
}

export default function PolicyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isSuccess = searchParams.get("success") === "true";

  const [data, setData] = useState<PolicyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch(`/api/policy/${id}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleClaim() {
    setClaimLoading(true);
    setClaimError("");
    try {
      const res = await fetch("/api/claim-policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policyId: id, email: email || undefined }),
      });
      const result = await res.json();
      if (result.success) {
        window.location.href = `/privacy-policy/${id}?success=true`;
      } else {
        setClaimError(result.error || "Something went wrong. Please try again.");
      }
    } catch {
      setClaimError("Network error. Please try again.");
    } finally {
      setClaimLoading(false);
    }
  }

  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">
        Loading policy...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">
        Policy not found.
      </div>
    );
  }

  // Paid — show full policy with download options
  if (data.paid && data.markdown) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {isSuccess && (
          <div className="mb-6 p-4 bg-green-950/50 border border-green-800 rounded-lg text-green-300">
            Your privacy policy is ready below.
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            Privacy Policy — {data.businessName}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() =>
                downloadFile(
                  data.markdown!,
                  "privacy-policy.md",
                  "text/markdown"
                )
              }
              className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ↓ Markdown
            </button>
            <button
              onClick={() =>
                downloadFile(data.html!, "privacy-policy.html", "text/html")
              }
              className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ↓ HTML
            </button>
            <button
              onClick={() =>
                downloadFile(
                  data.markdown!,
                  "privacy-policy.txt",
                  "text/plain"
                )
              }
              className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ↓ Text
            </button>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 prose prose-invert max-w-none">
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(simpleMarkdownToHtml(data.markdown)),
            }}
          />
        </div>
      </div>
    );
  }

  // Unpaid — show preview with free claim CTA
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">
        Privacy Policy Preview — {data.businessName}
      </h1>
      <p className="text-sm text-gray-400 mb-6">
        Preview of your AI-generated policy. Claim it free below.
      </p>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(simpleMarkdownToHtml(data.preview)),
          }}
        />
      </div>

      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
        <div className="inline-block px-3 py-1 mb-3 text-xs font-medium bg-green-900/50 text-green-400 border border-green-800 rounded-full">
          Launch promotion — normally $19
        </div>
        <h2 className="text-xl font-semibold">Get your full Privacy Policy</h2>
        <p className="text-gray-400 text-sm mt-1">
          AI-generated, customized to your business. HTML + Markdown + plain
          text.
        </p>
        <div className="flex items-center gap-2 justify-center mt-4 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com (optional)"
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleClaim}
            disabled={claimLoading}
            className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-500 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {claimLoading ? "Generating..." : "Get it free"}
          </button>
        </div>
        {claimError && (
          <p className="text-sm text-red-400 mt-3">{claimError}</p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Free during launch. No payment required.
        </p>
      </div>
    </div>
  );
}

function simpleMarkdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hlp])(.+)$/gm, "<p>$1</p>");
}
