import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
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

// Warm-paper palette for the notepad. Kept local to the scan screen — it's the one
// place in the app that renders "paper on a desk" rather than the brand surfaces.
// The board sits as warm paper on the app's own background (no desk override).
const PAPER = {
  sheet: '#FBF4E6',
  sheetBack1: '#F2E7D0',
  sheetBack2: '#EADEC3',
  ink: '#8C7B67',
  pencil: '#C7A876',
};

/**
 * A soft-3D clipboard clip that straddles the top of the pad, matching the mockup:
 * a pillowed tan plate with a spring-housing nub peeking above it, a glossy top
 * highlight, a lower bevel for thickness, and a contact shadow onto the board.
 * Built with react-native-svg gradients so it reads as a moulded object, not a chip.
 */
function ClipboardClip() {
  return (
    <Svg width={176} height={68} viewBox="0 0 176 68" fill="none">
      <Defs>
        <LinearGradient id="clipPlate" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F5E7CB" />
          <Stop offset="1" stopColor="#DBC293" />
        </LinearGradient>
        <LinearGradient id="clipNub" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#EFDEBB" />
          <Stop offset="1" stopColor="#D2B683" />
        </LinearGradient>
      </Defs>
      {/* Soft contact shadow cast onto the board. */}
      <Rect x={30} y={36} width={116} height={28} rx={14} fill="#8A6524" opacity={0.13} />
      {/* Spring housing peeking above the plate. */}
      <Rect x={64} y={6} width={48} height={30} rx={13} fill="url(#clipNub)" />
      <Rect x={72} y={11} width={32} height={7} rx={3.5} fill="#FFFFFF" opacity={0.35} />
      {/* Main clip plate. */}
      <Rect x={26} y={24} width={124} height={36} rx={16} fill="url(#clipPlate)" />
      {/* Glossy top highlight + lower bevel to give real thickness. */}
      <Rect x={38} y={29} width={100} height={8} rx={4} fill="#FFFFFF" opacity={0.42} />
      <Rect x={34} y={50} width={108} height={7} rx={3.5} fill="#B4954D" opacity={0.3} />
    </Svg>
  );
}

/** Hand-drawn curl-up arrow that points from the caption back at the notepad. */
function CurlyArrow() {
  return (
    <Svg width={40} height={48} viewBox="0 0 40 48" fill="none">
      <Path
        d="M33 45 C 13 42 7 27 16 12"
        stroke={PAPER.pencil}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <Path
        d="M9 19 L16 10 L24 16"
        stroke={PAPER.pencil}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function Scanner() {
  const router = useRouter();
  const scan = useScan();
  const { session } = useSession();
  const { data: today } = useToday(session?.user?.id);
  const [restaurant, setRestaurant] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const consumed = today?.totals ?? { calories: 0, protein_g: 0, fibre_g: 0, carbs_g: 0, fat_g: 0 };
  const busy = scan.isPending;
  const canGoBack = router.canGoBack();

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
    <ScreenContainer scroll={false}>
      {/* Header — back affordance (only when there's history) + a decorative "instant" bolt. */}
      <View style={styles.header}>
        {canGoBack ? (
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Icon name="chevronBack" size={26} color={theme.color.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
        <Icon name="flash" size={22} color={theme.color.textPrimary} />
      </View>

      <Text style={styles.title}>Scan a menu</Text>
      <Text style={styles.sub}>Get instant insights and smarter choices.</Text>

      {/* Clipboard: a stack of warm paper sheets, gripped by a moulded clip, holding the options. */}
      <View style={styles.boardWrap}>
        <View style={styles.boardStack}>
          <View style={[styles.sheet, styles.sheetBack2]} />
          <View style={[styles.sheet, styles.sheetBack1]} />

          <View style={styles.board}>
            <View style={styles.cards}>
              <OptionRow
                icon="camera"
                title="Take a photo"
                subtitle="Capture the menu"
                onPress={takePhoto}
                disabled={busy}
                trailing={null}
                style={styles.card}
              />
              <OptionRow
                icon="image"
                title="Upload screenshot"
                subtitle="Choose from your gallery"
                tint={theme.color.indigo}
                onPress={uploadImage}
                disabled={busy}
                trailing={null}
                style={styles.card}
              />
              <OptionRow
                icon="search"
                title="Search restaurant"
                subtitle="Type the restaurant name"
                tint={theme.color.purple}
                onPress={() => setShowSearch((s) => !s)}
                disabled={busy}
                trailing={null}
                style={styles.card}
              />
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
          </View>

          {/* Realistic clipboard clip, straddling the top edge and sitting above the board. */}
          <View style={styles.clipWrap} pointerEvents="none">
            <ClipboardClip />
          </View>
        </View>

        {/* Caption sits on the "desk" below the pad, with a hand-drawn nudge back up. */}
        <View style={styles.footer}>
          <View style={styles.arrow}>
            <CurlyArrow />
          </View>
          <Text style={styles.caption}>We&apos;ll find the menu and extract the items.</Text>
          {busy ? (
            <Text style={styles.busy}>Reading the menu and ranking dishes…</Text>
          ) : (
            <Text style={styles.disclaimer}>Estimates only — actual values vary by kitchen and portion.</Text>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  headerSpacer: { width: 26, height: 26 },
  title: {
    fontSize: theme.fontSize.headline,
    fontWeight: '800',
    color: theme.color.textPrimary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  sub: {
    fontSize: theme.fontSize.body,
    color: PAPER.ink,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },

  // The notepad + its caption are centred together as one block on the desk.
  boardWrap: { flex: 1, justifyContent: 'center' },
  boardStack: { position: 'relative' },

  // Offset sheets peeking out behind the top sheet — the "stack of paper" depth.
  sheet: { position: 'absolute', borderRadius: 24 },
  sheetBack1: {
    top: 5,
    bottom: -6,
    left: 9,
    right: -8,
    backgroundColor: PAPER.sheetBack1,
    transform: [{ rotate: '2deg' }],
  },
  sheetBack2: {
    top: 12,
    bottom: -12,
    left: -6,
    right: 11,
    backgroundColor: PAPER.sheetBack2,
    transform: [{ rotate: '-2.6deg' }],
  },

  // The moulded clipboard clip, lifted above the board so its nub reads above the edge.
  clipWrap: {
    position: 'absolute',
    top: -24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 6,
    elevation: 9,
  },

  board: {
    backgroundColor: PAPER.sheet,
    borderRadius: 24,
    paddingHorizontal: theme.spacing.lg,
    // Extra top room so the clip plate sits clear of the first card.
    paddingTop: theme.spacing.xxl + theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    shadowColor: '#8A6524',
    shadowOpacity: 0.17,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 5,
  },
  cards: { gap: theme.spacing.md },
  // Clean white tiles, borderless, with a soft warm lift off the paper.
  card: {
    borderWidth: 0,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.md + 2,
    shadowColor: '#6B4E1F',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  searchBox: { marginTop: theme.spacing.md, gap: theme.spacing.sm },

  footer: { marginTop: theme.spacing.xl, alignItems: 'center', paddingHorizontal: theme.spacing.xl },
  arrow: { position: 'absolute', left: theme.spacing.sm, top: -8 },
  caption: { color: PAPER.ink, fontSize: theme.fontSize.body, textAlign: 'center', maxWidth: 250 },
  busy: { color: theme.color.pink, fontSize: theme.fontSize.caption, marginTop: theme.spacing.sm, textAlign: 'center' },
  disclaimer: {
    color: PAPER.ink,
    fontSize: theme.fontSize.caption,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    opacity: 0.8,
  },
});
