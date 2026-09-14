'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell, Menu, X, LogOut, LayoutDashboard, Store, ChevronDown, Users, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotif } from '../../context/NotificationsContext';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Categories', href: '/products' },
  { label: 'Products', href: '/products' },
  { label: 'Orders', href: '/orders' },
  { label: 'Suppliers', href: '/suppliers' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact-us' },
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
  const searchRef = useRef(null);

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
        className={`fixed top-0 inset-x-0 z-50 h-[84px] sm:h-[96px] md:h-[100px] overflow-x-clip transition-all duration-500 ${
          scrolled
            ? 'shadow-[0_8px_30px_rgba(31,26,15,0.08)] border-b border-[#EFE7D6]'
            : 'shadow-none border-b border-transparent'
        }`}
      >
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-5">
          <div
            className={`rounded-[36px] bg-gradient-to-b from-[#FFFEF9]/95 via-[#FDFAF3]/85 to-[#F8F0E0]/85 backdrop-blur-2xl border border-white/70 ring-1 ring-black/[0.04] px-4 sm:px-7 lg:px-8 xl:px-9 h-[68px] sm:h-[76px] md:h-20 min-w-0 flex items-center justify-between gap-x-5 sm:gap-x-6 xl:gap-x-8 animate-slide-down transition-shadow duration-500 ${
              scrolled
                ? 'shadow-[0_18px_50px_-12px_rgba(80,62,28,0.28),0_4px_12px_rgba(80,62,28,0.08)]'
                : 'shadow-[0_10px_40px_-12px_rgba(80,62,28,0.22),0_2px_8px_rgba(80,62,28,0.06)]'
            }`}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center group shrink-0">
              <div className="flex flex-col leading-tight">
                <span className="font-playfair font-bold text-[#26221A] text-xl sm:text-2xl tracking-tight transition-colors duration-300 group-hover:text-[#8A5A2E]">
                  Core Collective
                </span>
                <span className="text-[9px] sm:text-[9.5px] uppercase tracking-[0.28em] font-semibold text-[#B4843F]">
                  B2B Marketplace
                </span>
              </div>
            </Link>

            {/* Divider */}
            <span className="hidden xl:block w-px h-11 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />

            {/* Nav links */}
            <div className="hidden xl:flex flex-1 min-w-0 items-center justify-center gap-7 2xl:gap-9">
              {navLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  onClick={() => setActiveLink(link.href)}
                  className={`group relative text-sm xl:text-[15px] font-medium whitespace-nowrap transition-colors duration-300 py-2 flex items-center gap-1 ${
                    activeLink === link.href
                      ? 'text-[#8A5A2E]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                  {link.label === 'Categories' && (
                    <ChevronDown className="w-3.5 h-3.5 opacity-70 mt-0.5 transition-transform duration-300 group-hover:-rotate-180" />
                  )}
                  <span
                    className={`absolute left-0 -bottom-0.5 h-[3px] rounded-full bg-gradient-to-r from-[#E8C04A] to-[#B4843F] transition-all duration-300 ease-out ${
                      activeLink === link.href
                        ? 'w-full opacity-100'
                        : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
                    }`}
                  />
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
              <div className="relative" ref={searchRef}>
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="w-10 h-10 rounded-full bg-[#F1ECE1] text-gray-600 hover:text-[#8A5A2E] hover:bg-[#EADFC6] flex items-center justify-center transition-all duration-300 shadow-inner hover:scale-[1.06] active:scale-95"
                  aria-label="Search"
                >
                  <Search className="w-[18px] h-[18px]" />
                </button>
                {searchOpen && (
                  <form onSubmit={handleSearch} className="absolute right-0 top-full mt-2 w-72 sm:w-96 bg-[#FDFAF3]/95 backdrop-blur-xl border border-gray-200 rounded-2xl p-3 shadow-2xl animate-scale-in">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-gray-500 shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="flex-1 bg-transparent text-gray-900 text-sm outline-none placeholder:text-gray-500"
                        autoFocus
                      />
                      <button type="submit" className="px-3 py-1 bg-gradient-to-r from-[#E8C04A] to-[#B4843F] text-white text-xs font-semibold rounded-lg hover:brightness-105 transition-all duration-300 shadow-sm">
                        Go
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {userProfile ? (
                <>
                  <Link href="/notifications" className="relative w-10 h-10 rounded-full bg-[#F1ECE1] text-gray-600 hover:text-[#8A5A2E] hover:bg-[#EADFC6] flex items-center justify-center transition-all duration-300 shadow-inner" aria-label="Notifications">
                    <Bell className="w-[18px] h-[18px]" />
                    {notifCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-[#E8C04A] to-[#B4843F] rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow">
                        {notifCount > 9 ? '9+' : notifCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/profile"
                    className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[#F1ECE1] hover:bg-[#EADFC6] transition-all duration-300 shadow-inner group"
                    aria-label="My Profile"
                  >
                    <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E8C04A] to-[#B4843F] text-white text-[11px] font-bold flex items-center justify-center">
                      {(userProfile.name || '?').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
                    </span>
                    <span className="hidden lg:inline text-xs font-semibold text-[#8A5A2E] group-hover:text-[#6b451f]">Profile</span>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#F6EDDE] text-[#8A5A2E] text-sm font-semibold rounded-full hover:bg-[#EEDCC0] transition-all duration-300 border border-[#D4A853]/40 shadow-sm">
                      <LayoutDashboard className="w-4 h-4" />
                      Admin
                    </Link>
                  )}
                  {isSupplier && (
                    <Link href="/supplier/dashboard" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#FDF3E3] text-[#A97A2F] text-sm font-semibold rounded-full hover:bg-[#F9E6C4] transition-all duration-300 border border-[#E8C04A]/40 shadow-sm">
                      <Store className="w-4 h-4" />
                      Supplier
                    </Link>
                  )}
                  <button onClick={handleLogout} className="hidden sm:flex w-10 h-10 rounded-full bg-[#F1ECE1] text-gray-600 hover:text-danger hover:bg-danger-light items-center justify-center transition-all duration-300 shadow-inner" aria-label="Logout">
                    <LogOut className="w-[18px] h-[18px]" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/supplier/signup"
                    className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D9A63C] via-[#B8862E] to-[#8A6A1E] text-white text-sm font-bold shadow-[0_8px_20px_-4px_rgba(201,151,75,0.55)] hover:shadow-[0_10px_26px_-4px_rgba(201,151,75,0.7)] hover:-translate-y-0.5 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
                  >
                    <Users className="w-4 h-4" />
                    Become a Supplier
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <span className="hidden sm:block w-px h-9 bg-gray-200" />
                  <Link
                    href="/login"
                    className="hidden sm:flex items-center gap-2 px-5 py-2.5 border border-[#B8862E]/60 bg-transparent text-[#8A5A2E] text-sm font-semibold hover:bg-[#FFF6E0] hover:border-[#B8862E] hover:shadow-md hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 shadow-sm"
                  >
                    <User className="w-4 h-4" />
                    Login
                  </Link>
                </>
              )}

              <button
                className="xl:hidden w-10 h-10 rounded-full bg-[#F1ECE1] text-gray-600 hover:text-[#8A5A2E] hover:bg-[#EADFC6] flex items-center justify-center transition-all duration-300 shadow-inner hover:scale-[1.06] active:scale-95"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#FDFAF3] border-l border-white/70 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-200/80">
              {/* Logo */}
              <div className="flex flex-col leading-tight">
                <span className="font-playfair font-bold text-[#26221A] text-lg">Core Collective</span>
                <span className="text-[8px] uppercase tracking-[0.26em] font-semibold text-[#B4843F]">B2B Marketplace</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="w-9 h-9 rounded-full bg-[#F1ECE1] text-gray-600 hover:text-[#8A5A2E] flex items-center justify-center transition-colors" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-1">
              {navLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  onClick={() => { setActiveLink(link.href); setMobileOpen(false); }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeLink === link.href
                      ? 'bg-[#F6EDDE] text-[#8A5A2E] border-l-[3px] border-[#D4A853]'
                      : 'text-gray-700 hover:bg-[#F1ECE1] hover:text-gray-900'
                  }`}
                >
                  {link.label}
                  {link.label === 'Categories' && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
                </Link>
              ))}
              <hr className="my-4 border-gray-200" />
              {userProfile ? (
                <>
                  <Link
                    href="/notifications"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-3 bg-[#F6EDDE] text-[#8A5A2E] font-semibold rounded-xl hover:bg-[#EEDCC0] transition-all duration-300"
                  >
                    Notifications {notifCount > 0 ? `(${notifCount})` : ''}
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-3 bg-[#F6EDDE] text-[#8A5A2E] font-semibold rounded-xl hover:bg-[#EEDCC0] transition-all duration-300 mt-2"
                  >
                    My Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full text-center px-4 py-3 bg-gradient-to-r from-[#E8C04A] via-[#D4A853] to-[#9C7034] text-white font-semibold rounded-xl hover:brightness-105 transition-all duration-300 mt-2 shadow-md"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  {isSupplier && (
                    <Link
                      href="/supplier/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full text-center px-4 py-3 bg-[#FDF3E3] text-[#A97A2F] font-semibold rounded-xl hover:bg-[#F9E6C4] transition-all duration-300 mt-2 border border-[#E8C04A]/40"
                    >
                      Supplier Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="block w-full text-center px-4 py-3 border border-gray-300 text-gray-600 font-semibold rounded-xl hover:bg-[#F1ECE1] transition-all duration-300 mt-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/supplier/signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full text-center px-4 py-3 bg-gradient-to-r from-[#E8C04A] via-[#D4A853] to-[#9C7034] text-white font-semibold rounded-xl hover:brightness-105 transition-all duration-300 shadow-md"
                  >
                    <Users className="w-4 h-4" />
                    Become a Supplier
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full text-center px-4 py-3 border border-[#D4A853]/60 text-[#8A5A2E] font-semibold rounded-xl hover:bg-[#FFF6E0] transition-all duration-300 mt-2"
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