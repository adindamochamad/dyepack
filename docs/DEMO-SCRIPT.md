# Demo script — DyePack (< 3 minutes)

**Audience:** WebMCP Challenge judges  
**Format:** Screen recording with voiceover, 1080p, public YouTube

## Setup (before record)

1. Chrome 149+, WebMCP flag on
2. Deployed URL or `localhost` via tunnel (prefer production URL)
3. Open `/split` — both panels visible
4. Close unrelated tabs

## Beat sheet (~2:30)

| Time | Visual | Voiceover |
|------|--------|-----------|
| 0:00 | `/` hero line | "WebMCP gives agents real tools. It doesn't know where an instruction came from." |
| 0:15 | Scroll to split teaser | "This is Harbor and Loom — a normal store. Nine honest tools." |
| 0:25 | Navigate to `/split`, click Run if not auto-started | "Same prompt both sides: summarise the reviews." |
| 0:35 | Left panel: `read_reviews` ok | "Both agents read the reviews. Fine." |
| 0:45 | Left: `apply_coupon(DRAIN40)` ok | "On the left, no guard — the agent obeys a coupon code that came from Review seven." |
| 0:55 | Left: `checkout(88 Kellard Row…)` ok | "Then it checks out to an address that only appeared in that review. Order placed." |
| 1:05 | Right panel: `read_reviews` ok | "Same prompt, same store — but DyePack is intercepting every call before execute." |
| 1:15 | Right: `apply_coupon` **BLOCKED**, Review #7 highlights | "Blocked. The ledger traces the coupon back to Review seven — the review lights up on the page." |
| 1:30 | Right: checkout blocked (if shown) or stop at coupon | "Irreversible calls need stronger evidence. One false positive is a confirmation; one false negative is money gone." |
| 1:45 | Quick `/store` or ledger evidence | "Primary signals tie arguments to dyed regions. Page-level suspicion alone doesn't block." |
| 2:00 | Mention `docs/SPEC-PROPOSAL.md` | "The scalable fix is provenance on the wire. DyePack is the reference guard until the spec catches up." |
| 2:15 | End card: repo + live URL | "DyePack — MIT, link in description." |

## Do not

- Exceed 3 minutes
- Use background music that drowns voice
- Spend time on visual fluff — the split is the pitch

## Submission copy (Devpost draft)

**Why WebMCP:** DyePack is impossible without real browser-registered tools; the attack is tool execution driven by page content.

**UX gain:** Users see exactly which sentence tried to act, not a generic "agent error."

**Implementation:** Dependency-free provenance engine, React dye zones, nine-tool storefront, reproducible split demo via scripted agent driver.
