import { useEffect, useState } from "react";
import { Pressable, Text as RNText, View } from "react-native";
import { useRouter } from "expo-router";
import { Badge, Button, Card, Divider, Empty, Header, Input, Progress, Row, Screen, Section, Small, Txt } from "@/components/ui";
import { TotalsTable, LineRow } from "@/components/cart";
import { Icon } from "@/components/Icon";
import { RESTAURANTS } from "@/data/restaurants";
import { formatTL, totals } from "@/lib/order";
import { useStore, useVariant } from "@/store";
import { radius, space, useTheme } from "@/theme";

export default function CartScreen() {
  const { c } = useTheme(); const router = useRouter();
  const cart = useStore((s) => s.cart); const setCart = useStore((s) => s.setCart); const track = useStore((s) => s.track); const v = useVariant(); const variant = () => v;
  const r = RESTAURANTS.find((x) => x.id === cart.restaurantId);
  const [promo, setPromo] = useState(cart.promo);
  useEffect(() => { if (cart.lines.length) track("cart_view"); }, [cart.lines.length > 0]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!r || !cart.lines.length) return <Screen testID="cart-empty"><Header title="Sepet" /><Empty icon="cart" title="Sepetin boş" text="Keşfet'ten bir restoran seç, lezzetler seni bekliyor." /><Button title="Restoranları keşfet" onPress={() => router.push("/(tabs)")} style={{ marginTop: space[4] }} /></Screen>;
  const t = totals(cart.lines, r, { fulfilment: cart.fulfilment, promo: cart.promo || undefined, tip: cart.tip });
  const go = () => { track("checkout_start", { variant: variant() }); router.push(variant() === "A" ? "/odeme/adim1" : "/odeme/tek"); };
  const suggestions = r.menu.filter((m) => !cart.lines.some((l) => l.itemId === m.id) && m.price <= 12_000).slice(0, 3);
  return (
    <Screen testID="cart">
      <Header title="Sepet" subtitle={r.name} right={<Badge label={`${variant() === "A" ? "Klasik" : "Yeni"} ödeme`} tone={variant() === "A" ? "neutral" : "success"} testID="variant-badge" />} />
      {r.deliveryFee > 0 && r.freeDeliveryOver > 0 && (
        <Card tone={t.freeDeliveryGap ? "primarySoft" : "successSoft"} style={{ gap: space[2] }}>
          <Row gap={space[2]}><Icon name="bike" size={18} color={t.freeDeliveryGap ? c.onPrimarySoft : c.onSuccessSoft} /><Txt role="bodyStrong" color={t.freeDeliveryGap ? c.onPrimarySoft : c.onSuccessSoft} testID="free-gap">{t.freeDeliveryGap ? `Ücretsiz teslimat için ${formatTL(t.freeDeliveryGap)} kaldı` : "Teslimat ücretsiz!"}</Txt></Row>
          <Progress value={t.subtotal} max={r.freeDeliveryOver} label="Ücretsiz teslimat ilerlemesi" color={t.freeDeliveryGap ? c.primary : c.success} height={6} />
        </Card>
      )}
      <Section title="Ürünler">
        <Card padded={false} style={{ paddingHorizontal: space[4] }}>{cart.lines.map((l, i) => <View key={l.key}>{i > 0 && <Divider />}<LineRow l={l} /></View>)}</Card>
        <Button title="Ürün ekle" variant="tertiary" icon="plus" size="sm" onPress={() => router.push(`/restoran/${r.id}`)} />
      </Section>
      {suggestions.length > 0 && (
        <Section title="Yanına iyi gider">
          <Row gap={space[2]}>{suggestions.map((m) => <Pressable key={m.id} accessibilityRole="button" accessibilityLabel={`${m.name} ekle, ${formatTL(m.price)}`} onPress={() => router.push({ pathname: "/urun", params: { r: r.id, i: m.id } })} testID={`suggest-${m.id}`} style={{ flex: 1, backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, padding: space[2], alignItems: "center", gap: 4 }}><RNText style={{ fontSize: 28 }}>{m.emoji}</RNText><Small numberOfLines={1} color={c.text}>{m.name}</Small><Small>{formatTL(m.price)}</Small></Pressable>)}</Row>
        </Section>
      )}
      <Section title="Promosyon kodu">
        <Row gap={space[2]}>
          <View style={{ flex: 1 }}><Input placeholder="SOFRA20, HOSGELDIN…" value={promo} onChangeText={(v) => setPromo(v.toUpperCase())} autoCapitalize="characters" error={cart.promo ? t.promoError : undefined} testID="promo-input" /></View>
          <Button title={cart.promo && !t.promoError ? "Kaldır" : "Uygula"} variant="secondary" onPress={() => { if (cart.promo && !t.promoError) { setCart({ promo: "" }); setPromo(""); } else setCart({ promo }); }} testID="promo-apply" />
        </Row>
        {t.promoApplied && <Small color={c.success} testID="promo-ok">✓ {t.promoApplied.desc} uygulandı</Small>}
      </Section>
      <Section title="Özet"><Card><TotalsTable t={t} /></Card></Section>
      {t.smallOrderFee > 0 && <Small style={{ marginTop: space[2] }}>Minimum sipariş {formatTL(r.minOrder)}; altında {formatTL(t.smallOrderFee)} küçük sipariş ücreti uygulanır.</Small>}
      <Button title={`Ödemeye geç · ${formatTL(t.total)}`} size="lg" iconRight="arrow" onPress={go} style={{ marginTop: space[5] }} disabled={!r.open} testID="checkout" />
      {!r.open && <Small color={c.danger} align="center" style={{ marginTop: space[2] }}>Restoran şu an kapalı</Small>}
    </Screen>
  );
}
