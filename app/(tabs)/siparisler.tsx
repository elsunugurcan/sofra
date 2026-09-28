import { Text as RNText, View } from "react-native";
import { useRouter } from "expo-router";
import { Badge, Button, Card, Empty, Header, ListItem, Row, Screen, Small } from "@/components/ui";
import { RESTAURANTS } from "@/data/restaurants";
import { STATUS_LABEL, formatTL, statusAt } from "@/lib/order";
import { useStore } from "@/store";
import { radius, space, useTheme } from "@/theme";

export default function Orders() {
  const { c } = useTheme(); const router = useRouter(); const orders = useStore((s) => s.orders); const replaceCart = useStore((s) => s.replaceCart);
  return (
    <Screen testID="orders">
      <Header title="Siparişlerim" subtitle={`${orders.length} sipariş`} />
      {orders.length === 0 && <Empty icon="clock" title="Henüz sipariş yok" text="İlk siparişinde HOSGELDIN koduyla ₺75 indirim seni bekliyor." />}
      <View style={{ gap: space[3] }}>
        {orders.map((o) => {
          const r = RESTAURANTS.find((x) => x.id === o.restaurantId)!; const { status } = statusAt(((Date.now() - o.placedAt) / 1000) * 20, o.etaMin);
          return (
            <Card key={o.id} padded={false} style={{ padding: space[3], gap: space[2] }} testID={`order-${o.id}`}>
              <ListItem title={r.name} subtitle={`${new Date(o.placedAt).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · ${o.lines.reduce((s, l) => s + l.qty, 0)} ürün · ${formatTL(o.totals.total)}`} left={<View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: r.color, alignItems: "center", justifyContent: "center" }}><RNText style={{ fontSize: 22 }}>{r.emoji}</RNText></View>} right={<Badge label={STATUS_LABEL[status]} tone={status === "teslim" ? "success" : "primary"} />} onPress={() => router.push(`/siparis/${o.id}`)} accessibilityLabel={`${r.name} siparişi, ${STATUS_LABEL[status]}`} />
              <Small numberOfLines={1}>{o.lines.map((l) => `${l.qty}× ${l.name}`).join(", ")}</Small>
              <Row gap={space[2]}>
                <Button title="Takip et" size="sm" variant="secondary" onPress={() => router.push(`/siparis/${o.id}`)} />
                <Button title="Tekrar sipariş ver" size="sm" variant="tertiary" icon="refresh" onPress={() => { const first = o.lines[0]; const item = r.menu.find((m) => m.id === first.itemId)!; replaceCart(r.id, item, first.mods, first.qty, first.note); o.lines.slice(1).forEach((l) => useStore.getState().addToCart(r.id, r.menu.find((m) => m.id === l.itemId)!, l.mods, l.qty, l.note)); router.push("/(tabs)/sepet"); }} testID={`reorder-${o.id}`} />
              </Row>
              <Small color={c.textMuted}>{o.variant === "A" ? "Klasik ödeme" : "Yeni ödeme"} akışı ile verildi</Small>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}
