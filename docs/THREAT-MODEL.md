# Threat model — DyePack

## Assets

- **Operator intent** — what the human asked the agent to do. The only authoritative instruction source.
- **Site tools** — WebMCP `registerTool()` handlers: cart, checkout, account actions.
- **User-generated content (UGC)** — reviews, comments, support tickets, email threads rendered on the page.

## Trust boundaries

| Region | Trust | Agent may read | Agent may obey |
|--------|-------|----------------|----------------|
| Operator prompt | `user` | yes | yes |
| Site copy (products, prices, nav) | `trusted` | yes | yes (via tools designed for it) |
| UGC (reviews, etc.) | `dyed` | yes | **no** |

WebMCP today treats all readable text as equally instructive. DyePack adds the missing boundary.

## Threat scenario

**Attacker:** any user who can post UGC on an honest site (review spam, ticket reply, forum comment).

**Victim:** the site operator and the end user whose agent session holds payment/shipping tools.

**Mechanism:** prompt injection embedded in UGC. The agent reads reviews as context, follows embedded directives ("apply coupon X", "checkout to address Y"), and executes irreversible tools.

**Why the site is not malicious:** tools and product data are legitimate. The attack uses the site's own honest infrastructure against the user.

## What DyePack defends

- Tool calls whose **arguments** trace to dyed content via primary signals:
  - `verbatim-span` — consecutive tokens copied from a review into an argument
  - `exclusive-token` — coupon codes, addresses, or IDs that appear only in UGC

Corroborating signals (`directive`, `out-of-intent`) surface in the ledger but do not block alone — blocking on page-level suspicion caused false positives (e.g. operator-typed address near a review mentioning "checkout").

## Out of scope (demo)

- Cross-origin iframe content
- Image/steganography payloads
- Agent memory from prior sessions
- Malicious site code (assumed honest site; threat is UGC on honest sites)

## Residual risk

Determined attackers may obfuscate payloads to evade token matching. The spec-level fix is **argument provenance metadata** (see `SPEC-PROPOSAL.md`), not stronger regex alone.
