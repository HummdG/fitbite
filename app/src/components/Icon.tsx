import { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

// Curated semantic icon set → Ionicons glyphs, so call sites stay stable even if
// we swap the underlying font later.
export const ICONS = {
  home: 'home',
  homeOutline: 'home-outline',
  scan: 'scan',
  scanOutline: 'scan-outline',
  camera: 'camera-outline',
  image: 'image-outline',
  search: 'search-outline',
  calendar: 'calendar',
  calendarOutline: 'calendar-outline',
  chart: 'stats-chart',
  chartOutline: 'stats-chart-outline',
  person: 'person',
  personOutline: 'person-outline',
  plus: 'add',
  trash: 'trash-outline',
  chevron: 'chevron-forward',
  chevronBack: 'chevron-back',
  chevronDown: 'chevron-down',
  flame: 'flame-outline',
  flameFilled: 'flame',
  close: 'close',
  check: 'checkmark',
  checkCircle: 'checkmark-circle',
  restaurant: 'restaurant-outline',
  fastFood: 'fast-food-outline',
  pizza: 'pizza-outline',
  cafe: 'cafe-outline',
  drink: 'wine-outline',
  dessert: 'ice-cream-outline',
  fish: 'fish-outline',
  egg: 'egg-outline',
  bowl: 'restaurant',
  sunny: 'sunny',
  sparkles: 'sparkles',
  nutrition: 'nutrition-outline',
  muscle: 'barbell-outline',
  leaf: 'leaf-outline',
  loseWeight: 'trending-down-outline',
  gainWeight: 'trending-up-outline',
  maintain: 'reorder-two-outline',
  calories: 'flame-outline',
  protein: 'fitness-outline',
  carbs: 'pizza-outline',
  fat: 'water-outline',
  fibre: 'leaf-outline',
  water: 'water-outline',
  weight: 'body-outline',
  height: 'resize-outline',
  flag: 'flag-outline',
  steps: 'footsteps-outline',
  relaxed: 'happy-outline',
  balanced: 'speedometer-outline',
  strict: 'locate-outline',
  heart: 'heart',
  heartOutline: 'heart-outline',
  settings: 'settings-outline',
  logout: 'log-out-outline',
  edit: 'create-outline',
  add: 'add-circle-outline',
  swap: 'swap-horizontal-outline',
  info: 'information-circle-outline',
} satisfies Record<string, IoniconName>;

export type IconName = keyof typeof ICONS;

type Props = { name: IconName; size?: number; color?: string };

export function Icon({ name, size = 22, color = theme.color.textPrimary }: Props) {
  return <Ionicons name={ICONS[name]} size={size} color={color} />;
}
