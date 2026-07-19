import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained server bundle (server + only the node_modules it needs) so
  // the Docker runtime stage doesn't have to ship the full node_modules tree.
  output: "standalone",
};

export default nextConfig;
