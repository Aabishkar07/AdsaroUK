import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/home/",
        destination: "/",
        permanent: true,
      },
      {
        source: "/advertisers",
        destination: "/advertising",
        permanent: true,
      },
      {
        source: "/advertisers/",
        destination: "/advertising",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
