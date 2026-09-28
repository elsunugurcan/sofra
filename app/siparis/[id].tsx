import { useEffect, useState } from "react";
import { Text as RNText, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Badge, Button, Card, Divider, H1, Header, Progress, Row, Screen, Section, Small, Txt } from "@/components/ui";
import { MapPreview } from "@/components/food";
import { Icon } from "@/components/Icon";
import { TotalsTable } from "@/components/cart";
import { RESTAURANTS } from "@/data/restaurants";
import { STATUS_LABEL, formatTL, statusAt, type OrderStatus } from "@/lib/order";
import { useStore } from "@/store";
import { space, useTheme } from "@/theme";

const ORDER: OrderStatus[] = ["alindi", "hazirlaniyor", "yolda", "teslim"];
/** Demo: zaman 20× hızlandırılmış (30 dk'lık teslimat ~90 sn'de tamamlanır). */
const SPEED = 20;
export default function OrderTracking() {
  const { c } = useTheme(); const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useStore((s) => s.orders.find((o) => o.id === id)); const addr = useStore((s) => s.addresses.find((a) => a.id === order?.addressId));
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  if (!order) return <Screen><Header title="Sipariş bulunamadı" back /></Screen>;
  const r = RESTAURANTS.find((x) => x.id === order.restaurantId)!;
  const elapsed = ((now - order.placedAt) / 1000) * SPEED; const { status, progress } = statusAt(elapsed, order.etaMin);
  const remaining = Math.max(0, Math.ceil(order.etaMin * (1 - progress)));
  const idx = ORDER.indexOf(status);
  return (
    <Screen testID="order-tracking">
      <Header title={status === "teslim" ? "Afiyet olsun!" : "Siparişin yolda"} subtitle={`#${order.id} · ${r.name}`} right={<Button title="Kapat" variant="tertiary" size="sm" onPress={() => router.replace("/(tabs)/siparisler")} testID="close-tracking" />} />
      <Card style={{ alignItems: "center", gap: space[2] }}>
        <RNText style={{ fontSize: 56 }}>{status === "teslim" ? "🎉" : status === "yolda" ? "🛵" : status === "hazirlaniyor" ? "👩‍🍳" : "🧾"}</RNText>
        <H1 testID="status-title">{STATUS_LABEL[status]}</H1>
        <Small testID="eta-text">{status === "teslim" ? `${order.fulfilment === "gel-al" ? "Teslim alındı" : "Kapına teslim edildi"}` : `Tahmini ${remaining} dk · ${order.fulfilment === "gel-al" ? "gel-al" : "teslimat"}`}</Small>
        <View style={{ alignSelf: "stretch", marginTop: space[2] }}><Progress value={progress} max={1} label="Sipariş ilerlemesi" color={status === "teslim" ? c.success : c.primary} /></View>
        <Small color={c.textMuted}>Demo: zaman {SPEED}× hızlı akar</Small>
      </Card>
      {order.fulfilment === "teslimat" && addr && <View style={{ marginTop: space[3] }}><MapPreview lat={addr.lat} lng={addr.lng} height={120} /></View>}
      <Section title="Zaman çizgisi">
        <Card>
          {ORDER.map((s, i) => (
            <Row key={s} gap={space[3]} style={{ paddingVertical: space[2] }}>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: i <= idx ? (i === idx && s !== "teslim" ? c.primary : c.success) : c.surface2, alignItems: "center", justifyContent: "center" }}>{i < idx || s === status && s === "teslim" ? <Icon name="check" size={14} color={c.textOnPrimary} stroke={3} /> : i === idx ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.textOnPrimary }} /> : null}</View>
              <Txt role={i === idx ? "bodyStrong" : "body"} color={i <= idx ? c.text : c.textMuted} style={{ flex: 1 }}>{STATUS_LABEL[s]}</Txt>
              {i === idx && s !== "teslim" && <Badge label="Şimdi" />}
            </Row>
          ))}
        </Card>
      </Section>
      <Section title="Sipariş">
        <Card>
          {order.lines.map((l) => <Row key={l.key} style={{ justifyContent: "space-between", paddingVertical: 3 }}><Small numberOfLines={1} style={{ flex: 1 }}>{l.qty}× {l.name}{l.mods.length ? ` (${l.mods.map((m) => m.name).join(", ")})` : ""}</Small><Small>{formatTL(l.unit * l.qty)}</Small></Row>)}
          <Divider />
          <TotalsTable t={order.totals} compact />
          <Divider />
          <Row style={{ justifyContent: "space-between", paddingTop: space[2] }}><Small>Ödeme</Small><Small color={c.text}>{order.payment}</Small></Row>
        </Card>
      </Section>
      <View style={{ marginTop: space[4], gap: space[2] }}>
        <Button title="Kuryeyi ara" variant="secondary" icon="phone" onPress={() => {}} disabled={status !== "yolda"} />
        <Button title="Yardım al" variant="tertiary" onPress={() => {}} />
      </View>
    </Screen>
  );
}
