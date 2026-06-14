/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'izqxsfuyibbzwdxdcmev.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
