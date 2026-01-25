import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    webpackBuildWorker: false,
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
