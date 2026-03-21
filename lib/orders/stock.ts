// lib/orders/stock.ts
import { serverClient } from "@/sanity/lib/serverClient";
import { patchPublished } from "@/lib/sanity/patchPublished";

type OrderItem = {
  product?: {
    _ref?: string;
    _id?: string;
  };
  quantity: number;
};

type OrderLike = {
  _id: string;
  stockReserved?: boolean;
  stockDeducted?: boolean;
  items: OrderItem[];
};

function getProductRef(item: OrderItem): string | null {
  return item.product?._ref || item.product?._id || null;
}

export async function reserveStockForOrder(order: OrderLike): Promise<void> {
  if (order.stockReserved) return;

  for (const item of order.items) {
    const productId = getProductRef(item);
    if (!productId) continue;

    const quantity = Number(item.quantity || 0);
    if (quantity <= 0) continue;

    const product = await serverClient.getDocument(productId);
    if (!product) throw new Error(`Product not found for reservation: ${productId}`);

    const stock = Number(product.stock ?? 0);
    const reservedStock = Number(product.reservedStock ?? 0);
    const availableStock = stock - reservedStock;

    if (availableStock < quantity) {
      throw new Error(
        `Insufficient available stock for "${product.name ?? productId}". Available: ${availableStock}, needed: ${quantity}`
      );
    }

    // Products are not edited in Studio during checkout — plain serverClient patch is fine
    await serverClient
      .patch(productId)
      .set({ reservedStock: reservedStock + quantity })
      .commit();
  }

  // Order document may be open in Studio — patch both published + draft
  await patchPublished(order._id, { stockReserved: true });
}

export async function releaseReservedStockForOrder(order: OrderLike): Promise<void> {
  if (!order.stockReserved || order.stockDeducted) return;

  for (const item of order.items) {
    const productId = getProductRef(item);
    if (!productId) continue;

    const quantity = Number(item.quantity || 0);
    if (quantity <= 0) continue;

    const product = await serverClient.getDocument(productId);
    if (!product) continue;

    const reservedStock = Number(product.reservedStock ?? 0);

    await serverClient
      .patch(productId)
      .set({ reservedStock: Math.max(0, reservedStock - quantity) })
      .commit();
  }

  await patchPublished(order._id, { stockReserved: false });
}

export async function captureReservedStockForPaidOrder(order: OrderLike): Promise<void> {
  if (order.stockDeducted) return;

  for (const item of order.items) {
    const productId = getProductRef(item);
    if (!productId) continue;

    const quantity = Number(item.quantity || 0);
    if (quantity <= 0) continue;

    const product = await serverClient.getDocument(productId);
    if (!product) throw new Error(`Product not found for stock capture: ${productId}`);

    const stock = Number(product.stock ?? 0);
    const reservedStock = Number(product.reservedStock ?? 0);

    if (stock < quantity) {
      throw new Error(
        `Cannot capture stock for "${product.name ?? productId}". stock=${stock}, quantity=${quantity}`
      );
    }

    await serverClient
      .patch(productId)
      .set({
        stock: Math.max(0, stock - quantity),
        reservedStock: Math.max(0, reservedStock - quantity),
      })
      .commit();
  }

  await patchPublished(order._id, { stockReserved: false, stockDeducted: true });
}