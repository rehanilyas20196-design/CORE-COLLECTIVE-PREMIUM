import './globals.css';
import { Providers } from './providers';
import Navbar from '../components/homepage/Navbar';
import FooterSection from '../components/homepage/FooterSection';
import ConditionalBackButton from '../components/ConditionalBackButton';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://buy-allproduts-corecollective.vercel.app';
const SITE_NAME = 'Core Collective';
const OG_IMAGE = 'https://izqxsfuyibbzwdxdcmev.supabase.co/storage/v1/object/public/Background/SEO/og-banner.jpg';
const FALLBACK_OG = 'https://izqxsfuyibbzwdxdcmev.supabase.co/storage/v1/object/public/Background/Logo/Core%20Collective%20(1).png';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - B2B Marketplace & Wholesale Supplier Hub Pakistan`,
    template: `%s | ${SITE_NAME}`,
  },
  description: "Core Collective is Pakistan's #1 B2B marketplace connecting buyers with verified global suppliers. Shop wholesale electronics, clothing, home goods, sports equipment and more at competitive bulk prices with fast shipping across Pakistan.",
  keywords: [
    'B2B marketplace Pakistan', 'wholesale supplier', 'wholesale products Pakistan',
    'bulk buying Pakistan', 'supplier hub', 'Core Collective', 'online wholesale Pakistan',
    'Pakistan marketplace', 'wholesale electronics', 'wholesale clothing',
    'supplier Pakistan', 'B2B Pakistan', 'wholesale marketplace',
    'verified suppliers', 'bulk order Pakistan', 'import export Pakistan',
  ],
  authors: [{ name: 'Core Collective', url: SITE_URL }],
  creator: 'Core Collective',
  publisher: 'Core Collective',
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: `${SITE_NAME} - B2B Marketplace & Wholesale Supplier Hub Pakistan`,
    description: "Pakistan's #1 B2B marketplace connecting buyers with verified global suppliers. Shop wholesale products at competitive bulk prices.",
    siteName: SITE_NAME,
    locale: 'en_PK',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - B2B Wholesale Marketplace Pakistan`,
      },
      {
        url: FALLBACK_OG,
        width: 400,
        height: 400,
        alt: `${SITE_NAME} Logo`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - B2B Marketplace & Supplier Hub`,
    description: "Pakistan's #1 B2B marketplace. Shop wholesale products from verified global suppliers with fast shipping.",
    images: [OG_IMAGE],
    site: '@corecollective',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: { url: '/apple-icon.png' },
  },
  manifest: '/manifest.json',
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE', // ⚠️ Replace with your actual Google Search Console verification code
  },
  other: {
    'geo.region': 'PK',
    'geo.placename': 'Pakistan',
    'geo.position': '30.3753;69.3451',
    'ICBM': '30.3753, 69.3451',
    'theme-color': '#C9974B',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: "Pakistan's premier B2B marketplace connecting buyers with verified global suppliers for wholesale products.",
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
        inLanguage: 'en-PK',
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        url: SITE_URL,
        name: SITE_NAME,
        description: 'B2B wholesale marketplace connecting buyers with verified suppliers in Pakistan.',
        logo: FALLBACK_OG,
        image: OG_IMAGE,
        address: { '@type': 'PostalAddress', addressLocality: 'Karachi', addressCountry: 'PK' },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+92-345-5900229',
          contactType: 'customer service',
          email: 'ecommerce_corecollective@gmail.com',
          availableLanguage: ['English', 'Urdu'],
        },
        sameAs: [
          'https://www.linkedin.com/company/core-collective',
          'https://twitter.com/corecollective',
          'https://facebook.com/corecollective',
        ],
      },
    ],
  };

  return (
    <html lang="en-PK">
      <head>
        <link rel="preconnect" href="https://izqxsfuyibbzwdxdcmev.supabase.co" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://core-backend-collect.vercel.app" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://challenges.cloudflare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://izqxsfuyibbzwdxdcmev.supabase.co" />
        <link rel="dns-prefetch" href="https://core-backend-collect.vercel.app" />
        <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />
        <link rel="canonical" href={SITE_URL} />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta name="theme-color" content="#C9974B" />
        <meta name="geo.region" content="PK" />
        <meta name="geo.placename" content="Pakistan" />
        <meta name="google-site-verification" content="" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>
          <Navbar />
          <ConditionalBackButton />
          {children}
          <FooterSection />
        </Providers>
      </body>
    </html>
  );
}
