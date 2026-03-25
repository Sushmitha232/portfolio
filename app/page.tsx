"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/portfolio.json")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  if (!data) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

  return (
    <div
      style={{
        fontFamily: "Arial",
        background: "#0f172a",
        color: "white",
        minHeight: "100vh",
        padding: "40px"
      }}
    >
      {/* HERO */}
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <h1 style={{ fontSize: "48px", marginBottom: "10px" }}>
          {data.personal.name}
        </h1>
        <h2 style={{ color: "#38bdf8" }}>{data.personal.title}</h2>
        <p style={{ marginTop: "10px", color: "#cbd5f5" }}>
          {data.personal.tagline}
        </p>
      </div>

      {/* ABOUT */}
      <div style={{ maxWidth: "800px", margin: "0 auto 60px" }}>
        <h2
          style={{
            marginBottom: "15px",
            borderBottom: "2px solid #38bdf8"
          }}
        >
          About
        </h2>

        {data.about.sections.map((item: string, i: number) => (
          <p key={i} style={{ marginBottom: "10px", color: "#e2e8f0" }}>
            {item}
          </p>
        ))}
      </div>

      {/* PROJECTS */}
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h2
          style={{
            marginBottom: "20px",
            borderBottom: "2px solid #38bdf8"
          }}
        >
          Projects
        </h2>

        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          {data.projects.map((p: any) => (
            <div
              key={p.id}
              style={{
                background: "#1e293b",
                padding: "20px",
                borderRadius: "12px",
                width: "280px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
              }}
            >
              <h3 style={{ color: "#38bdf8" }}>{p.title}</h3>
              <p style={{ color: "#cbd5f5" }}>{p.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SKILLS (FIXED VERSION) */}
      <div style={{ maxWidth: "800px", margin: "60px auto" }}>
        <h2
          style={{
            marginBottom: "20px",
            borderBottom: "2px solid #38bdf8"
          }}
        >
          Skills
        </h2>

        {data.skills.map((group: any, i: number) => (
          <div key={i} style={{ marginBottom: "20px" }}>
            {/* Category */}
            <h3 style={{ color: "#38bdf8", marginBottom: "10px" }}>
              {group.category}
            </h3>

            {/* Items */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {group.items.map((skill: string, j: number) => (
                <span
                  key={j}
                  style={{
                    background: "#1e293b",
                    padding: "8px 15px",
                    borderRadius: "20px",
                    color: "#38bdf8",
                    fontSize: "14px"
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SOCIAL */}
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        {data.social.map((s: any, i: number) => (
          <a
            key={i}
            href={s.url}
            target="_blank"
            style={{
              margin: "10px",
              padding: "10px 20px",
              background: "#38bdf8",
              color: "black",
              borderRadius: "5px",
              textDecoration: "none",
              fontWeight: "bold"
            }}
          >
            {s.name}
          </a>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: "center", marginTop: "60px", color: "#94a3b8" }}>
        <p>© 2026 Sushmitha R</p>
      </div>
    </div>
  );
}