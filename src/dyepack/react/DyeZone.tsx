"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface DyeZoneProps {
  zoneId: string;
  highlighted?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Wraps untrusted DOM. When DyePack blocks a call traced to this zone,
 * `highlighted` flips on and the review scrolls into view.
 */
export function DyeZone({ zoneId, highlighted, children, className = "" }: DyeZoneProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (highlighted && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlighted]);

  return (
    <article
      ref={ref}
      data-dye-zone={zoneId}
      data-highlighted={highlighted ? "true" : undefined}
      className={`dye-zone ${highlighted ? "dye-zone--lit" : ""} ${className}`}
    >
      {children}
    </article>
  );
}
