import Footer from '@/components/footer';
import Header from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { Inter, Noto_Sans_JP } from 'next/font/google';
import './globals.css';

const fontSans = Noto_Sans_JP({
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  weight: ['400', '500', '700'],
  subsets: ['latin'],
});

const fontUi = Inter({
  variable: '--font-ui',
  display: 'swap',
  preload: true,
  weight: ['400', '600'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'rymlab',
  description:
    'A modern tech blog for sharing knowledge and insights on web development, programming, and technology and quality assurance.',
  keywords: ['rymlab', 'web development', 'programming', 'technology', 'quality assurance'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.microcms-assets.io" crossOrigin="" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontUi.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen flex-col">
            <a href="#main-content" className="skip-link">
              コンテンツへスキップ
            </a>
            <Header />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
