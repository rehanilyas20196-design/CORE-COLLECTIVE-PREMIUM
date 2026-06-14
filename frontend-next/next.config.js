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
  async redirects() {
    return [
      {
        source: '/faq',
        destination: '/contact-us',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
