import { DyeRegistry } from "./dye";
import { Ledger } from "./ledger";
import { PolicyBook } from "./policy";
import { traceProvenance } from "./provenance";
import type { Adjudication, Blast, LedgerEntry, ToolPolicy } from "./types";

export interface WebMCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<ToolResult> | ToolResult;
}

export interface ToolResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

interface ModelContextLike {
  registerTool: (tool: WebMCPTool, opts?: { signal?: AbortSignal }) => Promise<unknown>;
}

const textResult = (text: string, isError = false): ToolResult => ({
  content: [{ type: "text", text }],
  isError,
});

export interface DyePackOptions {
  /** When false, every call executes untouched — the control side of the split. */
  guarded?: boolean;
  /** Fires whenever a call is blocked, so the UI can point at the culprit. */
  onBlock?: (entry: LedgerEntry) => void;
}

/**
 * The guard.
 *
 * Every tool registered through DyePack keeps its own `execute`, but that
 * execute is now downstream of an adjudication step that asks one question:
 * did the operator ask for this, or did the page?
 */
export class DyePack {
  readonly registry = new DyeRegistry();
  readonly policy = new PolicyBook();
  readonly ledger = new Ledger();

  private tools = new Map<string, WebMCPTool>();
  private guarded: boolean;
  private onBlock?: (entry: LedgerEntry) => void;
  private restore?: () => void;

  constructor(opts: DyePackOptions = {}) {
    this.guarded = opts.guarded ?? true;
    this.onBlock = opts.onBlock;
  }

  setGuarded(on: boolean): void {
    this.guarded = on;
  }

  isGuarded(): boolean {
    return this.guarded;
  }

  /** Register a tool locally, and with the browser when WebMCP is present. */
  async register(tool: WebMCPTool, policy?: Omit<ToolPolicy, "name">): Promise<void> {
    this.tools.set(tool.name, tool);
    this.policy.register({ name: tool.name, blast: policy?.blast ?? "reversible", threshold: policy?.threshold });

    const mc = this.modelContext();
    if (!mc) return;
    await mc.registerTool({ ...tool, execute: (args) => this.call(tool.name, args) });
  }

  listTools(): WebMCPTool[] {
    return [...this.tools.values()];
  }

  /** Score a call without running it. Used by the UI to preview a verdict. */
  adjudicate(toolName: string, args: Record<string, unknown>): Adjudication {
    const blast: Blast = this.policy.blastOf(toolName);
    const { score, evidence } = traceProvenance(toolName, args, this.registry);
    const verdict = this.guarded ? this.policy.adjudicate(toolName, score) : "allow";

    const top = [...evidence].sort((a, b) => b.weight - a.weight)[0];
    const reason =
      verdict === "block"
        ? `Arguments trace back to ${top?.zoneLabel ?? "untrusted content"}, not to the operator.`
        : verdict === "flag"
          ? `Weak provenance signal — executed, but logged for review.`
          : evidence.length
            ? `Signals present but below the ${blast} threshold.`
            : `Arguments trace to operator intent.`;

    return { toolName, verdict, score, blast, reason, evidence };
  }

  /** The one path every tool call travels, guarded or not. */
  async call(toolName: string, args: Record<string, unknown>): Promise<ToolResult> {
    const tool = this.tools.get(toolName);
    if (!tool) return textResult(`Unknown tool: ${toolName}`, true);

    const verdictInfo = this.adjudicate(toolName, args);

    if (verdictInfo.verdict === "block") {
      const entry = this.ledger.append({
        ...verdictInfo,
        args,
        guarded: this.guarded,
        executed: false,
        resultText: verdictInfo.reason,
      });
      this.onBlock?.(entry);
      return textResult(
        `BLOCKED by DyePack. ${verdictInfo.reason} No action was taken. ` +
          `If the operator wants this, they must ask for it themselves.`,
        true,
      );
    }

    let resultText: string;
    let isError = false;
    try {
      const out = await tool.execute(args);
      resultText = out.content.map((c) => c.text).join("\n");
      isError = out.isError ?? false;
    } catch (err) {
      resultText = err instanceof Error ? err.message : String(err);
      isError = true;
    }

    this.ledger.append({
      ...verdictInfo,
      args,
      guarded: this.guarded,
      executed: true,
      resultText,
    });

    return textResult(resultText, isError);
  }

  private modelContext(): ModelContextLike | null {
    if (typeof document === "undefined") return null;
    const mc = (document as unknown as { modelContext?: ModelContextLike }).modelContext;
    return mc && typeof mc.registerTool === "function" ? mc : null;
  }

  /** True when this browser actually speaks WebMCP. */
  static supported(): boolean {
    if (typeof document === "undefined") return false;
    const mc = (document as unknown as { modelContext?: unknown }).modelContext;
    return !!mc && typeof (mc as ModelContextLike).registerTool === "function";
  }

  dispose(): void {
    this.restore?.();
    this.tools.clear();
    this.registry.reset();
    this.ledger.reset();
  }

  /** Clear provenance state between demo runs without unregistering tools. */
  softReset(): void {
    this.registry.reset();
    this.ledger.reset();
  }
}
