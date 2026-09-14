'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const footerColumns = [
  {
    title: 'For Buyers',
    links: [
      { label: 'Browse Products', href: '/products' },
      { label: 'Browse Suppliers', href: '/suppliers' },
      { label: 'Request Custom Quote', href: '/contact-us' },
      { label: 'Buyer Protection', href: '/faq' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/faq' },
      { label: 'Contact Support', href: '/contact-us' },
      { label: 'Shipping Info', href: '/faq' },
      { label: 'Returns', href: '/faq' },
      { label: 'Report Issue', href: '/contact-us' },
    ],
  },
  {
    title: 'Categories',
    links: [
      { label: 'Electronics', href: '/products?category=Electronics' },
      { label: 'Clothing', href: '/products?category=Clothing' },
      { label: 'Home Goods', href: '/products?category=Home Goods' },
      { label: 'Sports Equipment', href: '/products?category=Sports Equipment' },
      { label: 'View All', href: '/products' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'How It Works', href: '/about' },
      { label: 'Careers', href: '/about' },
      { label: 'Press & Media', href: '/about' },
      { label: 'Contact Us', href: '/contact-us' },
    ],
  },
];

const socialLinks = [
  {
    name: 'WhatsApp',
    href: 'https://wa.me/03455900229',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/rehan-ilyas-6976793a7',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export default function FooterSection() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#15100C_0%,#1F1811_100%)]">
      <div
        aria-hidden="true"
        className="noise-bg absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent_0%,#B98A3C_28%,#E9C766_50%,#B98A3C_72%,transparent_100%)]"
      />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12">
          <div className="lg:col-span-3">
            <p className="font-fraunces text-[26px] sm:text-[28px] font-medium tracking-[-0.01em] text-[#F5EEDD]">
              Core Collective
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#E8DFCF]/65 max-w-[22ch]">
              The B2B wholesale marketplace connecting distributors and retail buyers with verified suppliers.
            </p>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title} className="lg:col-span-2">
              <h4 className="font-spacemono text-[11px] uppercase tracking-[0.22em] text-[#E9C766]">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#E8DFCF]/60 hover:text-[#E9C766] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-1">
            <h4 className="font-spacemono text-[11px] uppercase tracking-[0.22em] text-[#E9C766]">
              Follow Us
            </h4>
            <div className="mt-4 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="w-9 h-9 rounded-[10px] bg-[linear-gradient(145deg,#2B241B_0%,#181310_100%)] flex items-center justify-center text-[#E8DFCF]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(0,0,0,0.5),0_4px_8px_-2px_rgba(0,0,0,0.5)] hover:text-[#E9C766] hover:-translate-y-[3px] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.45),0_9px_16px_-4px_rgba(233,199,102,0.35)] transition-[transform,box-shadow,color] duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-[#E8DFCF]/10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-[#E8DFCF]/60">
            &copy; {new Date().getFullYear()} Core Collective. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-[#E8DFCF]/60">
            <Link href="/privacy" className="hover:text-[#E9C766] transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#E9C766] transition-colors duration-200">
              Terms of Use
            </Link>
            <Link href="/cookies" className="hover:text-[#E9C766] transition-colors duration-200">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}