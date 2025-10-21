import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * フロント表示やメタデータ用の日付フォーマット。
 * 入力が不正な場合は空文字を返し、呼び出し側で非表示にできるようにする。
 */
export function formatDate(date: string | Date) {
  const parsed = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return format(parsed, 'yyyy-MM-dd');
}

export function truncateForSEO(text: string, maxLength = 160) {
  if (!text) {
    return '';
  }

  const normalized = text.trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  if (maxLength <= 3) {
    return normalized.slice(0, maxLength);
  }

  return `${normalized.slice(0, maxLength - 3).trim()}...`;
}

export function stripHtml(value: string | undefined | null) {
  if (!value) {
    return '';
  }

  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
