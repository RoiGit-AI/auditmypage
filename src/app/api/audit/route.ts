import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/audit-engine";
import { getDb, persistDb } from "@/lib/db";
import { generateId, isValidUrl } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || !isValidUrl(url)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const result = await runAudit(url);
    const id = generateId();

    const db = await getDb();
    db.run(
      "INSERT INTO audits (id, url, score, results_json) VALUES (?, ?, ?, ?)",
      [id, url, result.score, JSON.stringify(result)]
    );
    persistDb();

    return NextResponse.json({ id, ...result });
  } catch (error) {
    console.error("Audit failed:", error);
    return NextResponse.json(
      {
        error: "Failed to audit URL. The site may be unreachable or blocking automated access.",
      },
      { status: 500 }
    );
  }
}
