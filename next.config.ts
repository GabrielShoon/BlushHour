import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  // Discover and Date ideas were merged into /explore; query strings carry over.
  async redirects() {
    return [
      { source: "/discover", destination: "/explore?tab=places", permanent: true },
      { source: "/dates", destination: "/explore", permanent: true },
    ];
  },
};

export default nextConfig;
