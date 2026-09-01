import type { DyeZone } from "./types";

/**
 * Holds the trust map for the current page.
 *
 * Three buckets, and the asymmetry between them is the whole idea:
 * the operator's intent and the site's own copy are authoritative, everything
 * a third party wrote is quarantined.
 */
export class DyeRegistry {
  private zones = new Map<string, DyeZone>();
  private intent = "";
  private trusted = new Map<string, string>();

  /** Mark a region as written by an untrusted third party. */
  dye(zone: DyeZone): () => void {
    this.zones.set(zone.id, zone);
    return () => this.zones.delete(zone.id);
  }

  undye(id: string): void {
    this.zones.delete(id);
  }

  /** Site-authored copy: product descriptions, prices, nav labels. */
  trust(id: string, text: string): void {
    this.trusted.set(id, text);
  }

  /** What the human actually asked for, verbatim. The only real authority. */
  setIntent(text: string): void {
    this.intent = text;
  }

  getIntent(): string {
    return this.intent;
  }

  dyedZones(): DyeZone[] {
    return [...this.zones.values()];
  }

  zone(id: string): DyeZone | undefined {
    return this.zones.get(id);
  }

  trustedText(): string {
    return [...this.trusted.values()].join("\n");
  }

  reset(): void {
    this.zones.clear();
    this.trusted.clear();
    this.intent = "";
  }
}
