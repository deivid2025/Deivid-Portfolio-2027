import { NextResponse } from "next/server";
import { isAdmin, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function csvEscape(value: string | number | null | undefined): string {
  const s = String(value ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Export messages + subscribers + project views as CSV files for backup. */
export async function GET(req: Request) {
  if (!(await isAdmin(req))) return unauthorizedResponse();

  const url = new URL(req.url);
  const dataset = url.searchParams.get("dataset") ?? "messages";

  let csv = "";
  let filename = "";

  if (dataset === "messages") {
    const messages = await db.message.findMany({
      orderBy: { createdAt: "desc" },
    });
    filename = `messages-${new Date().toISOString().slice(0, 10)}.csv`;
    csv = ["ticket", "name", "email", "message", "createdAt"]
      .join(",") + "\n";
    for (const m of messages) {
      csv += [
        csvEscape(m.ticket),
        csvEscape(m.name),
        csvEscape(m.email),
        csvEscape(m.message),
        csvEscape(m.createdAt.toISOString()),
      ].join(",") + "\n";
    }
  } else if (dataset === "subscribers") {
    const subs = await db.subscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
    filename = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    csv = ["email", "active", "createdAt"].join(",") + "\n";
    for (const s of subs) {
      csv += [
        csvEscape(s.email),
        csvEscape(s.active ? "yes" : "no"),
        csvEscape(s.createdAt.toISOString()),
      ].join(",") + "\n";
    }
  } else if (dataset === "views") {
    const views = await db.projectView.findMany({ orderBy: { views: "desc" } });
    filename = `project-views-${new Date().toISOString().slice(0, 10)}.csv`;
    csv = ["slug", "views", "updatedAt"].join(",") + "\n";
    for (const v of views) {
      csv += [
        csvEscape(v.slug),
        csvEscape(v.views),
        csvEscape(v.updatedAt.toISOString()),
      ].join(",") + "\n";
    }
  } else {
    return NextResponse.json({ error: "Dataset inválido" }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
