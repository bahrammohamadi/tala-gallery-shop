import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isGitHubPages ? {
    output: "export",
    basePath: "/tala-gallery-shop",
    trailingSlash: true,
    images: { unoptimized: true },
  } : {}),
  allowedDevOrigins: ["3000-inq29hmqvq7yoj1vtgb5f.e2b.app"],
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "@react-three/drei"],
  },
};

export default nextConfig;
