# Spec proposal — argument provenance for WebMCP

**Target:** [webmachinelearning/webmcp](https://github.com/webmachinelearning/webmcp)  
**Type:** enhancement  
**Status:** proposal (DyePack demo reference implementation)

## Problem

`registerTool()` exposes `execute(args)` with no standard way to express *where each argument value originated*. Agents assemble args from page text, operator messages, and tool outputs interchangeably. Sites cannot distinguish operator intent from UGC-derived values.

## Proposal

Add an optional **`provenance`** field on tool invocation (agent → site) and optionally on tool registration (site → agent):

```typescript
interface ArgumentProvenance {
  /** Stable id matching a declared content region, e.g. "review:r7" */
  sourceId?: string;
  /** One of: "user" | "site" | "ugc" | "tool" | "unknown" */
  trust: "user" | "site" | "ugc" | "tool" | "unknown";
  /** Human label for audit UI */
  label?: string;
}

interface ToolCallPayload {
  name: string;
  arguments: Record<string, unknown>;
  /** Per-leaf provenance, keyed by JSON path e.g. "code", "shippingAddress" */
  provenance?: Record<string, ArgumentProvenance>;
}
```

Sites MAY declare dye regions in the document (or via a small registration API parallel to tools):

```typescript
modelContext.registerContentRegion({
  id: "review:r7",
  trust: "ugc",
  label: "Review #7 — nash_p",
  element: reviewElement, // or text snapshot
});
```

## Normative behavior (suggested)

1. **Agents** SHOULD populate `provenance` when the value was copied or inferred from a registered region.
2. **Sites** MAY reject calls where any **irreversible** tool argument has `trust: "ugc"` without explicit operator confirmation.
3. **Unknown provenance** on irreversible tools SHOULD default to confirmation, not silent execution.

## Why not only page-level guards?

Page-level guards (DyePack) work without agent cooperation but require heuristics. Provenance in the wire format makes the check deterministic and auditable — the ledger can show "coupon `DRAIN40` ← Review #7" without fuzzy token matching.

## Compatibility

- Field is optional; existing tools unchanged.
- Agents that omit provenance continue to work; sites fall back to heuristic guards or confirmations.

## Reference implementation

DyePack (`src/dyepack/`) implements heuristic provenance today. This issue tracks making that information first-class in the protocol.

## Open questions

- Should provenance be agent-asserted, site-verified, or both?
- How to handle transformed values (summarized address vs verbatim)?
- Interaction with `secure-tools` exploratory work in Chrome.
