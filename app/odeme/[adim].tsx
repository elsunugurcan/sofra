import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Badge, Banner, Button, Card, Divider, Header, Input, Row, Screen, Section, Small, Txt } from "@/components/ui";
import { Icon, type IconName } from "@/components/Icon";
import { TotalsTable } from "@/components/cart";
import { CARDS } from "@/data/restaurants";
import { formatTL } from "@/lib/order";
import { useCheckout } from "@/lib/useCheckout";
import { hit, space, useTheme } from "@/theme";

const STEPS = ["Adres", "Teslimat", "Ödeme", "Özet"];
/** Adımlar ayrı ekranlar olduğundan form verisi modül düzeyinde taşınır (eski akışın "state kaybı" sorununu taklit etmiyoruz; sadece adım sayısını). */
let FORM: { il: string; ilce: string; mahalle: string; sokak: string; no: string; kat: string; posta: string } | null = null;
/**
 * Varyant A — "eski" 4 adımlı ödeme (kontrol grubu): adres elle yazılır, ilçe/posta kodu zorunlu,
 * teslimat ücreti ancak son adımda görünür. Deney bu akışı yeni tek sayfa ile karşılaştırır.
 */
export default function StepCheckout() {
  const { c } = useTheme(); const { adim } = useLocalSearchParams<{ adim: string }>();
  const step = Math.min(4, Math.max(1, Number(String(adim).replace("adim", "")) || 1));
  const { cart, setCart, address, r, t, eta, submit, track, router } = useCheckout();
  const [form, setFormState] = useState(FORM ?? { il: "İstanbul", ilce: "", mahalle: "", sokak: address.line.split(",")[0], no: "", kat: "", posta: "" });
  const setForm = (fn: (f: typeof form) => typeof form) => setFormState((f) => { const n = fn(f); FORM = n; return n; });
  const [errors, setErrors] = useState<Record<string, string>>({}); const [busy, setBusy] = useState(false); const [when, setWhen] = useState<"simdi" | "ileri">("simdi");
  useEffect(() => { track("checkout_step", { step, variant: "A" }); }, [step]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!r || !t) return <Screen><Header title="Sepet boş" back /></Screen>;
  const next = () => router.push(`/odeme/adim${step + 1}`);
  const validate = () => { const e: Record<string, string> = {}; if (!form.ilce) e.ilce = "İlçe zorunlu"; if (!form.mahalle) e.mahalle = "Mahalle zorunlu"; if (!form.no) e.no = "Bina no zorunlu"; if (!/^\d{5}$/.test(form.posta)) e.posta = "Posta kodu 5 haneli olmalı"; setErrors(e); if (Object.keys(e).length) { track("checkout_error", { field: Object.keys(e).join(",") }); return; } next(); };
  const F = (k: keyof typeof form, label: string, extra = {}) => <Input label={label} value={form[k]} onChangeText={(v) => setForm((f) => ({ ...f, [k]: v }))} error={errors[k]} testID={`f-${k}`} {...extra} />;
  return (
    <Screen testID={`checkout-a-${step}`}>
      <Header title={STEPS[step - 1]} subtitle={`Adım ${step} / 4 · ${r.name}`} back right={<Badge label="Klasik akış" tone="neutral" />} />
      <Row gap={6} style={{ marginBottom: space[4] }}>{STEPS.map((s, i) => <View key={s} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < step ? c.primary : c.surface2 }} />)}</Row>

      {step === 1 && (
        <View style={{ gap: space[3] }}>
          <Row gap={space[2]}><View style={{ flex: 1 }}>{F("il", "İl")}</View><View style={{ flex: 1 }}>{F("ilce", "İlçe")}</View></Row>
          {F("mahalle", "Mahalle")}
          {F("sokak", "Cadde / Sokak")}
          <Row gap={space[2]}><View style={{ flex: 1 }}>{F("no", "Bina no", { keyboardType: "numeric" })}</View><View style={{ flex: 1 }}>{F("kat", "Kat / Daire")}</View></Row>
          {F("posta", "Posta kodu", { keyboardType: "numeric", maxLength: 5 })}
          {Object.keys(errors).length > 0 && <Banner tone="danger" text={`${Object.keys(errors).length} alan eksik ya da hatalı`} testID="a-errors" />}
          <Button title="Devam" size="lg" iconRight="arrow" onPress={validate} testID="a-next" />
        </View>
      )}
      {step === 2 && (
        <View style={{ gap: space[3] }}>
          {[{ k: "simdi", t: "Şimdi", s: `${eta.min}–${eta.max} dk` }, { k: "ileri", t: "İleri tarihli", s: "Bugün 19:30 – 20:00" }].map((o) => (
            <Pressable key={o.k} accessibilityRole="radio" accessibilityState={{ checked: when === o.k }} accessibilityLabel={`${o.t}, ${o.s}`} onPress={() => setWhen(o.k as "simdi")} testID={`when-${o.k}`}><Card tone={when === o.k ? "primarySoft" : "surface"}><Row style={{ justifyContent: "space-between" }}><View><Txt role="bodyStrong" color={when === o.k ? c.onPrimarySoft : c.text}>{o.t}</Txt><Small color={when === o.k ? c.onPrimarySoft : undefined}>{o.s}</Small></View><Icon name={when === o.k ? "check" : "right"} color={when === o.k ? c.onPrimarySoft : c.textMuted} /></Row></Card></Pressable>
          ))}
          <Input label="Kurye notu" placeholder="İsteğe bağlı" value={cart.note} onChangeText={(v) => setCart({ note: v })} />
          <Button title="Devam" size="lg" iconRight="arrow" onPress={next} testID="a-next" />
        </View>
      )}
      {step === 3 && (
        <View style={{ gap: space[3] }}>
          <Card padded={false} style={{ paddingHorizontal: space[4] }}>
            {CARDS.map((p, i) => { const on = cart.payment === p.id; return <View key={p.id}>{i > 0 && <Divider />}<Pressable accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={p.label} onPress={() => setCart({ payment: p.id })} testID={`pay-${p.id}`} style={{ flexDirection: "row", alignItems: "center", gap: space[3], minHeight: hit.comfortable + 8 }}><Icon name={p.icon as IconName} color={c.text2} /><Txt color={c.text} style={{ flex: 1 }}>{p.label}</Txt><View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: on ? c.primary : c.borderStrong, alignItems: "center", justifyContent: "center" }}>{on && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: c.primary }} />}</View></Pressable></View>; })}
          </Card>
          <Input label="Promosyon kodu" placeholder="Kod" value={cart.promo} onChangeText={(v) => setCart({ promo: v.toUpperCase() })} autoCapitalize="characters" error={cart.promo ? t.promoError : undefined} />
          <Button title="Devam" size="lg" iconRight="arrow" onPress={next} testID="a-next" />
        </View>
      )}
      {step === 4 && (
        <View style={{ gap: space[3] }}>
          <Section title="Adres"><Card><Small color={c.text}>{form.sokak} No:{form.no} {form.kat}, {form.mahalle} Mah., {form.ilce}/{form.il} {form.posta}</Small></Card></Section>
          <Section title="Ürünler"><Card>{cart.lines.map((l) => <Row key={l.key} style={{ justifyContent: "space-between", paddingVertical: 3 }}><Small numberOfLines={1} style={{ flex: 1 }}>{l.qty}× {l.name}</Small><Small>{formatTL(l.unit * l.qty)}</Small></Row>)}</Card></Section>
          <Section title="Tutar"><Card><TotalsTable t={t} /></Card></Section>
          {t.deliveryFee > 0 && <Banner tone="warning" text={`Teslimat ücreti ${formatTL(t.deliveryFee)} eklendi.`} testID="a-fee-surprise" />}
          <Button title={`Onayla ve öde · ${formatTL(t.total)}`} size="lg" icon="check" onPress={() => { setBusy(true); setTimeout(submit, 700); }} loading={busy} testID="place-order" />
        </View>
      )}
    </Screen>
  );
}
