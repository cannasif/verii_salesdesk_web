export type ReportSection = 'header' | 'content' | 'footer';

interface ReportElementBase {
  id: string;
  section: ReportSection;
  x: number;
  y: number;
  width: number;
  height: number;
  value?: string;
  text?: string;
  path?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

export interface ReportElement extends ReportElementBase {
  type: 'text' | 'field' | 'image';
}

export interface TableColumn {
  label: string;
  path: string;
}

export interface TableElement extends ReportElementBase {
  type: 'table';
  columns: TableColumn[];
}

export type CanvasElement = ReportElement | TableElement;

export function isTableElement(el: CanvasElement): el is TableElement {
  return el.type === 'table';
}

export function isReportElement(el: CanvasElement): el is ReportElement {
  return el.type !== 'table';
}
