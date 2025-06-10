import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/hono-client'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
