// lib/sanity/queries/orders.ts

export const ORDER_BY_ID_QUERY = `
  *[_type == "order" && _id == $id][0]{
    _id,
    orderNumber,
    clerkUserId,
    email,
    total,
    status,
    currency,
    paymentMethod,
    pesapalTrackingId,
    pesapalPaymentId,
    pesapalStatus,
    createdAt,
    paidAt,
    address{
      name,
      line1,
      line2,
      city,
      postcode,
      country
    },
    items[]{
      _key,
      quantity,
      priceAtPurchase,
      productName,
      product->{
        _id,
        name,
        "slug": slug.current,
        "image": images[0]{
          asset->{
            url
          }
        }
      }
    }
  }
`;

export const ORDER_BY_PESAPAL_MERCHANT_REFERENCE_QUERY = `
  *[_type == "order" && pesapalMerchantReference == $pesapalMerchantReference][0]{
    _id,
    orderNumber,
    status,
    pesapalStatus,
    pesapalTrackingId,
    pesapalPaymentId,
    stockReserved,
    stockDeducted,
    paidAt,
    items[]{
      _key,
      quantity,
      priceAtPurchase,
      productName,
      product
    }
  }
`;

export const ORDERS_BY_USER_QUERY = `
  *[_type == "order" && clerkUserId == $clerkUserId] | order(_createdAt desc){
    _id,
    orderNumber,
    status,
    total,
    createdAt,
    "itemCount": count(items),
    "itemNames": items[].productName,
    "itemImages": items[].product->images[0].asset->url
  }
`;