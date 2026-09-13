import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  // PgBouncer (Supabase pooler) operates in transaction mode, which conflicts
  // with Prisma's default connection pool. Setting max=1 keeps each isolate to a
  // single connection and lets the pooler do the pooling, which prevents
  // connection storms and 10054 ConnectionReset errors.
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
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

// On Workers, environment variables are only populated once a request is being
// handled, so the client has to be built on first use rather than at import
// time. The proxy keeps every `prisma.<model>` call site unchanged.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const instance = getClient();
    const value = Reflect.get(instance, property);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
