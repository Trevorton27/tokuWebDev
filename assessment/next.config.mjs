/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['pdfkit'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // pdfkit dynamically loads AFM font files from node_modules at runtime.
    // Without this, Next.js's output file tracing omits them and pdfkit fails on Vercel.
    outputFileTracingIncludes: {
      '/api/admin/roadmaps/[id]/pdf': [
        './node_modules/pdfkit/js/data/**/*',
      ],
    },
  },
  images: {
    domains: [],
  },
};

export default nextConfig;
