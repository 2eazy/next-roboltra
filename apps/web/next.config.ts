import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@roboltra/db", "@roboltra/game-engine"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
