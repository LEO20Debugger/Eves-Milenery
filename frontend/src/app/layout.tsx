import type { Metadata } from 'next';
import { QueryProvider } from '@/providers/QueryProvider';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: "Eve's Millinery",
    template: "%s | Eve's Millinery",
  },
  description:
    'Shop premium fascinators and caps for every occasion. Free delivery on orders over ₦50,000.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-surface text-on-surface min-h-dvh">
        <QueryProvider>
          <TopBar />
          <main className="pt-16 pb-24">{children}</main>
          <BottomNav />
        </QueryProvider>
      </body>
    </html>
  );
}
