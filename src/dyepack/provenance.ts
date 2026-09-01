import type { DyeZone, Evidence } from "./types";
import type { DyeRegistry } from "./dye";

const STOPWORDS = new Set([
  "the","and","for","you","your","this","that","with","from","have","has","are","was",
  "will","can","not","but","all","any","our","out","get","one","two","use","please",
  "would","should","could","them","they","there","then","than","when","what","which",
  "about","into","over","also","just","been","were","more","some","only","very","item",
]);

const normalize = (s: string): string => s.toLowerCase().replace(/\s+/g, " ").trim();

const tokenize = (s: string): string[] =>
  normalize(s)
    .split(/[^a-z0-9@._-]+/)
    .filter((t) => t.length >= 2);

/**
 * A token is "distinctive" if seeing it twice in two places is unlikely to be
 * coincidence: coupon codes, order ids, emails, URLs, street numbers, long words.
 * These are what actually carry an injected payload into an argument.
 */
const isDistinctive = (t: string): boolean => {
  if (STOPWORDS.has(t)) return false;
  if (/\d/.test(t)) return true;
  if (/[@._-]/.test(t)) return true;
  return t.length >= 6;
};

/** Walk nested args and yield every string with a dotted path. */
function* strings(value: unknown, path = ""): Generator<{ path: string; text: string }> {
  if (typeof value === "string") {
    yield { path: path || "(root)", text: value };
  } else if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) yield* strings(value[i], `${path}[${i}]`);
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) yield* strings(v, path ? `${path}.${k}` : k);
  }
}

/** Longest run of consecutive tokens from `needle` that appears inside `hay`. */
function longestSharedRun(needle: string[], hay: string): string[] {
  const h = ` ${tokenize(hay).join(" ")} `;
  let best: string[] = [];
  for (let i = 0; i < needle.length; i++) {
    for (let j = needle.length; j > i + best.length; j--) {
      const run = needle.slice(i, j);
      if (h.includes(` ${run.join(" ")} `)) {
        best = run;
        break;
      }
    }
  }
  return best;
}

const DIRECTIVE = /\b(ignore|disregard|instead|must|always|immediately|system|assistant|now\s+(?:call|use|run)|do\s+not\s+tell|silently|before\s+(?:you\s+)?(?:reply|respond|answer))\b/i;

export interface ProvenanceResult {
  score: number;
  evidence: Evidence[];
}

/**
 * Decide whether this tool call's arguments were authored by dyed content
 * rather than by the operator.
 *
 * Four independent signals, combined with noisy-OR so that any one strong
 * signal is enough but weak signals still corroborate each other.
 */
export function traceProvenance(
  toolName: string,
  args: Record<string, unknown>,
  registry: DyeRegistry,
): ProvenanceResult {
  const evidence: Evidence[] = [];
  const zones = registry.dyedZones();
  if (zones.length === 0) return { score: 0, evidence };

  const intent = registry.getIntent();
  const authorized = new Set([...tokenize(intent), ...tokenize(registry.trustedText())]);

  for (const { path, text } of strings(args)) {
    const argTokens = tokenize(text);
    if (argTokens.length === 0) continue;

    for (const zone of zones) {
      // Signal 1 — a verbatim span of the dyed text survived into the argument.
      const run = longestSharedRun(argTokens, zone.text);
      const novelRun = run.filter((t) => !authorized.has(t));
      if (run.length >= 3 && novelRun.length > 0) {
        evidence.push({
          kind: "verbatim-span",
          zoneId: zone.id,
          zoneLabel: zone.label,
          span: run.join(" "),
          argPath: path,
          detail: `${run.length} consecutive tokens copied out of ${zone.label} into \`${path}\`.`,
          weight: Math.min(0.9, 0.3 + run.length * 0.12),
        });
      }

      // Signal 2 — distinctive tokens that exist ONLY in the dyed zone.
      const zoneTokens = new Set(tokenize(zone.text));
      const exclusive = argTokens.filter(
        (t) => isDistinctive(t) && zoneTokens.has(t) && !authorized.has(t),
      );
      const unique = [...new Set(exclusive)];
      if (unique.length > 0) {
        evidence.push({
          kind: "exclusive-token",
          zoneId: zone.id,
          zoneLabel: zone.label,
          span: unique.join(", "),
          argPath: path,
          detail: `\`${path}\` carries ${unique.length} value(s) found nowhere except ${zone.label}: ${unique.join(", ")}.`,
          weight: Math.min(0.88, 0.42 + unique.length * 0.16),
        });
      }
    }
  }
  /**
   * Signals 1 and 2 are PRIMARY: each one ties a specific argument back to a
   * specific dyed region. Signals 3 and 4 are CORROBORATING — they describe the
   * page, not the arguments, and on their own they are circumstantial.
   *
   * A guard that blocks on circumstance alone is a guard nobody ships. So if
   * nothing tied the arguments to dyed content, we stop here and allow, no
   * matter how suspicious the page looks.
   */
  const primary = [...evidence];
  if (primary.length === 0) return { score: 0, evidence: [] };

  // Signal 3 — the dyed text is phrased as an instruction aimed at this tool.
  for (const zone of zones) {
    const namesTool =
      zone.text.toLowerCase().includes(toolName.toLowerCase()) ||
      zone.text.toLowerCase().includes(toolName.toLowerCase().replace(/_/g, " "));
    if (DIRECTIVE.test(zone.text) && (namesTool || primary.some((e) => e.zoneId === zone.id))) {
      evidence.push({
        kind: "directive",
        zoneId: zone.id,
        zoneLabel: zone.label,
        span: zone.text.match(DIRECTIVE)?.[0],
        detail: `${zone.label} is written as a command, not as content.`,
        weight: 0.35,
      });
    }
  }

  // Signal 4 — nothing in what the operator asked for reaches this tool.
  if (intent) {
    const intentTokens = new Set(tokenize(intent));
    const nameParts = toolName.split(/[_\-.]/).filter((p) => p.length >= 3);
    if (!nameParts.some((p) => intentTokens.has(p))) {
      evidence.push({
        kind: "out-of-intent",
        detail: `Operator asked "${intent.slice(0, 72)}" — nothing in that request reaches ${toolName}.`,
        weight: 0.3,
      });
    }
  }

  // Noisy-OR: independent signals reinforce, none can single-handedly saturate.
  const score = 1 - evidence.reduce((acc, e) => acc * (1 - e.weight), 1);
  return { score: Math.min(1, score), evidence };
}

export type { DyeZone };
