/** @type {import('next').NextConfig} */
// Fixes issue 443: Implement frontend performance optimization pass
const nextConfig = {
  output: "standalone",
  eslint: {
    // Lint errors must be resolved before a production build succeeds.
    ignoreDuringBuilds: false,
  },
  reactStrictMode: true,
  staticPageGenerationTimeout: 0,
  // Compress responses with gzip for smaller transfer sizes
  compress: true,
  // Optimize images and allow external sources if needed
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },
  // Reduce bundle size by removing console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Enable experimental optimisation for package imports
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

// Bundle analyzer (dev-only, enabled via ANALYZE=true)
import withBundleAnalyzer from '@next/bundle-analyzer';

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);

