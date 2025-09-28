import Footer from '@/components/footer';
import Header from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';
import { buildWebSiteJsonLd, getSiteDescription, getSiteName, getSiteUrl, serializeJsonLd } from '@/lib/seo';
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

const SITE_NAME = getSiteName();
const SITE_DESCRIPTION = getSiteDescription();
const SITE_URL = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['rymlab', 'web development', 'programming', 'technology', 'quality assurance'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const webSiteJsonLd = serializeJsonLd(buildWebSiteJsonLd());

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
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: webSiteJsonLd }}
        />
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
