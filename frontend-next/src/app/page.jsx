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
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 left-6 z-40 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 hover:scale-110 transition-all duration-300 backdrop-blur-sm"
        aria-label="Back to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      <ChatbotWidget />
    </div>
  );
}
