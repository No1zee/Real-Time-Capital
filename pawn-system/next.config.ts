import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "loremflickr.com", // Added for seed images
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // Added for auth
      }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  poweredByHeader: false, // Req 1e: Suppress X-Powered-By
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Req 1e: Prevent clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Req 1e: Block content sniffing
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block', // Req 1e: Prevent XSS
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload', // Req 1e: Prevent MIM
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy', // Req 1f: CSP
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://images.unsplash.com https://plus.unsplash.com https://loremflickr.com https://avatars.githubusercontent.com https://api.dicebear.com https://assets.vercel.com https://vercel.live https://vercel.com; font-src 'self'; connect-src 'self' https://www.google-analytics.com https://vercel.live; frame-src 'self' https://vercel.live;",
          }
        ],
      },
    ]
  },
};

export default nextConfig;
