import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  const results = db.exec(
    "SELECT id, form_data_json, content_md, content_html, paid FROM policies WHERE id = ?",
    [id]
  );

  if (!results.length || !results[0].values.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const row = results[0].values[0];
  const formData = JSON.parse(row[1] as string);

  return NextResponse.json({
    id: row[0],
    paid: row[4] === 1,
    preview: row[4] === 1 ? undefined : row[2],
    markdown: row[4] === 1 ? row[2] : undefined,
    html: row[4] === 1 ? row[3] : undefined,
    businessName: formData.businessName || "Your Business",
  });
}
