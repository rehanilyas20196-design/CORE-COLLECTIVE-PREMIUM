'use client';

import { usePathname } from 'next/navigation';
import BackButton from './BackButton';

export default function ConditionalBackButton() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  if (isHome || pathname?.startsWith('/admin')) return null;

  return <BackButton />;
}
