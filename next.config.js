/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    useWasmBinary: true
  }
};

module.exports = nextConfig;
