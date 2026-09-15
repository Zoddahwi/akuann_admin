import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { getCloudflareContext } from "@opennextjs/cloudflare";

type HyperdriveBinding = { connectionString: string };

/**
 * Workers tie every socket to the request that opened it, so a connection
 * cached in the isolate makes later requests hang ("the Workers runtime
 * canceled this request because it detected that your Worker's code had hung").
 * Detected the same way `pg` detects it.
 */
const onWorkers =
  typeof navigator === "object" &&
  navigator !== null &&
  navigator.userAgent === "Cloudflare-Workers";

/**
 * On Workers, connect through the Hyperdrive binding rather than straight to
 * Supabase. Workers cannot complete the Postgres STARTTLS upgrade against the
 * Supabase pooler -- the TLS handshake succeeds and the first write then fails
 * with "Network connection lost" -- so a direct connection is not an option.
 * Hyperdrive opens that connection outside the isolate and exposes a local,
 * plaintext connection string.
 *
 * `next dev` runs on Node, where DATABASE_URL works directly.
 */
function resolveConnection() {
  try {
    const { env } = getCloudflareContext();
    const hyperdrive = (env as unknown as { HYPERDRIVE?: HyperdriveBinding }).HYPERDRIVE;
    if (hyperdrive?.connectionString) {
      return { connectionString: hyperdrive.connectionString, viaHyperdrive: true };
    }
  } catch {
    // No Cloudflare context: running under plain Node.
  }

  return { connectionString: process.env.DATABASE_URL, viaHyperdrive: false };
}

function createPrismaClient() {
  const { connectionString, viaHyperdrive } = resolveConnection();

  // maxUses=1 makes the pool discard a connection as soon as it is released, so
  // no socket is ever handed to a later request. That is what lets a single
  // client be reused across requests on Workers: building a PrismaClient costs
  // real CPU (roughly 60-90ms per request when done per request, against ~30ms
  // total for a route that does not touch the database), and the CPU limit is
  // charged per request.
  //
  // Off Workers, ordinary pooling is fine. max=1 there is for talking to
  // PgBouncer directly: it runs in transaction mode, which conflicts with
  // Prisma's own pool and causes connection storms and 10054 ConnectionReset
  // errors. Hyperdrive does its own pooling, so it does not need the cap.
  const poolConfig = onWorkers
    ? { connectionString, max: 5, maxUses: 1 }
    : { connectionString, max: viaHyperdrive ? 10 : 1 };

  return new PrismaClient({
    adapter: new PrismaPg(poolConfig),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

let client: PrismaClient | undefined = globalForPrisma.prisma;

function getClient() {
  if (!client) {
    client = createPrismaClient();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = client;
    }
  }
  return client;
}

// Bindings and environment variables are only available while a request is
// being handled, so the client has to be built on first use rather than at
// import time. The proxy keeps every `prisma.<model>` call site unchanged.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const instance = getClient();
    const value = Reflect.get(instance, property);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
