// Uçtan uca akış testi + gerçek ekran görüntüleri (390×844, @2x).
// Önce: npm run export:web && node scripts/serve.mjs 8081
import { chromium, devices } from "playwright";
import fs from "node:fs/promises";

const BASE = process.env.BASE_URL ?? "http://localhost:8081";
const OUT = process.env.OUT ?? "screenshots";
await fs.mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["iPhone 14"], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: "tr-TR", timezoneId: "Europe/Istanbul", colorScheme: "light" });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text() + " @" + page.url()); });
const ok = (c, m) => { if (!c) throw new Error("TEST BAŞARISIZ: " + m); console.log("✓", m); };
const shot = async (name) => { await page.waitForTimeout(400); await page.screenshot({ path: `${OUT}/${name}.png` }); console.log("📸", name); };
const text = async () => (await page.locator("body").innerText()).replace(/\s+/g, " ");
const has = (t, s) => t.toLocaleLowerCase("tr-TR").includes(s);
const tid = (id) => page.getByTestId(id).filter({ visible: true }).last();
const tab = async (label) => { await page.getByRole("tab", { name: new RegExp("^(\\d+\\s*)?" + label) }).click(); await page.waitForTimeout(600); };
const wait = (ms = 400) => page.waitForTimeout(ms);
const store = (fn) => page.evaluate(fn);

// ---------------- Keşfet ----------------
await page.goto(BASE + "/"); await page.waitForLoadState("networkidle"); await wait(900);
let t = await text();
ok(has(t, "yakınındakiler") && t.includes("9 restoran") && t.includes("Napoli Pizzeria") && t.includes("Ücretsiz"), "keşfet: 9 restoran, teslimat ücreti kartta görünür");
await shot("01-kesfet");
await tid("filter-free").click(); await wait(300);
t = await text(); ok(/[1-4] restoran/.test(await tid("result-count").innerText()) && t.includes("Napoli"), "ücretsiz teslimat filtresi");
await tid("filter-free").click(); await tid("cuisine-Pizza").click(); await wait(300);
ok((await tid("result-count").innerText()) === "1 restoran", "mutfak filtresi: Pizza → 1 restoran");
await tid("cuisine-Pizza").click();

// ---------------- Ara ----------------
await tab("Ara");
await tid("recent-lahmacun").click(); await wait(300);
t = await text(); ok(t.includes("1 sonuç") && t.includes("Kebapçı Ali Usta"), "arama menü içinde de bulur (lahmacun → Kebapçı Ali Usta)");
await tid("search-input").fill("burger"); await wait(300);
ok((await text()).includes("Burgerhane"), "arama: burger");
await shot("02-arama");

// ---------------- Restoran & ürün ----------------
await tid("result-burgerhane").click(); await wait(800);
t = await text();
ok(t.includes("Burgerhane") && t.includes("Popüler") && t.includes("Yanlar") && t.includes("₺350 daha ekle"), "restoran sayfası: akıllı kategoriler ve ücretsiz teslimat ipucu");
await shot("03-restoran");
await tid("cat-2").click(); await wait(600);
ok(await tid("section-2").isVisible(), "kategori çipi bölüme kaydırır");
await tid("item-bh1-pop").click(); await wait(600);
ok((await text()).includes("Klasik Burger") && (await text()).includes("Zorunlu"), "ürün sayfası: zorunlu seçenek grubu");
await tid("add-to-cart").click(); await wait(200);
ok(await tid("mod-error").isVisible(), "boy seçilmeden eklenemez (doğrulama)");
await tid("opt-menu").click(); await tid("opt-e0").click(); await tid("qty-plus").click(); await wait(200);
ok((await tid("add-to-cart").innerText()).includes("₺710"), "fiyat seçeneklerle güncellenir: (240+90+25)×2 = ₺710");
await shot("04-urun");
await tid("add-to-cart").click(); await wait(700);
ok((await tid("cart-bar").innerText()).includes("2 ürün") && (await tid("cart-bar").innerText()).includes("₺710"), "sepet çubuğu: 2 ürün · ₺710");
ok(await tid("free-delivery-ok").isVisible(), "eşik aşıldı: 'teslimat ücretsiz' rozeti");

// Başka restorandan ürün → çakışma
await page.getByRole("button", { name: "Geri" }).click(); await wait(400);
await tab("Ara"); await tid("search-input").fill("pizza"); await wait(300); await tid("result-napoli").click(); await wait(700);
await tid("item-np1-pop").click(); await wait(500); await tid("opt-30").click(); await tid("add-to-cart").click(); await wait(400);
ok(await tid("conflict-sheet").isVisible(), "farklı restoran → 'sepeti boşalt' uyarısı");
await shot("05-restoran-cakisma");
await page.getByRole("button", { name: "Vazgeç" }).click(); await wait(300); await page.getByTestId("item-modal").getByRole("button", { name: "Kapat" }).click(); await wait(400); await page.getByRole("button", { name: "Geri" }).click(); await wait(400);

