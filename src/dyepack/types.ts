/**
 * DyePack core types.
 *
 * The model: every string an agent can reach carries a provenance label.
 * `user`    — the operator typed it. Authoritative.
 * `trusted` — the site authored it (product copy, nav, prices). Safe to read.
 * `dyed`    — someone else authored it (reviews, comments, tickets, email).
 *             Safe to READ, never safe to OBEY.
 */
export type TrustLevel = "user" | "trusted" | "dyed";

/** A region of the page whose text came from an untrusted author. */
export interface DyeZone {
  /** Stable id, used to point back at the DOM node during a demo. */
  id: string;
  /** Human label shown in the ledger, e.g. "Review #7 — nash_p". */
  label: string;
  /** Provenance tag, e.g. "user-generated:review". */
  origin: string;
  /** Raw text content of the zone. */
  text: string;
}

/**
 * Blast radius. Not "is this dangerous" — "can the user walk it back".
 * Threshold to block scales down as blast radius grows.
 */
export type Blast = "read" | "reversible" | "irreversible";

export interface ToolPolicy {
  name: string;
  blast: Blast;
  /** Optional override of the default threshold for this tool. */
  threshold?: number;
}

/** Why DyePack reached its verdict. Each item is renderable in the UI. */
export interface Evidence {
  kind: "verbatim-span" | "exclusive-token" | "directive" | "out-of-intent";
  zoneId?: string;
  zoneLabel?: string;
  /** The offending fragment, quoted back for the UI to highlight. */
  span?: string;
  /** Which argument it landed in, e.g. "address.line1". */
  argPath?: string;
  detail: string;
  weight: number;
}

export type Verdict = "allow" | "flag" | "block";

export interface Adjudication {
  toolName: string;
  verdict: Verdict;
  /** 0..1 — confidence that this call was authored by dyed content. */
  score: number;
  blast: Blast;
  reason: string;
  evidence: Evidence[];
}

export interface LedgerEntry extends Adjudication {
  id: string;
  timestamp: number;
  args: Record<string, unknown>;
  /** false when the entry came from the unguarded control panel. */
  guarded: boolean;
  executed: boolean;
  resultText?: string;
}

export type LedgerListener = (entry: LedgerEntry) => void;
