import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    qualities: [25, 30, 50, 75, 80, 85, 90, 95, 96, 100],
  },
};

export default nextConfig;
