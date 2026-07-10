import { writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const source = join(root, 'public', '_logo-import.png');

const targets = [
  'v3rii-salesdesk-logo.png',
  'veriicrmlogo.png',
  'veriicrmlogo-sm.png',
  'v3logo-sm.png',
  'assets/v3rii-salesdesk-logo.png',
  'assets/veriicrmlogo.png',
  'assets/veriicrmlogo-sm.png',
  'assets/v3logo.png',
  'assets/v3logo-sm.png',
  'assets/logo.png',
];

const smallTargets = new Set(['veriicrmlogo-sm.png', 'v3logo-sm.png', 'assets/veriicrmlogo-sm.png', 'assets/v3logo-sm.png']);

function shouldMakeTransparent(r, g, b, a) {
  if (a === 0) return true;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const brightness = (r + g + b) / 3;
  const saturation = max === 0 ? 0 : (max - min) / max;

  if (max <= 28) return true;
  if (brightness <= 42 && saturation <= 0.22) return true;
  if (brightness <= 58 && max <= 70 && saturation <= 0.18) return true;

  return false;
}

function featherAlpha(r, g, b, a) {
  const max = Math.max(r, g, b);
  const brightness = (r + g + b) / 3;

  if (max <= 28) return 0;
  if (brightness <= 58 && max <= 75) {
    return Math.min(a, Math.round(((brightness - 28) / 30) * 255));
  }

  return a;
}

async function removeBackground(inputPath) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const pixels = Buffer.from(data);

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    if (shouldMakeTransparent(r, g, b, a)) {
      pixels[i + 3] = 0;
      continue;
    }

    pixels[i + 3] = featherAlpha(r, g, b, a);
  }

  return sharp(pixels, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

const fullBuffer = await removeBackground(source);

for (const name of targets) {
  const outputPath = join(root, 'public', name);
  const buffer = smallTargets.has(name)
    ? await sharp(fullBuffer).resize({ height: 48 }).png().toBuffer()
    : fullBuffer;
  writeFileSync(outputPath, buffer);
}

console.log(`Logo arka plani kaldirildi: ${targets.join(', ')}`);
