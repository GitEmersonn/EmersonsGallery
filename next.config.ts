import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cloudinary resizes at its own edge — see lib/cloudinaryLoader.ts.
    // remotePatterns below is inert while this loader is active, and is kept
    // so the built-in optimizer still works if the loader is ever removed.
    loader: "custom",
    loaderFile: "./lib/cloudinaryLoader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
