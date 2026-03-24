import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { type ProductCardProps } from '@/components/ProductCard';

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
      {/* Hero */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        {heroImage ? (
          <Image
            src={heroImage}
            alt="Eve's Millinery hero"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center grayscale"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-container-highest to-surface-dim" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 text-center px-6">
          <p className="font-label text-[0.6875rem] uppercase tracking-[0.3em] text-on-primary-fixed/70 mb-4">
            {heroSubtext}
          </p>
          <h1 className="font-headline text-5xl md:text-7xl text-on-primary-fixed mb-8 leading-tight max-w-2xl">
            {heroHeadline}
          </h1>
          <Link
            href="/shop"
            className="bg-primary text-on-primary px-10 py-5 font-label text-xs tracking-[0.2em] uppercase hover:bg-primary-container transition-colors duration-300 min-h-[44px] inline-flex items-center"
          >
            Shop the Collection
          </Link>
        </div>
      </section>

      {/* Categories carousel */}
      {categories.length > 0 && (
        <section className="mt-20 px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-headline text-2xl">Collections</h2>
            <Link
              href="/shop"
              className="font-label text-[10px] tracking-widest border-b border-primary pb-1 uppercase"
            >
              View All
            </Link>
          </div>
          <div className="flex overflow-x-auto hide-scrollbar gap-10 pb-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?categoryId=${cat.id}`}
                className="flex flex-col items-center flex-shrink-0 group"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden border border-outline-variant/30 bg-surface-container mb-3 flex items-center justify-center">
                  <span className="font-headline text-2xl text-outline">
                    {cat.name.charAt(0)}
                  </span>
                </div>
                <span className="font-label text-[10px] tracking-widest uppercase text-on-surface group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Editorial section header */}
      <section className="mt-24 px-6">
        <p className="font-label text-[10px] tracking-[0.4em] text-outline uppercase mb-12">
          New Arrivals — Curated Selection
        </p>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-12 gap-y-16 gap-x-6">
            {/* First product: wide */}
            {featuredProducts[0] && (
              <div className="col-span-12 md:col-span-7 group">
                <Link href={`/shop/${featuredProducts[0].slug}`} className="block">
                  <div className="relative overflow-hidden bg-surface-container-lowest aspect-[4/5]">
                    {featuredProducts[0].images?.[0] ? (
                      <Image
                        src={featuredProducts[0].images[0]}
                        alt={featuredProducts[0].name}
                        fill
                        sizes="(max-width: 768px) 100vw, 58vw"
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-container" />
                    )}
                  </div>
                  <div className="mt-6 flex justify-between items-start">
                    <div>
                      <h3 className="font-headline text-xl">{featuredProducts[0].name}</h3>
                      <p className="font-label text-xs uppercase tracking-widest text-outline mt-1">
                        {featuredProducts[0].stock <= 5 && featuredProducts[0].stock > 0 ? 'Limited Stock' : 'In Stock'}
                      </p>
                    </div>
                    <span className="font-body text-base">
                      ₦{(typeof featuredProducts[0].price === 'number' ? featuredProducts[0].price : parseFloat(String(featuredProducts[0].price))).toLocaleString('en-NG')}
                    </span>
                  </div>
                </Link>
              </div>
            )}

            {/* Second product: offset right */}
            {featuredProducts[1] && (
              <div className="col-span-12 md:col-span-4 md:col-start-9 md:pt-20 group">
                <Link href={`/shop/${featuredProducts[1].slug}`} className="block">
                  <div className="relative overflow-hidden bg-surface-container-lowest aspect-square">
                    {featuredProducts[1].images?.[0] ? (
                      <Image
                        src={featuredProducts[1].images[0]}
                        alt={featuredProducts[1].name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-container" />
                    )}
                  </div>
                  <div className="mt-6 flex justify-between items-start">
                    <div>
                      <h3 className="font-headline text-xl">{featuredProducts[1].name}</h3>
                    </div>
                    <span className="font-body text-base">
                      ₦{(typeof featuredProducts[1].price === 'number' ? featuredProducts[1].price : parseFloat(String(featuredProducts[1].price))).toLocaleString('en-NG')}
                    </span>
                  </div>
                </Link>
              </div>
            )}

            {/* Remaining products: 3-col grid */}
            {featuredProducts.slice(2).map((product) => (
              <div key={product.id} className="col-span-12 md:col-span-4 group">
                <Link href={`/shop/${product.slug}`} className="block">
                  <div className="relative overflow-hidden bg-surface-container-lowest aspect-[3/4]">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-container" />
                    )}
                  </div>
                  <div className="mt-6 flex justify-between items-start">
                    <h3 className="font-headline text-lg">{product.name}</h3>
                    <span className="font-body text-sm text-outline">
                      ₦{(typeof product.price === 'number' ? product.price : parseFloat(String(product.price))).toLocaleString('en-NG')}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="font-label text-xs uppercase tracking-widest text-outline">
              Products coming soon
            </p>
          </div>
        )}
      </section>

      {/* Brand quote */}
      <section className="my-32 px-12 text-center">
        <p className="font-headline italic text-2xl leading-relaxed text-on-surface/70 max-w-xl mx-auto">
          &ldquo;Every occasion deserves a crown. Find yours.&rdquo;
        </p>
        <div className="h-16 w-px bg-outline-variant mx-auto mt-12 opacity-30" />
      </section>

      {/* CTA */}
      <section className="px-6 pb-16 text-center">
        <Link
          href="/shop"
          className="inline-flex min-h-[44px] items-center bg-primary text-on-primary px-12 py-5 font-label text-xs uppercase tracking-[0.3em] hover:bg-primary-container transition-colors"
        >
          Discover the Full Collection
        </Link>
      </section>
    </>
  );
}
