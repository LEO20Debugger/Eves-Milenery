'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useCartStore from '@/store/cart.store';
import CartDrawer from './CartDrawer';

interface AuthUser {
  name: string;
  role: string;
}

function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
];

export default function NavHeader() {
  const pathname = usePathname();
  const items = useCartStore((s) => s.items);
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getAuthUser());
    // Re-read on storage changes (login/logout in another tab)
    const handler = () => setUser(getAuthUser());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="text-lg font-bold tracking-tight text-gray-900 min-h-[44px] flex items-center">
            Fascinator Cap Store
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors min-h-[44px] flex items-center ${
                  pathname === href ? 'text-gray-900 underline underline-offset-4' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Cart button */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label={`Open cart, ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
              className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span aria-hidden="true" className="text-xl">🛍</span>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Auth — desktop */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    href="/orders"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 min-h-[44px] flex items-center px-2"
                  >
                    {user.name.split(' ')[0]}
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin/products"
                      className="text-sm font-medium text-gray-700 hover:text-gray-900 min-h-[44px] flex items-center px-2"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 min-h-[44px] flex items-center px-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="min-h-[44px] flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span aria-hidden="true" className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav
            id="mobile-menu"
            aria-label="Mobile navigation"
            className="md:hidden border-t border-gray-100 bg-white px-4 pb-4"
          >
            <ul className="space-y-1 pt-2">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block min-h-[44px] flex items-center rounded-md px-3 text-sm font-medium transition-colors ${
                      pathname === href ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              {user ? (
                <>
                  <li>
                    <Link
                      href="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block min-h-[44px] flex items-center rounded-md px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      My Orders ({user.name.split(' ')[0]})
                    </Link>
                  </li>
                  {user.role === 'admin' && (
                    <li>
                      <Link
                        href="/admin/products"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block min-h-[44px] flex items-center rounded-md px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Admin
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                      className="block w-full min-h-[44px] flex items-center rounded-md px-3 text-sm font-medium text-gray-500 hover:bg-gray-50 text-left"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block min-h-[44px] flex items-center rounded-md px-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        )}
      </header>

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
