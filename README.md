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

| Route | What it is |
|---|---|
| `/` | Landing — the thesis |
| `/split` | Side-by-side: same prompt, guard off vs on |
| `/store` | Harbor & Loom — 9 WebMCP tools |
| `/smoke` | WebMCP environment check |

**Remaining for submission:** Chrome 149+ verification, Vercel deploy, YouTube demo, Devpost submit.

- Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled
- Node 20+, pnpm

## Run

```bash
pnpm install
cp .env.example .env.local   # add OPENAI_API_KEY
pnpm dev
```

Then open `/smoke` first — it verifies the WebMCP gate before anything else.

| Route | What it is |
|---|---|
| `/` | The argument |
| `/split` | Side-by-side: same prompt, same store, guard off vs on |
| `/store` | Harbor & Loom — a real working storefront with 9 WebMCP tools |
| `/smoke` | WebMCP environment check |

## The module

`src/dyepack/` is dependency-free and imports nothing from the app. It is meant
to be extracted into a standalone package.

## License

MIT — see [LICENSE](./LICENSE).
