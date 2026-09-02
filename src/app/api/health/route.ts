import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "dyepack",
    liveLLM: Boolean(process.env.OPENAI_API_KEY),
    routes: ["/", "/split", "/store", "/smoke"],
    webmcpNote:
      "WebMCP requires Chrome 149+ with enable-webmcp-testing. Verify via /smoke or pnpm smoke:browser.",
  });
}
