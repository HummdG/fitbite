import type { IconName } from '@/components/Icon';
import { theme, withAlpha } from '@/theme';

const C = theme.color;

export type FoodTile = {
  icon: IconName;
  /** Strong brand tone used for the icon + accents. */
  base: string;
  /** Two-stop soft gradient for the tile background. */
  gradient: readonly [string, string];
};

type Rule = { icon: IconName; base: string; keywords: string[] };

// First match wins, so order from most-specific to most-generic.
const RULES: Rule[] = [
  { icon: 'fish', base: C.purple, keywords: ['salmon', 'tuna', 'fish', 'seafood', 'prawn', 'shrimp', 'cod', 'sushi'] },
  { icon: 'leaf', base: C.candyPink, keywords: ['salad', 'greens', 'kale', 'spinach', 'slaw', 'veg'] },
  { icon: 'pizza', base: C.pink, keywords: ['pizza', 'flatbread'] },
  { icon: 'fastFood', base: C.berry, keywords: ['wrap', 'burrito', 'taco'] },
  { icon: 'fastFood', base: C.berry, keywords: ['burger', 'sandwich', 'fries', 'kebab', 'hot dog'] },
  { icon: 'bowl', base: C.berry, keywords: ['noodle', 'ramen', 'soup', 'pho'] },
  { icon: 'bowl', base: C.berry, keywords: ['pasta', 'spaghetti'] },
  { icon: 'bowl', base: C.berry, keywords: ['rice', 'curry', 'bowl', 'stir', 'poke', 'biryani'] },
  { icon: 'egg', base: C.candyPink, keywords: ['egg', 'omelet', 'omelette'] },
  { icon: 'dessert', base: C.pink, keywords: ['cake', 'cookie', 'ice cream', 'dessert', 'sweet', 'chocolate', 'brownie', 'donut', 'pancake'] },
  { icon: 'cafe', base: C.purple, keywords: ['coffee', 'latte', 'cappuccino', 'espresso', 'tea', 'mocha'] },
  { icon: 'drink', base: C.purple, keywords: ['juice', 'smoothie', 'shake', 'soda', 'drink', 'lemonade'] },
  { icon: 'cereal', base: C.candyPink, keywords: ['oat', 'cereal', 'yogurt', 'yoghurt', 'granola', 'berries', 'breakfast', 'fruit', 'porridge'] },
  { icon: 'restaurant', base: C.pink, keywords: ['chicken', 'beef', 'steak', 'meat', 'pork', 'lamb', 'grill', 'lentil', 'bean', 'dal'] },
];

/**
 * Derives a stable, on-brand "tile" (category icon + tint + soft gradient) from
 * a dish name. This is FitBite's deliberate stand-in for real food photography —
 * every dish gets a colourful, varied thumbnail without any image data.
 */
export function foodTile(name?: string): FoodTile {
  const n = (name ?? '').toLowerCase();
  const match = RULES.find((r) => r.keywords.some((k) => n.includes(k)));
  const base = match?.base ?? C.pink;
  const icon = match?.icon ?? 'restaurant';
  return { icon, base, gradient: [withAlpha(base, 0x3a), withAlpha(base, 0x14)] };
}
