import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Allow larger uploads (phone photos) — 10 MB */
  serverExternalPackages: ['pdf-parse'],
};

export default nextConfig;
