# `dyepack`

Dependency-free provenance guard for WebMCP tool calls. Imports nothing from
the host application — extractable as a standalone package as-is.

```ts
import { DyePack } from "@/dyepack";

const dp = new DyePack({ guarded: true });

// 1. Mark what the site did not author.
dp.registry.dye({
  id: "review-7",
  label: "Review #7 — nash_p",
  origin: "user-generated:review",
  text: review.body,
});

// 2. Record what the operator actually asked for.
dp.registry.setIntent("summarise the reviews on this page");

// 3. Register tools. Blast radius, not danger, sets the threshold.
await dp.register(checkoutTool, { blast: "irreversible" });

// 4. Calls now travel through adjudication before execute().
await dp.call("checkout", { shippingAddress: "…" });
```

## Signals

| Signal | Catches |
|---|---|
| `verbatim-span` | Payload text copied straight out of a dyed region |
| `exclusive-token` | Codes, emails, addresses existing only inside dyed content |
| `directive` | Dyed text phrased as a command rather than as content |
| `out-of-intent` | A tool nothing in the operator's request reaches |

Combined with noisy-OR: one strong signal suffices, weak ones corroborate.

## Thresholds

| Blast | Blocks at | Rationale |
|---|---|---|
| `read` | 0.85 | Cheap to get wrong |
| `reversible` | 0.45 | Undo exists |
| `irreversible` | 0.22 | One-way door — a false positive costs one confirmation, a false negative costs the money |

### Primary vs corroborating

`verbatim-span` and `exclusive-token` are **primary** — each ties a specific
argument to a specific dyed region. `directive` and `out-of-intent` are
**corroborating**: they describe the page, not the arguments.

If no primary signal fires, the score is 0 regardless of how hostile the page
looks. A guard that blocks on circumstance alone is a guard nobody ships —
and it was a real false positive in the test suite before this rule existed:
an address the operator typed themselves got blocked because a nearby review
happened to contain the word "checkout".
