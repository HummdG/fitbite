import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { localDateKey } from '@/features/today/useToday';
import { theme } from '@/theme';
import { Icon } from './Icon';

type Props = {
  month: Date; // any date within the displayed month
  selected: string; // 'YYYY-MM-DD'
  marked: Set<string>; // days that have logs (within budget)
  overBudget?: Set<string>; // logged days that exceeded the calorie target
  onSelect: (key: string) => void;
  onPrev: () => void;
  onNext: () => void;
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function key(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function Calendar({ month, selected, marked, overBudget, onSelect, onPrev, onNext }: Props) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstWeekday = new Date(year, m, 1).getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const today = localDateKey();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={onPrev} hitSlop={8}>
          <Icon name="chevronBack" size={22} color={theme.color.pink} />
        </Pressable>
        <Text style={styles.title}>
          {MONTHS[m]} {year}
        </Text>
        <Pressable accessibilityRole="button" onPress={onNext} hitSlop={8}>
          <Icon name="chevron" size={22} color={theme.color.pink} />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((d, i) => (
          <Text key={i} style={styles.weekday}>
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (day === null) return <View key={i} style={styles.cell} />;
          const k = key(year, m, day);
          const isSel = k === selected;
          const isToday = k === today;
          const over = overBudget?.has(k);
          const logged = marked.has(k);
          const dotColor = over ? theme.color.indigo : logged ? theme.color.candyPink : 'transparent';
          return (
            <Pressable key={i} style={styles.cell} onPress={() => onSelect(k)} accessibilityRole="button">
              <View
                style={[
                  styles.dayCircle,
                  isSel && styles.dayCircleSel,
                  !isSel && isToday && styles.dayCircleToday,
                ]}
              >
                <Text style={[styles.dayText, (isSel || (!isSel && isToday)) && styles.dayTextOn]}>{day}</Text>
              </View>
              <View style={[styles.dot, { backgroundColor: isSel ? 'transparent' : dotColor }]} />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legend}>
        <LegendDot color={theme.color.candyPink} label="Logged" />
        <LegendDot color={theme.color.indigo} label="Over budget" />
        <LegendDot color={theme.color.textPrimary} label="Today" filled />
      </View>
    </View>
  );
}

function LegendDot({ color, label, filled }: { color: string; label: string; filled?: boolean }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, filled ? { backgroundColor: color } : { borderWidth: 2, borderColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md },
  title: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekday: { width: `${100 / 7}%`, textAlign: 'center', fontSize: theme.fontSize.caption, color: theme.color.textSecondary, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  dayCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  dayCircleSel: { backgroundColor: theme.color.pink },
  dayCircleToday: { backgroundColor: theme.color.textPrimary },
  dayText: { fontSize: theme.fontSize.body, color: theme.color.textPrimary },
  dayTextOn: { color: theme.color.white, fontWeight: '700' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'transparent' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, marginTop: theme.spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendText: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary },
});
