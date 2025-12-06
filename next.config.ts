import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Enable static exports if needed
  // output: 'standalone',
  // Optimize images
  images: {
    domains: [],
  },
};

export default nextConfig;
