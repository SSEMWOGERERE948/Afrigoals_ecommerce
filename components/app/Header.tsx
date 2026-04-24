"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Menu, Package, Search, ShoppingCart, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/app/BrandLogo";
import { useTotalItems } from "@/lib/store/cart-store-provider";
import { useChatActions, useIsChatOpen } from "@/lib/store/chat-store-provider";

const navLinks = [
  { label: "Browse All", href: "/products" },
  { label: "Jerseys", href: "/products?category=jerseys" },
  { label: "Shoes", href: "/products?category=shoes" },
  { label: "Accessories", href: "/products?category=accessories" },
];

export function Header() {
  const router = useRouter();
  const { openChat } = useChatActions();
  const isChatOpen = useIsChatOpen();
  const totalItems = useTotalItems();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchQuery.trim();
    if (query) {
      router.push(`/products?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/products");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex min-w-fit items-center gap-2">
            <BrandLogo size="sm" priority />
          </Link>

          <form onSubmit={handleSearch} className="hidden flex-1 md:flex">
            <div className="relative w-full">
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search jerseys, shoes, caps..."
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-4 pr-11 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-primary"
                aria-label="Search products"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2">
            <SignedIn>
              <Link
                href="/orders"
                className="hidden items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 lg:flex"
              >
                <Package className="h-4 w-4" />
                My Orders
              </Link>
            </SignedIn>

            {!isChatOpen && (
              <button
                type="button"
                onClick={openChat}
                className="hidden items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 sm:flex"
              >
                <Sparkles className="h-4 w-4" />
                Ask AI
              </button>
            )}

            <Link
              href="/cart"
              className="relative rounded-lg p-2 text-gray-600 transition hover:text-primary dark:text-gray-300"
              aria-label={`Open cart (${totalItems} items)`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            </Link>

            <SignedIn>
              <UserButton
                afterSwitchSessionUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="My Orders"
                    labelIcon={<Package className="h-4 w-4" />}
                    href="/orders"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>

            <SignedOut>
              <Link
                href="/auth/signup"
                className="rounded-lg border border-primary/20 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
              >
                Sign up
              </Link>
            </SignedOut>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="rounded-lg p-2 text-gray-600 transition hover:text-primary dark:text-gray-300 md:hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="pb-4 md:hidden">
          <div className="relative">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products..."
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-4 pr-11 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-primary"
              aria-label="Search products"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>

        {mobileMenuOpen && (
          <nav className="space-y-2 border-t border-gray-200 pb-4 pt-3 dark:border-gray-800 md:hidden">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 text-sm font-medium text-gray-700 transition hover:text-primary dark:text-gray-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <SignedIn>
              <Link
                href="/orders"
                className="block py-2 text-sm font-medium text-gray-700 transition hover:text-primary dark:text-gray-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Orders
              </Link>
            </SignedIn>
          </nav>
        )}
      </div>
    </header>
  );
}
