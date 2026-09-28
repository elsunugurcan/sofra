/** Sipariş alan mantığı — saf fonksiyonlar, tutarlar kuruş cinsinden. */
export type Modifier = { id: string; name: string; price: number };
export type ModifierGroup = { id: string; name: string; required?: boolean; multi?: boolean; options: Modifier[] };
export type MenuItem = { id: string; name: string; desc: string; price: number; category: string; popular?: boolean; veg?: boolean; spicy?: boolean; groups?: ModifierGroup[]; emoji: string };
export type Restaurant = { id: string; name: string; cuisine: string; tags: string[]; rating: number; reviews: number; deliveryMin: number; deliveryMax: number; deliveryFee: number; freeDeliveryOver: number; minOrder: number; distanceKm: number; promo?: string; emoji: string; color: string; menu: MenuItem[]; open: boolean };
export type CartLine = { key: string; itemId: string; name: string; unit: number; qty: number; mods: Modifier[]; note?: string };
export type Promo = { code: string; kind: "percent" | "fixed" | "freeDelivery"; value: number; minSubtotal: number; desc: string };
export type Address = { id: string; label: string; line: string; lat: number; lng: number; note?: string };

export const PROMOS: Promo[] = [
  { code: "SOFRA20", kind: "percent", value: 20, minSubtotal: 25_000, desc: "₺250 üzeri %20 indirim" },
  { code: "HOSGELDIN", kind: "fixed", value: 7_500, minSubtotal: 20_000, desc: "İlk siparişe ₺75" },
  { code: "TESLIMAT", kind: "freeDelivery", value: 0, minSubtotal: 0, desc: "Ücretsiz teslimat" },
];
export const SMALL_ORDER_FEE = 1_500; // min sipariş altı ek ücret
export const SERVICE_FEE = 990;

export const formatTL = (kurus: number) => { const neg = kurus < 0; const a = Math.abs(kurus); const l = Math.floor(a / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); const k = a % 100; return `${neg ? "−" : ""}₺${l}${k ? "," + String(k).padStart(2, "0") : ""}`; };

export function lineKey(itemId: string, mods: Modifier[], note?: string) { return itemId + "|" + mods.map((m) => m.id).sort().join(",") + (note ? "|" + note : ""); }
export const lineUnit = (item: MenuItem, mods: Modifier[]) => item.price + mods.reduce((s, m) => s + m.price, 0);
export function addLine(lines: CartLine[], item: MenuItem, mods: Modifier[], qty = 1, note?: string): CartLine[] {
  const key = lineKey(item.id, mods, note); const unit = lineUnit(item, mods);
  const i = lines.findIndex((l) => l.key === key);
  if (i >= 0) return lines.map((l, j) => (j === i ? { ...l, qty: l.qty + qty } : l));
  return [...lines, { key, itemId: item.id, name: item.name, unit, qty, mods, note }];
}
export const setQty = (lines: CartLine[], key: string, qty: number) => (qty <= 0 ? lines.filter((l) => l.key !== key) : lines.map((l) => (l.key === key ? { ...l, qty } : l)));
export const subtotal = (lines: CartLine[]) => lines.reduce((s, l) => s + l.unit * l.qty, 0);
export const itemCount = (lines: CartLine[]) => lines.reduce((s, l) => s + l.qty, 0);
/** Zorunlu seçenek grupları eksikse hata listesi. */
export function validateMods(item: MenuItem, mods: Modifier[]): string[] {
  return (item.groups ?? []).filter((g) => g.required && !g.options.some((o) => mods.some((m) => m.id === o.id))).map((g) => `${g.name} seçin`);
}

