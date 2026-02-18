import Footer from '@/components/footer';
import Header from '@/components/header';
import DraftModeIndicator from '@/components/draft-mode-indicator';
import { ThemeProvider } from '@/components/theme-provider';
import { sanitizeMeasurementId } from '@/lib/constants';
import { CSP_NONCE_HEADER } from '@/lib/csp';
import { SITE_TITLE_TEMPLATE, buildOgImage, feedUrl, metadataBase, siteMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import { draftMode, headers } from 'next/headers';
import Script from 'next/script';
import './globals.css';

const defaultOgImage = buildOgImage();
const GA_MEASUREMENT_ID = sanitizeMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
const GA_MEASUREMENT_ID_JSON = GA_MEASUREMENT_ID ? JSON.stringify(GA_MEASUREMENT_ID) : null;
const ENABLE_CSP_E2E_PROBE = process.env.CSP_NONCE_E2E_PROBE === '1';

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const draftState = await draftMode();
  const requestHeaders = await headers();
  const { isEnabled } = draftState;
  const cspNonce = requestHeaders.get(CSP_NONCE_HEADER) || undefined;

  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.microcms-assets.io" crossOrigin="" />
        <link rel="alternate" type="application/rss+xml" href={feedUrl} />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem nonce={cspNonce}>
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
          {isEnabled && <DraftModeIndicator />}
        </ThemeProvider>
        {GA_MEASUREMENT_ID_JSON ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
              nonce={cspNonce}
            />
            <Script
              id="ga4"
              strategy="afterInteractive"
              nonce={cspNonce}
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
        {ENABLE_CSP_E2E_PROBE && cspNonce ? (
          <script
            id="layout-csp-probe"
            nonce={cspNonce}
            dangerouslySetInnerHTML={{ __html: 'window.__layoutCspProbe = true;' }}
          />
        ) : null}
      </body>
    </html>
  );
}
