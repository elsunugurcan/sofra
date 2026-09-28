import { Pressable, View } from "react-native";
import { Divider, Row, Small, Txt } from "./ui";
import { Icon } from "./Icon";
import { formatTL, totals, type CartLine } from "@/lib/order";
import { useStore } from "@/store";
import { radius, space, useTheme } from "@/theme";

export function TotalsTable({ t, compact }: { t: ReturnType<typeof totals>; compact?: boolean }) {
  const { c } = useTheme();
  const L = ({ k, v, tone, testID }: { k: string; v: string; tone?: string; testID?: string }) => <Row style={{ justifyContent: "space-between", paddingVertical: compact ? 3 : 6 }}><Small color={tone}>{k}</Small><Small color={tone ?? c.text} testID={testID}>{v}</Small></Row>;
  return (
    <View>
      <L k="Ara toplam" v={formatTL(t.subtotal)} testID="t-subtotal" />
      <L k="Teslimat" v={t.deliveryFee ? formatTL(t.deliveryFee) : "Ücretsiz"} tone={t.deliveryFee ? undefined : c.success} testID="t-delivery" />
      {t.smallOrderFee > 0 && <L k="Küçük sipariş ücreti" v={formatTL(t.smallOrderFee)} tone={c.warning} testID="t-small" />}
      <L k="Servis ücreti" v={formatTL(t.serviceFee)} />
      {t.discount > 0 && <L k={`İndirim (${t.promoApplied?.code})`} v={"−" + formatTL(t.discount)} tone={c.success} testID="t-discount" />}
      {t.tip > 0 && <L k="Kurye bahşişi" v={formatTL(t.tip)} />}
      <Divider />
      <Row style={{ justifyContent: "space-between", paddingTop: space[2] }}><Txt role="bodyStrong" color={c.text}>Toplam</Txt><Txt role="h3" color={c.text} testID="t-total">{formatTL(t.total)}</Txt></Row>
    </View>
  );
}
export function LineRow({ l }: { l: CartLine }) {
  const { c } = useTheme(); const setQty = useStore((s) => s.setLineQty);
  return (
    <Row style={{ paddingVertical: space[2] }} gap={space[3]}>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt role="bodyStrong" color={c.text}>{l.name}</Txt>
        {l.mods.length > 0 && <Small numberOfLines={2}>{l.mods.map((m) => m.name).join(", ")}</Small>}
        {l.note && <Small color={c.text2}>“{l.note}”</Small>}
        <Small color={c.text}>{formatTL(l.unit * l.qty)}</Small>
      </View>
      <Row gap={0} style={{ backgroundColor: c.surface2, borderRadius: radius.full }}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${l.name} azalt`} onPress={() => setQty(l.key, l.qty - 1)} testID={`dec-${l.itemId}`} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}><Icon name={l.qty === 1 ? "trash" : "minus"} size={16} color={l.qty === 1 ? c.danger : c.text} /></Pressable>
        <Txt role="bodyStrong" color={c.text} testID={`qty-${l.itemId}`} style={{ minWidth: 20, textAlign: "center" }}>{l.qty}</Txt>
        <Pressable accessibilityRole="button" accessibilityLabel={`${l.name} artır`} onPress={() => setQty(l.key, l.qty + 1)} testID={`inc-${l.itemId}`} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}><Icon name="plus" size={16} /></Pressable>
      </Row>
    </Row>
  );
}

