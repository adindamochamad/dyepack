import type { LedgerEntry, LedgerListener } from "./types";

/**
 * Append-only record of every tool call an agent attempted, guarded or not.
 *
 * This exists for a reason beyond the demo: WebMCP gives agents hands, and
 * today the user has no way to see what those hands did. The ledger is the
 * receipt.
 */
export class Ledger {
  private entries: LedgerEntry[] = [];
  private listeners = new Set<LedgerListener>();
  private seq = 0;

  append(entry: Omit<LedgerEntry, "id" | "timestamp">): LedgerEntry {
    const full: LedgerEntry = {
      ...entry,
      id: `call_${++this.seq}`,
      timestamp: Date.now(),
    };
    this.entries.push(full);
    this.listeners.forEach((fn) => fn(full));
    return full;
  }

  all(): readonly LedgerEntry[] {
    return this.entries;
  }

  blocked(): LedgerEntry[] {
    return this.entries.filter((e) => e.verdict === "block");
  }

  subscribe(fn: LedgerListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  reset(): void {
    this.entries = [];
    this.seq = 0;
  }
}
