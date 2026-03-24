import { create } from 'zustand';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export interface WishlistProduct {
  productId: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  stock: number;
}

interface WishlistState {
  items: WishlistProduct[];
  loaded: boolean;
  load: () => Promise<void>;
  add: (productId: string) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  toggle: (productId: string) => Promise<void>;
  has: (productId: string) => boolean;
  clear: () => void;
}

const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loaded: false,

  load: async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      set({
        loaded: true,
        items: data.map((i: any) => ({
          productId: i.productId,
          name: i.name,
          slug: i.slug,
          price: parseFloat(i.price),
          images: i.images ?? [],
          stock: i.stock,
        })),
      });
    } catch {}
  },

  add: async (productId) => {
    const token = getToken();
    if (!token) return;
    await fetch(`${API}/wishlist/${productId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    await get().load();
  },

  remove: async (productId) => {
    const token = getToken();
    if (!token) return;
    await fetch(`${API}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    set((s) => ({ items: s.items.filter((i) => i.productId !== productId) }));
  },

  toggle: async (productId) => {
    if (get().has(productId)) await get().remove(productId);
    else await get().add(productId);
  },

  has: (productId) => get().items.some((i) => i.productId === productId),

  clear: () => set({ items: [], loaded: false }),
}));

export default useWishlistStore;
