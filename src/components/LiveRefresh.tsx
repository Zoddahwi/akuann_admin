"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useRealtimeClient } from "@/components/RealtimeProvider";
import {
  CHANGE_EVENT,
  STUDIO_CHANNEL,
  type ChangePayload,
  type Resource,
} from "@/lib/realtime";

type Props = {
  /** Only react to these resources. Omit to react to any change. */
  watch?: Resource[];
  /** Only react when this specific record changed, for detail pages. */
  id?: string;
  /**
   * Called instead of router.refresh(). Needed by client components that hold
   * their rows in state, where re-rendering the server route changes nothing.
   */
  onChange?: (change: ChangePayload) => void;
};

/**
 * Updates the current page when someone else changes something.
 *
 * The broadcast carries no record data -- only the name of what changed -- so
 * the update is fetched back through the app's own authenticated routes, where
 * access control already lives. Nothing sensitive crosses the public channel.
 */
export default function LiveRefresh({ watch, id, onChange }: Props) {
  const router = useRouter();
  const supabase = useRealtimeClient();

  // Kept in refs so changing props do not tear down the subscription.
  const watchRef = useRef(watch);
  const idRef = useRef(id);
  const onChangeRef = useRef(onChange);
  watchRef.current = watch;
  idRef.current = id;
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!supabase) return;

    // Collapses bursts, e.g. a save that touches several tables at once.
    let pending: ReturnType<typeof setTimeout> | undefined;

    const channel: RealtimeChannel = supabase
      .channel(STUDIO_CHANNEL)
      .on("broadcast", { event: CHANGE_EVENT }, ({ payload }) => {
        const change = payload as ChangePayload;
        const watched = watchRef.current;

        if (watched && !watched.includes(change.resource)) return;
        if (idRef.current && change.id && change.id !== idRef.current) return;

        if (pending) clearTimeout(pending);
        pending = setTimeout(() => {
          const handler = onChangeRef.current;
          if (handler) handler(change);
          else router.refresh();
        }, 150);
      })
      .subscribe();

    return () => {
      if (pending) clearTimeout(pending);
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  return null;
}