// ---------------- Sepet ----------------
await store(() => globalThis.Sofra.getState().setVariantOverride("A"));
await tab("Sepet"); await wait(300);
t = await text();
ok(t.includes("Burgerhane") && (await tid("t-subtotal").innerText()) === "₺710" && (await tid("t-delivery").innerText()) === "Ücretsiz" && (await tid("t-total").innerText()) === "₺719,90", "sepet toplamları: ₺710 + servis ₺9,90 = ₺719,90");
await tid("inc-bh1").click(); await wait(200); ok((await tid("t-subtotal").innerText()) === "₺1.065", "adet artırma");
await tid("dec-bh1").click(); await wait(200);
await tid("promo-input").fill("XYZ"); await tid("promo-apply").click(); await wait(300);
ok((await text()).includes("Kod geçersiz"), "geçersiz promosyon kodu");
await tid("promo-input").fill("SOFRA20"); await tid("promo-apply").click(); await wait(300);
ok((await tid("t-discount").innerText()) === "−₺142" && (await tid("t-total").innerText()) === "₺577,90", "SOFRA20: %20 indirim → ₺577,90");
await shot("06-sepet");

// ---------------- Ödeme A (klasik 4 adım) ----------------
ok((await tid("variant-badge").innerText()).includes("Klasik"), "varyant A zorlandı: klasik ödeme");
await tid("checkout").click(); await wait(600);
ok((await text()).includes("Adım 1 / 4"), "A: adım 1 adres formu");
await tid("a-next").click(); await wait(200);
ok(await tid("a-errors").isVisible() && (await text()).includes("Posta kodu 5 haneli"), "A: eksik alanlar hata verir (form hatası olay günlüğüne düşer)");
await shot("07-odeme-a-hata");
await tid("f-ilce").fill("Kadıköy"); await tid("f-mahalle").fill("Caferağa"); await tid("f-no").fill("112"); await tid("f-posta").fill("34710");
await tid("a-next").click(); await wait(500); ok((await text()).includes("Adım 2 / 4"), "A: adım 2 teslimat");
await tid("when-ileri").click(); await tid("a-next").click(); await wait(500); ok((await text()).includes("Adım 3 / 4"), "A: adım 3 ödeme");
await tid("pay-nakit").click(); await tid("a-next").click(); await wait(500);
t = await text(); ok(t.includes("Adım 4 / 4") && t.includes("Caferağa") && (await tid("t-total").innerText()) === "₺577,90", "A: özet adımı");
await shot("08-odeme-a-ozet");
await tid("place-order").click(); await page.waitForURL((u) => u.pathname.startsWith("/siparis/"), { timeout: 10000 }); await wait(800);
t = await text(); ok(t.includes("Sipariş alındı") && t.includes("Kapıda nakit"), "sipariş verildi → takip ekranı");
await shot("09-siparis-takip");

// ---------------- Tekrar sipariş + Ödeme B (tek sayfa) ----------------
await tid("close-tracking").click(); await wait(600);
t = await text(); ok(t.includes("Siparişlerim") && t.includes("1 sipariş") && t.includes("Klasik ödeme"), "sipariş listesi");
const orderId = (await page.locator('[data-testid^="order-"]').first().getAttribute("data-testid")).replace("order-", "");
await tid(`reorder-${orderId}`).click(); await wait(600);
ok((await tid("t-subtotal").innerText()) === "₺710", "tekrar sipariş sepeti aynı seçeneklerle doldurur");
await store(() => globalThis.Sofra.getState().setVariantOverride("B"));
await tab("Profil"); await tab("Sepet"); await wait(300);
ok((await tid("variant-badge").innerText()).includes("Yeni"), "varyant B: yeni ödeme");
await tid("checkout").click(); await wait(600);
t = await text();
ok(t.includes("tek adım") && has(t, "teslimat adresi") && has(t, "ödeme yöntemi") && (await tid("t-total").innerText()) === "₺719,90", "B: tek sayfada adres, ödeme, özet ve toplam baştan görünür");
await tid("change-address").click(); await wait(200); await tid("addr-is").click(); await wait(200);
ok((await text()).includes("Maslak"), "B: adres tek dokunuşla değişir");
await tid("tip-2000").click(); await wait(200); ok((await tid("t-total").innerText()) === "₺739,90", "B: bahşiş toplama eklenir");
await tid("pay-c2").click();
await shot("10-odeme-b-tek-sayfa");
await tid("place-order").click(); await page.waitForURL((u) => u.pathname.startsWith("/siparis/"), { timeout: 10000 }); await wait(800);
ok((await text()).includes("Sofra Cüzdan"), "B: sipariş verildi");
await tid("close-tracking").click(); await wait(500);

