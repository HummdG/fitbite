// Regenerates every raster brand asset in app/assets/ from the real FitBite
// logo artwork (assets/logo.png — the Logo V2 lockup on a pale-pink background).
// Run after changing the logo: `node scripts/gen-icons.mjs`.
//
// Pipeline:
//   1. Key the pale-pink background out of logo.png → transparent RGBA buffer.
//   2. Export logo-lockup.png (mark + wordmark) and logo-mark.png (cloche only)
//      for in-app use, both tightly trimmed with transparent backgrounds.
//   3. Compose the launcher icon, splash, favicon and Android adaptive assets
//      from the mark so every platform shows the same artwork.
import sharp from 'sharp';
import { join } from 'node:path';

const ASSETS = join(process.cwd(), 'assets');
const SRC = join(ASSETS, 'logo.png');
const PLUM = { r: 0x45, g: 0x0b, b: 0x68 }; // #450B68 outline / monochrome colour
const ICON_BG = '#FFF1F8'; // warm pink wash behind the launcher mark

// --- 1. Background removal -------------------------------------------------

/** Load logo.png and clear the pale background to transparent. Returns RGBA. */
async function loadTransparent() {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  // Sample the background colour from the four corners (near-flat #FDF3F8).
  const corner = (x, y) => {
    const i = (y * W + x) * C;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const corners = [corner(1, 1), corner(W - 2, 1), corner(1, H - 2), corner(W - 2, H - 2)];
  const bg = [0, 1, 2].map((k) => Math.round(corners.reduce((s, c) => s + c[k], 0) / corners.length));
  const dist = (i) => {
    const dr = data[i] - bg[0];
    const dg = data[i + 1] - bg[1];
    const db = data[i + 2] - bg[2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  // Flood-fill the EXTERIOR background from the borders only. This clears the
  // page behind the artwork (and the gap between the mark and wordmark) while
  // leaving the dome's enclosed light highlights fully opaque — a global colour
  // key would eat those highlights.
  const HARD = 58; // exterior background match tolerance
  const visited = new Uint8Array(W * H);
  const stack = [];
  const seed = (x, y) => {
    const p = y * W + x;
    if (visited[p]) return;
    if (dist(p * C) > HARD) return;
    visited[p] = 1;
    data[p * C + 3] = 0;
    stack.push(p);
  };
  for (let x = 0; x < W; x++) {
    seed(x, 0);
    seed(x, H - 1);
  }
  for (let y = 0; y < H; y++) {
    seed(0, y);
    seed(W - 1, y);
  }
  while (stack.length) {
    const p = stack.pop();
    const x = p % W;
    const y = (p - x) / W;
    if (x > 0) seed(x - 1, y);
    if (x < W - 1) seed(x + 1, y);
    if (y > 0) seed(x, y - 1);
    if (y < H - 1) seed(x, y + 1);
  }

  // Feather the 1px anti-aliased fringe: opaque pixels touching a cleared pixel
  // and still close to the background colour get their alpha scaled down.
  const SOFT = 110;
  const out = Buffer.from(data);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x;
      const i = p * C;
      if (data[i + 3] === 0) continue;
      const touchesCleared =
        (x > 0 && data[(p - 1) * C + 3] === 0) ||
        (x < W - 1 && data[(p + 1) * C + 3] === 0) ||
        (y > 0 && data[(p - W) * C + 3] === 0) ||
        (y < H - 1 && data[(p + W) * C + 3] === 0);
      if (!touchesCleared) continue;
      const d = dist(i);
      if (d < SOFT) out[i + 3] = Math.min(data[i + 3], Math.round((255 * (d - HARD)) / (SOFT - HARD)) || 0);
    }
  }
  return { data: out, W, H, C, dist, hard: HARD };
}

/** Clear enclosed background-coloured pixels (e.g. letter counters) below `fromY`. */
function clearEnclosed(buf, fromY) {
  const { data, W, H, C, dist, hard } = buf;
  for (let y = fromY; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * C;
      if (data[i + 3] !== 0 && dist(i) <= hard) data[i + 3] = 0;
    }
  }
}

/** Bounding box of opaque (alpha > t) pixels. */
function opaqueBBox({ data, W, H, C }, t = 12) {
  let minX = W, minY = H, maxX = -1, maxY = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * C + 3] > t) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/** Per-row count of opaque pixels — used to find the mark/wordmark gap. */
function rowOpacity({ data, W, H, C }, t = 12) {
  const rows = new Int32Array(H);
  for (let y = 0; y < H; y++) {
    let n = 0;
    for (let x = 0; x < W; x++) if (data[(y * W + x) * C + 3] > t) n++;
    rows[y] = n;
  }
  return rows;
}

