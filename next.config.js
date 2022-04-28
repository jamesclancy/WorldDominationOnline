/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  publicRuntimeConfig: {
    // Will be available on both server and client
    apiUrl: "http://localhost:3000/api",
  },
  sassOptions: {
    includePaths: ["./styles"],
  },
};

module.exports = nextConfig;
4;
