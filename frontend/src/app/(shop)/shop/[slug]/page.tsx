import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import ImageGallery from '@/components/ImageGallery';
import ProductActions from '@/components/ProductActions';
import ReviewList from '@/components/ReviewList';
import ReviewSection from '@/components/ReviewSection';
import ProductCard, { type ProductCardProps } from '@/components/ProductCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  stock: number;
  initialStock: number;
  categoryId: string | null;
  images: string[];
  color: string | null;
  reviews?: ApiReview[];
}

interface ApiReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  approved: boolean;
  deleted: number;
  createdAt: string;
}

async function getProductBySlug(slug: string): Promise<ApiProduct | null> {
  try {
    const res = await fetch(`${API_URL}/products?slug=${encodeURIComponent(slug)}&limit=1`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data: ApiProduct[] = Array.isArray(json) ? json : (json.data ?? []);
    return data[0] ?? null;
  } catch {
    return null;
  }
}

async function getReviews(productId: string): Promise<ApiReview[]> {
  try {
    const res = await fetch(`${API_URL}/reviews?productId=${productId}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : (json.data ?? []);
  } catch {
    return [];
  }
}

async function getRelatedProducts(categoryId: string, currentId: string): Promise<ApiProduct[]> {
  try {
    const res = await fetch(
      `${API_URL}/products?categoryId=${categoryId}&limit=6`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    const json = await res.json();
    const data: ApiProduct[] = Array.isArray(json) ? json : (json.data ?? []);
    return data.filter((p) => p.id !== currentId).slice(0, 5);
  } catch {
    return [];
  }
}

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The product you are looking for could not be found.',
    };
  }

  const title = product.name;
  const description =
    product.description ??
    `Shop ${product.name} at Fascinator Cap Store. Price: ₦${parseFloat(product.price).toLocaleString('en-NG', { minimumFractionDigits: 2 })}.`;
  const imageUrl = product.images[0];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fascinatorcapstore.com';

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Fascinator Cap Store`,
      description,
      type: 'website',
      url: `${siteUrl}/shop/${product.slug}`,
      ...(imageUrl && {
        images: [{ url: imageUrl, width: 1200, height: 630, alt: product.name }],
      }),
    },
  };
}

export const revalidate = 60;

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [reviews, relatedProducts] = await Promise.all([
    getReviews(product.id),
    product.categoryId ? getRelatedProducts(product.categoryId, product.id) : Promise.resolve([]),
  ]);

  const price = parseFloat(product.price);
  const outOfStock = product.stock === 0;

  const cartProduct = {
    id: product.id,
    name: product.name,
    price,
    images: product.images,
    stock: product.stock,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-gray-900">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/shop" className="hover:text-gray-900">Shop</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</li>
        </ol>
      </nav>

      {/* Product section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image gallery */}
        <ImageGallery images={product.images} productName={product.name} />

        {/* Product info + sticky CTAs */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              ₦{price.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </p>

            {/* Stock status */}
            <p className="mt-2 text-sm text-gray-500">
              {outOfStock ? (
                <span className="font-medium text-red-600">Out of stock</span>
              ) : (
                <>
                  <span className="font-medium text-green-600">In stock</span>
                  {product.stock <= 5 && (
                    <span className="ml-1 text-amber-600">— only {product.stock} left</span>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Description
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{product.description}</p>
            </div>
          )}

          {/* Sticky CTAs */}
          <div className="sticky bottom-4 z-10 rounded-xl bg-white/90 p-4 shadow-lg backdrop-blur-sm ring-1 ring-gray-200 lg:static lg:shadow-none lg:ring-0 lg:p-0 lg:bg-transparent lg:backdrop-blur-none">
            <ProductActions product={cartProduct} />
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-12" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="text-xl font-bold text-gray-900">
          Customer Reviews
        </h2>
        <div className="mt-4">
          <ReviewList reviews={reviews} />
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <ReviewSection productId={product.id} />
        </div>
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-12" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-xl font-bold text-gray-900">
            You might also like
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {relatedProducts.map((p) => {
              const cardProps: ProductCardProps = {
                id: p.id,
                slug: p.slug,
                name: p.name,
                price: parseFloat(p.price),
                stock: p.stock,
                initialStock: p.initialStock,
                images: p.images,
              };
              return <ProductCard key={p.id} {...cardProps} />;
            })}
          </div>
        </section>
      )}
    </div>
  );
}
