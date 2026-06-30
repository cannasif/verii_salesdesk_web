import { create } from 'zustand';
import type {
  CanvasElement,
  ReportElement,
  TableColumn,
  TableElement,
} from '../models/report-element';

interface ReportState {
  elements: CanvasElement[];
  selectedElementId: string | null;
  setElements: (elements: CanvasElement[]) => void;
  addElement: (element: ReportElement | TableElement) => void;
  removeElement: (id: string) => void;
  setSelectedElement: (id: string | null) => void;
  updateElementPosition: (id: string, x: number, y: number) => void;
  updateElementSize: (id: string, width: number, height: number, x: number, y: number) => void;
  updateElementText: (id: string, text: string) => void;
  updateReportElement: (
    id: string,
    updates: Partial<Pick<ReportElement, 'text' | 'value' | 'path' | 'fontSize' | 'fontFamily' | 'color'>>
  ) => void;
  addColumnToTable: (tableId: string, column: TableColumn) => void;
}

export const useReportStore = create<ReportState>()((set) => ({
  elements: [],
  selectedElementId: null,
  setElements: (elements) => set({ elements, selectedElementId: null }),
  addElement: (element) =>
    set((state) => ({ elements: [...state.elements, element] })),
  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
    })),
  setSelectedElement: (id) => set({ selectedElementId: id }),
  updateElementPosition: (id, x, y) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, x, y } : el
      ),
    })),
  updateElementSize: (id, width, height, x, y) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, width, height, x, y } : el
      ),
    })),
  updateElementText: (id, text) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id && el.type !== 'table' ? { ...el, text } : el
      ),
    })),
  updateReportElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id && el.type !== 'table' ? { ...el, ...updates } : el
      ),
    })),
  addColumnToTable: (tableId, column) =>
    set((state) => ({
      elements: state.elements.map((el) => {
        if (el.type !== 'table' || el.id !== tableId) return el;
        if (el.columns.some((c) => c.path === column.path)) return el;
        return { ...el, columns: [...el.columns, column] };
      }),
    })),
}));
