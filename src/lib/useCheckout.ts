import { useRouter } from "expo-router";
import { RESTAURANTS, CARDS } from "@/data/restaurants";
import { eta, totals } from "@/lib/order";
import { useStore } from "@/store";

/** İki ödeme varyantının ortak veri ve eylemleri. */
export function useCheckout() {
  const router = useRouter();
  const cart = useStore((s) => s.cart); const setCart = useStore((s) => s.setCart); const addresses = useStore((s) => s.addresses);
  const placeOrder = useStore((s) => s.placeOrder); const track = useStore((s) => s.track);
  const r = RESTAURANTS.find((x) => x.id === cart.restaurantId);
  const t = r ? totals(cart.lines, r, { fulfilment: cart.fulfilment, promo: cart.promo || undefined, tip: cart.tip }) : null;
  const address = addresses.find((a) => a.id === cart.addressId) ?? addresses[0];
  const payment = CARDS.find((p) => p.id === cart.payment) ?? CARDS[0];
  const e = r ? eta(r, new Date().getHours()) : { min: 0, max: 0 };
  const submit = () => {
    if (!r || !t) return;
    const o = placeOrder({ restaurantId: r.id, lines: cart.lines, totals: t, fulfilment: cart.fulfilment, addressId: cart.fulfilment === "teslimat" ? address.id : undefined, payment: payment.label, etaMin: cart.fulfilment === "gel-al" ? Math.max(10, e.min - 10) : e.max });
    router.replace(`/siparis/${o.id}`);
  };
  return { cart, setCart, addresses, address, payment, r, t, eta: e, submit, track, router };
}