const buf = await loadTransparent();
const { data, W, H, C } = buf;
const rawOpts = { raw: { width: W, height: H, channels: C } };

function sharpFromBuf() {
  // sharp consumes the buffer, so hand it a copy each time.
  return sharp(Buffer.from(data), rawOpts);
}

// --- 2. In-app logo assets -------------------------------------------------

// Find the transparent gap between the cloche (top) and the wordmark (bottom).
// The flood-fill cleared the gap, so it shows as a run of near-empty rows.
const fullBox = opaqueBBox(buf);
const rows = rowOpacity(buf);
const peak = Math.max(...rows);
let y = fullBox.top;
while (y < H && rows[y] < peak * 0.02) y++; // skip to first content (mark top)
while (y < H && rows[y] >= peak * 0.02) y++; // through the mark
const gapStart = y;
while (y < H && rows[y] < peak * 0.02) y++; // through the gap
const gapEnd = y;
const cut = Math.round((gapStart + gapEnd) / 2);

// The flood-fill can't reach the wordmark's enclosed letter counters; clear
// those (background-coloured, high-contrast wordmark — safe to colour-key).
clearEnclosed(buf, cut);

// Full lockup: trim to all opaque content.
const lockupBox = opaqueBBox(buf);
await sharpFromBuf().extract(lockupBox).png().toFile(join(ASSETS, 'logo-lockup.png'));
console.log('wrote logo-lockup.png', `${lockupBox.width}x${lockupBox.height}`);

// Mark only: bounding box of the content above the cut.
const markBox = opaqueBBox(
  (() => {
    const d = Buffer.from(data);
    for (let yy = cut; yy < H; yy++) for (let xx = 0; xx < W; xx++) d[(yy * W + xx) * C + 3] = 0;
    return { data: d, W, H, C };
  })(),
);
await sharpFromBuf().extract(markBox).png().toFile(join(ASSETS, 'logo-mark.png'));
console.log('wrote logo-mark.png', `${markBox.width}x${markBox.height}`);

// Keep a trimmed mark buffer in memory for composing the launcher assets.
const markPng = await sharpFromBuf().extract(markBox).png().toBuffer();

// --- 3. Launcher / splash / adaptive assets --------------------------------

/** Square canvas (px) with the mark scaled to `frac` of the canvas, centred. */
async function composeMark({ px, frac, bg }) {
  const box = Math.round(px * frac);
  const mark = await sharp(markPng)
    .resize({ width: box, height: box, fit: 'inside', withoutEnlargement: false })
    .toBuffer();
  const base = bg
    ? sharp({ create: { width: px, height: px, channels: 4, background: bg } })
    : sharp({ create: { width: px, height: px, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } });
  return base.composite([{ input: mark, gravity: 'center' }]).png().toBuffer();
}

/** Solid-colour PNG. */
async function solid(px, color) {
  return sharp({ create: { width: px, height: px, channels: 4, background: color } }).png().toBuffer();
}

// Plum monochrome silhouette of the mark (Android themed icons).
async function monochromeMark(px, frac) {
  const box = Math.round(px * frac);
  // Recolour every opaque pixel to plum, keep alpha as the silhouette.
  const { data: md, info } = await sharp(markPng).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let p = 0; p < info.width * info.height; p++) {
    const i = p * info.channels;
    if (md[i + 3] > 8) {
      md[i] = PLUM.r;
      md[i + 1] = PLUM.g;
      md[i + 2] = PLUM.b;
      md[i + 3] = 255;
    }
  }
  const mono = await sharp(md, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .resize({ width: box, height: box, fit: 'inside' })
    .png()
    .toBuffer();
  return sharp({ create: { width: px, height: px, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: mono, gravity: 'center' }])
    .png()
    .toBuffer();
}

const writes = [
  ['icon.png', await composeMark({ px: 1024, frac: 0.7, bg: ICON_BG })],
  ['favicon.png', await sharp(await composeMark({ px: 1024, frac: 0.7, bg: ICON_BG })).resize(64).png().toBuffer()],
  ['splash-icon.png', await composeMark({ px: 1024, frac: 0.55, bg: null })],
  ['android-icon-foreground.png', await composeMark({ px: 1024, frac: 0.5, bg: null })],
  ['android-icon-background.png', await solid(1024, ICON_BG)],
  ['android-icon-monochrome.png', await monochromeMark(1024, 0.5)],
];
for (const [file, data] of writes) {
  await sharp(data).png().toFile(join(ASSETS, file));
  console.log('wrote', file);
}
console.log('done');
