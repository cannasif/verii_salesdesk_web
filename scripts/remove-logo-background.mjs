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

const PNG_OPTIONS = {
  compressionLevel: 6,
  adaptiveFiltering: true,
  effort: 10,
  palette: false,
  quality: 100,
};

function pixelStats(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const brightness = (r + g + b) / 3;
  const saturation = max === 0 ? 0 : (max - min) / max;
  const chroma = max - min;
  return { max, min, brightness, saturation, chroma };
}

/** Gercek logo pikselleri — beyaz/gri fringing tutulmaz */
function isLogoInk(r, g, b) {
  const { brightness, saturation, chroma, max } = pixelStats(r, g, b);
  if (max <= 32) return false;

  if (brightness >= 168 && saturation <= 0.2 && chroma <= 55) return false;
  if (brightness >= 145 && saturation <= 0.14 && chroma <= 38) return false;

  if (brightness <= 54 && chroma <= 45) return true;

  if (saturation >= 0.12 && brightness >= 36) {
    if (brightness >= 92 && saturation <= 0.34) return false;
    return true;
  }

  if (chroma >= 34 && brightness >= 52 && saturation >= 0.1) return true;

  if (r >= 120 && r > g + 18 && r > b + 18 && brightness >= 45 && saturation >= 0.08) return true;

  return false;
}

function buildOpaqueMask(pixels, width, height) {
  const total = width * height;
  const opaque = new Uint8Array(total);
  for (let index = 0; index < total; index += 1) {
    const offset = index * 4;
    opaque[index] = isLogoInk(pixels[offset], pixels[offset + 1], pixels[offset + 2]) ? 1 : 0;
  }
  return opaque;
}

/** Kucuk adalar: I arasi lekeler, kenar kirintilari */
function removeSmallIslands(opaque, width, height, minArea = 140) {
  const total = width * height;
  const visited = new Uint8Array(total);

  for (let index = 0; index < total; index += 1) {
    if (!opaque[index] || visited[index]) continue;

    const queue = [index];
    const component = [];
    visited[index] = 1;

    while (queue.length) {
      const current = queue.pop();
      component.push(current);
      const x = current % width;
      const y = (current - x) / width;
      for (const [nx, ny] of [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ]) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const ni = ny * width + nx;
        if (!opaque[ni] || visited[ni]) continue;
        visited[ni] = 1;
        queue.push(ni);
      }
    }

    if (component.length < minArea) {
      for (const i of component) opaque[i] = 0;
    }
  }
}

function purgeAllNeutralInk(pixels, width, height, opaque) {
  const total = width * height;
  for (let index = 0; index < total; index += 1) {
    if (!opaque[index]) continue;
    const offset = index * 4;
    const { brightness, saturation, chroma } = pixelStats(
      pixels[offset],
      pixels[offset + 1],
      pixels[offset + 2]
    );
    if (brightness >= 150 && saturation <= 0.14 && chroma <= 38) {
      opaque[index] = 0;
    }
  }
}

function peelExteriorNeutral(pixels, width, height, opaque, passes = 3) {
  for (let pass = 0; pass < passes; pass += 1) {
    const toClear = [];
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = y * width + x;
        if (!opaque[index]) continue;
        const offset = index * 4;
        const r = pixels[offset];
        const g = pixels[offset + 1];
        const b = pixels[offset + 2];
        const { brightness, saturation, chroma } = pixelStats(r, g, b);
        const neutral = brightness >= 140 && saturation <= 0.18 && chroma <= 45;
        if (!neutral) continue;

        let transparentNeighbors = 0;
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            if (!opaque[ny * width + nx]) transparentNeighbors += 1;
          }
        }
        if (transparentNeighbors >= 2) toClear.push(index);
      }
    }
    if (toClear.length === 0) break;
    for (const index of toClear) opaque[index] = 0;
  }
}

function applyMaskToAlpha(pixels, opaque) {
  const total = opaque.length;
  for (let index = 0; index < total; index += 1) {
    pixels[index * 4 + 3] = opaque[index] ? 255 : 0;
  }
}

async function removeBackground(inputPath) {
  const { data, info } = await sharp(inputPath)
    .rotate()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  const opaque = buildOpaqueMask(pixels, info.width, info.height);
  purgeAllNeutralInk(pixels, info.width, info.height, opaque);
  peelExteriorNeutral(pixels, info.width, info.height, opaque, 5);
  removeSmallIslands(opaque, info.width, info.height, 48);
  applyMaskToAlpha(pixels, opaque);

  return sharp(pixels, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .trim({ threshold: 8 })
    .modulate({ saturation: 1.12, brightness: 1.04 })
    .png(PNG_OPTIONS)
    .toBuffer();
}

const fullBuffer = await removeBackground(source);

for (const name of targets) {
  const outputPath = join(root, 'public', name);
  const buffer = smallTargets.has(name)
    ? await sharp(fullBuffer).resize({ height: 40, kernel: sharp.kernel.lanczos3 }).png(PNG_OPTIONS).toBuffer()
    : fullBuffer;
  writeFileSync(outputPath, buffer);
}

console.log(`Logo arka plani kaldirildi: ${targets.join(', ')}`);
