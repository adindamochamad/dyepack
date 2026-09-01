"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LedgerPanel } from "@/components/LedgerPanel";
import { StoreView } from "@/components/StoreView";
import { useDyePack } from "@/dyepack/react";
import { DEMO_PROMPT, runDemoAgent, type AgentEvent } from "@/store/agent-runner";
import { StoreEngine } from "@/store/engine";
import { setupStoreRegistry } from "@/store/setup-registry";
import { buildStoreTools } from "@/store/tools";

interface AgentPanelProps {
  label: string;
  guarded: boolean;
  autoStart?: boolean;
  mode?: "scripted" | "live";
}

export function AgentPanel({ label, guarded, autoStart = false, mode = "scripted" }: AgentPanelProps) {
  const engineRef = useRef(new StoreEngine());
  const registeredRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const { dp, entries, highlightedZone, softReset } = useDyePack({
    guarded,
    onBlock: (entry) => {
      const zoneId = entry.evidence.find((e) => e.zoneId)?.zoneId;
      if (zoneId) {
        document.querySelector(`[data-dye-zone="${zoneId}"]`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    },
  });

  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("idle");

  const registerTools = useCallback(() => {
    if (registeredRef.current) return;
    const specs = buildStoreTools(engineRef.current);
    specs.forEach(({ tool, blast }) => {
      void dp.register(tool, { blast });
    });
    registeredRef.current = true;
  }, [dp]);

  const executeTool = useCallback(
    async (name: string, args: Record<string, unknown>) => {
      const res = await dp.call(name, args);
      const text = res.content.map((c) => c.text).join("\n");
      const blocked = res.isError === true && text.includes("BLOCKED");
      return { text, blocked };
    },
    [dp],
  );

  const run = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    engineRef.current.reset();
    softReset();
    setEvents([]);
    setRunning(true);
    setStatus("running");
    setupStoreRegistry(dp, DEMO_PROMPT);
    registerTools();

    try {
      await runDemoAgent({
        prompt: DEMO_PROMPT,
        executeTool,
        mode,
        signal: abortRef.current.signal,
        onEvent: (ev) => {
          setEvents((prev) => [...prev, ev]);
          if (ev.type === "status") setStatus(ev.text);
          if (ev.type === "done") setStatus("done");
        },
      });
    } catch {
      setStatus("aborted");
    } finally {
      setRunning(false);
    }
  }, [dp, executeTool, mode, registerTools, softReset]);

  useEffect(() => {
    setupStoreRegistry(dp, DEMO_PROMPT);
    registerTools();
  }, [dp, registerTools]);

  useEffect(() => {
    if (autoStart) void run();
  }, [autoStart, run]);

  return (
    <div className={`agent-panel ${guarded ? "agent-panel--guarded" : "agent-panel--bare"}`}>
      <header className="agent-panel__head">
        <div>
          <h2>{label}</h2>
          <p>{guarded ? "DyePack guarded" : "No guard — control"}</p>
        </div>
        <button type="button" onClick={() => void run()} disabled={running}>
          {running ? "Running…" : "Run agent"}
        </button>
      </header>

      <div className="agent-panel__prompt">
        <span>Prompt</span>
        <q>{DEMO_PROMPT}</q>
      </div>

      <div className="agent-panel__body">
        <StoreView highlightedZone={highlightedZone} />
        <aside className="agent-panel__aside">
          <div className="agent-panel__trace">
            <h3>Agent trace</h3>
            <p className="agent-panel__status">{status}</p>
            <ul>
              {events.map((ev, i) => (
                <li key={i} className={`trace trace--${ev.type}`}>
                  {ev.type === "tool_call" && (
                    <>
                      <code>{ev.name}</code>
                      <pre>{JSON.stringify(ev.args)}</pre>
                    </>
                  )}
                  {ev.type === "tool_result" && (
                    <>
                      <code>{ev.name}</code>
                      <span className={ev.blocked ? "trace__blocked" : "trace__ok"}>
                        {ev.blocked ? "BLOCKED" : "ok"}
                      </span>
                      <p>{ev.text.slice(0, 140)}</p>
                    </>
                  )}
                  {ev.type === "assistant" && <p>{ev.text}</p>}
                  {ev.type === "status" && <p>{ev.text}</p>}
                </li>
              ))}
            </ul>
          </div>
          <LedgerPanel entries={entries} title="Tool ledger" />
        </aside>
      </div>
    </div>
  );
}
