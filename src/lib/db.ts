import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { getCloudflareContext } from "@opennextjs/cloudflare";

type HyperdriveBinding = { connectionString: string };

/**
 * On Workers, connect through the Hyperdrive binding rather than straight to
 * Supabase. Workers cannot complete the Postgres STARTTLS upgrade against the
 * Supabase pooler -- the TLS handshake succeeds and the first write then fails
 * with "Network connection lost" -- so a direct connection is not an option.
 * Hyperdrive makes that connection outside the isolate and exposes a local,
 * plaintext connection string, which also pools across requests.
 *
 * `next dev` runs on Node, where DATABASE_URL works directly.
 */
function resolveConnection() {
  try {
    const env = getCloudflareContext().env as unknown as {
      HYPERDRIVE?: HyperdriveBinding;
    };
    if (env?.HYPERDRIVE?.connectionString) {
      return { connectionString: env.HYPERDRIVE.connectionString, viaHyperdrive: true };
    }
  } catch {
    // No Cloudflare context: running under plain Node (`next dev`).
  }

  return { connectionString: process.env.DATABASE_URL, viaHyperdrive: false };
}

function createPrismaClient() {
  const { connectionString, viaHyperdrive } = resolveConnection();

  // Hyperdrive does the pooling, so the adapter can keep a normal local pool.
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

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

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

// On Workers, bindings and environment variables are only available while a
// request is being handled, so the client has to be built on first use rather
// than at import time. The proxy keeps every `prisma.<model>` call site unchanged.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const instance = getClient();
    const value = Reflect.get(instance, property);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
