import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useStore } from "@/store";
import { ThemeProvider, useTheme } from "@/theme";

function Root() {
  const { c, name } = useTheme();
  return (
    <>
      <StatusBar style={name === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg }, animation: "slide_from_right" }}>
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
        <Stack.Screen name="urun" options={{ presentation: "modal" }} />
        <Stack.Screen name="adres-ekle" options={{ presentation: "modal" }} />
        <Stack.Screen name="siparis/[id]" options={{ animation: "fade", gestureEnabled: false }} />
      </Stack>
    </>
  );
}
export default function RootLayout() {
  const [hydrated, setHydrated] = useState(useStore.persist.hasHydrated());
  useEffect(() => {
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true));
    if (useStore.persist.hasHydrated()) setHydrated(true);
    if (Platform.OS === "web") { document.documentElement.lang = "tr"; (globalThis as unknown as { Sofra: typeof useStore }).Sofra = useStore; }
    return unsub;
  }, []);
  return <SafeAreaProvider><ThemeProvider>{hydrated ? <Root /> : <View style={{ flex: 1, backgroundColor: "#fbf7f5", alignItems: "center", justifyContent: "center" }}><ActivityIndicator color="#d92d2d" /></View>}</ThemeProvider></SafeAreaProvider>;
}
