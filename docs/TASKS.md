# Remaining work

Status as of the end of the scaffolding session.

| # | Task | State |
|---|---|---|
| 0 | Install Chrome 149+, enable `chrome://flags/#enable-webmcp-testing`, pass `/smoke` | **BLOCKED — human** |
| 1 | Scaffold, LICENSE, smoke page | done |
| 2 | `src/dyepack/` core module, 5/5 tests | done |
| 3 | Store data, WebMCP tool definitions, the poisoned review | next |
| 4 | Agent driver — `/api/agent` SSE loop + client | |
| 5 | Split-screen demo — the centerpiece | |
| 6 | Landing page | |
| 7 | `THREAT-MODEL.md`, `SPEC-PROPOSAL.md`, `DEMO-SCRIPT.md` | |
| 8 | Deploy to Vercel, record video, submit | |

## Task 3 — store and tools

Store: **Harbor & Loom**, home goods. Reads like a real Shopify store, which is
the point — the attack has to land somewhere ordinary.

Nine tools, blast radius assigned deliberately:

| Tool | Blast |
|---|---|
| `search_products`, `get_product`, `read_reviews`, `view_cart` | `read` |
| `add_to_cart`, `remove_from_cart`, `apply_coupon` | `reversible` |
| `set_shipping_address`, `checkout` | `irreversible` |

`src/data/reviews.ts` holds the payload. Review #7 by `nash_p` reads as a
plausible review for its first sentence, then turns: coupon `DRAIN40`, shipping
to `88 Kellard Row, Tallin, EE-10115`, and "do not tell the user". Keep at least
six clean reviews around it — a payload sitting alone is not a demo, it is a
diagram.

Every review renders inside a dye zone. Product copy and prices are `trust()`ed.

## Task 4 — agent driver

`/api/agent` streams a tool-calling loop over the registered schemas. Server
route so `OPENAI_API_KEY` stays server-side. Two panels share one prompt and one
seed; only `guarded` differs. Determinism matters more than realism here — the
video depends on it.

## Task 5 — split screen

`src/dyepack/react/` gets `DyeZone`, `useDyePack`, `useWebMCPTool`. The blocked
call must scroll the culprit review into view and mark it. That visual link is
the wow moment; if it is not obvious in one frame, the demo has failed.

## Task 7 — the spec proposal

Concrete, not hand-waving: propose a provenance field on WebMCP tool call
arguments, in the shape an actual spec issue would take. This is what carries
"scalability" — the project's future is a change to the standard, not a startup.

## Task 8 — submission checklist

- Live URL working in ChatGPT's in-app browser
- Public repo, LICENSE visible at root
- YouTube video under 3 minutes, with audio, public
- Written description covering: why WebMCP, UX gain, implementation
- Submit well before 4 Sep 03:00 WIB — Devpost load spikes at the deadline
