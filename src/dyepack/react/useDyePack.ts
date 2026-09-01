"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DyePack } from "@/dyepack/interceptor";
import type { LedgerEntry } from "@/dyepack/types";

export interface UseDyePackOptions {
  guarded?: boolean;
  onBlock?: (entry: LedgerEntry) => void;
}

function makePack(opts: UseDyePackOptions): DyePack {
  return new DyePack({
    guarded: opts.guarded ?? true,
    onBlock: opts.onBlock,
  });
}

export function useDyePack(opts: UseDyePackOptions = {}) {
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const [pack, setPack] = useState(() => makePack(opts));
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [highlightedZone, setHighlightedZone] = useState<string | null>(null);
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    pack.setGuarded(opts.guarded ?? true);
  }, [pack, opts.guarded]);

  useEffect(() => {
    return pack.ledger.subscribe((entry) => {
      setEntries((prev) => [...prev, entry]);
      if (entry.verdict === "block") {
        const zoneId = entry.evidence.find((e) => e.zoneId)?.zoneId;
        if (zoneId) setHighlightedZone(zoneId);
        optsRef.current.onBlock?.(entry);
      }
    });
  }, [pack, epoch]);

  const softReset = useCallback(() => {
    pack.softReset();
    setEntries([]);
    setHighlightedZone(null);
  }, [pack]);

  const reset = useCallback(() => {
    pack.dispose();
    setPack(makePack(optsRef.current));
    setEntries([]);
    setHighlightedZone(null);
    setEpoch((e) => e + 1);
  }, [pack]);

  return {
    dp: pack,
    entries,
    highlightedZone,
    setHighlightedZone,
    reset,
    softReset,
  };
}
