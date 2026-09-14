import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { getCloudflareContext } from "@opennextjs/cloudflare";

type HyperdriveBinding = { connectionString: string };

/**
 * Workers tie every socket to the request that opened it, so a client cached in
 * module scope works on an isolate's first request and then hangs forever on
 * the next one ("the Workers runtime canceled this request because it detected
 * that your Worker's code had hung"). Detect the runtime the same way `pg`
 * does, and keep one client per request there.
 */
const onWorkers =
  typeof navigator === "object" &&
  navigator !== null &&
  navigator.userAgent === "Cloudflare-Workers";

function createPrismaClient(connectionString: string | undefined, viaHyperdrive: boolean) {
  // Hyperdrive pools on its own, so the adapter can keep a normal local pool.
  // Talking to PgBouncer directly is the case that needs max=1: it runs in
  // transaction mode, which conflicts with Prisma's own pool and causes
  // connection storms and 10054 ConnectionReset errors.
  const adapter = new PrismaPg(
    viaHyperdrive ? { connectionString } : { connectionString, max: 1 },
  );

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

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
function buildClient() {
  try {
    const { env } = getCloudflareContext();
    const hyperdrive = (env as unknown as { HYPERDRIVE?: HyperdriveBinding }).HYPERDRIVE;
    if (hyperdrive?.connectionString) {
      return createPrismaClient(hyperdrive.connectionString, true);
    }
  } catch {
    // No Cloudflare context: running under plain Node.
  }

  return createPrismaClient(process.env.DATABASE_URL, false);
}

// One client per request on Workers, keyed by that request's ExecutionContext.
const perRequestClients = new WeakMap<object, PrismaClient>();

// A single pooled client off Workers, so `next dev` does not open a new pool
// (and leak a Supabase connection) on every request.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
let nodeClient: PrismaClient | undefined = globalForPrisma.prisma;

function getClient(): PrismaClient {
  if (onWorkers) {
    let key: object | undefined;
    try {
      key = getCloudflareContext().ctx as unknown as object;
    } catch {
      // Outside a request context; fall through to a one-off client.
    }

    if (!key) return buildClient();

    let client = perRequestClients.get(key);
    if (!client) {
      client = buildClient();
      perRequestClients.set(key, client);
    }
    return client;
  }

  if (!nodeClient) {
    nodeClient = buildClient();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = nodeClient;
    }
  }
  return nodeClient;
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
