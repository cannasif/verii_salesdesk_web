import type { SalesDeskVisitFormDto } from '../api/salesdesk-api';
import { toDateInputValue } from './salesdesk-shared';

export const MAX_VISIT_FORM_DATE_FILTERS = 4;

export function normalizeVisitFormListDate(value?: string | null): string {
  return toDateInputValue(value);
}

export function datesToInputValues(dates: Date[]): string[] {
  return dates
    .map((date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })
    .filter((value, index, array) => array.indexOf(value) === index)
    .sort();
}

export function inputValuesToDates(values: string[]): Date[] {
  return values.map((value) => new Date(`${value}T12:00:00`));
}

export function filterVisitFormsByDates(
  forms: SalesDeskVisitFormDto[],
  selectedDates: string[]
): SalesDeskVisitFormDto[] {
  if (selectedDates.length === 0) return forms;

  const dateSet = new Set(selectedDates.map(normalizeVisitFormListDate));
  return forms.filter((form) => dateSet.has(normalizeVisitFormListDate(form.formDate)));
}

export function paginateVisitForms<T>(
  forms: T[],
  pageNumber: number,
  pageSize: number
): T[] {
  const start = (pageNumber - 1) * pageSize;
  return forms.slice(start, start + pageSize);
}
