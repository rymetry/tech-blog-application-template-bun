import type { NextConfig } from 'next';

const BASE_SECURITY_HEADERS = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
] as const;

const PERMISSIONS_POLICY =
  'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), serial=(), midi=(), magnetometer=(), gyroscope=(), accelerometer=(), xr-spatial-tracking=()';
const STRICT_TRANSPORT_SECURITY = 'max-age=15552000; includeSubDomains';

const createSecurityHeaders = () => {
  const headers: Array<{ key: string; value: string }> = [
    ...BASE_SECURITY_HEADERS,
    {
      key: 'Permissions-Policy',
      value: PERMISSIONS_POLICY,
    },
  ];

  if (process.env.NODE_ENV === 'production') {
    headers.push({
      key: 'Strict-Transport-Security',
      value: STRICT_TRANSPORT_SECURITY,
    });
  }

  return headers;
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: createSecurityHeaders(),
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.microcms-assets.io',
      },
    ],
  },
};

export default nextConfig;
