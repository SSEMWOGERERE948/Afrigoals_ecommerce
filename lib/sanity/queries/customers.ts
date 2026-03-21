"use server";

import { client, writeClient } from "@/sanity/lib/client";

const CUSTOMER_BY_EMAIL_QUERY = `*[_type == "customer" && email == $email][0]`;

interface CustomerResult {
  sanityCustomerId: string;
}

/**
 * Gets or creates a customer in Sanity
 * (Pesapal does not store customers like pesapal)
 */
export async function getOrCreateCustomer(
  email: string,
  name: string,
  clerkUserId: string
): Promise<CustomerResult> {
  if (!email) {
    throw new Error("Customer email is required");
  }

  // 1. Check if customer exists in Sanity
  const existingCustomer = await client.fetch(CUSTOMER_BY_EMAIL_QUERY, {
    email,
  });

  if (existingCustomer) {
    // Update basic info if needed (keep data fresh)
    await writeClient
      .patch(existingCustomer._id)
      .set({
        name,
        clerkUserId,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    return {
      sanityCustomerId: existingCustomer._id,
    };
  }

  // 2. Create new customer
  const newCustomer = await writeClient.create({
    _type: "customer",
    email,
    name,
    clerkUserId,
    createdAt: new Date().toISOString(),
  });

  return {
    sanityCustomerId: newCustomer._id,
  };
}

export { CUSTOMER_BY_EMAIL_QUERY };
