import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * コピーするURLを作成し、クリップボードにコピーします
 * @param text コピーするURL
 */
export async function copyUrl(text: string) {
  const { origin } = new URL(window.location.href);
  const target = text.startsWith('/') ? `${origin}${text}` : text;
  try {
    await navigator.clipboard.writeText(target);
  } catch (e) {
    console.error(e);
    const textarea = document.createElement('textarea');
    textarea.value = target;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.readOnly = true;
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      throw Error('コピーに失敗しました');
    } finally {
      document.body.removeChild(textarea);
    }
  }
}
