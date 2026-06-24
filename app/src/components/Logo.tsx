import { Image, ImageStyle, StyleProp } from 'react-native';

// The real FitBite artwork (Logo V2) with its background keyed out — generated
// from assets/logo.png by `node scripts/gen-icons.mjs`. Using the actual art (not
// a redrawn vector) keeps the logo pixel-identical to the brand mark; the wordmark
// font is baked into the lockup, so it always matches regardless of the UI font.
const LOCKUP = require('../../assets/logo-lockup.png');
const MARK = require('../../assets/logo-mark.png');

// Intrinsic aspect ratios (width / height) of the trimmed exports.
const LOCKUP_RATIO = 841 / 737;
const MARK_RATIO = 583 / 450;

type Props = {
  /** Rendered width in px (height follows the artwork's aspect ratio). */
  size?: number;
  style?: StyleProp<ImageStyle>;
};

/** The cloche mark only (no wordmark). */
export function LogoMark({ size = 96, style }: Props) {
  return (
    <Image
      source={MARK}
      resizeMode="contain"
      style={[{ width: size, height: Math.round(size / MARK_RATIO) }, style]}
    />
  );
}

/** The full FitBite lockup — cloche mark above the "FitBite" wordmark. */
export function Logo({ size = 208, style }: Props) {
  return (
    <Image
      source={LOCKUP}
      resizeMode="contain"
      style={[{ width: size, height: Math.round(size / LOCKUP_RATIO) }, style]}
    />
  );
}
