'use client';

import { usePathname } from 'next/navigation';
import BackButton from './BackButton';

export default function ConditionalBackButton() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isAuthRoute = ['/login', '/signup', '/supplier/login', '/supplier/signup'].includes(pathname);

  if (isHome || isAuthRoute || pathname?.startsWith('/admin')) return null;

  return <BackButton />;
}
