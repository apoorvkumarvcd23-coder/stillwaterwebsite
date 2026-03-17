/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/recommendation",
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "standalone",
};

export default nextConfig;
