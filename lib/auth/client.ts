"use client";

import { useCallback, useEffect, useState } from "react";

export type AuthUser = {
  id: string;
  email: string;
  role: "admin" | "user";
};

type AuthState =
  | { status: "loading"; user: null }
  | { status: "signed_out"; user: null }
  | { status: "signed_in"; user: AuthUser };

export function useAuthState() {
  const [state, setState] = useState<AuthState>({
    status: "loading",
    user: null,
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        setState({ status: "signed_out", user: null });
        return;
      }
      const data = (await res.json()) as AuthUser;
      if (!data?.id || !data?.email || !data?.role) {
        setState({ status: "signed_out", user: null });
        return;
      }
      setState({ status: "signed_in", user: data });
    } catch {
      setState({ status: "signed_out", user: null });
    }
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await refresh();
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ...state,
    isSignedIn: state.status === "signed_in",
    refresh,
    signOut,
  };
}
