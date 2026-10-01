import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling firebase-admin.
  // It must run as a Node.js server module, not bundled into client or edge code.
  serverExternalPackages: ["firebase-admin"],
  images: {
    remotePatterns: [
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
        hostname: "www.google.com",
      },
    ],
  },
};

export default nextConfig;

