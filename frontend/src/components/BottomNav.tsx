'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import useWishlistStore from '@/store/wishlist.store';

export default function BottomNav() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { load, loaded } = useWishlistStore();

  useEffect(() => {
    const check = () => {
      const token = localStorage.getItem('token');
      setLoggedIn(!!token);
      try {
        const raw = localStorage.getItem('user');
        const user = raw ? JSON.parse(raw) : null;
        setIsAdmin(user?.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    };
    check();
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  useEffect(() => {
    if (loggedIn && !loaded) load();
  }, [loggedIn, loaded, load]);

  if (pathname.startsWith('/admin')) return null;

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
          <path d="M9 21V12h6v9" />
        </svg>
      ),
    },
    {
      href: '/shop',
      label: 'Shop',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      ),
    },
    ...(!isAdmin ? [{
      href: '/orders',
      label: 'Orders',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="0" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      ),
    }] : []),
    ...(loggedIn && !isAdmin ? [{
      href: '/wishlist',
      label: 'Wishlist',
      icon: (active: boolean) => (
        <span className="relative">
          <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          {wishlistCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-on-primary">
              {wishlistCount > 99 ? '99+' : wishlistCount}
            </span>
          )}
        </span>
      ),
    }] : []),
    loggedIn
      ? {
          href: '/profile',
          label: 'Profile',
          icon: (active: boolean) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          ),
        }
      : {
          href: '/login',
          label: 'Login',
          icon: (active: boolean) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
              <polyline points="10 17 15 12 10 7" strokeWidth={active ? '2' : '1.5'} />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          ),
        },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-outline-variant/10 h-20"
      aria-label="Main navigation"
    >
      <div className={`grid h-full max-w-md mx-auto ${isAdmin ? 'grid-cols-3' : loggedIn ? 'grid-cols-5' : 'grid-cols-4'}`}>
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== '/' && href !== '/login' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors ${
                active ? 'text-primary' : 'text-outline hover:text-on-surface'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              {icon(active)}
              <span className={`font-label text-[9px] uppercase tracking-wider ${active ? 'text-primary' : 'text-outline'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
