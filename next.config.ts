import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "dgalywyr863hv.cloudfront.net", // common Strava CDN host
      },
    ],
  },
};

export default nextConfig;
