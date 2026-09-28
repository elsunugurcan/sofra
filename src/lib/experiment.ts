/**
 * Uygulama içi A/B deney altyapısı: deterministik atama, olay günlüğü, huni ve istatistiksel anlamlılık.
 * Tüm hesaplar saf fonksiyonlardır; testlerle doğrulanır.
 */
export type Variant = "A" | "B";
export type EventName = "restaurant_view" | "add_to_cart" | "cart_view" | "checkout_start" | "checkout_step" | "checkout_error" | "order_complete";
export type Event = { t: number; session: string; variant: Variant; name: EventName; meta?: Record<string, string | number> };

/** FNV-1a 32 bit — kullanıcı + deney anahtarından kararlı kova. */
export function hash32(s: string): number { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }
export function assign(userId: string, experiment: string, split = 0.5): Variant { return hash32(`${experiment}:${userId}`) / 0xffffffff < split ? "A" : "B"; }

export type Funnel = { variant: Variant; sessions: number; addToCart: number; checkoutStart: number; complete: number; abandonRate: number; conversion: number; avgSteps: number; errors: number };
/** Sepete ekleyen oturumlar bazında huni. Sepet terk = sepete ekleyip siparişi tamamlamayan. */
export function funnel(events: Event[], variant: Variant): Funnel {
  const ev = events.filter((e) => e.variant === variant);
  const sessions = new Set(ev.map((e) => e.session));
  const by = (name: EventName) => new Set(ev.filter((e) => e.name === name).map((e) => e.session));
  const cart = by("add_to_cart"), start = by("checkout_start"), done = by("order_complete");
  const completed = [...done].filter((s) => cart.has(s));
  const stepsPer = completed.map((s) => ev.filter((e) => e.session === s && e.name === "checkout_step").length);
  const errors = ev.filter((e) => e.name === "checkout_error").length;
  return { variant, sessions: sessions.size, addToCart: cart.size, checkoutStart: start.size, complete: completed.length, abandonRate: cart.size ? 1 - completed.length / cart.size : 0, conversion: sessions.size ? completed.length / sessions.size : 0, avgSteps: stepsPer.length ? stepsPer.reduce((a, b) => a + b, 0) / stepsPer.length : 0, errors };
}
/** İki oran için z-testi (tek yönlü değil, iki yönlü p). */
export function zTest(successA: number, nA: number, successB: number, nB: number): { z: number; p: number; significant: boolean; lift: number } {
  if (!nA || !nB) return { z: 0, p: 1, significant: false, lift: 0 };
  const pA = successA / nA, pB = successB / nB, pool = (successA + successB) / (nA + nB);
  const se = Math.sqrt(pool * (1 - pool) * (1 / nA + 1 / nB));
  const z = se ? (pB - pA) / se : 0;
  const p = 2 * (1 - normalCdf(Math.abs(z)));
  return { z: +z.toFixed(3), p: +p.toFixed(4), significant: p < 0.05, lift: pA ? (pB - pA) / pA : 0 };
}
/** Standart normal dağılım CDF (Abramowitz–Stegun 7.1.26 yaklaşımı, hata < 1.5e-7). */
export function normalCdf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(x * x) / 2);
  return 0.5 * (1 + (x >= 0 ? y : -y));
}
/** Gereken örneklem (oturum/varyant): temel oran p, beklenen mutlak artış d, α=0.05, güç 0.8. */
export function sampleSize(p: number, d: number): number {
  const za = 1.96, zb = 0.8416; const p2 = p + d; const pbar = (p + p2) / 2;
  const n = Math.pow(za * Math.sqrt(2 * pbar * (1 - pbar)) + zb * Math.sqrt(p * (1 - p) + p2 * (1 - p2)), 2) / (d * d);
  return Math.ceil(n);
}
/** Deterministik sentetik oturum verisi (demo etiketli): xorshift PRNG ile A/B davranış modeli. */
export function syntheticEvents(n: number, seed = 7, model = { A: { cart: 0.62, start: 0.55, complete: 0.32, steps: 9, err: 0.18 }, B: { cart: 0.64, start: 0.78, complete: 0.59, steps: 5, err: 0.05 } }): Event[] {
  let x = seed >>> 0 || 1; const rnd = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 0xffffffff; };
  const out: Event[] = []; const t0 = Date.parse("2026-09-01T10:00:00");
  for (let i = 0; i < n; i++) {
    const variant: Variant = i % 2 === 0 ? "A" : "B"; const m = model[variant]; const s = `syn-${variant}-${i}`; let t = t0 + i * 90_000;
    const push = (name: EventName, meta?: Event["meta"]) => out.push({ t: (t += 20_000), session: s, variant, name, meta });
    push("restaurant_view");
    if (rnd() < m.cart) { push("add_to_cart"); push("cart_view");
      if (rnd() < m.start) { push("checkout_start"); for (let k = 1; k <= m.steps; k++) push("checkout_step", { step: k }); if (rnd() < m.err) push("checkout_error", { field: "adres" });
        if (rnd() < m.complete) push("order_complete", { total: 20_000 + Math.round(rnd() * 30_000) }); } }
  }
  return out;
}
export const pct = (v: number) => `%${Math.round(v * 100)}`;
