import { NextResponse } from "next/server";
import { projects as staticProjects } from "@/lib/projects";
import { getProjectRows } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await getProjectRows();
    if (rows.length > 0) {
      return NextResponse.json({ count: rows.length, projects: rows });
    }
  } catch (err) {
    console.error("[projects] DB read failed, falling back to static", err);
  }
  return NextResponse.json({ count: staticProjects.length, projects: staticProjects });
}
