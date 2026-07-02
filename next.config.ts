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
      {
        source: '/ai-assistant',
        destination: '/ai-assistant/index.html',
      },
      {
        source: '/ai-assistant/',
        destination: '/ai-assistant/index.html',
      },
      {
        source: '/eye-test',
        destination: '/eye-test/index.html',
      },
      {
        source: '/eye-test/',
        destination: '/eye-test/index.html',
      },
      {
        source: '/adhd-procrastination-test',
        destination: '/adhd-procrastination-test/index.html',
      },
      {
        source: '/adhd-procrastination-test/',
        destination: '/adhd-procrastination-test/index.html',
      },
      {
        source: '/active-learning-game',
        destination: '/sight/active_learning_game/index.html',
      },
      {
        source: '/active-learning-game/',
        destination: '/sight/active_learning_game/index.html',
      },
    ];
  },
};

export default nextConfig;
