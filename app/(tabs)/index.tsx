import { useState } from "react";
import { Pressable, ScrollView, Text as RNText, View } from "react-native";
import { useRouter } from "expo-router";
import { Card, Chip, H1, IconButton, Row, Screen, Section, Small, Txt } from "@/components/ui";
import { RestaurantCard } from "@/components/food";
import { Icon } from "@/components/Icon";
import { CUISINE_EMOJI, CUISINES, RESTAURANTS } from "@/data/restaurants";
import { searchRestaurants } from "@/lib/order";
import { useStore } from "@/store";
import { radius, space, useTheme } from "@/theme";

export default function Discover() {
  const { c } = useTheme(); const router = useRouter();
  const address = useStore((s) => s.addresses.find((a) => a.id === s.cart.addressId) ?? s.addresses[0]); const favorites = useStore((s) => s.favorites);
  const [cuisine, setCuisine] = useState(""); const [filter, setFilter] = useState<"" | "free" | "fast" | "top">("");
  const list = searchRestaurants(RESTAURANTS, "", { cuisine: cuisine || undefined, freeDelivery: filter === "free", fast: filter === "fast", top: filter === "top" });
  const favs = RESTAURANTS.filter((r) => favorites.includes(r.id));
  const hour = new Date().getHours();
  return (
    <Screen padded={false} testID="discover">
      <View style={{ paddingHorizontal: space[4] }}>
        <Row style={{ paddingVertical: space[3], justifyContent: "space-between" }}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Teslimat adresi: ${address.label}, değiştir`} onPress={() => router.push("/adres-ekle")} style={{ flex: 1 }} testID="address-pill">
            <Small>Teslimat adresi</Small>
            <Row gap={4}><Icon name="pin" size={16} color={c.primary} /><Txt role="bodyStrong" color={c.text} numberOfLines={1}>{address.label} · {address.line}</Txt><Icon name="down" size={16} color={c.textMuted} /></Row>
          </Pressable>
          <IconButton name="bell" label="Bildirimler" onPress={() => {}} />
        </Row>
        <H1>{hour < 11 ? "Günaydın, kahvaltı?" : hour < 15 ? "Öğlen ne yesek?" : hour < 18 ? "İkindi atıştırması" : "Akşam yemeği ne olsun?"}</H1>
        <Pressable accessibilityRole="button" accessibilityLabel="Restoran veya yemek ara" onPress={() => router.push("/(tabs)/ara")} testID="search-entry" style={{ marginTop: space[3], flexDirection: "row", alignItems: "center", gap: space[2], height: 48, paddingHorizontal: space[3], borderRadius: radius.md, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}><Icon name="search" size={18} color={c.textMuted} /><Txt color={c.textMuted}>Restoran, mutfak veya yemek ara</Txt></Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space[4], gap: space[3], paddingTop: space[4] }}>
        {CUISINES.map((k) => (
          <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: cuisine === k }} accessibilityLabel={k} onPress={() => setCuisine(cuisine === k ? "" : k)} testID={`cuisine-${k}`} style={{ alignItems: "center", gap: 6, width: 64 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: cuisine === k ? c.primary : c.surface, borderWidth: 1, borderColor: cuisine === k ? c.primary : c.border, alignItems: "center", justifyContent: "center" }}><RNText style={{ fontSize: 26 }}>{CUISINE_EMOJI[k]}</RNText></View>
            <Small color={cuisine === k ? c.primary : c.text2} style={{ fontWeight: "600" }} numberOfLines={1}>{k}</Small>
          </Pressable>
        ))}
      </ScrollView>
      <View style={{ paddingHorizontal: space[4] }}>
        <Row gap={space[2]} style={{ marginTop: space[4] }}>
          <Chip label="Ücretsiz teslimat" icon="bike" active={filter === "free"} onPress={() => setFilter(filter === "free" ? "" : "free")} testID="filter-free" />
          <Chip label="30 dk altı" icon="clock" active={filter === "fast"} onPress={() => setFilter(filter === "fast" ? "" : "fast")} testID="filter-fast" />
          <Chip label="4.5+" icon="star" active={filter === "top"} onPress={() => setFilter(filter === "top" ? "" : "top")} testID="filter-top" />
        </Row>
        {!cuisine && !filter && (
          <Section title="Kampanyalar">
            <Card tone="primarySoft" onPress={() => router.push("/restoran/burgerhane")} accessibilityLabel="Kampanya: ilk siparişe ₺75 indirim, kod HOSGELDIN">
              <Row style={{ justifyContent: "space-between" }}><View style={{ flex: 1 }}><Txt role="h3" color={c.onPrimarySoft}>İlk siparişe ₺75 indirim</Txt><Small color={c.onPrimarySoft}>Ödemede HOSGELDIN kodunu kullan · ₺200 üzeri</Small></View><RNText style={{ fontSize: 40 }}>🎁</RNText></Row>
            </Card>
          </Section>
        )}
        {favs.length > 0 && !cuisine && !filter && <Section title="Favorilerin"><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space[3] }}>{favs.map((r) => <RestaurantCard key={r.id} r={r} compact />)}</ScrollView></Section>}
        <Section title={cuisine || (filter ? "Filtrelenmiş" : "Yakınındakiler")} action={<Small testID="result-count">{list.length} restoran</Small>}>
          <View style={{ gap: space[3] }}>{list.map((r) => <RestaurantCard key={r.id} r={r} testID={`rest-${r.id}`} />)}</View>
        </Section>
      </View>
    </Screen>
  );
}
