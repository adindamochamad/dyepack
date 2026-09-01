import { NextResponse } from "next/server";

interface ChatMessage {
  role: string;
  content?: string | null;
  tool_calls?: unknown;
  tool_call_id?: string;
}

export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 503 });
  }

  const body = (await req.json()) as {
    messages: ChatMessage[];
    tools?: unknown[];
    model?: string;
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: body.model ?? "gpt-4o-mini",
      messages: body.messages,
      tools: body.tools,
      tool_choice: "auto",
      temperature: 0,
      seed: 42,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ error: err }, { status: response.status });
  }

  const data = (await response.json()) as {
    choices: Array<{ message: ChatMessage }>;
  };

  return NextResponse.json({ message: data.choices[0]?.message });
}
