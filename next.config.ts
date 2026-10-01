import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling firebase-admin and its native gRPC bindings.
  // These must run as Node.js server modules, not be bundled by webpack/turbopack.
  serverExternalPackages: [
    "firebase-admin",
    "@firebase/firestore",
    "@grpc/grpc-js",
    "@grpc/proto-loader",
    "google-auth-library",
    "google-gax",
  ],
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

