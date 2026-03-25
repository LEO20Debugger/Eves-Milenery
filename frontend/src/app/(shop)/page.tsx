import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { type ProductCardProps } from '@/components/ProductCard';
import RevealImage from '@/components/RevealImage';

export const metadata: Metadata = {
  title: "Eve's Millinery",
  description:
    'Discover premium fascinators and caps for every occasion. Shop the latest styles with free delivery on orders over ₦50,000.',
  openGraph: {
    title: "Eve's Millinery — Premium Fascinators & Caps",
    description: 'Discover premium fascinators and caps for every occasion.',
    type: 'website',
  },
};

export const revalidate = 60;

interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  price: string | number;
  stock: number;
  initialStock: number;
  images: string[];
  sold?: number;
}

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
}

async function getFeaturedProducts(): Promise<ProductCardProps[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    const res = await fetch(`${baseUrl}/products?limit=6&sort=newest`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    const items: ApiProduct[] = Array.isArray(data) ? data : (data.data ?? []);
    return items.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
      stock: p.stock,
      initialStock: p.initialStock,
      images: p.images,
      sold: p.sold ?? 0,
    }));
  } catch {
    return [];
  }
}

async function getCategories(): Promise<ApiCategory[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    const res = await fetch(`${baseUrl}/categories`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data ?? []);
  } catch {
    return [];
  }
}

async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    const res = await fetch(`${baseUrl}/settings`, { next: { revalidate: 60 } });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

function formatPrice(price: number | string) {
  const n = typeof price === 'string' ? parseFloat(price) : price;
  return n.toLocaleString('en-NG');
}

