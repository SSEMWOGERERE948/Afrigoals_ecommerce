import "server-only";

import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "./constants";

export function getAuthToken(): string | null {
  // NOTE: Next 16 cookies() is async
  throw new Error("use getAuthTokenAsync() instead");
}

export async function getAuthTokenAsync(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}
