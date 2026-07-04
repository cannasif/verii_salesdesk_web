const COLOR_PROPS = [
  'color',
  'backgroundColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'outlineColor',
] as const;

let colorCanvas: HTMLCanvasElement | null = null;
let colorCtx: CanvasRenderingContext2D | null = null;

function getColorContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!colorCanvas) {
    colorCanvas = document.createElement('canvas');
    colorCanvas.width = 1;
    colorCanvas.height = 1;
    colorCtx = colorCanvas.getContext('2d', { willReadFrequently: true });
  }
  return colorCtx;
}

/** html2canvas oklch/oklab parse edemez — tarayici uzerinden rgb'ye cevirir. */
export function cssColorToRgb(value: string): string {
  if (!value || value === 'transparent' || value === 'rgba(0, 0, 0, 0)') {
    return value;
  }

  if (!/oklch|oklab|color\(/i.test(value)) {
    return value;
  }

  const ctx = getColorContext();
  if (!ctx) return '#0f172a';

  try {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = value;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    if (a === 0) return 'transparent';
    if (a === 255) return `rgb(${r}, ${g}, ${b})`;
    return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(4)})`;
  } catch {
    return '#0f172a';
  }
}

function stripUnsupportedStylesheets(clonedDoc: Document): void {
  clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => node.remove());
}

function applyRgbStylesFromSource(sourceRoot: HTMLElement, cloneRoot: HTMLElement): void {
  const sourceNodes = [sourceRoot, ...Array.from(sourceRoot.querySelectorAll('*'))];
  const cloneNodes = [cloneRoot, ...Array.from(cloneRoot.querySelectorAll('*'))];
  const count = Math.min(sourceNodes.length, cloneNodes.length);

  for (let index = 0; index < count; index += 1) {
    const source = sourceNodes[index];
    const clone = cloneNodes[index];
    if (!(source instanceof HTMLElement) || !(clone instanceof HTMLElement)) continue;

    const computed = window.getComputedStyle(source);

    for (const prop of COLOR_PROPS) {
      const cssName = prop.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
      clone.style.setProperty(cssName, cssColorToRgb(computed[prop]));
    }

    if (computed.backgroundImage && computed.backgroundImage !== 'none') {
      clone.style.backgroundImage = 'none';
      clone.style.backgroundColor = cssColorToRgb(computed.backgroundColor);
    }

    clone.style.boxShadow = 'none';
    clone.style.outline = 'none';
  }
}

/** html2canvas onclone icinde cagirilir — oklch hatasini onler. */
export function prepareCloneForHtml2Canvas(
  sourceRoot: HTMLElement,
  clonedDoc: Document,
  cloneRoot: HTMLElement,
): void {
  stripUnsupportedStylesheets(clonedDoc);
  applyRgbStylesFromSource(sourceRoot, cloneRoot);
}
