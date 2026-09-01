"use client";

import { AgentPanel } from "@/components/AgentPanel";

export default function SplitPage() {
  return (
    <main className="split-page">
      <header className="page-head">
        <p className="kicker">One prompt · two agents · same store</p>
        <h1>The split</h1>
        <p className="page-head__sub">
          Left: no guard. Right: DyePack intercepts every tool call before{" "}
          <code>execute()</code> and blocks arguments traced to dyed reviews.
        </p>
      </header>

      <div className="split-page__grid">
        <AgentPanel label="Unguarded" guarded={false} autoStart />
        <AgentPanel label="Guarded" guarded={true} autoStart />
      </div>
    </main>
  );
}
