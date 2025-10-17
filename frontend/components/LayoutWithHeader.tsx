'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function LayoutWithHeader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show header on landing page, auth pages, or admin pages
  const hideHeader = pathname === '/' || pathname === '/landing' || pathname.startsWith('/admin');

  return (
    <>
      {!hideHeader && <Header />}
      {children}
    </>
  );
}
