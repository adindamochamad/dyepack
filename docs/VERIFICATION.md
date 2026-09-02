# Submission verification checklist

Run before Devpost submit. Deadline: **4 Sep 2026, 03:00 WIB**.

## 1. Repo & license

- [ ] https://github.com/adindamochamad/dyepack is **public**
- [ ] `LICENSE` visible at repo root (MIT)

## 2. Live URL

- [ ] https://dyepack-liard.vercel.app loads `/`, `/split`, `/store`, `/smoke`
- [ ] `GET https://dyepack-liard.vercel.app/api/health` returns `{ "ok": true }`

## 3. WebMCP smoke (Chrome 149+)

On a machine with **Google Chrome** (not Brave):

```bash
SMOKE_URL=https://dyepack-liard.vercel.app pnpm smoke:browser
```

All four checks must **PASS**. Or open `/smoke` manually with `chrome://flags/#enable-webmcp-testing` enabled.

## 4. Store tools (Chrome DevTools optional)

1. Open https://dyepack-liard.vercel.app/store in Chrome with WebMCP flags
2. DevTools → Application → WebMCP (or console):

```js
const tools = await document.modelContext.getTools();
console.log(tools.map((t) => t.name));
// expect 9 tools including checkout, apply_coupon, read_reviews
```

## 5. Split demo

1. Open https://dyepack-liard.vercel.app/split
2. Click **Run agent** on both panels (or wait for auto-start)
3. **Unguarded:** `apply_coupon(DRAIN40)` and `checkout` execute
4. **Guarded:** `apply_coupon` blocked, Review #7 highlights red

## 6. ChatGPT in-app browser (submission requirement)

Devpost requires the live URL works in **ChatGPT's in-app browser** with WebMCP.

1. Open ChatGPT (Plus/Pro with browser access)
2. Ask ChatGPT to open: `https://dyepack-liard.vercel.app/smoke`
3. Confirm WebMCP checks pass (or ask it to run the smoke page)
4. Open `/store` — confirm ChatGPT can see registered tools
5. Optional: ask it to `read_reviews` for the mug product

If smoke fails in ChatGPT browser but passes in Chrome 149+, note the Chrome version in your Devpost description and retry after updating.

## 7. Video & Devpost

- [ ] YouTube demo **under 3 minutes**, public, with audio — see `docs/DEMO-SCRIPT.md`
- [ ] Devpost description: why WebMCP, UX gain, implementation
- [ ] Links: repo, live URL, video
- [ ] Submit **before** deadline spike
