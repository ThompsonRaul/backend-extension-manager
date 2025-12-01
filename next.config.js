/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/api/v1/status",
      },
    ];
  },
};

module.exports = nextConfig;
