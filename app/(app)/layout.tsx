import { AppShell } from "@/components/app/AppShell";
import { CartSheet } from "@/components/app/CartSheet";
import { ChatSheet } from "@/components/app/ChatSheet";
import { Footer } from "@/components/app/Footer";
import { Header } from "@/components/app/Header";
import { Toaster } from "@/components/ui/sonner";
import { CartStoreProvider } from "@/lib/store/cart-store-provider";
import { ChatStoreProvider } from "@/lib/store/chat-store-provider";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartStoreProvider>
      <ChatStoreProvider>
        <AppShell>
          <Header />
          <main>{children}</main>
          <Footer />
        </AppShell>
        <CartSheet />
        <ChatSheet />
        <Toaster position="bottom-center" />
      </ChatStoreProvider>
    </CartStoreProvider>
  );
}

export default AppLayout;
