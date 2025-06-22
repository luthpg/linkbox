import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_JP } from 'next/font/google';
import '@/app/globals.css';
import ConvexClientProvider from '@/components/custom/ConvexClientProvider';
import { ThemeProvider } from '@/components/custom/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { jaJP } from '@clerk/localizations';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ['latin'] });
const notoSansJP = Noto_Sans_JP({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'linkbox',
  description: 'Your personal bookmark manager',
  openGraph: {
    type: 'website',
    url: './',
    title: 'linkbox',
    description: 'Your personal bookmark manager',
    siteName: 'linkbox',
    images: './icon.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'linkbox',
    description: 'Your personal bookmark manager',
    images: './icon.png',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
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
        <Analytics />
      </body>
    </html>
  );
}
