import { ImageResponse } from "next/og";
import { projects } from "@/lib/projects";
import { profile } from "@/lib/projects";

export const runtime = "edge";
export const alt = "Deivid Tech — Portfolio & Productos en producción";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const accent1 = "#f59e0b"; // amber-500
  const accent2 = "#f43f5e"; // rose-500
  const accent3 = "#10b981"; // emerald-500

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
          background:
            "radial-gradient(1200px 600px at 80% -10%, rgba(245,158,11,0.35), transparent), radial-gradient(900px 500px at -10% 110%, rgba(244,63,94,0.28), transparent), linear-gradient(135deg, #0c0a09 0%, #1c1917 100%)",
          color: "#fafaf9",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${accent1}, ${accent2})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
              color: "white",
            }}
          >
            D
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>
              <span>deivid</span>
              <span style={{ color: accent1 }}>.tech</span>
            </div>
            <div style={{ display: "flex", fontSize: 16, color: "#a8a29e" }}>
              {profile.role}
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 999,
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.4)",
              fontSize: 14,
              color: accent3,
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: accent3,
              }}
            />
            <span>Disponible</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            Sistemas en producción,
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              background: `linear-gradient(90deg, ${accent1}, ${accent2})`,
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            no demos.
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#d6d3d1", maxWidth: 820 }}>
            Full-stack developer & product builder. IA aplicada, logística y
            e-commerce conversacional.
          </div>
        </div>

        {/* Project pills */}
        <div style={{ display: "flex", gap: 12 }}>
          {projects.map((p) => (
            <div
              key={p.slug}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 20px",
                borderRadius: 16,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background:
                    p.status === "live"
                      ? accent3
                      : p.status === "beta"
                        ? accent1
                        : "#a8a29e",
                }}
              />
              <span style={{ fontSize: 18, fontWeight: 600 }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
