import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { SalesDeskQuotePreviewData } from './build-salesdesk-quote-preview-data';
import { prepareCloneForHtml2Canvas } from './html2canvas-oklch-fix';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

async function waitForImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );
}

async function capturePagesToPdf(pages: HTMLElement[]): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  for (let index = 0; index < pages.length; index += 1) {
    if (index > 0) {
      doc.addPage();
    }

    const page = pages[index];
    const canvas = await html2canvas(page, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: page.scrollWidth,
      height: page.scrollHeight,
      windowWidth: page.scrollWidth,
      windowHeight: page.scrollHeight,
      onclone: (clonedDoc, clonedElement) => {
        if (clonedElement instanceof HTMLElement) {
          prepareCloneForHtml2Canvas(page, clonedDoc, clonedElement);
        }
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.9);
    doc.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST');
  }

  return doc.output('blob');
}

export async function buildSalesDeskQuotePdfBlobFromDom(container: HTMLElement): Promise<Blob> {
  const pages = Array.from(container.querySelectorAll('.quote-preview-page')) as HTMLElement[];
  if (pages.length === 0) {
    throw new Error('Onizleme sayfalari bulunamadi.');
  }
  return capturePagesToPdf(pages);
}

export async function buildSalesDeskQuotePdfBlobFromData(data: SalesDeskQuotePreviewData): Promise<Blob> {
  const { SalesDeskQuotePreviewDocument } = await import(
    '../components/quotes/SalesDeskQuotePreviewDocument'
  );

  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  Object.assign(container.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: '210mm',
    pointerEvents: 'none',
    opacity: '0',
    zIndex: '-1',
    background: '#ffffff',
  });
  document.body.appendChild(container);

  let root: Root | null = null;
  try {
    root = createRoot(container);
    await new Promise<void>((resolve) => {
      root!.render(createElement(SalesDeskQuotePreviewDocument, { data, printMode: true }));
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    await waitForImages(container);
    await new Promise((resolve) => window.setTimeout(resolve, 150));
    return await buildSalesDeskQuotePdfBlobFromDom(container);
  } finally {
    root?.unmount();
    container.remove();
  }
}
