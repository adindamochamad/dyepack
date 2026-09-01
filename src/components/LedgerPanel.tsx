"use client";

import type { LedgerEntry } from "@/dyepack/types";

function verdictColor(entry: LedgerEntry): string {
  if (entry.verdict === "block") return "var(--accent-block)";
  if (entry.verdict === "flag") return "var(--accent-flag)";
  return "var(--accent-allow)";
}

export function LedgerPanel({ entries, title }: { entries: LedgerEntry[]; title: string }) {
  return (
    <section className="ledger">
      <header className="ledger__head">
        <h3>{title}</h3>
        <span>{entries.length} calls</span>
      </header>
      <ol className="ledger__list">
        {entries.length === 0 && <li className="ledger__empty">No tool calls yet.</li>}
        {entries.map((e) => (
          <li key={e.id} className="ledger__row" style={{ borderLeftColor: verdictColor(e) }}>
            <div className="ledger__tool">
              <code>{e.toolName}</code>
              <span className={`ledger__verdict ledger__verdict--${e.verdict}`}>
                {e.executed ? "executed" : e.verdict}
              </span>
            </div>
            <p className="ledger__reason">{e.resultText ?? e.reason}</p>
            {e.evidence.length > 0 && (
              <ul className="ledger__evidence">
                {e.evidence.slice(0, 2).map((ev, i) => (
                  <li key={i}>
                    <strong>{ev.kind}</strong> — {ev.detail}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
