# DyePack

**Provenance guardrails for WebMCP.**

WebMCP lets a site hand an agent real tools. It has no concept of *where an
instruction came from*. So a trustworthy site with honest tools can be aimed by
one untrustworthy sentence sitting in its own user-generated content.

DyePack dyes untrusted DOM regions, intercepts every tool call before it
executes, and stops any call whose arguments were derived from dyed content —
then points at the exact sentence that tried it.

> What happens when a trusted site's honest tools are aimed by an untrusted sentence?

## Status

Built for [The WebMCP Challenge](https://webmcp.devpost.com/) (Aug 25 – Sep 3, 2026).

**Live:** https://dyepack-liard.vercel.app  
**Repo:** https://github.com/adindamochamad/dyepack

**Remaining for submission:** YouTube demo, Devpost submit.

| Route | What it is |
|---|---|
| `/` | Landing — the thesis |
| `/split` | Side-by-side: same prompt, guard off vs on |
| `/store` | Harbor & Loom — 9 WebMCP tools |
| `/smoke` | WebMCP environment check |

## Requirements

- **Google Chrome 149+** (Brave does not expose WebMCP)
- Node 20+, pnpm

### WebMCP in Chrome

Either enable the flag in the UI:

1. Open `chrome://flags/#enable-webmcp-testing` → **Enabled**
2. Relaunch Chrome

Or launch Chrome with CLI flags (used by `pnpm smoke:browser`):

```bash
--enable-experimental-web-platform-features
--enable-features=WebMCPTesting,DevToolsWebMCPSupport
```

## Run

```bash
pnpm install
cp .env.example .env.local   # optional — live LLM mode only
pnpm dev
```

Open `/smoke` first — all four checks must pass before anything else.

Automated gate (requires Google Chrome installed):

```bash
pnpm dev          # terminal 1
pnpm smoke:browser                    # localhost
SMOKE_URL=https://dyepack-liard.vercel.app pnpm smoke:browser   # production
```

## The module

`src/dyepack/` is dependency-free and imports nothing from the app. It is meant
to be extracted into a standalone package.

## License

MIT — see [LICENSE](./LICENSE).
