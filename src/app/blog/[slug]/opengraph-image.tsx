import { getPostBySlug } from '@/lib/cms';
import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export const runtime = 'edge';

const backgroundGradient = 'linear-gradient(135deg, #1e293b, #6366f1)';

export default async function Image({ params }: { params: { slug: string } }) {
  try {
    const post = await getPostBySlug(params.slug);

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
            padding: '72px',
            color: 'white',
            fontFamily: 'Inter, Noto Sans JP, sans-serif',
          }}
        >
          <span style={{ fontSize: 36, opacity: 0.7 }}>rymlab</span>
          <h1
            style={{
              marginTop: 24,
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: '85%',
            }}
          >
            {post.title}
          </h1>
          {post.excerpt ? (
            <p
              style={{
                marginTop: 24,
                fontSize: 30,
                maxWidth: '75%',
                opacity: 0.85,
                lineHeight: 1.4,
              }}
            >
              {post.excerpt}
            </p>
          ) : null}
        </div>
      ),
      {
        ...size,
      },
    );
  } catch (error) {
    console.error('Failed to generate OG image:', error);

    return new ImageResponse(
      (
        <div
          style={{
            background: backgroundGradient,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'Inter, Noto Sans JP, sans-serif',
            fontSize: 64,
          }}
        >
          rymlab
        </div>
      ),
      {
        ...size,
      },
    );
  }
}
