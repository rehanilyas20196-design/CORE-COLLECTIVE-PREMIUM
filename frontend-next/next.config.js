/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['izqxsfuyibbzwdxdcmev.supabase.co'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend-ten-lime-44.vercel.app'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
