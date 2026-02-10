'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { AuthButton } from '@/components/auth/AuthButton';

const navLinks = [
  { href: '/playground/hello-solana', label: 'Playground' },
  { href: '/my-code', label: 'My Code' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 border-b border-[#262626] backdrop-blur-sm">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/">
            <Logo height={40} className="text-[#FAFAFA]" />
          </Link>
          <div className="hidden sm:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href.split('/').slice(0, 2).join('/') + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#FAFAFA]'
                      : 'text-[#737373] hover:text-[#FAFAFA]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
        <AuthButton />
      </div>
    </nav>
  );
}
