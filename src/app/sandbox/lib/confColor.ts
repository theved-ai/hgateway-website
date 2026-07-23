// Both Legacy and Ved confidence bars share ONE color scale keyed to the value
// itself — at 50% they render identically, and Ved's bar only shifts toward
// green because its value climbs, never because it's hardcoded green.
const CONF_COLOR_START = [168, 64, 42]; // var(--red) — the shared 50% color
const CONF_COLOR_END = [12, 143, 68]; // var(--green) — reached at 90%

export function confColor(pct: number): string {
  const t = Math.max(0, Math.min(1, (pct - 50) / 40));
  const c = CONF_COLOR_START.map((s, i) => Math.round(s + (CONF_COLOR_END[i] - s) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
