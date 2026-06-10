import type { NextConfig } from "next";
import { resolveBackendUrl } from "./lib/backend-url";

const backendUrl = resolveBackendUrl(process.env.BACKEND_URL);

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;