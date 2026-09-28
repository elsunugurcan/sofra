import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Header, Input, Screen, Small } from "@/components/ui";
import { MapPreview } from "@/components/food";
import { useStore } from "@/store";
import { space } from "@/theme";

/** Haritadan adres seçimi — konumu dokunarak ayarla, açık adres otomatik önerilir. */
export default function AddAddress() {
  const router = useRouter(); const addAddress = useStore((s) => s.addAddress); const setCart = useStore((s) => s.setCart);
  const [pos, setPos] = useState({ lat: 40.99, lng: 29.03 }); const [label, setLabel] = useState(""); const [line, setLine] = useState("Caferağa Mah. Moda Cad. 45, Kadıköy"); const [note, setNote] = useState(""); const [moved, setMoved] = useState(false);
  const save = () => { const a = addAddress({ label: label.trim() || "Yeni adres", line: line.trim(), lat: pos.lat, lng: pos.lng, note: note.trim() || undefined }); setCart({ addressId: a.id }); router.back(); };
  return (
    <Screen testID="add-address">
      <Header title="Adres ekle" subtitle="Haritada konumu işaretle" onClose={() => router.back()} />
      <MapPreview lat={pos.lat} lng={pos.lng} height={220} onPick={(dx, dy) => { setPos((p) => ({ lat: +(p.lat - dy * 0.02).toFixed(4), lng: +(p.lng + dx * 0.03).toFixed(4) })); setMoved(true); setLine(`Caferağa Mah. Moda Cad. ${Math.round(45 + dx * 60)}, Kadıköy`); }} testID="map-pick" />
      <Small style={{ marginTop: space[2] }} testID="coords">{pos.lat.toFixed(4)}, {pos.lng.toFixed(4)}{moved ? " · konum güncellendi" : " · haritaya dokunarak taşı"}</Small>
      <View style={{ gap: space[3], marginTop: space[4] }}>
        <Input label="Açık adres" value={line} onChangeText={setLine} help="Haritadan otomatik dolduruldu, düzenleyebilirsin" testID="addr-line" />
        <Input label="Etiket" placeholder="Ev, İş, Annem…" value={label} onChangeText={setLabel} testID="addr-label" />
        <Input label="Kurye notu" placeholder="Kapı kodu, kat, tarif…" value={note} onChangeText={setNote} />
        <Button title="Kaydet ve kullan" size="lg" onPress={save} disabled={line.trim().length < 5} testID="addr-save" />
      </View>
    </Screen>
  );
}
