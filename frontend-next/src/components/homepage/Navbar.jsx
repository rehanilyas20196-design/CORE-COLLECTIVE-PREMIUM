'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Menu, X, LogOut, LayoutDashboard, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotif } from '../../context/NotificationsContext';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Categories', href: '/products' },
  { label: 'Products', href: '/products' },
  { label: 'Suppliers', href: '/suppliers' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact-us' },
];



export default function Navbar() {
  const { userProfile, isAdmin, isSupplier } = useAuth();
  const { notifCount } = useNotif();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('/');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-2xl border-b border-gray-200/80 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img
                  src="https://izqxsfuyibbzwdxdcmev.supabase.co/storage/v1/object/public/Background/Logo/Core%20Collective%20(1).png"
                  alt="Core Collective"
                  className="h-8 sm:h-10 w-auto transition-all duration-300"
                />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse-dot" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 hidden sm:block">
                Core Collective
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  onClick={() => setActiveLink(link.href)}
                  className={`relative text-sm font-medium transition-all duration-200 py-1 ${
                    activeLink === link.href
                       ? 'text-primary'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.label}
                  {activeLink === link.href && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative" ref={searchRef}>
                <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-100" aria-label="Search">
                  <Search className="w-5 h-5" />
                </button>
                {searchOpen && (
                  <form onSubmit={handleSearch} className="absolute right-0 top-full mt-2 w-72 sm:w-96 bg-gray-100 border border-gray-200 rounded-xl p-3 shadow-2xl animate-scale-in">
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
                      <button type="submit" className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors">
                        Go
                      </button>
                    </div>
                  </form>
                )}
              </div>
              {userProfile ? (
                <>
                  <Link href="/notifications" className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-100 relative" aria-label="Notifications">
                    <Bell className="w-5 h-5" />
                    {notifCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                        {notifCount > 9 ? '9+' : notifCount}
                      </span>
                    )}
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="hidden sm:flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-lg hover:bg-primary/20 transition-all duration-300 border border-primary/20">
                      <LayoutDashboard className="w-4 h-4" />
                      Admin
                    </Link>
                  )}
                  {isSupplier && (
                    <Link href="/supplier/dashboard" className="hidden sm:flex items-center gap-2 px-3 py-2 bg-amber-500/10 text-amber-400 text-sm font-semibold rounded-lg hover:bg-amber-500/20 transition-all duration-300 border border-amber-500/20">
                      <Store className="w-4 h-4" />
                      Supplier
                    </Link>
                  )}
                  <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-100 hidden sm:block" aria-label="Logout">
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/supplier/signup"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    Become a Supplier
                  </Link>
                  <Link
                    href="/login"
                    className="px-4 py-2 border border-gray-200 text-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 hidden sm:block"
                  >
                    Login
                  </Link>
                </>
              )}
              <button
                className="lg:hidden p-2 text-gray-400 hover:text-primary transition-colors"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white border-l border-gray-200 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="text-lg font-bold text-white">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-400 hover:text-white transition-colors" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-1">
              {navLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  onClick={() => { setActiveLink(link.href); setMobileOpen(false); }}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeLink === link.href
                      ? 'bg-primary/10 text-primary border-l-2 border-primary'
                      : 'text-gray-400 hover:bg-gray-100 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-4 border-gray-200" />
              {userProfile ? (
                <>
                  <Link
                    href="/notifications"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-3 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-all duration-300"
                  >
                    Notifications {notifCount > 0 ? `(${notifCount})` : ''}
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full text-center px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-300 mt-2"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  {isSupplier && (
                    <Link
                      href="/supplier/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full text-center px-4 py-3 bg-amber-500/10 text-amber-400 font-semibold rounded-lg hover:bg-amber-500/20 transition-all duration-300 mt-2 border border-amber-500/20"
                    >
                      Supplier Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="block w-full text-center px-4 py-3 border border-gray-200 text-gray-300 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 mt-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/supplier/signup"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-300"
                  >
                    Become a Supplier
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-3 border border-gray-200 text-gray-300 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 mt-2"
                  >
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
