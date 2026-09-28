import { View } from "react-native";
import { Badge, Banner, Button, Card, Divider, Header, Row, Screen, Section, Segmented, Small, Txt } from "@/components/ui";
import { funnel, pct, sampleSize, zTest, type Variant } from "@/lib/experiment";
import { useStore, useVariant } from "@/store";
import { space, useTheme } from "@/theme";

/** Ürün ekibi paneli: cihazdaki olay günlüğünden A/B hunisi ve istatistiksel anlamlılık. */
export default function Experiment() {
  const { c } = useTheme();
  const events = useStore((s) => s.events); const override = useStore((s) => s.variantOverride); const setOverride = useStore((s) => s.setVariantOverride); const v = useVariant(); const variant = () => v; const loadSyn = useStore((s) => s.loadSynthetic); const clear = useStore((s) => s.clearEvents);
  const A = funnel(events, "A"), B = funnel(events, "B");
  const z = zTest(A.complete, A.addToCart, B.complete, B.addToCart);
  const syn = events.filter((e) => e.session.startsWith("syn-")).length; const real = events.length - syn;
  const need = sampleSize(0.32, 0.1);
  const Cell = ({ v, strong }: { v: string; strong?: boolean }) => <Txt role={strong ? "bodyStrong" : "body"} color={c.text} style={{ width: 84, textAlign: "right" }}>{v}</Txt>;
  const RowT = ({ k, a, b, strong }: { k: string; a: string; b: string; strong?: boolean }) => <Row style={{ paddingVertical: 6 }}><Small style={{ flex: 1 }}>{k}</Small><Cell v={a} strong={strong} /><Cell v={b} strong={strong} /></Row>;
  return (
    <Screen testID="experiment">
      <Header title="Ödeme akışı deneyi" subtitle="checkout-v2 · A: 4 adım · B: tek sayfa" back />
      <Card style={{ gap: space[3] }}>
        <Row style={{ justifyContent: "space-between" }}><Txt role="bodyStrong" color={c.text}>Bu cihazın varyantı</Txt><Badge label={`Varyant ${variant()}`} tone={variant() === "B" ? "success" : "neutral"} testID="current-variant" /></Row>
        <Segmented label="Varyant seçimi" value={override ?? "auto"} onChange={(v) => setOverride(v === "auto" ? null : (v as Variant))} options={[{ value: "auto", label: "Otomatik (hash)" }, { value: "A", label: "A'yı zorla" }, { value: "B", label: "B'yi zorla" }]} />
        <Small>Otomatik atama kullanıcı kimliği + deney anahtarının FNV-1a özetiyle yapılır; aynı kullanıcı hep aynı kovaya düşer.</Small>
      </Card>

      <Section title="Huni (sepete ekleyen oturumlar)" action={<Small testID="event-count">{events.length} olay · {real} gerçek{syn ? ` · ${syn} sentetik` : ""}</Small>}>
        <Card>
          <Row style={{ paddingBottom: 6 }}><Small style={{ flex: 1 }}> </Small><Small style={{ width: 84, textAlign: "right", fontWeight: "700" }}>A · Klasik</Small><Small style={{ width: 84, textAlign: "right", fontWeight: "700" }}>B · Yeni</Small></Row>
          <Divider />
          <RowT k="Oturum" a={String(A.sessions)} b={String(B.sessions)} />
          <RowT k="Sepete ekledi" a={String(A.addToCart)} b={String(B.addToCart)} />
          <RowT k="Ödemeye başladı" a={String(A.checkoutStart)} b={String(B.checkoutStart)} />
          <RowT k="Sipariş verdi" a={String(A.complete)} b={String(B.complete)} strong />
          <Divider />
          <RowT k="Sepet terk oranı" a={pct(A.abandonRate)} b={pct(B.abandonRate)} strong />
          <RowT k="Ort. ödeme adımı" a={A.avgSteps.toFixed(1)} b={B.avgSteps.toFixed(1)} />
          <RowT k="Form hatası" a={String(A.errors)} b={String(B.errors)} />
        </Card>
      </Section>

      <Section title="İstatistiksel anlamlılık">
        <Card style={{ gap: space[2] }}>
          <Row style={{ justifyContent: "space-between" }}><Txt color={c.text}>Dönüşüm artışı (B vs A)</Txt><Txt role="h3" color={z.lift >= 0 ? c.success : c.danger} testID="lift">{z.lift >= 0 ? "+" : ""}{Math.round(z.lift * 100)}%</Txt></Row>
          <Row style={{ justifyContent: "space-between" }}><Small>z-skoru · p-değeri</Small><Small color={c.text} testID="ztest">z = {z.z} · p = {z.p < 0.0001 ? "< 0,0001" : z.p.toFixed(4)}</Small></Row>
          <Banner tone={z.significant ? "success" : "info"} text={z.significant ? "Fark %95 güven düzeyinde anlamlı (p < 0,05). B'yi %100'e açmak için karar alınabilir." : `Henüz anlamlı değil. Temel oran %32 için +10 puan farkı görmek üzere varyant başına ≈ ${need} sepetli oturum gerekir.`} testID="significance" />
        </Card>
      </Section>

      <Section title="Veri">
        <View style={{ gap: space[2] }}>
          <Button title="Sentetik oturum verisi yükle (1.200 oturum)" variant="secondary" icon="chart2" onPress={loadSyn} testID="load-synthetic" />
          <Button title="Olay günlüğünü temizle" variant="tertiary" icon="trash" onPress={clear} testID="clear-events" />
          <Small>Gerçek olaylar bu cihazda, bu uygulamayı kullandıkça birikir. Sentetik veri, panelin nasıl çalıştığını göstermek için xorshift tohumuyla üretilir ve açıkça etiketlenir.</Small>
        </View>
      </Section>
    </Screen>
  );
}
