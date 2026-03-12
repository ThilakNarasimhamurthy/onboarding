/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure API routes work properly in production
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  // Add headers for better API route handling
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
