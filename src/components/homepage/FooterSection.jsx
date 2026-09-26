'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function IconFacebook({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.5 1.6-1.5h1.6V4.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4v2.4H7.6V14h2.7v8h3.2Z" />
    </svg>
  );
}

function IconInstagram({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconX({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3l7.3 9.6L3.3 21h2.6l5.5-6.5L16.5 21H21l-7.6-10L20.4 3h-2.6l-5 6-4.8-6H3Z" />
    </svg>
  );
}

function IconLinkedIn({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.2 8.1h4.6V23H.2V8.1Zm7.5 0h4.4v2h.1c.6-1.2 2.1-2.4 4.4-2.4 4.7 0 5.6 3.1 5.6 7.1V23h-4.6v-7.3c0-1.7 0-4-2.4-4s-2.8 1.9-2.8 3.8V23H7.7V8.1Z" />
    </svg>
  );
}

const shopLinks = [
  { label: 'Electronics', href: '/products?category=Electronics' },
  { label: 'Clothing & Apparel', href: '/products?category=Clothing%20%26%20Apparel' },
  { label: 'Home & Furniture', href: '/products?category=Home%20%26%20Furniture' },
  { label: 'Sports Equipment', href: '/products?category=Sports%20Equipment' },
  { label: 'Health & Beauty', href: '/products?category=Health%20%26%20Beauty' },
  { label: 'View All Products', href: '/products' },
];

const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact-us' },
  { label: 'Suppliers', href: '/suppliers' },
  { label: 'Become a Supplier', href: '/supplier/signup' },
  { label: 'Supplier Login', href: '/supplier/login' },
  { label: 'Seller Dashboard', href: '/supplier/dashboard' },
];

const supportLinks = [
  { label: 'My Orders', href: '/orders' },
  { label: 'Notifications', href: '/notifications' },
  { label: 'My Profile', href: '/profile' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookies' },
];

const socials = [
  { label: 'Facebook', href: 'https://facebook.com/corecollective', icon: IconFacebook },
  { label: 'Instagram', href: 'https://instagram.com/corecollective', icon: IconInstagram },
  { label: 'X (Twitter)', href: 'https://twitter.com/corecollective', icon: IconX },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/core-collective', icon: IconLinkedIn },
];

export default function FooterSection() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-[#0B0B0B] text-white/70 font-jost">
      {/* Newsletter strip */}
      <div className="border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-playfair font-bold text-xl sm:text-2xl text-white">
              Stay Updated With Wholesale Deals
            </h3>
            <p className="text-sm text-white/50 mt-1">
              Weekly digests on price drops, verified supplier arrivals and exclusive B2B offers.
            </p>
          </div>
          <form
            action="/"
            method="get"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = '/products';
            }}
            className="relative w-full max-w-md"
          >
              <input
                type="email"
                aria-label="Email address"
              placeholder="you@company.com"
              className="w-full pl-5 pr-36 py-3.5 bg-white/5 border border-white/15 rounded-full text-sm text-white outline-none focus:border-white/50 focus:ring-2 focus:ring-white/10 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-white text-black rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-all"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main columns */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex flex-col leading-tight group">
              <span className="font-playfair font-bold text-white text-3xl tracking-[0.12em] uppercase">
                Core Collective
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] font-semibold text-white/40 mt-1">
                B2B Wholesale Marketplace
              </span>
            </Link>

            <p className="mt-6 text-sm leading-relaxed text-white/50 max-w-sm">
              Pakistan&apos;s #1 B2B marketplace connecting retailers with verified global suppliers —
              competitive bulk pricing, secure payments and fast nationwide delivery.
            </p>

            <div className="mt-7 space-y-3 text-sm">
              <a
                href="mailto:ecommerce_corecollective@gmail.com"
                className="flex items-center gap-3 hover:text-white transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-white/40" />
                ecommerce_corecollective@gmail.com
              </a>
              <a
                href="tel:+923455900229"
                className="flex items-center gap-3 hover:text-white transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-white/40" />
                +92 345 5900229
              </a>
              <span className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-white/40" />
                Karachi, Pakistan
              </span>
            </div>

            <div className="flex items-center gap-3 mt-8">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="w-10 h-10 rounded-full border border-white/15 text-white/60 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all duration-300"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Shop */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-white mb-6">
              Shop
            </h4>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-white mb-6">
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-white mb-6">
              Support
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40 font-normal">
            Copyright &copy; {new Date().getFullYear()} Core Collective. All Rights Reserved.
          </p>

          <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider">
            <Link href="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <Link href="/signup" className="hover:text-white transition-colors">
              Create Account
            </Link>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <Link href="/contact-us" className="hover:text-white transition-colors">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}