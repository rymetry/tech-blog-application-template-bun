import Footer from '@/components/footer';
import Header from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';
import { sanitizeMeasurementId } from '@/lib/constants';
import { SITE_TITLE_TEMPLATE, buildOgImage, feedUrl, metadataBase, siteMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import Script from 'next/script';
import { Suspense } from 'react';
import './globals.css';

const defaultOgImage = buildOgImage();
const GA_MEASUREMENT_ID = sanitizeMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
const GA_MEASUREMENT_ID_JSON = GA_MEASUREMENT_ID ? JSON.stringify(GA_MEASUREMENT_ID) : null;

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: siteMetadata.name,
    template: SITE_TITLE_TEMPLATE,
  },
  description: siteMetadata.description,
  keywords: siteMetadata.keywords,
  openGraph: {
    type: 'website',
    locale: siteMetadata.locale,
    siteName: siteMetadata.name,
    title: siteMetadata.name,
    description: siteMetadata.description,
    url: siteMetadata.url,
    images: [defaultOgImage],
  },
  twitter: {
    card: siteMetadata.twitter.cardType,
    site: siteMetadata.twitter.site,
    creator: siteMetadata.twitter.creator,
    title: siteMetadata.name,
    description: siteMetadata.description,
    images: [defaultOgImage.url],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteMetadata.url,
    types: {
      'application/rss+xml': feedUrl,
    },
  },
};

/**
 * ドラフトモードインジケーター — draftMode()（動的 API）を読み取り、
 * プレビュー有効時のみインジケーターをレンダリングする。
 * 静的シェルをブロックしないよう <Suspense> 境界内に配置する。
 */
async function DraftModeCheck() {
  const draftState = await draftMode();
  if (!draftState.isEnabled) return null;
  const DraftModeIndicator = (await import('@/components/draft-mode-indicator')).default;
  return <DraftModeIndicator />;
}

/**
 * ルートレイアウト — 静的シェルとしてプリレンダリングされる。
 * CSP は proxy.ts で unsafe-inline ベースのヘッダーを付与するため、
 * nonce や headers() の呼び出しは不要。
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.microcms-assets.io" crossOrigin="" />
        <link rel="alternate" type="application/rss+xml" href={feedUrl} />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="flex min-h-screen flex-col">
            <a href="#main-content" className="skip-link">
              Skip to content
            </a>
            <Header />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Suspense fallback={null}>
            <DraftModeCheck />
          </Suspense>
        </ThemeProvider>
        {GA_MEASUREMENT_ID_JSON ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga4"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  const GA_MEASUREMENT_ID = ${GA_MEASUREMENT_ID_JSON};
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', GA_MEASUREMENT_ID, {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        ) : null}
      </body>
    </html>
  );
}
