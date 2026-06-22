import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme, verdictColor } from '@/theme';
import type { ScoredDish } from '@/types/api';
import { Icon } from './Icon';
import { MacroChips } from './MacroChips';
import { Pill } from './Pill';
import { Thumb } from './Thumb';

type Props = {
  dish: ScoredDish;
  onPress?: () => void;
  highlight?: boolean;
};

/** Compact, tappable menu-result row: thumbnail, name, verdict, macro chips and
 * a verdict-coloured fit score. Tapping opens the item-details screen. */
export function DishCard({ dish, onPress, highlight = false }: Props) {
  const score = Math.round(dish.fit_score * 100);
  const color = verdictColor(dish.verdict);

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, highlight && styles.highlight, { opacity: pressed ? 0.92 : 1 }]}
    >
      <Thumb size={60} />
      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={1}>
          {dish.name}
        </Text>
        <View style={styles.pillRow}>
          <Pill verdict={dish.verdict} />
        </View>
        <MacroChips
          calories={dish.calories.point}
          protein={dish.protein_g.point}
          carbs={dish.carbs_g.point}
          fat={dish.fat_g.point}
          style={{ marginTop: 6 }}
        />
      </View>
      <View style={styles.right}>
        <Text style={[styles.score, { color }]}>{score}</Text>
        <Text style={styles.scoreCaption}>fit</Text>
        {onPress && <Icon name="chevron" size={18} color={theme.color.textSecondary} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.color.card,
    borderColor: theme.color.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    shadowColor: theme.shadow.card.color,
    shadowOpacity: theme.shadow.card.opacity,
    shadowRadius: theme.shadow.card.radius,
    shadowOffset: { width: 0, height: theme.shadow.card.offsetY },
    elevation: 2,
  },
  highlight: { borderColor: theme.color.pink, borderWidth: 2 },
  middle: { flex: 1, gap: 2 },
  name: { fontSize: theme.fontSize.body, fontWeight: '700', color: theme.color.textPrimary },
  pillRow: { flexDirection: 'row', marginTop: 2 },
  right: { alignItems: 'center', minWidth: 40 },
  score: { fontSize: theme.fontSize.title, fontWeight: '800' },
  scoreCaption: { fontSize: 10, color: theme.color.textSecondary, marginTop: -2, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
});
