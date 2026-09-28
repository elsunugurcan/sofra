import { View } from "react-native";
import { useRouter } from "expo-router";
import { Avatar, Button, Card, Divider, Header, ListItem, Row, Screen, Section, Segmented, Small, Txt } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { DEMO_USER } from "@/data/restaurants";
import { useStore } from "@/store";
import { space, useTheme } from "@/theme";

export default function Profile() {
  const { c } = useTheme(); const router = useRouter();
  const settings = useStore((s) => s.settings); const set = useStore((s) => s.setSetting); const addresses = useStore((s) => s.addresses); const orders = useStore((s) => s.orders); const reset = useStore((s) => s.reset);
  return (
    <Screen testID="profile">
      <Header title="Profil" />
      <Card><Row gap={space[3]}><Avatar name={DEMO_USER.name} size={52} color={c.primary} /><View style={{ flex: 1 }}><Txt role="h3" color={c.text}>{DEMO_USER.name}</Txt><Small>{DEMO_USER.phone} · {orders.length} sipariş</Small></View></Row></Card>
      <Section title="Adreslerim" action={<Button title="Ekle" variant="tertiary" size="sm" icon="plus" onPress={() => router.push("/adres-ekle")} />}>
        <Card padded={false} style={{ paddingHorizontal: space[4] }}>{addresses.map((a, i) => <View key={a.id}>{i > 0 && <Divider />}<ListItem title={a.label} subtitle={a.line} left={<Icon name="pin" color={c.primary} />} testID={`addr-row-${a.id}`} /></View>)}</Card>
      </Section>
      <Section title="Görünüm">
        <Card style={{ gap: space[3] }}>
          <View style={{ gap: space[2] }}><Txt role="bodyStrong" color={c.text}>Tema</Txt><Segmented label="Tema" value={settings.theme} onChange={(v) => set("theme", v)} options={[{ value: "light", label: "Açık" }, { value: "dark", label: "Koyu" }, { value: "system", label: "Sistem" }]} /></View>
          <View style={{ gap: space[2] }}><Txt role="bodyStrong" color={c.text}>Yazı boyutu</Txt><Segmented label="Yazı boyutu" value={settings.fontScale} onChange={(v) => set("fontScale", v)} options={[{ value: "normal", label: "Normal" }, { value: "large", label: "Büyük" }, { value: "xlarge", label: "Çok büyük" }]} /></View>
        </Card>
      </Section>
      <Section title="Ürün ekibi">
        <Card padded={false} style={{ paddingHorizontal: space[4] }}>
          <ListItem title="Ödeme akışı deneyi" subtitle="A/B huni, sepet terk oranı, anlamlılık" left={<Icon name="flask" color={c.textMuted} />} chevron onPress={() => router.push("/deney")} testID="open-experiment" />
        </Card>
      </Section>
      <View style={{ marginTop: space[6], gap: space[2] }}>
        <Button title="Demo verilerini sıfırla" variant="tertiary" icon="refresh" onPress={reset} testID="reset" />
        <Small align="center">Sofra 1.0 · kurgusal platform, gerçek sipariş oluşmaz</Small>
      </View>
    </Screen>
  );
}
