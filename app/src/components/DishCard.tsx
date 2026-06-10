import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';
import type { ScoredDish } from '@/types/api';
import { Button } from './Button';
import { Card } from './Card';
import { Pill } from './Pill';

type Props = {
  dish: ScoredDish;
  onAdd?: () => void;
  adding?: boolean;
  highlight?: boolean;
};

export function DishCard({ dish, onAdd, adding = false, highlight = false }: Props) {
  return (
    <Card style={highlight ? { borderColor: theme.color.pink, borderWidth: 2 } : undefined}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{dish.name}</Text>
        <Pill verdict={dish.verdict} />
      </View>

      <View style={styles.macros}>
        <Macro label="kcal" value={dish.calories.point} big />
        <Macro label="protein" value={`${dish.protein_g.point}g`} />
        <Macro label="fibre" value={`${dish.fibre_g.point}g`} />
      </View>

      {!!dish.why && <Text style={styles.why}>{dish.why}</Text>}

      {dish.modifications.length > 0 && (
        <View style={styles.mods}>
          <Text style={styles.modsTitle}>Smart order</Text>
          {dish.modifications.map((m, i) => (
            <Text key={i} style={styles.mod}>
              • {m}
            </Text>
          ))}
        </View>
      )}

      {onAdd && (
        <Button
          title={adding ? 'Adding…' : 'Add to Today'}
          onPress={onAdd}
          loading={adding}
          style={{ marginTop: theme.spacing.md }}
        />
      )}
    </Card>
  );
}

function Macro({ label, value, big = false }: { label: string; value: string | number; big?: boolean }) {
  return (
    <View style={styles.macro}>
      <Text style={[styles.macroValue, big && { fontSize: theme.fontSize.title }]}>{value}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  name: { flex: 1, fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary },
  macros: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
  macro: { alignItems: 'flex-start' },
  macroValue: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary },
  macroLabel: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary },
  why: { marginTop: theme.spacing.md, color: theme.color.textSecondary, fontSize: theme.fontSize.body, lineHeight: 20 },
  mods: { marginTop: theme.spacing.md },
  modsTitle: { fontSize: theme.fontSize.caption, fontWeight: '700', color: theme.color.purple, marginBottom: 4 },
  mod: { color: theme.color.textPrimary, fontSize: theme.fontSize.body, lineHeight: 22 },
});
