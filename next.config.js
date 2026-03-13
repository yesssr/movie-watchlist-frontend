/** @type {import("next").NextConfig} */
const nextConfig = {
  env: {
    API_BASE_URL:
      process.env.API_BASE_URL || "https://movie-watchlist-api.fly.dev",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        port: "",
        pathname: "/t/p/**",
      },
    ],
  },
};

module.exports = nextConfig;
