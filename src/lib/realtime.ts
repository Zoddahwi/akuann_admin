/**
 * Live updates between open browser tabs.
 *
 * Messages are deliberately content-free -- they name a resource that changed
 * and nothing else. Browsers connect to Supabase Realtime with the public
 * `anon` key, so anything sent here should be treated as public. The client
 * reacts by refetching through the app's own authenticated routes, which is
 * where access control already lives, so no record data crosses this channel.
 */

/** Single channel for the studio. Everything an admin can see is in here. */
export const STUDIO_CHANNEL = "akuann-studio";

/** Event name carried on the channel. */
export const CHANGE_EVENT = "changed";

/** The things a page can care about. */
export type Resource =
  | "invoices"
  | "gowns"
  | "consultations"
  | "clients"
  | "measurements";

export type ChangePayload = {
  resource: Resource;
  /** Set when a single record changed, so a detail page can ignore others. */
  id?: string;
  /** Lets a tab skip the refresh it caused itself. */
  origin?: string;
};
