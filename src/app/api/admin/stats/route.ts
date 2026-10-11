import { NextResponse } from "next/server";
import { isAdmin, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAdmin(req))) return unauthorizedResponse();

  const [messagesCount, recentMessages, updates, testimonials, projectViews, subscribers] =
    await Promise.all([
      db.message.count(),
      db.message.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, ticket: true, createdAt: true },
      }),
      db.update.count(),
      db.testimonial.count(),
      db.projectView.findMany({ select: { slug: true, views: true } }),
      db.subscriber.count({ where: { active: true } }),
    ]);

  const totalViews = projectViews.reduce((acc, p) => acc + p.views, 0);

  return NextResponse.json({
    counts: {
      messages: messagesCount,
      updates,
      testimonials,
      projects: projectViews.length,
      totalViews,
      subscribers,
    },
    recentMessages,
    projectViews,
  });
}