// ---------------- Deney paneli ----------------
await tab("Profil"); await tid("open-experiment").click(); await wait(600);
t = await text();
ok(has(t, "huni") && t.includes("Varyant B"), "deney paneli: mevcut varyant ve huni");
const ev = await store(() => globalThis.Sofra.getState().events.map((e) => e.variant + ":" + e.name));
ok(ev.includes("A:checkout_error") && ev.filter((e) => e === "A:checkout_step").length === 4 && ev.filter((e) => e === "B:checkout_step").length === 1 && ev.filter((e) => e.endsWith("order_complete")).length === 2, "gerçek olay günlüğü: A 4 adım + 1 form hatası, B 1 adım, 2 sipariş");
await tid("load-synthetic").click(); await wait(500);
t = await text();
ok((await tid("event-count").innerText()).includes("sentetik") && has(t, "anlamlı (p < 0,05)"), "sentetik veriyle anlamlılık: p < 0,05");
const lift = await tid("lift").innerText(); ok(/^\+\d+%$/.test(lift) && parseInt(lift) > 30, `dönüşüm artışı ${lift}`);
await page.mouse.move(195, 400); await page.mouse.wheel(0, -4000); await wait(300); await shot("11-deney-paneli");
await page.getByRole("radio", { name: "Otomatik (hash)" }).click(); await wait(200);
ok((await tid("current-variant").innerText()).includes("Varyant B"), "otomatik atama (FNV-1a) → B");
await page.getByRole("button", { name: "Geri" }).click(); await wait(400);

// ---------------- Haritadan adres ----------------
await page.getByRole("button", { name: "Ekle" }).click(); await wait(600);
const before = await tid("coords").innerText();
await tid("map-pick").click({ position: { x: 250, y: 60 } }); await wait(200);
const after = await tid("coords").innerText();
ok(before !== after && after.includes("konum güncellendi"), "haritaya dokununca konum ve açık adres güncellenir");
await tid("addr-label").fill("Yazlık"); await shot("12-adres-harita");
await tid("addr-save").click(); await wait(600);
await tab("Keşfet"); await wait(300);
ok((await tid("address-pill").innerText()).includes("Yazlık"), "yeni adres teslimat adresi oldu");

// ---------------- Kalıcılık ----------------
await page.reload(); await page.waitForLoadState("networkidle"); await wait(900);
await tab("Siparişler"); ok((await text()).includes("2 sipariş"), "yenileme sonrası siparişler kalıcı (AsyncStorage)");

// ---------------- Tema ve yazı boyutu ----------------
await tab("Profil"); await page.getByRole("radio", { name: "Koyu" }).click(); await wait(400);
await tab("Keşfet"); await shot("13-kesfet-koyu");
await tab("Profil"); await page.getByRole("radio", { name: "Çok büyük" }).click(); await wait(300);
const size = await page.evaluate(() => { const el = [...document.querySelectorAll("div")].find((d) => d.textContent === "Tema" && d.children.length === 0); return el ? parseFloat(getComputedStyle(el).fontSize) : 0; });
ok(size >= 20, `çok büyük yazı ölçeği: ${size}px`);
await shot("14-profil-buyuk-yazi");
await page.getByRole("radio", { name: "Normal" }).click(); await page.getByRole("radio", { name: "Açık" }).click(); await wait(200);

// ---------------- Erişilebilirlik ----------------
await tab("Keşfet"); await wait(300);
const unlabeled = await page.evaluate(() => [...document.querySelectorAll('[role="button"],[role="switch"],[role="radio"],[role="tab"],[role="checkbox"]')].filter((el) => !(el.getAttribute("aria-label") || el.textContent?.trim())).length);
ok(unlabeled === 0, "tüm etkileşimli öğelerin erişilebilir adı var");

const realErrors = errors.filter((e) => !/404|favicon|Download the React DevTools/.test(e));
ok(realErrors.length === 0, "konsolda hata yok" + (realErrors.length ? ": " + realErrors.join(" | ") : ""));
await browser.close();
console.log("\nTÜM KONTROLLER GEÇTİ ✔");