export default async function HomePage() {
  const [featuredProducts, categories, settings] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getSiteSettings(),
  ]);

  const heroImage = settings.hero_image_url || '';
  const heroHeadline = settings.hero_headline || 'The Occasion Anthology';
  const heroSubtext = settings.hero_subtext || 'New Collection Available';

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative h-screen w-full overflow-hidden bg-primary">
        {heroImage ? (
          <Image
            src={heroImage}
            alt="Eve's Millinery hero"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-80 mix-blend-luminosity"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-container-highest to-surface-dim" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 text-center px-6">
          <p className="font-label text-[0.6875rem] uppercase tracking-[0.3em] text-on-primary-fixed/70 mb-4">
            {heroSubtext}
          </p>
          <h1 className="font-headline italic text-5xl md:text-7xl lg:text-8xl text-on-primary-fixed mb-8 leading-none max-w-3xl">
            {heroHeadline}
          </h1>
          <Link
            href="/shop"
            className="bg-primary text-on-primary px-10 py-4 font-label text-xs tracking-[0.3em] uppercase hover:bg-primary-container transition-colors duration-300 min-h-[44px] inline-flex items-center"
          >
            Shop the Collection
          </Link>
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex items-end justify-between mb-16">
              <h2 className="font-headline text-3xl md:text-4xl">Browse by Category</h2>
              <div className="hidden md:block w-1/3 h-px bg-outline-variant/30 mb-2" />
            </div>
            <div className="flex overflow-x-auto hide-scrollbar gap-10 md:gap-16 pb-4 snap-x">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?categoryId=${cat.id}`}
                  className="flex flex-col items-center flex-shrink-0 group snap-start"
                >
                  <div className="w-24 h-24 md:w-40 md:h-40 rounded-full overflow-hidden border border-outline-variant mb-4 transition-transform duration-500 group-hover:scale-105 relative bg-surface-container">
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        sizes="160px"
                        className="object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-headline text-3xl md:text-5xl text-outline">
                          {cat.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="font-label text-[10px] md:text-xs tracking-widest uppercase text-on-surface group-hover:text-primary transition-colors font-semibold">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured collection split ── */}
      {featuredProducts[0] && (
        <section className="bg-surface-container-low py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
              <div className="space-y-8 md:space-y-12">
                <div className="space-y-4">
                  <span className="font-label text-xs uppercase tracking-[0.4em] text-outline">New Arrival</span>
                  <h2 className="font-headline text-4xl md:text-6xl leading-tight max-w-md">
                    {featuredProducts[0].name}
                  </h2>
                </div>
                <p className="font-body text-on-surface-variant max-w-sm leading-relaxed text-base md:text-lg font-light">
                  Crafted for every occasion. Discover the piece that elevates your look.
                </p>
                <div className="flex items-center gap-6">
                  <span className="font-headline text-2xl">₦{formatPrice(featuredProducts[0].price)}</span>
                  <Link
                    href={`/shop/${featuredProducts[0].slug}`}
                    className="border-b border-primary pb-1 font-label text-xs uppercase tracking-[0.2em] hover:opacity-50 transition-opacity"
                  >
                    View Piece
                  </Link>
                </div>
              </div>
              <Link href={`/shop/${featuredProducts[0].slug}`} className="relative aspect-[3/4] overflow-hidden group block">
                {featuredProducts[0].images?.[0] ? (
                  <RevealImage
                    src={featuredProducts[0].images[0]}
                    alt={featuredProducts[0].name}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-surface-container" />
                )}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Editorial grid ── */}
      <section className="py-24 md:py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-16 md:mb-24 flex flex-col items-center">
            <p className="font-label text-xs uppercase tracking-[0.5em] text-outline mb-4">Editorial</p>
            <div className="w-12 h-px bg-primary" />
          </div>

          {featuredProducts.length > 1 ? (
            <div className="grid grid-cols-12 gap-6 md:gap-8 items-start">
              {/* Large left */}
              {featuredProducts[1] && (
                <div className="col-span-12 md:col-span-5 group">
                  <Link href={`/shop/${featuredProducts[1].slug}`} className="block">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      {featuredProducts[1].images?.[0] ? (
                        <RevealImage
                          src={featuredProducts[1].images[0]}
                          alt={featuredProducts[1].name}
                          sizes="(max-width: 768px) 100vw, 42vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-surface-container" />
                      )}
                    </div>
                    <div className="mt-6">
                      <h3 className="font-headline text-2xl">{featuredProducts[1].name}</h3>
                      <p className="font-body text-outline mt-1">₦{formatPrice(featuredProducts[1].price)}</p>
                    </div>
                  </Link>
                </div>
              )}

              {/* Center column */}
              <div className="col-span-12 md:col-span-3 flex flex-col justify-center gap-12 md:pt-24">
                <div className="space-y-4">
                  <h5 className="font-label text-[10px] uppercase tracking-[0.3em] font-bold">New Season</h5>
                  <p className="font-body text-sm leading-loose text-on-surface-variant">
                    Every piece tells a story. Discover fascinators and caps crafted for the moments that matter.
                  </p>
                </div>
                {featuredProducts[2] && (
                  <Link href={`/shop/${featuredProducts[2].slug}`} className="group block">
                    <div className="relative aspect-square overflow-hidden bg-surface-dim">
                      {featuredProducts[2].images?.[0] ? (
                        <RevealImage
                          src={featuredProducts[2].images[0]}
                          alt={featuredProducts[2].name}
                          sizes="25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-surface-container" />
                      )}
                    </div>
                    <div className="mt-4">
                      <h3 className="font-headline text-lg">{featuredProducts[2].name}</h3>
                      <p className="font-body text-sm text-outline">₦{formatPrice(featuredProducts[2].price)}</p>
                    </div>
                  </Link>
                )}
              </div>

              {/* Right column */}
              <div className="col-span-12 md:col-span-4 md:mt-12">
                {featuredProducts[3] && (
                  <Link href={`/shop/${featuredProducts[3].slug}`} className="group block mb-12">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {featuredProducts[3].images?.[0] ? (
                        <RevealImage
                          src={featuredProducts[3].images[0]}
                          alt={featuredProducts[3].name}
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-surface-container" />
                      )}
                    </div>
                    <div className="mt-6 flex justify-between items-start">
                      <h4 className="font-headline text-2xl md:text-3xl">{featuredProducts[3].name}</h4>
                      <span className="font-body text-base ml-2 flex-shrink-0">₦{formatPrice(featuredProducts[3].price)}</span>
                    </div>
                  </Link>
                )}
                <Link
                  href="/shop"
                  className="border border-outline-variant px-8 py-3 font-label text-[10px] uppercase tracking-[0.2em] hover:bg-primary hover:text-on-primary transition-all inline-block min-h-[44px] flex items-center"
                >
                  View Full Collection
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="font-label text-xs uppercase tracking-widest text-outline">Products coming soon</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Brand quote ── */}
      <section className="py-24 md:py-32 px-12 text-center bg-surface-container-low">
        <p className="font-headline italic text-2xl md:text-4xl leading-relaxed text-on-surface/70 max-w-2xl mx-auto">
          &ldquo;Every occasion deserves a crown. Find yours.&rdquo;
        </p>
        <div className="h-16 w-px bg-outline-variant mx-auto mt-12 opacity-30" />
        <Link
          href="/shop"
          className="inline-flex min-h-[44px] items-center bg-primary text-on-primary px-12 py-5 font-label text-xs uppercase tracking-[0.3em] hover:bg-primary-container transition-colors mt-12"
        >
          Discover the Full Collection
        </Link>
      </section>
    </>
  );
}
