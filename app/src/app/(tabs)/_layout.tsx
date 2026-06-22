import { Tabs } from 'expo-router';

import { Icon, IconName } from '@/components';
import { theme } from '@/theme';

const tabIcon =
  (filled: IconName, outline: IconName) =>
  ({ focused, color }: { focused: boolean; color: string }) =>
    <Icon name={focused ? filled : outline} size={24} color={color} />;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.color.pink,
        tabBarInactiveTintColor: theme.color.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.color.card,
          borderTopColor: theme.color.border,
          height: 64,
          paddingTop: 6,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="today" options={{ title: 'Today', tabBarIcon: tabIcon('home', 'homeOutline') }} />
      <Tabs.Screen name="scanner" options={{ title: 'Scan', tabBarIcon: tabIcon('scan', 'scanOutline') }} />
      <Tabs.Screen name="history" options={{ title: 'Log', tabBarIcon: tabIcon('calendar', 'calendarOutline') }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: tabIcon('chart', 'chartOutline') }} />
      <Tabs.Screen name="settings" options={{ title: 'Profile', tabBarIcon: tabIcon('person', 'personOutline') }} />
    </Tabs>
  );
}
