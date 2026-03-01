"use client";

import type { AuditCheck, SocialPreview } from "@/lib/audit-engine";
import { ScoreGauge } from "./ScoreGauge";

interface AuditResultsProps {
  url: string;
  score: number;
  checks: AuditCheck[];
  socialPreviews: SocialPreview[];
  hasPrivacyPolicy: boolean;
  loadTimeMs: number;
}

const statusIcon = {
  pass: "✅",
  warn: "⚠️",
  fail: "❌",
};

const categoryLabel = {
  critical: "Critical",
  important: "Important",
  nice: "Nice to have",
};

export function AuditResults({
  url,
  score,
  checks,
  socialPreviews,
  hasPrivacyPolicy,
  loadTimeMs,
}: AuditResultsProps) {
  const criticalChecks = checks.filter((c) => c.category === "critical");
  const importantChecks = checks.filter((c) => c.category === "important");
  const niceChecks = checks.filter((c) => c.category === "nice");

  const passCount = checks.filter((c) => c.status === "pass").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;
  const failCount = checks.filter((c) => c.status === "fail").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-8">
        <ScoreGauge score={score} />
        <div>
          <h1 className="text-2xl font-bold">SEO Audit Results</h1>
          <p className="text-gray-400 mt-1 break-all">{url}</p>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-green-400">{passCount} passed</span>
            <span className="text-yellow-400">{warnCount} warnings</span>
            <span className="text-red-400">{failCount} failed</span>
            <span className="text-gray-500">{loadTimeMs}ms load time</span>
          </div>
        </div>
      </div>

      {/* Privacy Policy CTA */}
      {!hasPrivacyPolicy && (
        <div className="p-4 bg-red-950/50 border border-red-800 rounded-lg">
          <p className="font-medium text-red-300">
            ❌ No Privacy Policy detected
          </p>
          <p className="text-sm text-red-400 mt-1">
            Most jurisdictions legally require a privacy policy. GDPR fines can
            reach 4% of annual revenue.
          </p>
          <a
            href="/privacy-policy-generator"
            className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors"
          >
            Generate a Privacy Policy — $19
          </a>
        </div>
      )}

      {/* Check Sections */}
      <CheckSection title="Critical" checks={criticalChecks} />
      <CheckSection title="Important" checks={importantChecks} />
      <CheckSection title="Nice to have" checks={niceChecks} />

      {/* Social Previews */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Social Previews</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {socialPreviews.map((preview) => (
            <SocialPreviewCard key={preview.platform} preview={preview} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CheckSection({
  title,
  checks,
}: {
  title: string;
  checks: AuditCheck[];
}) {
  if (checks.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="space-y-2">
        {checks.map((check) => (
          <div
            key={check.id}
            className="p-3 bg-gray-900 rounded-lg border border-gray-800"
          >
            <div className="flex items-start gap-2">
              <span className="mt-0.5">{statusIcon[check.status]}</span>
              <div className="flex-1 min-w-0">
                <span className="font-medium">{check.label}</span>
                <p className="text-sm text-gray-400 mt-0.5 break-all">
                  {check.value}
                </p>
                {check.suggestion && (
                  <p className="text-sm text-blue-400 mt-1">
                    💡 {check.suggestion}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialPreviewCard({ preview }: { preview: SocialPreview }) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <div className="px-3 py-2 bg-gray-800 text-xs text-gray-400 font-medium">
        {preview.platform}
      </div>
      {preview.image && (
        <div className="h-32 bg-gray-800 flex items-center justify-center text-xs text-gray-500 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.image}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      {!preview.image && (
        <div className="h-20 bg-gray-800/50 flex items-center justify-center text-xs text-gray-600">
          No image set
        </div>
      )}
      <div className="p-3">
        <p className="font-medium text-sm truncate">{preview.title}</p>
        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
          {preview.description || "No description"}
        </p>
        <p className="text-xs text-gray-600 mt-1 truncate">{preview.url}</p>
      </div>
    </div>
  );
}
