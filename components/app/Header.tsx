"use client";

import Link from "next/link";
import { Package, ShoppingBag, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartActions, useTotalItems } from "@/lib/store/cart-store-provider";
import { useChatActions, useIsChatOpen } from "@/lib/store/chat-store-provider";
import { useAuthState } from "@/lib/auth/client";

export function Header() {
  const { openCart } = useCartActions();
  const { openChat } = useChatActions();
  const isChatOpen = useIsChatOpen();
  const totalItems = useTotalItems();
  const { isSignedIn, user, signOut } = useAuthState();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Afrigoals Store
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* My Orders - disabled until orders endpoint is implemented */}
          {isSignedIn ? (
            <Button asChild>
              <Link href="/orders" className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <span className="text-sm font-medium">My Orders</span>
              </Link>
            </Button>
          ) : null}

          {/* AI Shopping Assistant */}
          {!isChatOpen && (
            <Button
              onClick={openChat}
              className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200/50 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-300/50 dark:shadow-amber-900/30 dark:hover:shadow-amber-800/40"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Ask AI</span>
            </Button>
          )}

          {/* Cart Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={openCart}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
            <span className="sr-only">Open cart ({totalItems} items)</span>
          </Button>

          {/* User */}
          {isSignedIn ? (
            <div className="flex items-center gap-2">
              {user?.role === "admin" ? (
                <Button
                  asChild
                  variant="outline"
                  className="hidden sm:inline-flex"
                >
                  <Link href="/admin">Admin</Link>
                </Button>
              ) : null}
              <Button variant="ghost" size="icon" onClick={signOut}>
                <User className="h-5 w-5" />
                <span className="sr-only">Sign out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                className="hidden sm:inline-flex"
              >
                <Link href="/admin/signin">Admin</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="hidden gap-2 sm:inline-flex"
              >
                <Link href="/signin">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Sign in</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="sm:hidden">
                <Link href="/signin">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Sign in</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
