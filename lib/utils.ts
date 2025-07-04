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
  await navigator.clipboard.writeText(target);
}

export async function writeClipboardSync(callback: () => Promise<string>) {
  if (typeof ClipboardItem && navigator.clipboard.write) {
    const text = new ClipboardItem({
      'text/plain': callback().then(
        (text) => new Blob([text], { type: 'text/plain' }),
      ),
    });
    navigator.clipboard.write([text]);
  } else {
    callback().then((text) => navigator.clipboard.writeText(text));
  }
}
