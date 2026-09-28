import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { Badge, Button, Card, Chip, Divider, Header, Input, ListItem, Row, Screen, Section, Segmented, Small, Txt } from "@/components/ui";
import { MapPreview } from "@/components/food";
import { Icon, type IconName } from "@/components/Icon";
import { TotalsTable } from "@/components/cart";
import { CARDS } from "@/data/restaurants";
import { formatTL } from "@/lib/order";
import { useCheckout } from "@/lib/useCheckout";
import { hit, radius, space, useTheme } from "@/theme";

const TIPS = [0, 1_000, 2_000, 3_000];
/** Varyant B — tek sayfa ödeme: adres haritadan, ücretler baştan görünür, tek onay. */
export default function SinglePageCheckout() {
  const { c } = useTheme(); const { cart, setCart, addresses, address, r, t, eta, submit, track, router } = useCheckout();
  const [busy, setBusy] = useState(false); const [pickAddr, setPickAddr] = useState(false);
  useEffect(() => { track("checkout_step", { step: 1, variant: "B" }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!r || !t) return <Screen><Header title="Sepet boş" back /></Screen>;
  const place = () => { setBusy(true); setTimeout(submit, 700); };
  return (
    <Screen testID="checkout-b">
      <Header title="Ödeme" subtitle={`${r.name} · tek adım`} back right={<Badge label="Yeni akış" tone="success" />} />
      <Segmented label="Teslimat türü" value={cart.fulfilment} onChange={(v) => setCart({ fulfilment: v })} options={[{ value: "teslimat", label: `Teslimat · ${eta.min}–${eta.max} dk` }, { value: "gel-al", label: `Gel-al · ${Math.max(10, eta.min - 10)} dk` }]} />

      {cart.fulfilment === "teslimat" && (
        <Section title="Teslimat adresi">
          <Card padded={false}>
            <MapPreview lat={address.lat} lng={address.lng} testID="map" />
            <View style={{ padding: space[3] }}>
              <ListItem title={address.label} subtitle={address.line + (address.note ? ` · ${address.note}` : "")} left={<Icon name="pin" color={c.primary} />} right={<Button title="Değiştir" variant="tertiary" size="sm" onPress={() => setPickAddr((v) => !v)} testID="change-address" />} />
              {pickAddr && <View style={{ gap: space[2], marginTop: space[2] }}>{addresses.map((a) => <Chip key={a.id} label={`${a.label} · ${a.line}`} icon="pin" active={a.id === address.id} onPress={() => { setCart({ addressId: a.id }); setPickAddr(false); }} testID={`addr-${a.id}`} />)}<Button title="Haritadan yeni adres" variant="secondary" size="sm" icon="map" onPress={() => router.push("/adres-ekle")} testID="new-address" /></View>}
            </View>
          </Card>
        </Section>
      )}
      {cart.fulfilment === "gel-al" && <Section title="Gel-al noktası"><Card><ListItem title={r.name} subtitle={`${r.distanceKm} km · hazır olunca bildirim gelir`} left={<Icon name="pin" color={c.primary} />} /></Card></Section>}

      <Section title="Ödeme yöntemi">
        <Card padded={false} style={{ paddingHorizontal: space[4] }} accessibilityLabel="Ödeme yöntemi">
          {CARDS.map((p, i) => { const on = cart.payment === p.id; return (
            <View key={p.id}>{i > 0 && <Divider />}
              <Pressable accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={p.label} onPress={() => setCart({ payment: p.id })} testID={`pay-${p.id}`} style={{ flexDirection: "row", alignItems: "center", gap: space[3], minHeight: hit.comfortable + 8 }}>
                <Icon name={p.icon as IconName} color={c.text2} /><Txt color={c.text} style={{ flex: 1 }}>{p.label}</Txt>
                <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: on ? c.primary : c.borderStrong, alignItems: "center", justifyContent: "center" }}>{on && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: c.primary }} />}</View>
              </Pressable>
            </View>
          ); })}
        </Card>
      </Section>

      {cart.fulfilment === "teslimat" && (
        <Section title="Kurye bahşişi">
          <Row gap={space[2]}>{TIPS.map((v) => <Chip key={v} label={v ? formatTL(v) : "Yok"} active={cart.tip === v} onPress={() => setCart({ tip: v })} testID={`tip-${v}`} />)}</Row>
        </Section>
      )}
      <Section title="Sipariş notu"><Input placeholder="Kuryeye not (örn. kapıya bırakın)" value={cart.note} onChangeText={(v) => setCart({ note: v })} maxLength={80} testID="order-note" /></Section>

      <Section title={`Özet · ${cart.lines.reduce((s, l) => s + l.qty, 0)} ürün`}>
        <Card>
          {cart.lines.map((l) => <Row key={l.key} style={{ justifyContent: "space-between", paddingVertical: 3 }}><Small numberOfLines={1} style={{ flex: 1 }}>{l.qty}× {l.name}</Small><Small>{formatTL(l.unit * l.qty)}</Small></Row>)}
          <Divider />
          <TotalsTable t={t} compact />
        </Card>
      </Section>
      <View style={{ marginTop: space[5], gap: space[2] }}>
        <Button title={`Siparişi ver · ${formatTL(t.total)}`} size="lg" icon="check" onPress={place} loading={busy} testID="place-order" />
        <Small align="center">Siparişi vererek <Txt role="small" color={c.primary}>Kullanım Koşulları</Txt>'nı kabul edersin. Ödeme, restoran onaylayınca çekilir.</Small>
      </View>
      <View style={{ height: radius.xl }} />
    </Screen>
  );
}
