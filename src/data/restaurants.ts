import type { Address, MenuItem, ModifierGroup, Restaurant } from "@/lib/order";

const size = (extra = 9_000): ModifierGroup => ({ id: "boy", name: "Boy", required: true, options: [{ id: "tek", name: "Tekli", price: 0 }, { id: "menu", name: "Menü (patates + içecek)", price: extra }] });
const drink: ModifierGroup = { id: "icecek", name: "İçecek", required: true, options: [{ id: "kola", name: "Kola", price: 0 }, { id: "ayran", name: "Ayran", price: 0 }, { id: "su", name: "Su", price: -500 }] };
const extras = (opts: [string, number][]): ModifierGroup => ({ id: "ekstra", name: "Ekstra", multi: true, options: opts.map(([name, price], i) => ({ id: "e" + i, name, price })) });
const sauces: ModifierGroup = { id: "sos", name: "Sos", multi: true, options: [{ id: "s1", name: "Acı sos", price: 0 }, { id: "s2", name: "Ranch", price: 500 }, { id: "s3", name: "BBQ", price: 500 }] };
const m = (id: string, name: string, price: number, category: string, emoji: string, desc: string, x: Partial<MenuItem> = {}): MenuItem => ({ id, name, price, category, emoji, desc, ...x });

export const RESTAURANTS: Restaurant[] = [
  { id: "burgerhane", name: "Burgerhane", cuisine: "Burger", tags: ["burger", "patates", "gece"], rating: 4.7, reviews: 2140, deliveryMin: 20, deliveryMax: 30, deliveryFee: 2_490, freeDeliveryOver: 35_000, minOrder: 15_000, distanceKm: 1.2, promo: "₺350 üzeri ücretsiz teslimat", emoji: "🍔", color: "#b45309", open: true, menu: [
    m("bh1", "Klasik Burger", 24_000, "Burgerler", "🍔", "150 g dana köfte, cheddar, turşu, özel sos", { popular: true, groups: [size(), extras([["Cheddar", 2_500], ["Bacon", 3_500], ["Karamelize soğan", 1_500]]), sauces] }),
    m("bh2", "Trüf Mantarlı Burger", 31_000, "Burgerler", "🍄", "Trüf mayonez, sotelenmiş mantar, gruyère", { popular: true, groups: [size(), extras([["Cheddar", 2_500], ["Bacon", 3_500]])] }),
    m("bh3", "Acılı Tavuk Burger", 22_000, "Burgerler", "🌶️", "Çıtır tavuk, jalapeño, sriracha mayo", { spicy: true, groups: [size(), sauces] }),
    m("bh4", "Vegan Burger", 23_000, "Burgerler", "🥬", "Nohut-pancar köftesi, avokado", { veg: true, groups: [size()] }),
    m("bh5", "Çıtır Patates", 8_500, "Yanlar", "🍟", "Deniz tuzu, rosemary", { veg: true, groups: [sauces] }),
    m("bh6", "Soğan Halkası", 9_500, "Yanlar", "🧅", "8 adet, ranch sos ile", { veg: true }),
    m("bh7", "Milkshake", 11_000, "Tatlı & İçecek", "🥤", "Çilek / vanilya / çikolata", { groups: [{ id: "tat", name: "Tat", required: true, options: [{ id: "t1", name: "Çilek", price: 0 }, { id: "t2", name: "Vanilya", price: 0 }, { id: "t3", name: "Çikolata", price: 0 }] }] }),
    m("bh8", "Kola 33 cl", 3_500, "Tatlı & İçecek", "🥤", "Soğuk"),
  ] },
  { id: "napoli", name: "Napoli Pizzeria", cuisine: "Pizza", tags: ["pizza", "italyan", "odun fırını"], rating: 4.8, reviews: 3320, deliveryMin: 25, deliveryMax: 40, deliveryFee: 0, freeDeliveryOver: 0, minOrder: 20_000, distanceKm: 2.4, emoji: "🍕", color: "#15803d", open: true, menu: [
    m("np1", "Margherita", 26_000, "Pizzalar", "🍕", "San Marzano domates, fior di latte, fesleğen", { popular: true, veg: true, groups: [{ id: "boy", name: "Boy", required: true, options: [{ id: "30", name: "30 cm", price: 0 }, { id: "40", name: "40 cm", price: 12_000 }] }, extras([["Ekstra mozzarella", 3_000], ["Trüf yağı", 4_000]])] }),
    m("np2", "Diavola", 31_000, "Pizzalar", "🌶️", "Acılı salam, kırmızı biber, mozzarella", { spicy: true, popular: true, groups: [{ id: "boy", name: "Boy", required: true, options: [{ id: "30", name: "30 cm", price: 0 }, { id: "40", name: "40 cm", price: 12_000 }] }] }),
    m("np3", "Quattro Formaggi", 33_000, "Pizzalar", "🧀", "Dört peynir, ceviz, bal", { veg: true, groups: [{ id: "boy", name: "Boy", required: true, options: [{ id: "30", name: "30 cm", price: 0 }, { id: "40", name: "40 cm", price: 12_000 }] }] }),
    m("np4", "Caprese Salata", 14_000, "Başlangıçlar", "🥗", "Domates, mozzarella, fesleğen", { veg: true }),
    m("np5", "Sarımsaklı Ekmek", 7_500, "Başlangıçlar", "🥖", "Fırın taze", { veg: true }),
    m("np6", "Tiramisu", 12_000, "Tatlılar", "🍰", "Ev yapımı", { popular: true }),
    m("np7", "Limonata", 6_000, "İçecekler", "🍋", "Taze sıkma"),
  ] },
  { id: "kebapci-ali", name: "Kebapçı Ali Usta", cuisine: "Kebap", tags: ["kebap", "lahmacun", "pide"], rating: 4.6, reviews: 5210, deliveryMin: 30, deliveryMax: 45, deliveryFee: 1_990, freeDeliveryOver: 30_000, minOrder: 15_000, distanceKm: 3.1, promo: "2 lahmacun + ayran ₺149", emoji: "🥙", color: "#b91c1c", open: true, menu: [
    m("ka1", "Adana Kebap", 29_000, "Kebaplar", "🍢", "Lavaş, közlenmiş domates-biber, soğan salatası", { popular: true, spicy: true, groups: [{ id: "porsiyon", name: "Porsiyon", required: true, options: [{ id: "1", name: "1 porsiyon", price: 0 }, { id: "1.5", name: "1,5 porsiyon", price: 12_000 }] }] }),
    m("ka2", "Urfa Kebap", 29_000, "Kebaplar", "🍢", "Acısız", { groups: [{ id: "porsiyon", name: "Porsiyon", required: true, options: [{ id: "1", name: "1 porsiyon", price: 0 }, { id: "1.5", name: "1,5 porsiyon", price: 12_000 }] }] }),
    m("ka3", "Beyti Sarma", 34_000, "Kebaplar", "🌯", "Yoğurt ve tereyağlı sos", { popular: true }),
    m("ka4", "Lahmacun", 7_500, "Fırın", "🫓", "İnce hamur, bol maydanoz", { popular: true }),
    m("ka5", "Kaşarlı Pide", 16_000, "Fırın", "🥖", "Kapalı ya da açık", { veg: true }),
    m("ka6", "Kıymalı Pide", 18_000, "Fırın", "🥖", "Yumurtalı"),
    m("ka7", "Künefe", 13_000, "Tatlılar", "🍮", "Antep fıstıklı"),
    m("ka8", "Ayran", 2_500, "İçecekler", "🥛", "Yayık"),
  ] },
  { id: "sushiko", name: "Sushiko", cuisine: "Japon", tags: ["sushi", "ramen", "japon"], rating: 4.9, reviews: 980, deliveryMin: 35, deliveryMax: 50, deliveryFee: 3_990, freeDeliveryOver: 60_000, minOrder: 25_000, distanceKm: 4.6, emoji: "🍣", color: "#0369a1", open: true, menu: [
    m("su1", "Salmon Roll (8)", 32_000, "Roll", "🍣", "Somon, avokado, salatalık", { popular: true }),
    m("su2", "California Roll (8)", 27_000, "Roll", "🍣", "Yengeç, avokado, tobiko"),
    m("su3", "Spicy Tuna Roll (8)", 34_000, "Roll", "🌶️", "Ton, sriracha mayo", { spicy: true }),
    m("su4", "Tonkotsu Ramen", 38_000, "Ramen", "🍜", "12 saat kaynatılmış domuz suyu, chashu, yumurta", { popular: true, groups: [extras([["Ekstra chashu", 8_000], ["Ekstra yumurta", 3_000]])] }),
    m("su5", "Miso Ramen (Vegan)", 33_000, "Ramen", "🍜", "Tofu, mantar, pak choi", { veg: true }),
    m("su6", "Edamame", 9_000, "Başlangıçlar", "🫛", "Deniz tuzu", { veg: true }),
    m("su7", "Gyoza (6)", 14_000, "Başlangıçlar", "🥟", "Tavuklu"),
  ] },
  { id: "yesil-kase", name: "Yeşil Kase", cuisine: "Sağlıklı", tags: ["salata", "bowl", "vegan", "fit"], rating: 4.5, reviews: 760, deliveryMin: 15, deliveryMax: 25, deliveryFee: 1_490, freeDeliveryOver: 25_000, minOrder: 12_000, distanceKm: 0.8, promo: "Öğle menüsü ₺179", emoji: "🥗", color: "#16a34a", open: true, menu: [
    m("yk1", "Tavuklu Sezar Bowl", 19_000, "Bowl", "🥗", "Izgara tavuk, parmesan, kruton", { popular: true }),
    m("yk2", "Falafel Bowl", 17_000, "Bowl", "🧆", "Humus, kinoa, tahin sos", { veg: true, popular: true }),
    m("yk3", "Somon Poke", 26_000, "Bowl", "🐟", "Somon, edamame, avokado, susam"),
    m("yk4", "Yeşil Smoothie", 9_500, "İçecekler", "🥤", "Ispanak, elma, zencefil", { veg: true }),
    m("yk5", "Protein Tatlı", 8_000, "Tatlılar", "🍫", "Kakao, hurma, fındık", { veg: true }),
  ] },
  { id: "mantici", name: "Kayseri Mantıcısı", cuisine: "Ev Yemeği", tags: ["mantı", "ev yemeği", "çorba"], rating: 4.4, reviews: 1890, deliveryMin: 25, deliveryMax: 40, deliveryFee: 1_990, freeDeliveryOver: 25_000, minOrder: 12_000, distanceKm: 2.0, emoji: "🥟", color: "#7c3aed", open: true, menu: [
    m("mt1", "Kayseri Mantısı", 18_000, "Ana Yemek", "🥟", "Yoğurt, nane, sumak, tereyağı", { popular: true }),
    m("mt2", "Kuru Fasulye + Pilav", 15_000, "Ana Yemek", "🍛", "Pastırmalı ya da sade"),
    m("mt3", "Mercimek Çorbası", 6_500, "Çorbalar", "🍲", "Limon ve kıtır ekmekle", { veg: true, popular: true }),
    m("mt4", "Yayla Çorbası", 6_500, "Çorbalar", "🍲", "Yoğurtlu, naneli", { veg: true }),
    m("mt5", "Sütlaç", 7_000, "Tatlılar", "🍚", "Fırın"),
  ] },
  { id: "tantuni", name: "Mersin Tantuni", cuisine: "Sokak Lezzeti", tags: ["tantuni", "dürüm", "gece"], rating: 4.3, reviews: 2430, deliveryMin: 15, deliveryMax: 25, deliveryFee: 1_490, freeDeliveryOver: 20_000, minOrder: 10_000, distanceKm: 1.5, emoji: "🌯", color: "#c2410c", open: true, menu: [
    m("tt1", "Et Tantuni Dürüm", 14_000, "Dürümler", "🌯", "Lavaş, soğan, maydanoz, domates", { popular: true, groups: [{ id: "acı", name: "Acı", required: true, options: [{ id: "a0", name: "Acısız", price: 0 }, { id: "a1", name: "Az acı", price: 0 }, { id: "a2", name: "Çok acı", price: 0 }] }] }),
    m("tt2", "Tavuk Tantuni Dürüm", 12_000, "Dürümler", "🌯", "Lavaş", { popular: true }),
    m("tt3", "Ekmek Arası Tantuni", 13_000, "Dürümler", "🥖", "Yarım ekmek"),
    m("tt4", "Şalgam", 2_500, "İçecekler", "🧃", "Acılı / acısız"),
  ] },
  { id: "tatlici", name: "Hafız Baklava", cuisine: "Tatlı", tags: ["baklava", "tatlı", "kahve"], rating: 4.8, reviews: 4100, deliveryMin: 20, deliveryMax: 35, deliveryFee: 2_490, freeDeliveryOver: 30_000, minOrder: 12_000, distanceKm: 2.8, emoji: "🍮", color: "#a16207", open: true, menu: [
    m("hb1", "Fıstıklı Baklava (6)", 22_000, "Baklava", "🍯", "Antep fıstığı, kaymak", { popular: true }),
    m("hb2", "Havuç Dilimi (4)", 19_000, "Baklava", "🍯", "Bol fıstıklı", { popular: true }),
    m("hb3", "Şöbiyet (4)", 20_000, "Baklava", "🍯", "Kaymaklı"),
    m("hb4", "Türk Kahvesi", 5_000, "İçecekler", "☕", "Orta / sade / şekerli", { groups: [{ id: "seker", name: "Şeker", required: true, options: [{ id: "sade", name: "Sade", price: 0 }, { id: "orta", name: "Orta", price: 0 }, { id: "sekerli", name: "Şekerli", price: 0 }] }] }),
  ] },
  { id: "kahvalti", name: "Van Kahvaltı Evi", cuisine: "Kahvaltı", tags: ["kahvaltı", "serpme", "menemen"], rating: 4.6, reviews: 1560, deliveryMin: 25, deliveryMax: 40, deliveryFee: 1_990, freeDeliveryOver: 35_000, minOrder: 15_000, distanceKm: 3.4, emoji: "🍳", color: "#0891b2", open: false, menu: [
    m("vk1", "Serpme Kahvaltı (2 kişilik)", 42_000, "Kahvaltı", "🍳", "22 çeşit, sınırsız çay", { popular: true }),
    m("vk2", "Menemen", 12_000, "Kahvaltı", "🍳", "Biberli, soğansız", { veg: true }),
    m("vk3", "Sucuklu Yumurta", 13_000, "Kahvaltı", "🍳", "Sahanda"),
  ] },
];
export const CUISINES = ["Burger", "Pizza", "Kebap", "Japon", "Sağlıklı", "Ev Yemeği", "Sokak Lezzeti", "Tatlı", "Kahvaltı"];
export const CUISINE_EMOJI: Record<string, string> = { Burger: "🍔", Pizza: "🍕", Kebap: "🥙", Japon: "🍣", "Sağlıklı": "🥗", "Ev Yemeği": "🥟", "Sokak Lezzeti": "🌯", "Tatlı": "🍮", "Kahvaltı": "🍳" };
export const ADDRESSES: Address[] = [
  { id: "ev", label: "Ev", line: "Moda Cad. 112, D:4, Kadıköy", lat: 40.982, lng: 29.027, note: "Kapı zili çalışmıyor, arayın" },
  { id: "is", label: "İş", line: "Maslak Mah. Büyükdere Cad. 255, Sarıyer", lat: 41.111, lng: 29.021 },
];
export const CARDS = [{ id: "c1", label: "Kredi kartı •••• 4242", icon: "card" }, { id: "c2", label: "Sofra Cüzdan · ₺120", icon: "wallet" }, { id: "nakit", label: "Kapıda nakit", icon: "cash" }];
export const DEMO_USER = { id: "demo-user-7", name: "Uğur", phone: "+90 5•• ••• 42 67" };
