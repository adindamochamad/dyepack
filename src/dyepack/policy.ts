import type { Blast, ToolPolicy } from "./types";

/**
 * Blocking thresholds by blast radius.
 *
 * Reading is cheap to get wrong, so we tolerate noisy provenance signals.
 * An irreversible call is a one-way door: we stop it on much weaker evidence,
 * because the cost of a false positive (one extra confirmation) is nothing
 * next to the cost of a false negative (money gone).
 */
const BLOCK_THRESHOLD: Record<Blast, number> = {
  read: 0.85,
  reversible: 0.45,
  irreversible: 0.22,
};

/** Below this we still surface the call in the ledger, but let it run. */
const FLAG_MARGIN = 0.6;

export class PolicyBook {
  private policies = new Map<string, ToolPolicy>();

  register(policy: ToolPolicy): void {
    this.policies.set(policy.name, policy);
  }

  registerAll(policies: ToolPolicy[]): void {
    policies.forEach((p) => this.register(p));
  }

  blastOf(toolName: string): Blast {
    // Unknown tools are treated as reversible: not paranoid, not naive.
    return this.policies.get(toolName)?.blast ?? "reversible";
  }

  thresholdFor(toolName: string): number {
    const policy = this.policies.get(toolName);
    if (policy?.threshold !== undefined) return policy.threshold;
    return BLOCK_THRESHOLD[this.blastOf(toolName)];
  }

  /** Turn a provenance score into a verdict for this specific tool. */
  adjudicate(toolName: string, score: number): "allow" | "flag" | "block" {
    const threshold = this.thresholdFor(toolName);
    if (score >= threshold) return "block";
    if (score >= threshold * FLAG_MARGIN) return "flag";
    return "allow";
  }
}
