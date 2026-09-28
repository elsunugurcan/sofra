import { useState } from "react";
import { Pressable, Text as RNText, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Banner, Button, Header, Input, Label, Row, Screen, Sheet, Small, Txt } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { RESTAURANTS } from "@/data/restaurants";
import { formatTL, lineUnit, validateMods, type Modifier } from "@/lib/order";
import { useStore } from "@/store";
import { hit, radius, space, useTheme } from "@/theme";

export default function ItemScreen() {
  const { c } = useTheme(); const router = useRouter();
  const { r: rid, i: iid } = useLocalSearchParams<{ r: string; i: string }>();
  const r = RESTAURANTS.find((x) => x.id === rid); const item = r?.menu.find((x) => x.id === iid);
  const addToCart = useStore((s) => s.addToCart); const replaceCart = useStore((s) => s.replaceCart); const cartRest = useStore((s) => s.cart.restaurantId);
  const [mods, setMods] = useState<Modifier[]>([]); const [qty, setQty] = useState(1); const [note, setNote] = useState(""); const [err, setErr] = useState<string[]>([]); const [conflict, setConflict] = useState(false);
  if (!r || !item) return <Screen><Header title="Ürün bulunamadı" back /></Screen>;
  const unit = lineUnit(item, mods);
  const pick = (gid: string, o: Modifier, multi?: boolean) => setMods((m) => { const g = item.groups!.find((x) => x.id === gid)!; const has = m.some((x) => x.id === o.id); if (multi) return has ? m.filter((x) => x.id !== o.id) : [...m, o]; return [...m.filter((x) => !g.options.some((y) => y.id === x.id)), ...(has ? [] : [o])]; });
  const add = () => { const e = validateMods(item, mods); setErr(e); if (e.length) return; const res = addToCart(r.id, item, mods, qty, note.trim() || undefined); if (res === "other-restaurant") { setConflict(true); return; } router.back(); };
  return (
    <Screen testID="item-modal">
      <Header title={item.name} subtitle={r.name} onClose={() => router.back()} />
      <View style={{ height: 150, borderRadius: radius.lg, backgroundColor: c.surface2, alignItems: "center", justifyContent: "center" }}><RNText style={{ fontSize: 80 }}>{item.emoji}</RNText></View>
      <Txt style={{ marginTop: space[3] }}>{item.desc}</Txt>
      {(item.groups ?? []).map((g) => (
        <View key={g.id} style={{ marginTop: space[5], gap: space[2] }} accessibilityRole={g.multi ? undefined : "radiogroup"} accessibilityLabel={g.name}>
          <Row style={{ justifyContent: "space-between" }}><Label>{g.name}</Label><Small color={g.required ? c.primary : c.textMuted}>{g.required ? "Zorunlu" : "İsteğe bağlı"}</Small></Row>
          {err.some((e) => e.startsWith(g.name)) && <Small color={c.danger} testID="mod-error">{g.name} seçmelisiniz</Small>}
          {g.options.map((o) => { const on = mods.some((x) => x.id === o.id); return (
            <Pressable key={o.id} accessibilityRole={g.multi ? "checkbox" : "radio"} accessibilityState={{ checked: on }} accessibilityLabel={`${o.name}${o.price ? `, ${o.price > 0 ? "+" : ""}${formatTL(o.price)}` : ""}`} onPress={() => pick(g.id, o, g.multi)} testID={`opt-${o.id}`} style={{ flexDirection: "row", alignItems: "center", gap: space[3], minHeight: hit.min, paddingVertical: 6 }}>
              <View style={{ width: 22, height: 22, borderRadius: g.multi ? 6 : 11, borderWidth: 2, borderColor: on ? c.primary : c.borderStrong, backgroundColor: on ? c.primary : "transparent", alignItems: "center", justifyContent: "center" }}>{on && <Icon name="check" size={14} color={c.textOnPrimary} stroke={3} />}</View>
              <Txt color={c.text} style={{ flex: 1 }}>{o.name}</Txt>
              {o.price !== 0 && <Small color={o.price > 0 ? c.text2 : c.success}>{o.price > 0 ? "+" : ""}{formatTL(o.price)}</Small>}
            </Pressable>
          ); })}
        </View>
      ))}
      <View style={{ marginTop: space[5] }}><Input label="Not (isteğe bağlı)" placeholder="Örn. soğansız olsun" value={note} onChangeText={setNote} maxLength={80} testID="item-note" /></View>
      <Row style={{ marginTop: space[6], justifyContent: "space-between" }}>
        <Row gap={space[3]} style={{ backgroundColor: c.surface2, borderRadius: radius.full, padding: 4 }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Adet azalt" onPress={() => setQty((q) => Math.max(1, q - 1))} style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" }}><Icon name="minus" /></Pressable>
          <Txt role="h3" color={c.text} testID="qty">{qty}</Txt>
          <Pressable accessibilityRole="button" accessibilityLabel="Adet artır" onPress={() => setQty((q) => Math.min(20, q + 1))} style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" }} testID="qty-plus"><Icon name="plus" /></Pressable>
        </Row>
        <Button title={`Sepete ekle · ${formatTL(unit * qty)}`} size="lg" onPress={add} style={{ flex: 1, marginLeft: space[3] }} testID="add-to-cart" />
      </Row>
      <Sheet open={conflict} onClose={() => setConflict(false)} title="Sepetinde başka restoran var" testID="conflict-sheet">
        <Banner tone="warning" text="Tek siparişte tek restoran olabilir. Sepeti boşaltıp bu ürünle devam edelim mi?" />
        <Button title="Sepeti boşalt ve ekle" variant="destructive" onPress={() => { replaceCart(r.id, item, mods, qty, note.trim() || undefined); setConflict(false); router.back(); }} testID="replace-cart" />
        <Button title="Vazgeç" variant="tertiary" onPress={() => setConflict(false)} />
      </Sheet>
    </Screen>
  );
}
