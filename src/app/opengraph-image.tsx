import { getSiteDescription, getSiteName } from '@/lib/seo';
import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export const runtime = 'edge';

const backgroundGradient = 'linear-gradient(135deg, #0f172a, #2563eb)';

export default function Image() {
  const siteName = getSiteName();
  const siteDescription = getSiteDescription();

  return new ImageResponse(
    (
      <div
        style={{
          background: backgroundGradient,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '80px',
          color: 'white',
          fontFamily: 'Inter, Noto Sans JP, sans-serif',
        }}
      >
        <span
          style={{
            fontSize: 42,
            opacity: 0.7,
          }}
        >
          {siteName}
        </span>
        <h1
          style={{
            marginTop: 16,
            fontSize: 82,
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          Inspiring stories for modern developers
        </h1>
        <p
          style={{
            marginTop: 24,
            fontSize: 32,
            maxWidth: '70%',
            lineHeight: 1.3,
          }}
        >
          {siteDescription}
        </p>
      </div>
    ),
    {
      ...size,
    },
  );
}
