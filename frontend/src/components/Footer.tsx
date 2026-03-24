import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Shop</p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/shop" className="text-sm text-gray-600 hover:text-gray-900 min-h-[44px] inline-flex items-center">All Products</Link></li>
              <li><Link href="/cart" className="text-sm text-gray-600 hover:text-gray-900 min-h-[44px] inline-flex items-center">Cart</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Account</p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 min-h-[44px] inline-flex items-center">Login</Link></li>
              <li><Link href="/register" className="text-sm text-gray-600 hover:text-gray-900 min-h-[44px] inline-flex items-center">Register</Link></li>
              <li><Link href="/orders" className="text-sm text-gray-600 hover:text-gray-900 min-h-[44px] inline-flex items-center">My Orders</Link></li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-sm font-semibold text-gray-900">Fascinator Cap Store</p>
            <p className="mt-3 text-sm text-gray-500">
              Premium fascinators and caps for every occasion. Free delivery on orders over ₦50,000.
            </p>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Fascinator Cap Store. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
