import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/sight/gallup_pro',
        destination: '/sight/gallup_pro/index.html',
      },
      {
        source: '/sight/gallup_pro/',
        destination: '/sight/gallup_pro/index.html',
      },
      {
        source: '/sight/gallup_pro/index.html',
        destination: '/sight/gallup_pro/index.html',
      },
    ];
  },
};

export default nextConfig;
