import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { cardShadow, theme, verdictLabel } from '@/theme';
import type { ScoredDish, Verdict } from '@/types/api';
import { Tag, TagTone } from './Tag';
import { Thumb } from './Thumb';

type Props = {
  dish: ScoredDish;
  onPress?: () => void;
  highlight?: boolean;
};

const TONE: Record<Verdict, TagTone> = {
  great: 'good',
  good_with_mods: 'info',
  calorie_dense: 'warn',
  hard_to_track: 'neutral',
  not_ideal: 'bad',
};

/** Menu-result row: food thumbnail, name + description, calories and a
 * verdict tag (or "Best match" for the highlighted top pick). */
export function DishCard({ dish, onPress, highlight = false }: Props) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, highlight && styles.highlight, { opacity: pressed ? 0.92 : 1 }]}
    >
      <Thumb size={60} name={dish.name} />
      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={1}>
          {dish.name}
        </Text>
        {!!dish.description && (
          <Text style={styles.desc} numberOfLines={2}>
            {dish.description}
          </Text>
        )}
      </View>
      <View style={styles.right}>
        <Text style={styles.kcal}>
          {dish.calories.point.toLocaleString()}
          <Text style={styles.kcalUnit}> kcal</Text>
        </Text>
        <Tag
          label={highlight ? 'Best match' : verdictLabel(dish.verdict)}
          tone={highlight ? 'good' : TONE[dish.verdict] ?? 'neutral'}
        />
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
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    ...cardShadow(),
  },
  highlight: { borderColor: theme.color.pink, borderWidth: 2 },
  middle: { flex: 1, gap: 3 },
  name: { fontSize: theme.fontSize.body, fontWeight: '700', color: theme.color.textPrimary },
  desc: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary, lineHeight: 17 },
  right: { alignItems: 'flex-end', gap: 5 },
  kcal: { fontSize: theme.fontSize.subtitle, fontWeight: '800', color: theme.color.pink },
  kcalUnit: { fontSize: theme.fontSize.caption, fontWeight: '700', color: theme.color.textSecondary },
});
