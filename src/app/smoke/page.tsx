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
        ? "localhost / https detected"
        : "WebMCP requires a secure context (localhost or https)",
    });

    results.push({
      label: "document.modelContext available",
      state: ctx ? "pass" : "fail",
      detail: ctx
        ? `typeof = ${typeof ctx}`
        : "Enable chrome://flags/#enable-webmcp-testing and relaunch Chrome",
    });

    results.push({
      label: "registerTool() present",
      state:
        ctx && typeof (ctx as { registerTool?: unknown }).registerTool === "function"
          ? "pass"
          : "fail",
      detail:
        ctx && typeof (ctx as { registerTool?: unknown }).registerTool === "function"
          ? "ready"
          : "API not exposed in this Chrome build",
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
          { label: "Tool registered", state: "pass", detail: "dyepack_smoke_ping is live" },
        ]),
      )
      .catch((e: Error) =>
        setChecks((c) => [...c, { label: "Tool registered", state: "fail", detail: e.message }]),
      );

    return () => controller.abort();
  }, []);

  const allPass = checks.length >= 4 && checks.every((c) => c.state === "pass");

  return (
    <main className="smoke-page">
      <header className="page-head">
        <p className="kicker">Environment gate</p>
        <h1>WebMCP smoke test</h1>
        <p className="page-head__sub">
          All four checks must pass before anything else. Chrome 149+ with{" "}
          <code>chrome://flags/#enable-webmcp-testing</code>.
        </p>
      </header>

      <section className="smoke-grid">
        {checks.map((c) => (
          <article key={c.label} className={`smoke-card smoke-card--${c.state}`}>
            <span className="smoke-card__badge">{c.state.toUpperCase()}</span>
            <h3>{c.label}</h3>
            <p>{c.detail}</p>
          </article>
        ))}
      </section>

      <footer className="smoke-verdict">
        <span className={allPass ? "smoke-verdict--pass" : "smoke-verdict--fail"}>
          {allPass ? "GATE PASSED — proceed to /split" : "GATE NOT PASSED"}
        </span>
      </footer>
    </main>
  );
}
