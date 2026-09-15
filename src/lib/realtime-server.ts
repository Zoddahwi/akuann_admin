import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { CHANGE_EVENT, STUDIO_CHANNEL, type ChangePayload, type Resource } from "@/lib/realtime";

/**
 * Tell open tabs that something changed.
 *
 * Uses Realtime's HTTP broadcast endpoint rather than a websocket, because a
 * Worker handling a request has no reason to hold a socket open. Sent with the
 * service role key, which stays on the server.
 *
 * This is best-effort by design: a mutation that succeeded must not be reported
 * as failed because a notification did not go out. Failures are logged and
 * swallowed, and the send is handed to waitUntil so it never delays the
 * response.
 */
export function notifyChange(resource: Resource, id?: string): void {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // Not configured (e.g. a local checkout without Supabase). Say so rather
    // than dropping updates silently, but never fail the calling mutation.
    console.warn(
      "Realtime broadcast skipped: missing " +
        [!url && "NEXT_PUBLIC_SUPABASE_URL", !key && "SUPABASE_SERVICE_ROLE_KEY"]
          .filter(Boolean)
          .join(" and "),
    );
    return;
  }

  const payload: ChangePayload = { resource, ...(id ? { id } : {}) };

  const send = fetch(`${url}/realtime/v1/api/broadcast`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ topic: STUDIO_CHANNEL, event: CHANGE_EVENT, payload }],
    }),
  })
    .then((res) => {
      if (!res.ok) console.error(`Realtime broadcast failed: ${res.status} ${res.statusText}`);
    })
    .catch((error) => {
      console.error("Realtime broadcast error:", error);
    });

  // On Workers a promise not tied to the request is cancelled when the response
  // is returned, so hand it to the runtime to finish in the background.
  try {
    getCloudflareContext().ctx.waitUntil(send);
  } catch {
    // No Cloudflare context (plain Node): the promise settles on its own.
  }
}
