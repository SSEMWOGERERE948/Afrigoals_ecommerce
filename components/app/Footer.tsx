import Link from "next/link";
import { BrandLogo } from "@/components/app/BrandLogo";

export function Footer() {
  return (
    <footer className="bg-gray-900 py-12 text-white md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4">
              <BrandLogo size="md" framed />
            </div>
            <p className="text-sm text-gray-400">
              Your trusted marketplace for premium African sports attire and
              equipment.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Browse</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/products" className="transition hover:text-white">
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=jerseys"
                  className="transition hover:text-white"
                >
                  Jerseys
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=shoes"
                  className="transition hover:text-white"
                >
                  Shoes
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=accessories"
                  className="transition hover:text-white"
                >
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="transition hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/orders" className="transition hover:text-white">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/cart" className="transition hover:text-white">
                  Basket
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Secure checkout</li>
              <li>Fast delivery</li>
              <li>Easy returns</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2026 Afrigoals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
