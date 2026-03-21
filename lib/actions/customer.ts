"use server";

import { client, writeClient } from "@/sanity/lib/client";
import { CUSTOMER_BY_EMAIL_QUERY } from "@/lib/sanity/queries/customers";

interface CustomerResult {
  sanityCustomerId: string;
}

export async function getOrCreateCustomer(
  email: string,
  name: string,
  clerkUserId: string
): Promise<CustomerResult> {
  if (!email) {
    throw new Error("Customer email is required");
  }

  const existingCustomer = await client.fetch(CUSTOMER_BY_EMAIL_QUERY, {
    email,
  });

  if (existingCustomer) {
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