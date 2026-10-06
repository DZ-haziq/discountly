import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling firebase-admin.
  // It must run as a Node.js server module, not bundled into client or edge code.
  serverExternalPackages: ["firebase-admin"],
  transpilePackages: ["jwks-rsa", "jose"],

  // Compress responses with gzip
  compress: true,

  // Reduce bundle size by only including used locales
  i18n: undefined,

  images: {
    formats: ['image/avif', 'image/webp'],
    // Minimum cache TTL for optimised images (1 hour → big LCP win)
    minimumCacheTTL: 3600,
    // Limit concurrent image optimization requests to avoid memory spikes
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.wixstatic.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "icon.horse",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },

  // Cache headers for static public assets and pages
  async headers() {
    return [
      {
        // Immutable static assets (hashed filenames)
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/icon.svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        // Static pages — serve stale while revalidating in background
        source: "/(stores|categories|about|how-we-choose-stores|affiliate-disclosure|privacy|contact)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=600",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

