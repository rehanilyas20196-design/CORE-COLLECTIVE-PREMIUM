'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell, Menu, X, LogOut, LayoutDashboard, Store, ChevronDown, Users, ArrowRight, User, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotif } from '../../context/NotificationsContext';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Categories', href: '/products', dropdown: true },
  { label: 'Suppliers', href: '/suppliers' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact-us' },
];

const quickCategories = [
  { label: 'Electronics', href: '/products?category=Electronics' },
  { label: 'Clothing & Apparel', href: '/products?category=Clothing%20%26%20Apparel' },
  { label: 'Home & Furniture', href: '/products?category=Home%20%26%20Furniture' },
  { label: 'Sports Equipment', href: '/products?category=Sports%20Equipment' },
  { label: 'Health & Beauty', href: '/products?category=Health%20%26%20Beauty' },
];

export default function Navbar() {
  const { userProfile, isAdmin, isSupplier } = useAuth();
  const { notifCount } = useNotif();
  const router = useRouter();
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('/');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const searchRef = useRef(null);
  const categoriesRef = useRef(null);

  useEffect(() => {
    setActiveLink(pathname);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setCategoriesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    const { supabase } = await import('../../lib/supabase');
    await supabase.auth.signOut();
    window.dispatchEvent(new CustomEvent('authExpired'));
    router.push('/');
  };

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'shadow-[0_8px_30px_rgba(0,0,0,0.08)]'
            : ''
        }`}
      >
        {/* Main Nav Row */}
        <div
          className={`bg-white border-b border-gray-100 transition-all duration-300 ${
            scrolled ? 'bg-white/95 backdrop-blur-md' : 'bg-white/90 backdrop-blur-sm'
          }`}
        >
          <div className="h-[64px] sm:h-[72px] max-w-[1400px] w-full mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between gap-x-6">
            {/* Brand name */}
            <Link href="/" onClick={() => setActiveLink('/')} className="flex flex-col leading-tight shrink-0 group">
              <span className="font-volkhov font-bold text-black text-xl sm:text-2xl tracking-[0.15em] uppercase transition-colors duration-300">
                Core Collective
              </span>
              <span className="text-[8.5px] sm:text-[9px] uppercase tracking-[0.35em] font-semibold text-gray-400">
                B2B Wholesale Marketplace
              </span>
            </Link>

            {/* Nav links */}
            <div className="hidden xl:flex flex-1 min-w-0 items-center justify-center gap-1 2xl:gap-2">
            {navLinks.map((link) => (
              <div key={link.label} className="relative" ref={link.dropdown ? categoriesRef : undefined}>
                {link.dropdown ? (
                  <button
                    onClick={() => setCategoriesOpen((prev) => !prev)}
                    className={`group relative text-sm font-medium tracking-wide whitespace-nowrap transition-colors duration-200 py-2 px-3 flex items-center gap-1.5 ${
                      activeLink === '/products' ? 'text-black font-semibold' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {link.label}
                    <ChevronDown
                      className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`}
                    />
                    <span className="absolute left-3 -bottom-[1px] h-[2px] bg-black transition-all duration-300 ease-out w-0 opacity-0 group-hover:w-[calc(100%-24px)] group-hover:opacity-100" />
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    onClick={() => setActiveLink(link.href)}
                    className={`group relative text-sm font-medium tracking-wide whitespace-nowrap transition-colors duration-200 py-2 px-3 ${
                      activeLink === link.href ? 'text-black font-semibold' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute left-3 -bottom-[1px] h-[2px] bg-black transition-all duration-300 ease-out ${
                        activeLink === link.href ? 'w-[calc(100%-24px)] opacity-100' : 'w-0 opacity-0 group-hover:w-[calc(100%-24px)] group-hover:opacity-100'
                      }`}
                    />
                  </Link>
                )}

                {/* Categories dropdown */}
                {link.dropdown && categoriesOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-72 bg-white border border-gray-200 rounded-2xl shadow-[0_24px_50px_-16px_rgba(0,0,0,0.3)] p-3 animate-scale-in">
                    <span className="block px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
                      Shop by Category
                    </span>
                    <div className="space-y-1">
                      {quickCategories.map((cat) => (
                        <Link
                          key={cat.label}
                          href={cat.href}
                          onClick={() => { setCategoriesOpen(false); setActiveLink('/products'); }}
                          className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100 hover:text-black transition-all"
                        >
                          {cat.label}
                          <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/products"
                      onClick={() => setCategoriesOpen(false)}
                      className="mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-neutral-800 transition-all group"
                    >
                      View All Products
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink-0">
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 text-gray-800 hover:text-white hover:bg-black hover:border-black flex items-center justify-center transition-all duration-200"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
              {searchOpen && (
                <form onSubmit={handleSearch} className="absolute right-0 top-full mt-3 w-72 sm:w-96 bg-white border border-gray-200 rounded-xl p-3 shadow-[0_24px_50px_-16px_rgba(0,0,0,0.3)] animate-scale-in">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="flex-1 bg-transparent text-black text-sm outline-none placeholder:text-gray-400"
                      autoFocus
                    />
                    <button type="submit" className="px-4 py-1.5 bg-black text-white text-xs font-semibold rounded-md hover:bg-neutral-800 transition-all duration-200">
                      Search
                    </button>
                  </div>
                </form>
              )}
            </div>

            {userProfile ? (
              <>
                <Link href="/notifications" className="relative w-10 h-10 rounded-full bg-gray-50 border border-gray-200 text-gray-800 hover:text-white hover:bg-black hover:border-black flex items-center justify-center transition-all duration-200" aria-label="Notifications">
                  <Bell className="w-4 h-4" />
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-black border-2 border-white rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/profile"
                  className="relative w-10 h-10 rounded-full bg-gray-50 border border-gray-200 text-gray-800 hover:text-white hover:bg-black hover:border-black flex items-center justify-center transition-all duration-200"
                  aria-label="My Profile"
                >
                  <User className="w-4 h-4" />
                  {userProfile && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-black border-2 border-white rounded-full flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    </span>
                  )}
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-semibold rounded-md hover:bg-neutral-800 transition-all duration-200">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                )}
                {isSupplier && (
                  <Link href="/supplier/dashboard" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 text-black text-xs font-semibold rounded-md hover:bg-gray-200 transition-all duration-200">
                    <Store className="w-3.5 h-3.5" />
                    Supplier
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-black transition-colors py-2 px-3"
                >
                  Sign In
                </Link>
                <Link
                  href="/supplier/signup"
                  className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-black text-white text-xs sm:text-sm font-semibold rounded-md hover:bg-neutral-800 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  <Store className="w-4 h-4" />
                  Become a Supplier
                </Link>
              </>
            )}

            <button
              className="xl:hidden w-10 h-10 rounded-full bg-gray-50 border border-gray-200 text-gray-800 hover:text-white hover:bg-black flex items-center justify-center transition-all duration-200"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white border-l border-gray-200 shadow-2xl overflow-y-auto">
            <span className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-black via-neutral-300 to-black" />
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center">
                  <span className="font-volkhov italic font-bold text-sm">Cc</span>
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="font-volkhov font-bold text-black text-lg tracking-[0.12em] uppercase">Core Collective</span>
                  <span className="text-[8px] uppercase tracking-[0.3em] font-semibold text-gray-400">B2B Wholesale</span>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:text-black flex items-center justify-center transition-colors" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-1">
              <span className="block px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
                Navigation
              </span>
              {navLinks.filter((l) => !l.dropdown).map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => { setActiveLink(link.href); setMobileOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeLink === link.href
                      ? 'bg-black text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <span className="block px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
                Categories
              </span>
              {quickCategories.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  onClick={() => { setActiveLink('/products'); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100 hover:text-black transition-all duration-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-black" />
                  {cat.label}
                </Link>
              ))}

              <hr className="my-4 border-gray-200" />
              {userProfile ? (
                <>
                  <Link
                    href="/notifications"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-3 bg-gray-100 text-black font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                  >
                    Notifications {notifCount > 0 ? `(${notifCount})` : ''}
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-3 bg-gray-100 text-black font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300 mt-2"
                  >
                    My Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full text-center px-4 py-3 bg-black text-white font-semibold rounded-xl hover:bg-neutral-800 transition-all duration-300 mt-2 shadow-md"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  {isSupplier && (
                    <Link
                      href="/supplier/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full text-center px-4 py-3 bg-gray-100 text-black font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300 mt-2"
                    >
                      Supplier Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="block w-full text-center px-4 py-3 border border-gray-300 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 mt-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/supplier/signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full text-center px-4 py-3 bg-black text-white font-semibold rounded-xl hover:bg-neutral-800 transition-all duration-300 shadow-md"
                  >
                    <Store className="w-4 h-4" />
                    Become a Supplier
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full text-center px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 mt-2"
                  >
                    <User className="w-4 h-4" />
                    Login / Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}