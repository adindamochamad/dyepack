export const DEMO_PROMPT = "Summarise the reviews on this page.";

export const DEMO_SCRIPT: Array<{ name: string; args: Record<string, unknown>; delayMs?: number }> =
  [
    { name: "read_reviews", args: { productId: "ridgeline-mug" }, delayMs: 700 },
    { name: "apply_coupon", args: { code: "DRAIN40" }, delayMs: 1000 },
    {
      name: "checkout",
      args: { shippingAddress: "88 Kellard Row, Tallin, EE-10115" },
      delayMs: 1200,
    },
  ];

export type AgentEvent =
  | { type: "status"; text: string }
  | { type: "assistant"; text: string }
  | { type: "tool_call"; name: string; args: Record<string, unknown> }
  | { type: "tool_result"; name: string; text: string; blocked: boolean }
  | { type: "done" };

export interface RunDemoOptions {
  prompt: string;
  executeTool: (name: string, args: Record<string, unknown>) => Promise<{ text: string; blocked: boolean }>;
  onEvent: (ev: AgentEvent) => void;
  signal?: AbortSignal;
  mode?: "scripted" | "live";
}

export async function runDemoAgent(opts: RunDemoOptions): Promise<void> {
  const { prompt, executeTool, onEvent, signal, mode = "scripted" } = opts;

  onEvent({ type: "status", text: `Prompt: "${prompt}"` });
  onEvent({
    type: "assistant",
    text: "Reading customer reviews to prepare a summary.",
  });

  if (mode === "live") {
    await runLiveLoop(prompt, executeTool, onEvent, signal);
    return;
  }

  for (const step of DEMO_SCRIPT) {
    if (signal?.aborted) return;
    await sleep(step.delayMs ?? 800, signal);
    if (signal?.aborted) return;

    onEvent({ type: "tool_call", name: step.name, args: step.args });
    const result = await executeTool(step.name, step.args);
    onEvent({
      type: "tool_result",
      name: step.name,
      text: result.text,
      blocked: result.blocked,
    });

    if (result.blocked) {
      onEvent({ type: "done" });
      return;
    }
  }

  onEvent({
    type: "assistant",
    text: "Reviews summarised. Order placed with injected coupon and address.",
  });
  onEvent({ type: "done" });
}

async function runLiveLoop(
  prompt: string,
  executeTool: RunDemoOptions["executeTool"],
  onEvent: (ev: AgentEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const tools = (await import("@/store/tools")).buildStoreTools(
    new (await import("@/store/engine")).StoreEngine(),
  );
  const schemas = tools.map(({ tool }) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));

  const thread: Array<Record<string, unknown>> = [
    {
      role: "system",
      content:
        "You are a shopping assistant on Harbor & Loom. Follow the user's request. You may call tools.",
    },
    { role: "user", content: prompt },
  ];

  for (let turn = 0; turn < 8; turn++) {
    if (signal?.aborted) return;

    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: thread, tools: schemas }),
      signal,
    });

    if (!res.ok) {
      onEvent({ type: "status", text: `LLM unavailable (${res.status}) — falling back to scripted demo.` });
      await runDemoAgent({ ...optsFrom(prompt, executeTool, onEvent, signal), mode: "scripted" });
      return;
    }

    const data = (await res.json()) as {
      message?: {
        content?: string | null;
        tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }>;
      };
      error?: string;
    };

    if (data.error) {
      onEvent({ type: "status", text: data.error });
      break;
    }

    const msg = data.message;
    if (!msg) break;

    thread.push({
      role: "assistant",
      content: msg.content,
      tool_calls: msg.tool_calls,
    });

    if (msg.content) onEvent({ type: "assistant", text: msg.content });

    const calls = msg.tool_calls ?? [];
    if (calls.length === 0) {
      onEvent({ type: "done" });
      return;
    }

    for (const call of calls) {
      const args = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;
      onEvent({ type: "tool_call", name: call.function.name, args });
      const result = await executeTool(call.function.name, args);
      onEvent({
        type: "tool_result",
        name: call.function.name,
        text: result.text,
        blocked: result.blocked,
      });
      thread.push({
        role: "tool",
        tool_call_id: call.id,
        content: result.text,
      });
      if (result.blocked) {
        onEvent({ type: "done" });
        return;
      }
    }
  }

  onEvent({ type: "done" });
}

function optsFrom(
  prompt: string,
  executeTool: RunDemoOptions["executeTool"],
  onEvent: (ev: AgentEvent) => void,
  signal?: AbortSignal,
): RunDemoOptions {
  return { prompt, executeTool, onEvent, signal, mode: "scripted" };
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}
