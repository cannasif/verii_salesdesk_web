import type { CanvasElement, ReportElement, TableElement } from '../models/report-element';
import type { ReportTemplateElementDto } from '../types/report-template-types';
import type { ReportSection } from '../models/report-element';
import {
  A4_CANVAS_WIDTH,
  A4_CANVAS_HEIGHT,
  A4_HEADER_HEIGHT,
  A4_CONTENT_TOP,
  A4_CONTENT_HEIGHT,
  A4_FOOTER_TOP,
} from '../constants';

function toSection(s: string): ReportSection {
  if (s === 'header' || s === 'content' || s === 'footer') return s;
  return 'content';
}

function clampYToSection(
  section: ReportSection,
  y: number,
  elementHeight: number
): number {
  const safeH = Math.max(0, elementHeight);
  switch (section) {
    case 'header':
      return Math.max(0, Math.min(y, A4_HEADER_HEIGHT - safeH));
    case 'content':
      return Math.max(
        A4_CONTENT_TOP,
        Math.min(y, A4_CONTENT_TOP + A4_CONTENT_HEIGHT - safeH)
      );
    case 'footer':
      return Math.max(
        A4_FOOTER_TOP,
        Math.min(y, A4_CANVAS_HEIGHT - safeH)
      );
    default:
      return Math.max(0, Math.min(y, A4_CANVAS_HEIGHT - safeH));
  }
}

function clampX(x: number, width: number): number {
  return Math.max(0, Math.min(x, A4_CANVAS_WIDTH - Math.max(0, width)));
}

export function dtoElementsToCanvasElements(
  dtoElements: ReportTemplateElementDto[]
): CanvasElement[] {
  return dtoElements.map((dto): CanvasElement => {
    const section = toSection(dto.section);
    const w = typeof dto.width === 'number' ? dto.width : 200;
    const h = typeof dto.height === 'number' ? dto.height : 30;
    const x = clampX(dto.x, w);
    const y = clampYToSection(section, dto.y, h);
    const base = {
      id: dto.id,
      section,
      x,
      y,
      width: w,
      height: h,
      value: dto.value,
      text: dto.text,
      path: dto.path,
      fontSize: dto.fontSize,
      fontFamily: dto.fontFamily,
      color: dto.color,
    };
    if (dto.type === 'table' && Array.isArray(dto.columns)) {
      const table: TableElement = {
        ...base,
        type: 'table',
        columns: dto.columns.map((c) => ({ label: c.label, path: c.path })),
      };
      return table;
    }
    const type = (dto.type === 'text' || dto.type === 'field' || dto.type === 'image')
      ? dto.type
      : 'text';
    const el: ReportElement = { ...base, type };
    return el;
  });
}
