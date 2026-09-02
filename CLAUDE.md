# DyePack — working context

Read this before touching anything. It carries the decisions that the code
alone does not explain.

## What this is

A submission to **The WebMCP Challenge** (OpenAI + Chrome/Cloudflare/Vercel/
Shopify/Render/Netlify), on Devpost.

**Hard deadline: 3 Sep 2026, 13:00 PT = 4 Sep 2026, 03:00 WIB.**
Judging 4–21 Sep. Winners ~23 Sep. 10 winners, $3,000 each plus sponsor credits.
5,225 registrants.

The one-line thesis:

> What happens when a trusted site's honest tools are aimed by an untrusted sentence?

WebMCP hands agents real tools but has no concept of where an instruction came
from. A site can be entirely honest and still be turned into the weapon, because
its own user-generated content (reviews, comments, tickets) is read by an agent
that holds the site's tools. DyePack dyes untrusted regions, intercepts every
call before `execute()`, and blocks calls whose arguments trace back to dyed
content — then points at the exact sentence.

Full reasoning: `docs/STRATEGY.md`. Remaining work: `docs/TASKS.md`.

## Judging criteria — equally weighted, memorise these

1. **WebMCP Leverage** — thorough, skilful, non-trivial use of WebMCP
2. **Execution** — a complete, coherent product, *not a proof of concept*
3. **Potential Impact** — a real problem for a real audience
4. **Creativity & Ambition** — novel, differentiated

There is **no visual-design criterion**. Good design buys credibility, not
score. Budget roughly 70% engineering / 30% presentation.

## Hard submission requirements

- [x] Open-source LICENSE detectable at repo root — already committed
- [x] Live URL reachable in ChatGPT's in-app browser or Chrome with WebMCP on
- [x] Public repo (GitHub) with all source
- [ ] Public YouTube demo video, **under 3 minutes**, with audio
- [ ] Written description: why WebMCP fits, how it improves UX, implementation

Project must be new work created during the submission window (opened 25 Aug
2026). This repo is new. Do not import prior work.

## Environment gate

WebMCP needs **Chrome 149+** with `chrome://flags/#enable-webmcp-testing`
(or CLI flags — see README `pnpm smoke:browser`). Chrome 152 verified locally
and on production. `pnpm test` exercises guard logic headlessly without a browser.

## Architecture decisions

**Single Next.js app, not a pnpm monorepo.** Workspace setup plus
`transpilePackages` costs ~20 min and adds deploy failure modes. `src/dyepack/`
is dependency-free and imports nothing from the app, so it stays extractable.

**Primary vs corroborating signals.** `verbatim-span` and `exclusive-token` tie
a specific argument to a specific dyed region — these are primary. `directive`
and `out-of-intent` describe the page, not the arguments, and cannot block on
their own. This was a real false positive: an operator-typed address got blocked
because a nearby review contained the word "checkout". Do not undo this.

**Thresholds scale with blast radius, not with danger.** A false positive on an
irreversible call costs one confirmation; a false negative costs the money.

**The agent driver is ours.** We do not depend on ChatGPT behaving
deterministically for the demo video. `/api/agent` runs our own tool-calling
loop so the split-screen is reproducible. The site must *also* work in ChatGPT's
browser for the submission requirement, but the video uses our driver.

## Design rules — the project loses credibility if these break

Judges are tech-savvy and spot LLM-default output in about three seconds.

Banned: purple→pink gradients, glassmorphism, gradient text, `rounded-2xl`
everywhere, `hover:scale-105`, raw Lucide icons, Inter or Poppins as the display
face, 3×2 feature grids, emoji in section headings, fake testimonials, centred
everything, uniform `py-24`, copy like "Empower your workflow" or "In today's
fast-paced world".

Direction: forensic / evidentiary. Off-white or tinted-dark ground, one accent
that is not trendy, a mono face carrying real weight (this is a security tool —
mono is honest here, not decorative), asymmetric layout, at least one moment
that breaks the grid. Copy is short, specific, and has an opinion. Use real
numbers, real product names, real timings.

## Commands

```bash
pnpm dev          # localhost:3000 — check /smoke first
pnpm test         # provenance engine, 5/5 must stay green
pnpm typecheck
```

Keep `pnpm test` green. Every new signal or threshold change needs a test,
including a false-positive test — that is where this design actually earns trust.
