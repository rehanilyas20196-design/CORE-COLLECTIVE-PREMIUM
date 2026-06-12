import './globals.css';
import { Providers } from './providers';
import Navbar from '../components/homepage/Navbar';
import FooterSection from '../components/homepage/FooterSection';
import ConditionalBackButton from '../components/ConditionalBackButton';

export const metadata = {
  title: 'Core Collective - B2B Marketplace & Supplier Hub | Wholesale Products',
  description: "Core Collective is Pakistan's premier B2B marketplace connecting buyers with verified global suppliers. Shop wholesale electronics, clothing, home goods, sports equipment and more at competitive prices. Fast shipping across Pakistan.",
  keywords: 'B2B marketplace Pakistan, wholesale supplier, wholesale products, bulk buying, supplier hub, core collective, online wholesale, Pakistan marketplace, wholesale electronics, wholesale clothing, supplier Pakistan',
  authors: [{ name: 'Core Collective' }],
  openGraph: {
    type: 'website',
    url: 'https://frontend-eta-sepia-69.vercel.app',
    title: 'Core Collective - B2B Marketplace & Supplier Hub | Wholesale Products',
    description: "Pakistan's premier B2B marketplace connecting buyers with verified global suppliers.",
    siteName: 'Core Collective',
    images: [{ url: 'https://izqxsfuyibbzwdxdcmev.supabase.co/storage/v1/object/public/Background/Logo/Core%20Collective%20(1).png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Core Collective - B2B Marketplace & Supplier Hub',
    description: "Pakistan's premier B2B marketplace. Shop wholesale products from verified global suppliers with fast shipping.",
    images: ['https://izqxsfuyibbzwdxdcmev.supabase.co/storage/v1/object/public/Background/Logo/Core%20Collective%20(1).png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://izqxsfuyibbzwdxdcmev.supabase.co" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://backend-ten-lime-44.vercel.app" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://challenges.cloudflare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://izqxsfuyibbzwdxdcmev.supabase.co" />
        <link rel="dns-prefetch" href="https://backend-ten-lime-44.vercel.app" />
        <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />

        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="theme-color" content="#C9974B" />
        <meta name="geo.region" content="PK" />
        <meta name="geo.placename" content="Pakistan" />
        <link rel="canonical" href="https://frontend-eta-sepia-69.vercel.app" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Core Collective",
              "url": "https://frontend-eta-sepia-69.vercel.app",
              "description": "B2B marketplace connecting buyers with global suppliers for wholesale products.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://frontend-eta-sepia-69.vercel.app/?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
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
