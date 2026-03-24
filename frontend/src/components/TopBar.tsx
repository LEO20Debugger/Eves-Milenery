'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

export default function TopBar() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getAuthUser());
    const handler = () => setUser(getAuthUser());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav h-16 flex items-center justify-between px-6 border-b border-outline-variant/10">
        {/* Left: menu / back */}
        <div className="flex items-center w-10">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open menu"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-on-surface"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {/* Center: logo */}
        <Link href="/" className="font-headline text-sm md:text-xl tracking-[0.2em] md:tracking-[0.3em] font-bold text-primary whitespace-nowrap">
          EVE&apos;S MILLINERY
        </Link>

        {/* Right: cart */}
        <div className="flex items-center w-10 justify-end">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label={`Open cart, ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
            className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-on-surface"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-on-primary">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Slide-down menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}>
          <nav
            className="absolute top-16 left-0 right-0 glass-nav border-b border-outline-variant/10 px-6 py-6"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="space-y-1">
              {[
                { href: '/', label: 'Home' },
                { href: '/shop', label: 'Shop' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="block font-label text-xs uppercase tracking-[0.2em] py-3 border-b border-outline-variant/20 text-on-surface hover:text-primary transition-colors"
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
                      onClick={() => setMenuOpen(false)}
                      className="block font-label text-xs uppercase tracking-[0.2em] py-3 border-b border-outline-variant/20 text-on-surface hover:text-primary transition-colors"
                    >
                      My Orders ({user.name.split(' ')[0]})
                    </Link>
                  </li>
                  {user.role === 'admin' && (
                    <>
                      <li>
                        <Link
                          href="/admin/products"
                          onClick={() => setMenuOpen(false)}
                          className="block font-label text-xs uppercase tracking-[0.2em] py-3 border-b border-outline-variant/20 text-on-surface hover:text-primary transition-colors"
                        >
                          Admin — Products
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/admin/orders"
                          onClick={() => setMenuOpen(false)}
                          className="block font-label text-xs uppercase tracking-[0.2em] py-3 border-b border-outline-variant/20 text-on-surface hover:text-primary transition-colors"
                        >
                          Admin — Orders
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/admin/settings"
                          onClick={() => setMenuOpen(false)}
                          className="block font-label text-xs uppercase tracking-[0.2em] py-3 border-b border-outline-variant/20 text-on-surface hover:text-primary transition-colors"
                        >
                          Admin — Settings
                        </Link>
                      </li>
                    </>
                  )}
                  <li>
                    <button
                      onClick={() => { setMenuOpen(false); handleLogout(); }}
                      className="block w-full text-left font-label text-xs uppercase tracking-[0.2em] py-3 text-outline hover:text-primary transition-colors"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block font-label text-xs uppercase tracking-[0.2em] py-3 text-on-surface hover:text-primary transition-colors"
                  >
                    Login / Sign Up
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
