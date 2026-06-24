import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useRouter } from 'expo-router';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { Button, Field, Icon, OptionRow, ScreenContainer } from '@/components';
import { useSession } from '@/features/auth/useSession';
import { lastScan } from '@/features/scan/lastScan';
import { useScan } from '@/features/scan/useScan';
import { useToday } from '@/features/today/useToday';
import { theme } from '@/theme';
import type { ScanRequest } from '@/types/api';

export default function Scanner() {
  const router = useRouter();
  const scan = useScan();
  const { session } = useSession();
  const { data: today } = useToday(session?.user?.id);
  const [restaurant, setRestaurant] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const consumed = today?.totals ?? { calories: 0, protein_g: 0, fibre_g: 0, carbs_g: 0, fat_g: 0 };
  const busy = scan.isPending;

  const runScan = async (req: ScanRequest) => {
    try {
      const result = await scan.mutateAsync({
        ...req,
        restaurant_name: restaurant.trim() || req.restaurant_name || null,
        consumed,
      });
      lastScan.set(result);
      router.push('/scan/result');
    } catch (e) {
      Alert.alert(
        'Scan failed',
        e instanceof Error ? e.message : 'Please try again. Is the FitBite service running?',
      );
    }
  };

  // Resize + compress client-side to keep the vision payload small (cost/latency).
  const toBase64 = async (uri: string): Promise<string> => {
    const context = ImageManipulator.manipulate(uri);
    context.resize({ width: 1600 });
    const rendered = await context.renderAsync();
    const out = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.6, base64: true });
    if (!out.base64) throw new Error('Could not read the image.');
    return out.base64;
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera needed', 'Enable camera access in Settings, or type the restaurant name instead.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 });
    if (res.canceled) return;
    await runScan({ source: 'photo', image_base64: await toBase64(res.assets[0].uri) });
  };

  const uploadImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photos needed', 'Enable photo access in Settings, or type the restaurant name instead.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (res.canceled) return;
    await runScan({ source: 'upload', image_base64: await toBase64(res.assets[0].uri) });
  };

  const scanByName = async () => {
    if (!restaurant.trim()) {
      Alert.alert('Restaurant name', 'Type a restaurant name to look up its menu.');
      return;
    }
    await runScan({ source: 'text', menu_text: restaurant.trim() });
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Scan a menu</Text>
      <Text style={styles.sub}>Get instant insights and smarter choices.</Text>

      {/* Clipboard of scan options */}
      <View style={styles.boardWrap}>
        <View style={styles.boardBack} />
        <View style={styles.board}>
          <View style={styles.clip}>
            <View style={styles.clipBar} />
          </View>
          <View style={{ gap: theme.spacing.md }}>
            <OptionRow icon="camera" title="Take a photo" subtitle="Capture the menu" onPress={takePhoto} disabled={busy} />
            <OptionRow icon="image" title="Upload screenshot" subtitle="Choose from your gallery" tint={theme.color.indigo} onPress={uploadImage} disabled={busy} />
            <OptionRow
              icon="search"
              title="Search restaurant"
              subtitle="Type the restaurant name"
              tint={theme.color.berry}
              onPress={() => setShowSearch((s) => !s)}
              disabled={busy}
            />
          </View>
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchBox}>
          <Field
            label="Restaurant name"
            value={restaurant}
            onChangeText={setRestaurant}
            autoCapitalize="words"
            placeholder="e.g. Nando's"
            autoFocus
          />
          <Button title="Find best options" onPress={scanByName} loading={busy} disabled={busy} />
        </View>
      )}

      <View style={styles.hint}>
        <Icon name="sparkles" size={16} color={theme.color.pink} />
        <Text style={styles.hintText}>We&apos;ll find the menu and extract the items.</Text>
      </View>

      {busy && <Text style={styles.muted}>Reading the menu and ranking dishes…</Text>}
      <Text style={styles.disclaimer}>Estimates only — actual values vary by kitchen and portion.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: theme.fontSize.headline, fontWeight: '800', color: theme.color.textPrimary, marginTop: theme.spacing.md, textAlign: 'center' },
  sub: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, marginBottom: theme.spacing.xl, textAlign: 'center' },
  boardWrap: { marginTop: theme.spacing.lg },
  // A faint offset sheet behind the board for a stacked-paper feel.
  boardBack: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 8,
    bottom: -8,
    backgroundColor: '#F6E8D2',
    borderRadius: theme.radius.xl,
    opacity: 0.7,
  },
  board: {
    backgroundColor: '#FCF3E4',
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
    shadowColor: '#A9762B',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  clip: {
    position: 'absolute',
    top: -14,
    alignSelf: 'center',
    width: 92,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#D8C29A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clipBar: { width: 54, height: 8, borderRadius: 4, backgroundColor: '#B6976A' },
  searchBox: { marginTop: theme.spacing.lg, gap: theme.spacing.sm },
  hint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: theme.spacing.lg },
  hintText: { color: theme.color.textSecondary, fontSize: theme.fontSize.body },
  muted: { color: theme.color.textSecondary, fontSize: theme.fontSize.body, marginTop: theme.spacing.lg, textAlign: 'center' },
  disclaimer: { color: theme.color.textSecondary, fontSize: theme.fontSize.caption, marginTop: theme.spacing.xl, textAlign: 'center' },
});
