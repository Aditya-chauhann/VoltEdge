/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from external domains (CJ Dropshipping CDN + common product image hosts)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cjdropshipping.com' },
      { protocol: 'https', hostname: '**.alicdn.com' },
      { protocol: 'https', hostname: '**.aliyuncs.com' },
      { protocol: 'https', hostname: 'img.ltwebstatic.com' },
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  // Ensure API calls are proxied correctly in production
  async rewrites() {
    return [];
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Enable React strict mode
  reactStrictMode: true,
};

export default nextConfig;
