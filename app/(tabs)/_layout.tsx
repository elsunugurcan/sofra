import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { Icon, type IconName } from "@/components/Icon";
import { useStore } from "@/store";
import { useTheme } from "@/theme";
import { itemCount } from "@/lib/order";

export default function TabsLayout() {
  const { c } = useTheme(); const n = useStore((s) => itemCount(s.cart.lines));
  const tab = (title: string, icon: IconName, badge?: number) => ({ title, tabBarIcon: ({ color }: { color: ColorValue }) => <Icon name={icon} size={22} color={String(color)} stroke={2.2} />, tabBarBadge: badge || undefined, tabBarBadgeStyle: { backgroundColor: c.primary, color: c.textOnPrimary, fontSize: 10, fontWeight: "700" as const } });
  return (
    <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg }, tabBarActiveTintColor: c.primary, tabBarInactiveTintColor: c.textMuted, tabBarStyle: { backgroundColor: c.bgElevated, borderTopColor: c.border, height: 64, paddingTop: 6 }, tabBarLabelStyle: { fontSize: 10.5, fontWeight: "600", marginBottom: 6 }, tabBarItemStyle: { paddingHorizontal: 0 }, tabBarAllowFontScaling: false }}>
      <Tabs.Screen name="index" options={tab("Keşfet", "home")} />
      <Tabs.Screen name="ara" options={tab("Ara", "search")} />
      <Tabs.Screen name="sepet" options={tab("Sepet", "cart", n)} />
      <Tabs.Screen name="siparisler" options={tab("Siparişler", "clock")} />
      <Tabs.Screen name="profil" options={tab("Profil", "user")} />
    </Tabs>
  );
}
