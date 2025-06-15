import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * コピーするURLを作成し、クリップボードにコピーします
 * @param text コピーするURL（相対URL）
 */
export async function copyUrl(text: string) {
  const url = new URL(window.location.href);
  await navigator.clipboard.writeText(`${url.origin}${text}`);
}
