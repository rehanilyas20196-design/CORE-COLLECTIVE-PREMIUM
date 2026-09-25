'use client';

import HeroSection from '../components/homepage/HeroSection';
import StatsSection from '../components/homepage/StatsSection';
import CategoryGrid from '../components/homepage/CategoryGrid';
import HowItWorks from '../components/homepage/HowItWorks';
import SupplierSpotlight from '../components/homepage/SupplierSpotlight';
import Testimonials from '../components/homepage/Testimonials';
import SupplierCTA from '../components/homepage/SupplierCTA';
import NewProducts from '../components/homepage/NewProducts';
import NewsletterSection from '../components/homepage/NewsletterSection';
import ChatbotWidget from '../components/ChatbotWidget';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <StatsSection />
      <CategoryGrid />
      <HowItWorks />
      <SupplierSpotlight />
      <NewProducts />
      <Testimonials />
      <SupplierCTA />
      <NewsletterSection />

      <button
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          })
        }
        className="group fixed bottom-6 left-6 z-40 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-lg hover:bg-neutral-800 hover:-translate-y-[2px] transition-all duration-200"
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
