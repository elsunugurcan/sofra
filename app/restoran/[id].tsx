import { useEffect, useRef, useState } from "react";
import { ScrollView, Text as RNText, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Badge, Banner, Card, Chip, Divider, H1, IconButton, Row, Small, Txt } from "@/components/ui";
import { CartBar, MenuRow } from "@/components/food";
import { Icon } from "@/components/Icon";
import { RESTAURANTS } from "@/data/restaurants";
import { eta, formatTL, menuSections, subtotal } from "@/lib/order";
import { useStore } from "@/store";
import { radius, space, useTheme } from "@/theme";

export default function RestaurantScreen() {
  const { c } = useTheme(); const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = RESTAURANTS.find((x) => x.id === id);
  const track = useStore((s) => s.track); const fav = useStore((s) => s.favorites.includes(id)); const toggle = useStore((s) => s.toggleFavorite);
  const cart = useStore((s) => s.cart);
  const scroll = useRef<ScrollView>(null); const [active, setActive] = useState(0); const offsets = useRef<number[]>([]);
  useEffect(() => { if (r) track("restaurant_view", { restaurant: r.id }); }, [r?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!r) return <SafeAreaView><Txt>Restoran bulunamadı</Txt></SafeAreaView>;
  const sections = menuSections(r.menu); const e = eta(r, new Date().getHours());
  const gap = cart.restaurantId === r.id ? Math.max(0, r.freeDeliveryOver - subtotal(cart.lines)) : r.freeDeliveryOver;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <ScrollView ref={scroll} stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }} onScroll={(ev) => { const y = ev.nativeEvent.contentOffset.y + 120; const i = offsets.current.findLastIndex((o) => o <= y); if (i >= 0 && i !== active) setActive(i); }} scrollEventThrottle={100}>
        <View>
          <View style={{ height: 170, backgroundColor: r.color, alignItems: "center", justifyContent: "center" }}>
            <RNText style={{ fontSize: 72 }}>{r.emoji}</RNText>
            <View style={{ position: "absolute", left: space[4], top: space[3] }}><IconButton name="left" label="Geri" onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))} tone="surface2" /></View>
            <View style={{ position: "absolute", right: space[4], top: space[3] }}><IconButton name="heart" label={fav ? "Favorilerden çıkar" : "Favorilere ekle"} onPress={() => toggle(r.id)} color={fav ? c.primary : c.text} tone="surface2" testID="fav" /></View>
          </View>
          <View style={{ paddingHorizontal: space[4], paddingTop: space[4], gap: space[3] }}>
            <Row style={{ justifyContent: "space-between" }}><H1 style={{ flex: 1 }}>{r.name}</H1>{!r.open && <Badge label="Şu an kapalı" tone="danger" />}</Row>
            <Row gap={space[3]} style={{ flexWrap: "wrap" }}>
              <Row gap={4}><Icon name="star" size={16} color={c.warning} /><Txt role="bodyStrong" color={c.text}>{r.rating.toFixed(1)}</Txt><Small>({r.reviews})</Small></Row>
              <Row gap={4}><Icon name="clock" size={15} color={c.textMuted} /><Small>{e.min}–{e.max} dk</Small></Row>
              <Row gap={4}><Icon name="bike" size={15} color={c.textMuted} /><Small>{r.deliveryFee ? `${formatTL(r.deliveryFee)} teslimat` : "Ücretsiz teslimat"}</Small></Row>
              <Small>Min. {formatTL(r.minOrder)}</Small>
            </Row>
            {r.freeDeliveryOver > 0 && r.deliveryFee > 0 && (gap > 0 ? <Banner tone="info" icon="bike" text={`${formatTL(gap)} daha ekle, teslimat ücretsiz olsun`} testID="free-delivery-hint" /> : <Banner tone="success" icon="bike" text="Teslimat ücretsiz 🎉" testID="free-delivery-ok" />)}
            {r.promo && <Card tone="primarySoft" padded={false} style={{ padding: space[3] }}><Row gap={space[2]}><Icon name="bolt" size={16} color={c.onPrimarySoft} /><Txt role="bodyStrong" color={c.onPrimarySoft}>{r.promo}</Txt></Row></Card>}
          </View>
        </View>
        <View style={{ backgroundColor: c.bg, paddingVertical: space[2], borderBottomWidth: 1, borderBottomColor: c.border }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space[4], gap: space[2] }}>
            {sections.map((s, i) => <Chip key={s.title} label={s.title} active={i === active} onPress={() => { setActive(i); scroll.current?.scrollTo({ y: (offsets.current[i] ?? 0) - 60, animated: true }); }} testID={`cat-${i}`} />)}
          </ScrollView>
        </View>
        <View style={{ paddingHorizontal: space[4] }}>
          {sections.map((s, i) => (
            <View key={s.title} onLayout={(ev) => { offsets.current[i] = ev.nativeEvent.layout.y + 330; }} style={{ paddingTop: space[4] }} testID={`section-${i}`}>
              <Txt role="h2" color={c.text}>{s.title}</Txt>
              {s.items.map((it, j) => <View key={it.id + i}>{j > 0 && <Divider />}<MenuRow item={it} onPress={() => router.push({ pathname: "/urun", params: { r: r.id, i: it.id } })} testID={`item-${it.id}${i === 0 && s.title === "Popüler" ? "-pop" : ""}`} /></View>)}
            </View>
          ))}
          <View style={{ marginTop: space[6], padding: space[3], borderRadius: radius.md, backgroundColor: c.surface2 }}><Small>Alerjen bilgisi ve içerikler için restorana ulaşın. Fiyatlara KDV dahildir.</Small></View>
        </View>
      </ScrollView>
      <CartBar testID="cart-bar" />
    </SafeAreaView>
  );
}
