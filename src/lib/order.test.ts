import { describe, expect, it } from "vitest";
import { addLine, eta, formatTL, menuSections, searchRestaurants, setQty, statusAt, totals, validateMods, type CartLine, type MenuItem, type Restaurant } from "./order";
import { assign, funnel, normalCdf, sampleSize, syntheticEvents, zTest } from "./experiment";
import { contrast } from "./a11y";
import { contrastContract, themes } from "@/theme/tokens";

const item: MenuItem = { id: "b1", name: "Klasik Burger", desc: "", price: 24_000, category: "Burgerler", emoji: "🍔", groups: [{ id: "size", name: "Boy", required: true, options: [{ id: "s", name: "Tekli", price: 0 }, { id: "m", name: "Menü", price: 9_000 }] }, { id: "ex", name: "Ekstra", multi: true, options: [{ id: "ch", name: "Cheddar", price: 2_500 }] }] };
const rest = { deliveryFee: 2_990, freeDeliveryOver: 40_000, minOrder: 20_000 };

describe("sepet", () => {
  it("aynı ürün+seçenek birleşir, farklı seçenek ayrı satır", () => {
    let l = addLine([], item, [item.groups![0].options[1]]);
    l = addLine(l, item, [item.groups![0].options[1]]);
    l = addLine(l, item, [item.groups![0].options[0]]);
    expect(l).toHaveLength(2); expect(l[0].qty).toBe(2); expect(l[0].unit).toBe(33_000); expect(l[1].unit).toBe(24_000);
  });
  it("adet sıfırlanınca satır silinir", () => { const l = addLine([], item, [item.groups![0].options[0]]); expect(setQty(l, l[0].key, 0)).toHaveLength(0); });
  it("zorunlu seçenek doğrulaması", () => { expect(validateMods(item, [])).toEqual(["Boy seçin"]); expect(validateMods(item, [item.groups![0].options[0]])).toEqual([]); });
});
describe("tutarlar", () => {
  const lines: CartLine[] = [{ key: "k", itemId: "b1", name: "x", unit: 15_000, qty: 1, mods: [] }];
  it("min sipariş altı ek ücret + teslimat + servis", () => { const t = totals(lines, rest, { fulfilment: "teslimat" }); expect(t).toMatchObject({ subtotal: 15_000, deliveryFee: 2_990, smallOrderFee: 1_500, serviceFee: 990, total: 20_480, freeDeliveryGap: 25_000 }); });
  it("ücretsiz teslimat eşiği ve gel-al", () => {
    const big = [{ ...lines[0], qty: 3 }];
    expect(totals(big, rest, { fulfilment: "teslimat" })).toMatchObject({ deliveryFee: 0, smallOrderFee: 0, freeDeliveryGap: 0 });
    expect(totals(lines, rest, { fulfilment: "gel-al" })).toMatchObject({ deliveryFee: 0, smallOrderFee: 0 });
  });
  it("promosyon kodları", () => {
    const big = [{ ...lines[0], qty: 2 }]; // ₺300
    expect(totals(big, rest, { fulfilment: "teslimat", promo: "sofra20" })).toMatchObject({ discount: 6_000 });
    expect(totals(big, rest, { fulfilment: "teslimat", promo: "HOSGELDIN" })).toMatchObject({ discount: 7_500 });
    expect(totals(big, rest, { fulfilment: "teslimat", promo: "TESLIMAT" })).toMatchObject({ discount: 2_990, deliveryFee: 2_990 });
    expect(totals(lines, rest, { fulfilment: "teslimat", promo: "SOFRA20" }).promoError).toContain("₺250 üzeri");
    expect(totals(lines, rest, { fulfilment: "teslimat", promo: "XYZ" }).promoError).toBe("Kod geçersiz");
  });
  it("bahşiş toplama eklenir; para biçimi", () => { expect(totals(lines, rest, { fulfilment: "gel-al", tip: 1_000 }).total).toBe(16_990); expect(formatTL(20_480)).toBe("₺204,80"); expect(formatTL(30_000)).toBe("₺300"); });
});
describe("teslimat ve durum", () => {
  it("yoğun saatte +8 dk, mesafe başına 3 dk", () => { expect(eta({ deliveryMin: 20, deliveryMax: 30, distanceKm: 2 }, 13)).toEqual({ min: 34, max: 44 }); expect(eta({ deliveryMin: 20, deliveryMax: 30, distanceKm: 2 }, 16)).toEqual({ min: 26, max: 36 }); });
  it("durum zaman çizgisi", () => { expect(statusAt(0, 30).status).toBe("alindi"); expect(statusAt(300, 30).status).toBe("hazirlaniyor"); expect(statusAt(1200, 30).status).toBe("yolda"); expect(statusAt(1800, 30).status).toBe("teslim"); });
});
describe("keşif", () => {
  const mk = (id: string, p: Partial<Restaurant>): Restaurant => ({ id, name: id, cuisine: "Burger", tags: [], rating: 4, reviews: 10, deliveryMin: 20, deliveryMax: 35, deliveryFee: 1_990, freeDeliveryOver: 50_000, minOrder: 15_000, distanceKm: 1, emoji: "", color: "", menu: [], open: true, ...p });
  const list = [mk("a", { rating: 4.8, distanceKm: 3 }), mk("b", { rating: 4.2, deliveryFee: 0 }), mk("c", { rating: 4.9, open: false }), mk("d", { cuisine: "Pizza", deliveryMax: 25, menu: [{ id: "m", name: "Margherita", desc: "", price: 1, category: "Pizza", emoji: "" }] })];
  it("kapalı restoran sona düşer, filtreler ve menü araması", () => {
    expect(searchRestaurants(list, "", {}).at(-1)!.id).toBe("c");
    expect(searchRestaurants(list, "", { freeDelivery: true }).map((r) => r.id)).toEqual(["b"]);
    expect(searchRestaurants(list, "", { fast: true }).map((r) => r.id)).toEqual(["d"]);
    expect(searchRestaurants(list, "margher", {}).map((r) => r.id)).toEqual(["d"]);
    expect(searchRestaurants(list, "", { sort: "puan" })[0].id).toBe("c");
  });
  it("menü bölümleri: Popüler öne", () => { const s = menuSections([{ ...item, popular: true }, { ...item, id: "x", category: "Tatlı" }]); expect(s.map((x) => x.title)).toEqual(["Popüler", "Burgerler", "Tatlı"]); });
});
describe("deney altyapısı", () => {
  it("atama deterministik ve dengeli", () => {
    expect(assign("u1", "checkout")).toBe(assign("u1", "checkout"));
    const n = 2000; let a = 0; for (let i = 0; i < n; i++) if (assign("user" + i, "checkout") === "A") a++;
    expect(Math.abs(a / n - 0.5)).toBeLessThan(0.05);
  });
  it("huni ve sepet terk oranı", () => {
    const ev = syntheticEvents(2000);
    const A = funnel(ev, "A"), B = funnel(ev, "B");
    expect(A.sessions).toBe(1000); expect(A.abandonRate).toBeGreaterThan(B.abandonRate); expect(A.avgSteps).toBe(9); expect(B.avgSteps).toBe(5);
    expect(A.abandonRate).toBeGreaterThan(0.6); expect(B.abandonRate).toBeLessThan(0.6);
  });
  it("z-testi ve normal CDF", () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 6); expect(normalCdf(1.96)).toBeCloseTo(0.975, 3);
    const r = zTest(320, 620, 590, 640); expect(r.significant).toBe(true); expect(r.p).toBeLessThan(0.001); expect(r.lift).toBeGreaterThan(0.5);
    expect(zTest(50, 100, 52, 100).significant).toBe(false);
  });
  it("örneklem büyüklüğü (p=0.32, +0.10 → ≈ 370)", () => { const n = sampleSize(0.32, 0.1); expect(n).toBeGreaterThan(340); expect(n).toBeLessThan(400); });
});
describe("tasarım belirteçleri — kontrast sözleşmesi", () => {
  for (const name of ["light", "dark"] as const) for (const c of contrastContract) it(`${name}: ${c.note}`, () => { const t = themes[name]; expect(contrast(t[c.fg], t[c.bg], t.bg), `${t[c.fg]}/${t[c.bg]}`).toBeGreaterThanOrEqual(c.min); });
});
