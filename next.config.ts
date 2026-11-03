import type { NextConfig } from "next";

// Photos uploaded through the admin live in Supabase Storage.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  // Lets a second dev server (e.g. a preview) build into its own folder.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
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
