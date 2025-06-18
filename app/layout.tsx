import type { Metadata } from 'next';
import { Inter, Noto_Sans_JP } from 'next/font/google';
import '@/app/globals.css';
import ConvexClientProvider from '@/components/custom/ConvexClientProvider';
import { ThemeProvider } from '@/components/custom/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { jaJP } from '@clerk/localizations';

const inter = Inter({ subsets: ['latin'] });
const notoSansJP = Noto_Sans_JP({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'linkbox',
  description: 'Your personal bookmark manager',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.className} ${notoSansJP.className}`}>
        <ConvexClientProvider localization={jaJP}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster duration={10000} position="bottom-right" richColors />
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
