import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { Button, Card, Field, Icon, OptionRow, ScreenContainer, Thumb } from '@/components';
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
      <Text style={styles.sub}>Three simple ways to find your best bite in seconds.</Text>

      <Card style={styles.illustration}>
        <Thumb size={88} radius={theme.radius.lg} icon="restaurant" />
        <Text style={styles.illustrationText}>Point at a menu, drop in a screenshot, or just name the place.</Text>
      </Card>

      <View style={{ gap: theme.spacing.sm }}>
        <OptionRow icon="camera" title="Take a photo" subtitle="Snap the menu in front of you" onPress={takePhoto} disabled={busy} />
        <OptionRow icon="image" title="Upload a screenshot" subtitle="Use a photo from your library" tint={theme.color.purple} onPress={uploadImage} disabled={busy} />
      </View>

      <Card style={{ marginTop: theme.spacing.lg }}>
        <View style={styles.searchHeader}>
          <Icon name="search" size={18} color={theme.color.berry} />
          <Text style={styles.searchTitle}>Search a restaurant</Text>
        </View>
        <Field
          label="Restaurant name"
          value={restaurant}
          onChangeText={setRestaurant}
          autoCapitalize="words"
          placeholder="e.g. Nando's"
        />
        <Button title="Find best options" onPress={scanByName} loading={busy} disabled={busy} />
      </Card>

      {busy && <Text style={styles.muted}>Reading the menu and ranking dishes…</Text>}
      <Text style={styles.disclaimer}>Estimates only — actual values vary by kitchen and portion.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: theme.fontSize.title, fontWeight: '700', color: theme.color.textPrimary, marginTop: theme.spacing.md },
  sub: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, marginBottom: theme.spacing.lg },
  illustration: { alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.lg },
  illustrationText: { textAlign: 'center', color: theme.color.textSecondary, fontSize: theme.fontSize.body, lineHeight: 20 },
  searchHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: theme.spacing.sm },
  searchTitle: { fontSize: theme.fontSize.body, fontWeight: '700', color: theme.color.textPrimary },
  muted: { color: theme.color.textSecondary, fontSize: theme.fontSize.body, marginTop: theme.spacing.lg, textAlign: 'center' },
  disclaimer: { color: theme.color.textSecondary, fontSize: theme.fontSize.caption, marginTop: theme.spacing.xl, textAlign: 'center' },
});
