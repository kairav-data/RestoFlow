/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets a production build run next to a dev server: NEXT_DIST_DIR=.next-build npm run build
  distDir: process.env.NEXT_DIST_DIR || '.next',
  webpack: (config) => {
    // On Windows the persistent pack cache fails with "Unable to snapshot resolve dependencies";
    // an in-memory cache avoids the warning in dev and in builds.
    if (process.platform === "win32") config.cache = { type: "memory" };
    return config;
  },
};

module.exports = nextConfig;
