'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
  color: string;
  images: string[];
}

interface AdminProductFormProps {
  productId?: string;
  initialData?: Partial<ProductFormData>;
}

const EMPTY_FORM: ProductFormData = {
  name: '',
  description: '',
  price: '',
  stock: '',
  categoryId: '',
  color: '',
  images: [],
};

export default function AdminProductForm({ productId, initialData }: AdminProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!productId;

  const [form, setForm] = useState<ProductFormData>({ ...EMPTY_FORM, ...initialData });
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData | 'form', string>>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  useEffect(() => {
    fetch(`${apiUrl}/categories`)
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : data.data ?? []))
      .catch(() => {});
  }, [apiUrl]);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      next.price = 'A valid price is required.';
    if (!form.categoryId) next.categoryId = 'Category is required.';
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      next.stock = 'Stock must be 0 or more.';
    if (!isEdit && form.images.length === 0) next.images = 'At least one image is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    if (!token) { setApiError('Not authenticated.'); return; }

    setUploading(true);
    setApiError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${apiUrl}/uploads`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? 'Upload failed.');
      }
      const { url } = await res.json();
      setForm((f) => ({ ...f, images: [...f.images, url] }));
      setErrors((e) => ({ ...e, images: undefined }));
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function removeImage(idx: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const token = localStorage.getItem('token');
    if (!token) { setApiError('Not authenticated.'); return; }

    setSubmitting(true);
    setApiError(null);

    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      categoryId: form.categoryId,
    };
    if (form.color.trim()) payload.color = form.color.trim();
    if (form.images.length > 0) payload.images = form.images;

    try {
      const url = isEdit ? `${apiUrl}/products/${productId}` : `${apiUrl}/products`;
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? 'Failed to save product.');
      }
      router.push('/admin/products');
      router.refresh();
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong.');
      setSubmitting(false);
    }
  }

  const field = (
    id: keyof ProductFormData,
    label: string,
    input: React.ReactNode
  ) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {input}
      {errors[id] && <p className="mt-1 text-xs text-red-600">{errors[id]}</p>}
    </div>
  );

  const inputCls = (id: keyof ProductFormData) =>
    `w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ${
      errors[id] ? 'border-red-500' : 'border-gray-300'
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 max-w-xl">
      {field(
        'name',
        'Name *',
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={inputCls('name')}
        />
      )}

      {field(
        'description',
        'Description',
        <textarea
          id="description"
          rows={4}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className={`${inputCls('description')} resize-none`}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        {field(
          'price',
          'Price (₦) *',
          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className={inputCls('price')}
          />
        )}
        {field(
          'stock',
          'Stock *',
          <input
            id="stock"
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
            className={inputCls('stock')}
          />
        )}
      </div>

      {field(
        'categoryId',
        'Category *',
        <select
          id="categoryId"
          value={form.categoryId}
          onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
          className={inputCls('categoryId')}
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}

      {field(
        'color',
        'Color',
        <input
          id="color"
          type="text"
          placeholder="e.g. Red, Black"
          value={form.color}
          onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
          className={inputCls('color')}
        />
      )}

      {/* Image upload */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">
          Images {!isEdit && '*'}
        </p>
        {form.images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {form.images.map((url, idx) => (
              <div key={idx} className="relative h-20 w-20 rounded border border-gray-200 overflow-hidden bg-gray-100">
                <Image src={url} alt={`Product image ${idx + 1}`} fill sizes="80px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  aria-label={`Remove image ${idx + 1}`}
                  className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-xs hover:bg-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageUpload}
            className="sr-only"
            disabled={uploading}
          />
          {uploading ? 'Uploading…' : 'Upload image'}
        </label>
        {errors.images && <p className="mt-1 text-xs text-red-600">{errors.images}</p>}
      </div>

      {apiError && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {apiError}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="min-h-[44px] rounded-md bg-gray-900 px-6 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="min-h-[44px] rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
