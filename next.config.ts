import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: "/context-engineering-lab5-compress-isolate",
};

export default nextConfig;
