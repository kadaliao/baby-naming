import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude LICENSE files from bundling
    config.module.rules.push({
      test: /LICENSE$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;
