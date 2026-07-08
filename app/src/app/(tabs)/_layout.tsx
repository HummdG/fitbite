import { Tabs } from 'expo-router';

import { Icon, IconName } from '@/components';
import { theme } from '@/theme';

const tabIcon =
  (name: IconName) =>
  ({ focused, color }: { focused: boolean; color: string }) =>
    <Icon name={name} size={24} color={color} weight={focused ? 'fill' : 'regular'} />;

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
        tabBarLabelStyle: { fontSize: 11, fontFamily: theme.fontFamily.semibold },
      }}
    >
      <Tabs.Screen name="today" options={{ title: 'Today', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="scanner" options={{ title: 'Scan', tabBarIcon: tabIcon('scan') }} />
      <Tabs.Screen name="history" options={{ title: 'Log', tabBarIcon: tabIcon('calendar') }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: tabIcon('chart') }} />
      <Tabs.Screen name="settings" options={{ title: 'Profile', tabBarIcon: tabIcon('person') }} />
    </Tabs>
  );
}
