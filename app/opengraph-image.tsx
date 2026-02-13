import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "DevFlowAI - Developer Toolkit for AI Development";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          padding: "60px 80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
          </div>
          <span
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#f1f5f9",
              letterSpacing: "-0.02em",
            }}
          >
            DevFlow AI
          </span>
        </div>

        {/* Center content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#a78bfa",
                textTransform: "uppercase" as const,
                letterSpacing: "0.1em",
                background: "rgba(167,139,250,0.1)",
                padding: "6px 16px",
                borderRadius: "100px",
                border: "1px solid rgba(167,139,250,0.2)",
              }}
            >
              Free & Open Source
            </span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#34d399",
                textTransform: "uppercase" as const,
                letterSpacing: "0.1em",
                background: "rgba(52,211,153,0.1)",
                padding: "6px 16px",
                borderRadius: "100px",
                border: "1px solid rgba(52,211,153,0.2)",
              }}
            >
              15 Tools
            </span>
          </div>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "#f8fafc",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            The developer toolkit
          </h1>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 800,
              background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            for AI development
          </h1>
        </div>

        {/* Bottom */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <span
            style={{
              fontSize: "18px",
              color: "#94a3b8",
              fontStyle: "italic",
            }}
          >
            Para vosotros, developers
          </span>
          <span
            style={{
              fontSize: "16px",
              color: "#64748b",
            }}
          >
            devflowai.dev
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
