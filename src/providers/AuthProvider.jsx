"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { authClient } from "@/lib/auth-client";

const AuthContext = createContext(null);

// Refresh a little before expiry so an in-flight request never races the deadline.
const EXPIRY_SKEW_MS = 60_000;

function expiresAt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1])).exp * 1000;
  } catch {
    return 0; // unparseable token is treated as expired
  }
}

export function AuthProvider({ children }) {
  const { data: session, isPending } = authClient.useSession();
  // { userId, token, exp } — userId lets us drop a previous user's token on switch
  const [jwt, setJwt] = useState(null);
  const inflight = useRef(null);
  const userId = session?.user?.id;

  const fetchJwt = useCallback(async (uid) => {
    inflight.current ??= (async () => {
      try {
        // Plain fetch rather than authClient.*: the jwt client plugin's method
        // names move between better-auth releases, the endpoint path does not.
        const res = await fetch("/api/auth/token", { credentials: "include" });
        if (!res.ok) return null;
        const { token } = await res.json();
        setJwt(token ? { userId: uid, token, exp: expiresAt(token) } : null);
        return token ?? null;
      } finally {
        inflight.current = null;
      }
    })();
    return inflight.current;
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fresh =
      jwt?.userId === userId && jwt.exp - EXPIRY_SKEW_MS > Date.now();
    if (!fresh) fetchJwt(userId);
  }, [userId, jwt, fetchJwt]);

  const refreshJwt = useCallback(() => fetchJwt(userId), [fetchJwt, userId]);

  const logout = useCallback(async () => {
    await authClient.signOut();
    setJwt(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      role: session?.user?.role ?? null,
      jwt: jwt && jwt.userId === userId ? jwt.token : null,
      isLoading: isPending,
      isAuthenticated: Boolean(session?.user),
      refreshJwt,
      logout,
    }),
    [session?.user, jwt, userId, isPending, refreshJwt, logout]
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
