import { getDb } from "@/lib/db";
import { AuditResults } from "@/components/AuditResults";
import { notFound } from "next/navigation";
import type { AuditResult } from "@/lib/audit-engine";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const db = await getDb();
  const results = db.exec("SELECT url, score FROM audits WHERE id = ?", [id]);

  if (!results.length || !results[0].values.length) {
    return { title: "Audit Not Found" };
  }

  const [url, score] = results[0].values[0] as [string, number];

  return {
    title: `SEO Audit: ${score}/100 — ${url} | AuditMyPage`,
    description: `SEO audit results for ${url}. Score: ${score}/100. Check meta tags, Open Graph, social previews, and more.`,
  };
}

export default async function AuditPage({ params }: Props) {
  const { id } = await params;
  const db = await getDb();
  const results = db.exec(
    "SELECT results_json FROM audits WHERE id = ?",
    [id]
  );

  if (!results.length || !results[0].values.length) notFound();

  const result: AuditResult = JSON.parse(results[0].values[0][0] as string);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <AuditResults
        url={result.url}
        score={result.score}
        checks={result.checks}
        socialPreviews={result.socialPreviews}
        hasPrivacyPolicy={result.hasPrivacyPolicy}
        loadTimeMs={result.loadTimeMs}
      />
      <div className="mt-8 text-center">
        <a href="/" className="text-blue-400 text-sm hover:underline">
          ← Audit another page
        </a>
      </div>
    </div>
  );
}
