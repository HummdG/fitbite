import { Text } from 'react-native';
import { Tabs } from 'expo-router';

import { theme } from '@/theme';

const tabIcon =
  (emoji: string) =>
  ({ focused }: { focused: boolean }) =>
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.color.pink,
        tabBarInactiveTintColor: theme.color.textSecondary,
        tabBarStyle: { backgroundColor: theme.color.card, borderTopColor: theme.color.border },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen name="today" options={{ title: 'Today', tabBarIcon: tabIcon('🏠') }} />
      <Tabs.Screen name="scanner" options={{ title: 'Scan', tabBarIcon: tabIcon('📷') }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: tabIcon('🕘') }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: tabIcon('📈') }} />
      <Tabs.Screen name="saved" options={{ title: 'Saved', tabBarIcon: tabIcon('⭐') }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: tabIcon('⚙️') }} />
    </Tabs>
  );
}
