"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type RealtimeConfig = { url: string; anonKey: string } | null;

const ConfigContext = createContext<RealtimeConfig>(null);

/**
 * Carries the Supabase connection details from the server to the client.
 *
 * They cannot come from NEXT_PUBLIC_* variables: those are inlined when the app
 * is built, and the build runs in CI where the values are not present -- they
 * exist only as Worker secrets at runtime. The root layout is a server
 * component, so it can read them per request and hand them down here.
 *
 * The anon key is a public credential by design. It is only safe because the
 * database grants it nothing: see prisma/sql/001_lock_down_anon_access.sql.
 */
export function RealtimeProvider({
  url,
  anonKey,
  children,
}: {
  url?: string;
  anonKey?: string;
  children: ReactNode;
}) {
  const config = useMemo<RealtimeConfig>(
    () => (url && anonKey ? { url, anonKey } : null),
    [url, anonKey],
  );

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

/** One client per browser tab, shared by every subscriber on the page. */
let cached: { url: string; client: SupabaseClient } | undefined;

export function useRealtimeClient(): SupabaseClient | null {
  const config = useContext(ConfigContext);

  return useMemo(() => {
    if (!config) return null;
    if (cached?.url === config.url) return cached.client;

    try {
      const client = createClient(config.url, config.anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      cached = { url: config.url, client };
      return client;
    } catch (error) {
      // Live updates are an enhancement; pages work without them.
      console.error("Live updates unavailable:", error);
      return null;
    }
  }, [config]);
}
