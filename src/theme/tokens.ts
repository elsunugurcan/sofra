/** Sofra tasarım belirteçleri — Bankam tasarım sisteminin aynı yapısı, sıcak/kırmızı marka paleti. */
export const palette = {
  red: { 50: "#fff1f1", 100: "#ffe1e1", 200: "#ffc7c7", 300: "#ff9f9f", 400: "#f96b6b", 500: "#ef4444", 600: "#d92d2d", 700: "#b91c1c", 800: "#8f1a1a", 900: "#6b1414" },
  warm: { 0: "#ffffff", 50: "#fbf7f5", 100: "#f4ecea", 200: "#e8dbd8", 300: "#cdbbb7", 400: "#a08d89", 500: "#78655f", 600: "#5b4a45", 700: "#41322e", 800: "#2b1c1a", 850: "#241212", 900: "#1c0e0e", 950: "#160a0a" },
  green: { 100: "#dcfce7", 400: "#4ade80", 600: "#16a34a", 700: "#15803d" },
  amber: { 100: "#fef3c7", 400: "#fbbf24", 700: "#b45309" },
  sky: { 100: "#e0f2fe", 400: "#38bdf8", 700: "#0369a1" },
} as const;

export type ColorRole = "bg" | "bgElevated" | "surface" | "surface2" | "surfaceInverse" | "border" | "borderStrong" | "text" | "text2" | "textMuted" | "textInverse" | "textOnPrimary" | "primary" | "primaryPressed" | "primarySoft" | "onPrimarySoft" | "success" | "successSoft" | "onSuccessSoft" | "danger" | "dangerSoft" | "onDangerSoft" | "warning" | "warningSoft" | "onWarningSoft" | "info" | "infoSoft" | "onInfoSoft" | "focus" | "overlay";
export type Theme = Record<ColorRole, string>;

export const light: Theme = {
  bg: palette.warm[50], bgElevated: palette.warm[0], surface: palette.warm[0], surface2: palette.warm[100], surfaceInverse: palette.warm[900],
  border: palette.warm[200], borderStrong: palette.warm[400],
  text: palette.warm[900], text2: palette.warm[600], textMuted: palette.warm[500], textInverse: palette.warm[0], textOnPrimary: palette.warm[0],
  primary: palette.red[600], primaryPressed: palette.red[700], primarySoft: palette.red[50], onPrimarySoft: palette.red[700],
  success: palette.green[700], successSoft: palette.green[100], onSuccessSoft: palette.green[700],
  danger: palette.red[600], dangerSoft: palette.red[100], onDangerSoft: palette.red[700],
  warning: palette.amber[700], warningSoft: palette.amber[100], onWarningSoft: palette.amber[700],
  info: palette.sky[700], infoSoft: palette.sky[100], onInfoSoft: palette.sky[700],
  focus: palette.red[500], overlay: "rgba(28,14,14,0.55)",
};
export const dark: Theme = {
  bg: palette.warm[950], bgElevated: palette.warm[900], surface: palette.warm[850], surface2: palette.warm[800], surfaceInverse: palette.warm[50],
  border: "rgba(255,255,255,0.09)", borderStrong: "rgba(255,255,255,0.42)",
  text: palette.red[50], text2: palette.warm[300], textMuted: "#b3a29e", textInverse: palette.warm[900], textOnPrimary: palette.warm[950],
  primary: palette.red[400], primaryPressed: palette.red[300], primarySoft: "rgba(239,68,68,0.18)", onPrimarySoft: palette.red[300],
  success: palette.green[400], successSoft: "rgba(74,222,128,0.16)", onSuccessSoft: palette.green[400],
  danger: palette.red[400], dangerSoft: "rgba(249,107,107,0.16)", onDangerSoft: palette.red[300],
  warning: palette.amber[400], warningSoft: "rgba(251,191,36,0.16)", onWarningSoft: palette.amber[400],
  info: palette.sky[400], infoSoft: "rgba(56,189,248,0.16)", onInfoSoft: palette.sky[400],
  focus: palette.red[300], overlay: "rgba(0,0,0,0.65)",
};
export const contrastContract: { fg: ColorRole; bg: ColorRole; min: number; note: string }[] = [
  { fg: "text", bg: "bg", min: 7, note: "gövde metni / sayfa (AAA)" },
  { fg: "text", bg: "surface", min: 7, note: "gövde metni / kart (AAA)" },
  { fg: "text2", bg: "surface", min: 4.5, note: "ikincil metin / kart (AA)" },
  { fg: "textMuted", bg: "surface", min: 4.5, note: "soluk metin / kart (AA)" },
  { fg: "textOnPrimary", bg: "primary", min: 4.5, note: "birincil düğme metni (AA)" },
  { fg: "onPrimarySoft", bg: "primarySoft", min: 4.5, note: "yumuşak birincil rozet (AA)" },
  { fg: "onSuccessSoft", bg: "successSoft", min: 4.5, note: "başarı rozeti (AA)" },
  { fg: "onDangerSoft", bg: "dangerSoft", min: 4.5, note: "hata rozeti (AA)" },
  { fg: "onWarningSoft", bg: "warningSoft", min: 4.5, note: "uyarı rozeti (AA)" },
  { fg: "primary", bg: "surface", min: 4.5, note: "bağlantı metni / kart (AA)" },
  { fg: "borderStrong", bg: "surface", min: 3, note: "giriş alanı kenarlığı (AA)" },
];
export const space = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 } as const;
export const radius = { xs: 6, sm: 10, md: 14, lg: 20, xl: 28, full: 999 } as const;
export const type = {
  display: { size: 34, line: 40, weight: "800" as const, tracking: -0.8 },
  h1: { size: 28, line: 34, weight: "800" as const, tracking: -0.5 },
  h2: { size: 22, line: 28, weight: "700" as const, tracking: -0.3 },
  h3: { size: 17, line: 22, weight: "700" as const, tracking: 0 },
  body: { size: 16, line: 22, weight: "400" as const, tracking: 0 },
  bodyStrong: { size: 16, line: 22, weight: "600" as const, tracking: 0 },
  small: { size: 13, line: 18, weight: "400" as const, tracking: 0 },
  label: { size: 11, line: 14, weight: "700" as const, tracking: 1 },
  amount: { size: 40, line: 46, weight: "800" as const, tracking: -1 },
} as const;
export type TypeRole = keyof typeof type;
export const fontScales = { normal: 1, large: 1.15, xlarge: 1.3 } as const;
export type FontScale = keyof typeof fontScales;
export const motion = { fast: 120, base: 200, slow: 320, spring: { damping: 18, stiffness: 220 } } as const;
export const hit = { min: 44, comfortable: 48 } as const;
export const themes = { light, dark } as const;
export type ThemeName = keyof typeof themes;
