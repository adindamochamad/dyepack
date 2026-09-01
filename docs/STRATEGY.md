# Why DyePack — Stage 1 record

Preserved so a cold session does not re-derive it and drift.

## The competitive read

OpenAI's own showcase already ships Margin Editor (notes), Sunday Table (meal
planning), Verdant Market (grocery cart), WanderNote (trips), Crossword Desk,
Webroom (photo editing), Paperie, Cubecade, Fieldwork//12.

That is not an inspiration list. It is the list of ideas that are now dead —
OpenAI told 5,225 entrants which pattern is "correct" and most will clone it.

Estimated distribution of submissions:

| Category | Share | Why it loses |
|---|---|---|
| CRUD app + `registerTool()` | ~70% | Trivial; fails "non-trivial implementation" |
| Storefront / cart tools | ~15% | Most crowded; Verdant Market already exists |
| Dashboard / CRM | ~8% | Demos badly |
| Games / creative | ~5% | Cubecade, Fieldwork//12 already there |
| **Infrastructure or safety for WebMCP itself** | **<2%** | ← the open lane |

All of the losing categories answer the same shallow question: *what app can an
agent drive?* That question was answered publicly last week.

## The deeper question

The expected failure — "the agent can't find the button" — is solved by the spec
itself. Everyone building CRUD is solving a problem that no longer exists.

The unexpected failure: WebMCP turns sentences into execution. Everyone assumes
the attacker is a **malicious site**, which is the easy threat — don't visit it.
The nastier case is an **honest site with user-generated content**. The site is
the victim and the gun at the same time.

> What happens when a trusted site's honest tools are aimed by an untrusted sentence?

Chrome published its own fear about this in `webmcp/secure-tools`, but the spec
has **no notion of argument provenance**. That gap is the project.

Chrome sits on the judging panel. So does OpenAI. Both are institutionally
obsessed with agent safety.

## Scoring

| Lens | Score |
|---|---|
| Pain point clarity | 9 |
| Differentiation | 9 |
| Technical feasibility | 7 ← the only soft number |
| Judge appeal | 10 |
| Scalability story | 9 |
| Chance of winning | 8 |
| Uniqueness | 9 |
| Wow factor | 9 |
| ChatGPT test | PASS — cannot be prompted into existence |

**Verdict: GO.** This is the one category where the top-weighted criterion,
*WebMCP Leverage*, is answered by the substance of the project rather than by
decoration layered on top of it.

## Demo — the whole pitch in one frame

Two panels, **one prompt**, two agents running side by side against the same
storefront.

```
TANPA DYEPACK                    DENGAN DYEPACK
"summarise the reviews"          "summarise the reviews"

read_reviews()        ok         read_reviews()        ok
apply_coupon(DRAIN40) ok         apply_coupon(DRAIN40) BLOCKED
checkout(88 Kellard)  ok         checkout(88 Kellard)  BLOCKED
                                   └─ traced to Review #7
Order placed.                    Review #7 lights up red
Money gone.                      on the page itself.
```

The judge sees the attack **succeed** on the left, with money on the line, then
get caught on the right with a line drawn to the exact sentence responsible. No
explanation needed. The reaction lands inside fifteen seconds.

Stakes framing: not "the agent picked the wrong tool" — but **"one product
review drained a card, and the store did nothing wrong."**

## Landing page sections

1. **Hero** — the insomnia question as one large line. No subtitle filler, no
   "Get Started" button.
2. **The Split** — the side-by-side. Centerpiece, placed high, not below three folds.
3. **Anatomy of the Attack** — the poisoned review dissected line by line.
4. **How the Dye Works** — three steps, visual, and *not* a 3×2 grid.
5. **Tool Ledger** — live call log, green and red, real time.
6. **What This Means for the Spec** — the scalability story: a concrete proposal
   to `webmachinelearning/webmcp`.
