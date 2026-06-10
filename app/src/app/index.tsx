import { ActivityIndicator, View } from 'react-native';

import { theme } from '@/theme';

// The AuthGate in _layout redirects away from here based on session/profile.
export default function Index() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.color.background }}>
      <ActivityIndicator size="large" color={theme.color.pink} />
    </View>
  );
}
