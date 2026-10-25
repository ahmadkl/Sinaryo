import type { ProjectType } from './types';

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Convert a number to Arabic-Indic digits for display. */
export function ar(n: number): string {
  return String(n).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)]);
}

export function typeLabel(type: ProjectType): string {
  return type === 'series' ? 'مسلسل' : 'فيلم';
}

export function formatDate(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString('ar', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return new Date(ts).toISOString().slice(0, 10);
  }
}
