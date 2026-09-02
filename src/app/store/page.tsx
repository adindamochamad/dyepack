"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useDyePack } from "@/dyepack/react";
import { StoreView } from "@/components/StoreView";
import { StoreEngine } from "@/store/engine";
import { setupStoreRegistry } from "@/store/setup-registry";
import { buildStoreTools } from "@/store/tools";

export default function StorePage() {
  const engineRef = useRef(new StoreEngine());
  const { dp, highlightedZone } = useDyePack({ guarded: true });
  const registered = useRef(false);

  useEffect(() => {
    setupStoreRegistry(dp, "");
    if (registered.current) return;
    buildStoreTools(engineRef.current).forEach(({ tool, blast }) => {
      void dp.register(tool, { blast });
    });
    registered.current = true;
    return () => dp.dispose();
  }, [dp]);

  return (
    <main className="store-page">
      <header className="page-head">
        <p className="kicker">Harbor &amp; Loom · WebMCP storefront</p>
        <h1>9 tools registered</h1>
        <p className="page-head__sub">
          Reviews are dyed. Product copy is trusted. Open in Chrome 149+ with WebMCP enabled —
          ChatGPT can drive this page directly.
        </p>
        <nav className="page-head__nav">
          <Link href="/split">See the split demo →</Link>
        </nav>
      </header>
      <StoreView highlightedZone={highlightedZone} />
    </main>
  );
}