export type Fulfilment = "teslimat" | "gel-al";
export type Totals = { subtotal: number; deliveryFee: number; smallOrderFee: number; serviceFee: number; discount: number; tip: number; total: number; freeDeliveryGap: number; promoError?: string; promoApplied?: Promo };
export function totals(lines: CartLine[], r: Pick<Restaurant, "deliveryFee" | "freeDeliveryOver" | "minOrder">, opts: { fulfilment: Fulfilment; promo?: string; tip?: number } ): Totals {
  const sub = subtotal(lines);
  const delivery = opts.fulfilment === "gel-al" ? 0 : sub >= r.freeDeliveryOver ? 0 : r.deliveryFee;
  const small = sub > 0 && sub < r.minOrder && opts.fulfilment === "teslimat" ? SMALL_ORDER_FEE : 0;
  const service = sub > 0 ? SERVICE_FEE : 0;
  let discount = 0, promoError: string | undefined, promoApplied: Promo | undefined;
  if (opts.promo) {
    const code = opts.promo.trim().toUpperCase(); const p = PROMOS.find((x) => x.code === code);
    if (!p) promoError = "Kod geçersiz";
    else if (sub < p.minSubtotal) promoError = `Bu kod ${formatTL(p.minSubtotal)} üzeri geçerli`;
    else { promoApplied = p; discount = p.kind === "percent" ? Math.round((sub * p.value) / 100) : p.kind === "fixed" ? Math.min(p.value, sub) : delivery; }
  }
  const tip = opts.tip ?? 0;
  const total = Math.max(0, sub + delivery + small + service - discount + tip);
  return { subtotal: sub, deliveryFee: delivery, smallOrderFee: small, serviceFee: service, discount, tip, total, freeDeliveryGap: Math.max(0, r.freeDeliveryOver - sub), promoError, promoApplied };
}
/** Tahmini teslimat dakikası: hazırlık + mesafe + yoğunluk. */
export function eta(r: Pick<Restaurant, "deliveryMin" | "deliveryMax" | "distanceKm">, hour: number): { min: number; max: number } {
  const rush = (hour >= 12 && hour < 14) || (hour >= 19 && hour < 21) ? 8 : 0;
  const dist = Math.round(r.distanceKm * 3);
  return { min: r.deliveryMin + dist + rush, max: r.deliveryMax + dist + rush };
}
export type OrderStatus = "alindi" | "hazirlaniyor" | "yolda" | "teslim";
export const STATUS_LABEL: Record<OrderStatus, string> = { alindi: "Sipariş alındı", hazirlaniyor: "Hazırlanıyor", yolda: "Kurye yolda", teslim: "Teslim edildi" };
/** Sipariş anından itibaren geçen saniyeye göre durum (demo hızlandırılmış: her aşama ~40 sn). */
export function statusAt(elapsedSec: number, totalMin: number): { status: OrderStatus; progress: number } {
  const total = totalMin * 60; const p = Math.min(1, elapsedSec / total);
  const status: OrderStatus = p >= 1 ? "teslim" : p >= 0.6 ? "yolda" : p >= 0.15 ? "hazirlaniyor" : "alindi";
  return { status, progress: p };
}
/** Restoran sıralama: açık > puan + yakınlık + ücretsiz teslimat; arama metni ve filtreler. */
export function searchRestaurants(list: Restaurant[], q: string, f: { cuisine?: string; freeDelivery?: boolean; fast?: boolean; top?: boolean; sort?: "onerilen" | "puan" | "sure" | "ucret" }): Restaurant[] {
  const t = q.trim().toLocaleLowerCase("tr-TR");
  const hit = (r: Restaurant) => !t || r.name.toLocaleLowerCase("tr-TR").includes(t) || r.cuisine.toLocaleLowerCase("tr-TR").includes(t) || r.tags.some((x) => x.toLocaleLowerCase("tr-TR").includes(t)) || r.menu.some((m) => m.name.toLocaleLowerCase("tr-TR").includes(t));
  const out = list.filter((r) => hit(r) && (!f.cuisine || r.cuisine === f.cuisine) && (!f.freeDelivery || r.deliveryFee === 0 || r.freeDeliveryOver <= 20_000) && (!f.fast || r.deliveryMax <= 30) && (!f.top || r.rating >= 4.5));
  const score = (r: Restaurant) => (r.open ? 0 : -100) + r.rating * 10 - r.distanceKm * 2 + (r.deliveryFee === 0 ? 5 : 0) + (r.promo ? 3 : 0);
  const cmp: Record<string, (a: Restaurant, b: Restaurant) => number> = { onerilen: (a, b) => score(b) - score(a), puan: (a, b) => b.rating - a.rating, sure: (a, b) => a.deliveryMax - b.deliveryMax, ucret: (a, b) => a.deliveryFee - b.deliveryFee };
  return out.sort(cmp[f.sort ?? "onerilen"]);
}
/** Menü kategorilerini akıllı sırala: Popüler öne, sonra menü sırası. */
export function menuSections(menu: MenuItem[]): { title: string; items: MenuItem[] }[] {
  const pop = menu.filter((m) => m.popular);
  const cats = [...new Set(menu.map((m) => m.category))];
  return [...(pop.length ? [{ title: "Popüler", items: pop }] : []), ...cats.map((c) => ({ title: c, items: menu.filter((m) => m.category === c) }))];
}
