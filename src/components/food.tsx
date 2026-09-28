import { Pressable, Text as RNText, View } from "react-native";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";
import { useRouter } from "expo-router";
import { radius, space, useTheme } from "@/theme";
import { Badge, Button, Row, Small, Txt } from "./ui";
import { Icon } from "./Icon";
import { eta, formatTL, itemCount, subtotal, type MenuItem, type Restaurant } from "@/lib/order";
import { useStore } from "@/store";

/** Restoran kartı — teslimat ücreti ve süre kartın üzerinde (UX kararı: ücret sürprizi yok). */
export function RestaurantCard({ r, compact, testID }: { r: Restaurant; compact?: boolean; testID?: string }) {
  const { c } = useTheme(); const router = useRouter(); const fav = useStore((s) => s.favorites.includes(r.id)); const toggle = useStore((s) => s.toggleFavorite);
  const e = eta(r, new Date().getHours());
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={`${r.name}, ${r.cuisine}, puan ${r.rating}, teslimat ${r.deliveryFee ? formatTL(r.deliveryFee) : "ücretsiz"}, ${e.min}-${e.max} dakika${r.open ? "" : ", kapalı"}`} onPress={() => router.push(`/restoran/${r.id}`)} style={({ pressed }) => [{ width: compact ? 250 : undefined, backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.border, overflow: "hidden", opacity: pressed ? 0.85 : r.open ? 1 : 0.6 }]}>
      <View style={{ height: compact ? 100 : 130, backgroundColor: r.color, alignItems: "center", justifyContent: "center" }}>
        <RNText style={{ fontSize: compact ? 44 : 60 }}>{r.emoji}</RNText>
        {r.promo && <View style={{ position: "absolute", left: space[3], top: space[3], backgroundColor: c.bgElevated, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.xs }}><Small color={c.primary} style={{ fontWeight: "700" }}>{r.promo}</Small></View>}
        {!r.open && <View style={{ position: "absolute", right: space[3], top: space[3] }}><Badge label="Kapalı" tone="neutral" /></View>}
        <Pressable accessibilityRole="button" accessibilityLabel={fav ? `${r.name} favorilerden çıkar` : `${r.name} favorilere ekle`} onPress={() => toggle(r.id)} hitSlop={8} style={{ position: "absolute", right: space[3], bottom: space[3], width: 36, height: 36, borderRadius: 18, backgroundColor: c.bgElevated, alignItems: "center", justifyContent: "center" }}><Icon name="heart" size={18} color={fav ? c.primary : c.textMuted} /></Pressable>
      </View>
      <View style={{ padding: space[3], gap: 6 }}>
        <Row style={{ justifyContent: "space-between" }}><Txt role="h3" color={c.text} numberOfLines={1} style={{ flex: 1 }}>{r.name}</Txt><Row gap={4}><Icon name="star" size={14} color={c.warning} /><Txt role="bodyStrong" color={c.text}>{r.rating.toFixed(1)}</Txt><Small>({r.reviews > 999 ? (r.reviews / 1000).toFixed(1) + "b" : r.reviews})</Small></Row></Row>
        <Row gap={space[2]} style={{ flexWrap: "wrap" }}>
          <Small>{r.cuisine} · {r.distanceKm} km</Small>
          <Small>·</Small>
          <Row gap={4}><Icon name="clock" size={13} color={c.textMuted} /><Small>{e.min}–{e.max} dk</Small></Row>
          <Small>·</Small>
          <Row gap={4}><Icon name="bike" size={14} color={r.deliveryFee ? c.textMuted : c.success} /><Small color={r.deliveryFee ? c.textMuted : c.success} style={r.deliveryFee ? undefined : { fontWeight: "700" }}>{r.deliveryFee ? formatTL(r.deliveryFee) : "Ücretsiz"}</Small></Row>
        </Row>
      </View>
    </Pressable>
  );
}
export function MenuRow({ item, onPress, testID }: { item: MenuItem; onPress: () => void; testID?: string }) {
  const { c } = useTheme();
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={`${item.name}, ${formatTL(item.price)}`} onPress={onPress} style={({ pressed }) => [{ flexDirection: "row", gap: space[3], paddingVertical: space[3], opacity: pressed ? 0.7 : 1 }]}>
      <View style={{ flex: 1, gap: 4 }}>
        <Row gap={6}><Txt role="bodyStrong" color={c.text}>{item.name}</Txt>{item.veg && <Icon name="leaf" size={14} color={c.success} />}{item.spicy && <Icon name="flame" size={14} color={c.primary} />}</Row>
        <Small numberOfLines={2}>{item.desc}</Small>
        <Row gap={space[2]}><Txt role="bodyStrong" color={c.text}>{formatTL(item.price)}</Txt>{item.popular && <Badge label="Popüler" tone="warning" />}</Row>
      </View>
      <View style={{ width: 76, height: 76, borderRadius: radius.md, backgroundColor: c.surface2, alignItems: "center", justifyContent: "center" }}><RNText style={{ fontSize: 36 }}>{item.emoji}</RNText><View style={{ position: "absolute", right: -6, bottom: -6, width: 28, height: 28, borderRadius: 14, backgroundColor: c.primary, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: c.surface }}><Icon name="plus" size={14} color={c.textOnPrimary} stroke={3} /></View></View>
    </Pressable>
  );
}
/** Sepet çubuğu — restoran/menü ekranında sabit alt bar. */
export function CartBar({ testID }: { testID?: string }) {
  const { c } = useTheme(); const router = useRouter(); const lines = useStore((s) => s.cart.lines);
  if (!lines.length) return null;
  return (
    <View style={{ position: "absolute", left: space[4], right: space[4], bottom: space[4] }}>
      <Button testID={testID} title={`Sepeti gör · ${itemCount(lines)} ürün · ${formatTL(subtotal(lines))}`} size="lg" icon="cart" onPress={() => router.push("/(tabs)/sepet")} />
    </View>
  );
}
/** Basit şematik harita — adres seçiminde konum önizlemesi (gerçek harita SDK'sı yerine SVG). */
export function MapPreview({ lat, lng, height = 140, onPick, testID }: { lat: number; lng: number; height?: number; onPick?: (dx: number, dy: number) => void; testID?: string }) {
  const { c, name } = useTheme(); const w = 340;
  const roads = name === "dark" ? "rgba(255,255,255,0.14)" : "#e8dbd8", block = name === "dark" ? "#2b1c1a" : "#f4ecea", water = name === "dark" ? "#1c2b3a" : "#dbeafe";
  const px = ((lng * 1000) % 100) / 100 * w * 0.6 + w * 0.2, py = ((lat * 1000) % 100) / 100 * height * 0.5 + height * 0.25;
  return (
    <Pressable testID={testID} accessibilityRole={onPick ? "button" : undefined} accessibilityLabel={onPick ? "Haritadan konum seç" : "Harita önizlemesi"} onPress={(e) => { const ne = e.nativeEvent as { locationX?: number; locationY?: number; offsetX?: number; offsetY?: number }; const x = ne.locationX ?? ne.offsetX ?? w / 2, y = ne.locationY ?? ne.offsetY ?? height / 2; onPick?.(x / w - 0.5, y / height - 0.5); }} style={{ height, borderRadius: radius.md, overflow: "hidden", backgroundColor: block }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
        <Rect x={w - 90} y={0} width={90} height={height} fill={water} />
        {[0.2, 0.45, 0.7].map((f) => <Line key={f} x1={0} y1={height * f} x2={w} y2={height * f} stroke={roads} strokeWidth={8} />)}
        {[0.15, 0.4, 0.62].map((f) => <Line key={f} x1={w * f} y1={0} x2={w * f + 20} y2={height} stroke={roads} strokeWidth={6} />)}
        <Path d={`M0 ${height * 0.85} Q ${w * 0.4} ${height * 0.6} ${w} ${height * 0.9}`} stroke={c.warning} strokeWidth={4} fill="none" />
        <Circle cx={px} cy={py} r={18} fill={c.primary} opacity={0.2} />
        <Circle cx={px} cy={py} r={7} fill={c.primary} stroke={c.bgElevated} strokeWidth={3} />
      </Svg>
    </Pressable>
  );
}
