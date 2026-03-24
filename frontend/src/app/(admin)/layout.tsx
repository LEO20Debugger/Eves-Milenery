'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) { router.replace('/'); return; }
    try {
      const user = JSON.parse(raw) as { role?: string };
      if (user.role !== 'admin') router.replace('/');
    } catch {
      router.replace('/');
    }
  }, [router]);

  return <>{children}</>;
}
