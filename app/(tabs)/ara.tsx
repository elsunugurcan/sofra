import { useState } from "react";
import { View } from "react-native";
import { Chip, Empty, Header, Input, Row, Screen, Segmented, Small } from "@/components/ui";
import { RestaurantCard } from "@/components/food";
import { Icon } from "@/components/Icon";
import { RESTAURANTS } from "@/data/restaurants";
import { searchRestaurants } from "@/lib/order";
import { space, useTheme } from "@/theme";

const RECENT = ["burger", "lahmacun", "vegan", "ramen"];
export default function Search() {
  const { c } = useTheme();
  const [q, setQ] = useState(""); const [sort, setSort] = useState<"onerilen" | "puan" | "sure" | "ucret">("onerilen");
  const list = searchRestaurants(RESTAURANTS, q, { sort });
  return (
    <Screen testID="search">
      <Header title="Ara" />
      <Input placeholder="Restoran, mutfak veya yemek" value={q} onChangeText={setQ} autoFocus right={<Icon name="search" size={18} color={c.textMuted} />} testID="search-input" />
      {!q ? (
        <View style={{ gap: space[3], marginTop: space[4] }}>
          <Small>Son aramalar</Small>
          <Row gap={space[2]} style={{ flexWrap: "wrap" }}>{RECENT.map((r) => <Chip key={r} label={r} icon="clock" onPress={() => setQ(r)} testID={`recent-${r}`} />)}</Row>
        </View>
      ) : (
        <View style={{ marginTop: space[3], gap: space[3] }}>
          <Segmented label="Sırala" value={sort} onChange={setSort} options={[{ value: "onerilen", label: "Önerilen" }, { value: "puan", label: "Puan" }, { value: "sure", label: "Süre" }, { value: "ucret", label: "Ücret" }]} />
          <Small testID="search-count">{list.length} sonuç · “{q}”</Small>
          {list.length === 0 && <Empty icon="search" title="Sonuç yok" text="Başka bir kelime dene: pizza, kebap, tatlı…" />}
          {list.map((r) => <RestaurantCard key={r.id} r={r} testID={`result-${r.id}`} />)}
        </View>
      )}
    </Screen>
  );
}
