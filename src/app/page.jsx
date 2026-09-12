'use client';

import HeroSection from '../components/homepage/HeroSection';
import MarqueeStrip from '../components/homepage/MarqueeStrip';
import StatsSection from '../components/homepage/StatsSection';
import CategoryGrid from '../components/homepage/CategoryGrid';
import TrendingProducts from '../components/homepage/TrendingProducts';
import HowItWorks from '../components/homepage/HowItWorks';
import SupplierSpotlight from '../components/homepage/SupplierSpotlight';
import WhyCoreCollective from '../components/homepage/WhyCoreCollective';
import Testimonials from '../components/homepage/Testimonials';
import SupplierCTA from '../components/homepage/SupplierCTA';
import NewProducts from '../components/homepage/NewProducts';
import NewsletterSection from '../components/homepage/NewsletterSection';
import ChatbotWidget from '../components/ChatbotWidget';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <MarqueeStrip />
      <StatsSection />
      <CategoryGrid />
      <TrendingProducts />
      <HowItWorks />
      <SupplierSpotlight />
      <WhyCoreCollective />
      <Testimonials />
      <SupplierCTA />
      <NewProducts />
      <NewsletterSection />

      <button
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          })
        }
        className="group fixed bottom-6 left-6 z-40 w-11 h-11 rounded-[10px] bg-[linear-gradient(145deg,#2B241B_0%,#181310_100%)] flex items-center justify-center text-[#E8DFCF]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(0,0,0,0.5),0_4px_8px_-2px_rgba(0,0,0,0.5)] hover:text-[#E9C766] hover:-translate-y-[3px] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.45),0_9px_16px_-4px_rgba(233,199,102,0.35)] transition-[transform,box-shadow,color] duration-200"
        aria-label="Back to top"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      <ChatbotWidget />
    </div>
  );
}
