// Regenerates every raster brand asset in app/assets/ from the flat FitBite
// cloche mark, so the launcher icon, splash and favicon match the in-app SVG
// logo. Run once after changing the mark: `node scripts/gen-icons.mjs`.
//
// The mark is pure vector shapes (paths/circles/gradients/mask) — no text — so
// the SVG rasterizer never needs a font installed.
import sharp from 'sharp';
import { join } from 'node:path';

const ASSETS = join(process.cwd(), 'assets');
const PLUM = '#450B68';

/** The cloche mark drawn in a 0..120 box. `mono` flattens it to one flat colour. */
function markBody(mono = false) {
  const fill = mono ? PLUM : 'url(#d)';
  const stroke = mono ? PLUM : PLUM;
  const sw = 5;
  return `
    <defs>
      <linearGradient id="d" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FB6FB0"/>
        <stop offset="0.55" stop-color="#F13A94"/>
        <stop offset="1" stop-color="#B5179E"/>
      </linearGradient>
      <mask id="bite">
        <rect x="0" y="0" width="120" height="120" fill="#fff"/>
        <circle cx="85" cy="54" r="15" fill="#000"/>
      </mask>
    </defs>
    <rect x="20" y="84" width="80" height="11" rx="5.5" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>
    <g mask="url(#bite)">
      <path d="M 30 84 A 30 30 0 0 1 90 84 Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>
      <circle cx="60" cy="49" r="5.5" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
    </g>`;
}

/** Wrap the mark, scaled about its visual centre (~60,70) and re-centred in the box. */
function markScaled(scale, mono = false) {
  return `<g transform="translate(60 60) scale(${scale}) translate(-60 -70)">${markBody(mono)}</g>`;
}

function svg(px, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 120 120">${inner}</svg>`;
}

const BG = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#FFF0F7"/>
      <stop offset="1" stop-color="#FFD9EC"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" fill="url(#bg)"/>`;

const targets = [
  // Full-bleed app icon: gentle pink wash + centred mark.
  { file: 'icon.png', px: 1024, inner: svg(1024, `${BG}${markScaled(0.82)}`) },
  // Web favicon: same as the icon, small.
  { file: 'favicon.png', px: 64, inner: svg(64, `${BG}${markScaled(0.82)}`) },
  // Splash: transparent mark on the configured #FFF7FB splash background.
  { file: 'splash-icon.png', px: 1024, inner: svg(1024, markScaled(0.62)) },
  // Android adaptive: foreground mark sits inside the ~66% safe zone.
  { file: 'android-icon-foreground.png', px: 1024, inner: svg(1024, markScaled(0.6)) },
  { file: 'android-icon-background.png', px: 1024, inner: svg(1024, `<rect width="120" height="120" fill="#FFF7FB"/>`) },
  // Monochrome (themed icons): single-colour silhouette on transparent.
  { file: 'android-icon-monochrome.png', px: 1024, inner: svg(1024, markScaled(0.6, true)) },
];

for (const t of targets) {
  await sharp(Buffer.from(t.inner)).png().toFile(join(ASSETS, t.file));
  console.log('wrote', t.file, `(${t.px}px)`);
}
console.log('done');
