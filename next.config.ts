// next.config.ts
/** @type {import('next').NextConfig} */
import type { NextConfig } from "next";
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  // Silence Turbopack vs Webpack conflict in Next.js 16
  // next-pwa requires Webpack, but Turbopack is default in v16
  turbopack: {},
};

export default withPWA(nextConfig);
