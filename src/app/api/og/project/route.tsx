import { ImageResponse } from "next/og";
import { projects } from "@/lib/projects";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") ?? "";
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0c0a09",
            color: "#fafaf9",
            fontSize: 48,
            fontFamily: "sans-serif",
          }}
        >
          Proyecto no encontrado
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }

  const statusLabel =
    project.status === "live"
      ? "En vivo"
      : project.status === "beta"
        ? "Beta"
        : "Mantenimiento";
  const statusColor =
    project.status === "live" ? "#10b981" : project.status === "beta" ? "#f59e0b" : "#a8a29e";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: `linear-gradient(135deg, #0c0a09 0%, #1c1917 60%, #292524 100%)`,
          color: "#fafaf9",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top row: status + meta + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 999,
              background: `${statusColor}25`,
              border: `1px solid ${statusColor}66`,
              fontSize: 14,
              color: statusColor,
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: statusColor,
              }}
            />
            <span>{statusLabel}</span>
          </div>
          <div
            style={{
              display: "flex",
              padding: "6px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              fontSize: 14,
              color: "#d6d3d1",
            }}
          >
            <span>{project.category} · {project.year}</span>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: -0.5,
            }}
          >
            <span>deivid</span>
            <span style={{ color: "#f59e0b" }}>.tech</span>
          </div>
        </div>

        {/* Title + tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 1000,
            }}
          >
            <span>{project.name}</span>
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#d6d3d1", maxWidth: 920 }}>
            <span>{project.tagline}</span>
          </div>
        </div>

        {/* Tech pills */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {project.techStack.slice(0, 6).map((t) => (
            <div
              key={t.name}
              style={{
                display: "flex",
                padding: "8px 16px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontSize: 16,
                fontFamily: "monospace",
                color: "#d6d3d1",
              }}
            >
              <span>{t.name}</span>
            </div>
          ))}
          {project.techStack.length > 6 && (
            <div
              style={{
                display: "flex",
                padding: "8px 16px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: 16,
                fontFamily: "monospace",
                color: "#a8a29e",
              }}
            >
              <span>+{project.techStack.length - 6}</span>
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
