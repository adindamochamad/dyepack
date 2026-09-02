/**
 * Headless WebMCP smoke probe — runs /smoke in real Chrome with WebMCP flags.
 * Requires: Google Chrome 149+, dev server on localhost:3000
 */
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const BASE = process.env.SMOKE_URL ?? "http://localhost:3000";
const SMOKE = `${BASE}/smoke`;

async function waitForServer(url, attempts = 30) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await sleep(500);
  }
  throw new Error(`Server not reachable at ${url}`);
}

async function main() {
  if (process.env.SKIP_SMOKE_BROWSER === "1") {
    console.log("SKIP_SMOKE_BROWSER=1 — skipping Chrome WebMCP probe (CI has no Chrome).");
    return;
  }

  const chromePath =
    process.env.CHROME_PATH ??
    (process.platform === "darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : "google-chrome");

  if (!existsSync(chromePath) && process.platform !== "win32") {
    const msg = `Google Chrome not found at ${chromePath}`;
    if (process.env.CI) {
      console.log(`${msg} — skipping in CI. Run locally or set CHROME_PATH.`);
      return;
    }
    throw new Error(`${msg}. Install Chrome 149+ or set CHROME_PATH.`);
  }

  console.log(`Chrome: ${chromePath}`);
  console.log(`Target: ${SMOKE}`);

  await waitForServer(BASE);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: false,
    args: [
      "--no-first-run",
      "--no-default-browser-check",
      "--enable-experimental-web-platform-features",
      "--enable-features=WebMCPTesting,DevToolsWebMCPSupport",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.goto(SMOKE, { waitUntil: "networkidle0", timeout: 30000 });

    await page.waitForFunction(
      () => document.querySelectorAll(".smoke-card").length >= 3,
      { timeout: 15000 },
    );

    // Wait for async registerTool() to settle (4th card)
    await page
      .waitForFunction(() => document.querySelectorAll(".smoke-card").length >= 4, {
        timeout: 10000,
      })
      .catch(() => {
        /* modelContext may be absent — 3 cards is enough to report */
      });

    await sleep(500);

    const report = await page.evaluate(() => {
      const byLabel = new Map();
      for (const c of document.querySelectorAll(".smoke-card")) {
        byLabel.set(c.querySelector("h3")?.textContent ?? "", {
          label: c.querySelector("h3")?.textContent ?? "",
          state: c.classList.contains("smoke-card--pass")
            ? "pass"
            : c.classList.contains("smoke-card--fail")
              ? "fail"
              : "pending",
          detail: c.querySelector("p")?.textContent ?? "",
        });
      }
      const cards = [...byLabel.values()];
      const verdict = document.querySelector(".smoke-verdict span")?.textContent ?? "";
      const modelContext = typeof document.modelContext;
      return { cards, verdict, modelContext };
    });

    console.log("\n--- Smoke results ---");
    for (const c of report.cards) {
      console.log(`${c.state.toUpperCase().padEnd(7)} ${c.label}`);
      console.log(`        ${c.detail}`);
    }
    console.log(`\nVerdict: ${report.verdict}`);
    console.log(`document.modelContext: ${report.modelContext}`);

    const allPass = report.cards.length >= 4 && report.cards.every((c) => c.state === "pass");
    if (!allPass) {
      console.error("\nGATE NOT PASSED");
      process.exitCode = 1;
    } else {
      console.log("\nGATE PASSED");
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
