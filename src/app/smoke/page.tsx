"use client";

import { useEffect, useState } from "react";

type Check = { label: string; state: "pass" | "fail" | "pending"; detail: string };

export default function SmokePage() {
  const [checks, setChecks] = useState<Check[]>([]);

  useEffect(() => {
    const results: Check[] = [];
    const ctx = (document as unknown as { modelContext?: unknown }).modelContext;

    results.push({
      label: "Secure context",
      state: window.isSecureContext ? "pass" : "fail",
      detail: window.isSecureContext
        ? "localhost / https terdeteksi"
        : "WebMCP butuh secure context (localhost atau https)",
    });

    results.push({
      label: "document.modelContext tersedia",
      state: ctx ? "pass" : "fail",
      detail: ctx
        ? `typeof = ${typeof ctx}`
        : "Aktifkan chrome://flags/#enable-webmcp-testing lalu relaunch Chrome",
    });

    results.push({
      label: "registerTool() ada",
      state:
        ctx && typeof (ctx as { registerTool?: unknown }).registerTool === "function"
          ? "pass"
          : "fail",
      detail:
        ctx && typeof (ctx as { registerTool?: unknown }).registerTool === "function"
          ? "siap dipanggil"
          : "API belum terekspos di build Chrome ini",
    });

    setChecks(results);

    if (!ctx || typeof (ctx as { registerTool?: unknown }).registerTool !== "function") return;

    const controller = new AbortController();
    const mc = ctx as {
      registerTool: (t: unknown, o?: unknown) => Promise<unknown>;
    };

    mc.registerTool(
      {
        name: "dyepack_smoke_ping",
        description: "Smoke test tool. Returns pong so we can confirm agent visibility.",
        inputSchema: {
          type: "object",
          properties: { note: { type: "string", description: "Anything to echo back" } },
          required: [],
        },
        async execute({ note }: { note?: string }) {
          return { content: [{ type: "text", text: `pong ${note ?? ""}`.trim() }] };
        },
      },
      { signal: controller.signal },
    )
      .then(() =>
        setChecks((c) => [
          ...c,
          { label: "Tool terdaftar", state: "pass", detail: "dyepack_smoke_ping hidup" },
        ]),
      )
      .catch((e: Error) =>
        setChecks((c) => [...c, { label: "Tool terdaftar", state: "fail", detail: e.message }]),
      );

    return () => controller.abort();
  }, []);

  const allPass = checks.length >= 4 && checks.every((c) => c.state === "pass");

  return (
    <main style={{ font: "14px ui-monospace, monospace", padding: 40, lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>DyePack — WebMCP smoke test</h1>
      <p style={{ opacity: 0.6, marginBottom: 24 }}>Gate #0. Semua harus hijau sebelum lanjut.</p>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {checks.map((c) => (
          <li key={c.label} style={{ marginBottom: 10 }}>
            <strong>{c.state === "pass" ? "PASS" : "FAIL"}</strong> — {c.label}
            <div style={{ opacity: 0.6, paddingLeft: 20 }}>{c.detail}</div>
          </li>
        ))}
      </ul>
      {checks.length > 0 && (
        <p style={{ marginTop: 24, fontWeight: 700 }}>
          {allPass ? "GATE LOLOS — lanjut ke Task 2." : "GATE BELUM LOLOS."}
        </p>
      )}
    </main>
  );
}
