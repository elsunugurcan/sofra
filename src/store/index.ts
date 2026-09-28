import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addLine, setQty, type Address, type CartLine, type Fulfilment, type MenuItem, type Modifier, type Totals } from "@/lib/order";
import { assign, syntheticEvents, type Event, type EventName, type Variant } from "@/lib/experiment";
import { ADDRESSES, DEMO_USER } from "@/data/restaurants";
import type { FontScale, ThemeName } from "@/theme/tokens";

export type Order = { id: string; restaurantId: string; lines: CartLine[]; totals: Totals; fulfilment: Fulfilment; addressId?: string; payment: string; placedAt: number; etaMin: number; variant: Variant };
export type State = {
  sessionId: string;
  variantOverride: Variant | null;
  cart: { restaurantId: string | null; lines: CartLine[]; promo: string; fulfilment: Fulfilment; addressId: string; payment: string; tip: number; note: string };
  addresses: Address[]; favorites: string[]; orders: Order[]; events: Event[];
  settings: { theme: ThemeName | "system"; fontScale: FontScale };
  variant: () => Variant;
  track: (name: EventName, meta?: Event["meta"]) => void;
  addToCart: (restaurantId: string, item: MenuItem, mods: Modifier[], qty?: number, note?: string) => "ok" | "other-restaurant";
  replaceCart: (restaurantId: string, item: MenuItem, mods: Modifier[], qty?: number, note?: string) => void;
  setLineQty: (key: string, qty: number) => void;
  setCart: (patch: Partial<State["cart"]>) => void;
  clearCart: () => void;
  placeOrder: (o: Omit<Order, "id" | "placedAt" | "variant">) => Order;
  addAddress: (a: Omit<Address, "id">) => Address;
  toggleFavorite: (id: string) => void;
  setVariantOverride: (v: Variant | null) => void;
  loadSynthetic: () => void; clearEvents: () => void;
  setSetting: <K extends keyof State["settings"]>(k: K, v: State["settings"][K]) => void;
  reset: () => void;
};
const uid = () => Math.random().toString(36).slice(2, 10);
const emptyCart = (): State["cart"] => ({ restaurantId: null, lines: [], promo: "", fulfilment: "teslimat", addressId: "ev", payment: "c1", tip: 0, note: "" });
const initial = () => ({ sessionId: "s-" + uid(), variantOverride: null as Variant | null, cart: emptyCart(), addresses: ADDRESSES, favorites: ["napoli"], orders: [] as Order[], events: [] as Event[], settings: { theme: "light" as const, fontScale: "normal" as const } });

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial(),
      variant: () => get().variantOverride ?? assign(DEMO_USER.id, "checkout-v2"),
      track: (name, meta) => set((s) => ({ events: [...s.events, { t: Date.now(), session: s.sessionId, variant: get().variant(), name, meta }] })),
      addToCart: (restaurantId, item, mods, qty = 1, note) => {
        const s = get(); if (s.cart.restaurantId && s.cart.restaurantId !== restaurantId && s.cart.lines.length) return "other-restaurant";
        set({ cart: { ...s.cart, restaurantId, lines: addLine(s.cart.lines, item, mods, qty, note) } }); get().track("add_to_cart", { item: item.id }); return "ok";
      },
      replaceCart: (restaurantId, item, mods, qty = 1, note) => { set({ cart: { ...emptyCart(), restaurantId, lines: addLine([], item, mods, qty, note) } }); get().track("add_to_cart", { item: item.id, replaced: 1 }); },
      setLineQty: (key, qty) => set((s) => { const lines = setQty(s.cart.lines, key, qty); return { cart: { ...s.cart, lines, restaurantId: lines.length ? s.cart.restaurantId : null } }; }),
      setCart: (patch) => set((s) => ({ cart: { ...s.cart, ...patch } })),
      clearCart: () => set({ cart: emptyCart() }),
      placeOrder: (o) => { const order: Order = { ...o, id: "SF" + uid().toUpperCase().slice(0, 6), placedAt: Date.now(), variant: get().variant() }; set((s) => ({ orders: [order, ...s.orders], cart: emptyCart() })); get().track("order_complete", { total: o.totals.total, order: order.id }); return order; },
      addAddress: (a) => { const n = { ...a, id: "adr-" + uid() }; set((s) => ({ addresses: [...s.addresses, n] })); return n; },
      toggleFavorite: (id) => set((s) => ({ favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [...s.favorites, id] })),
      setVariantOverride: (v) => set({ variantOverride: v }),
      loadSynthetic: () => set((s) => ({ events: [...s.events.filter((e) => !e.session.startsWith("syn-")), ...syntheticEvents(1200)] })),
      clearEvents: () => set({ events: [] }),
      setSetting: (k, v) => set((s) => ({ settings: { ...s.settings, [k]: v } })),
      reset: () => set({ ...initial(), sessionId: get().sessionId }),
    }),
    { name: "sofra-v1", storage: createJSONStorage(() => AsyncStorage), partialize: (s) => ({ variantOverride: s.variantOverride, cart: s.cart, addresses: s.addresses, favorites: s.favorites, orders: s.orders, events: s.events, settings: s.settings }) },
  ),
);
/** Varyantı reaktif okur (zorlama değişince yeniden çizer). */
export const useVariant = () => useStore((s) => s.variantOverride ?? assign(DEMO_USER.id, "checkout-v2"));
