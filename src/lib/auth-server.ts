import "server-only";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createSession, SESSION_COOKIE, verifySession } from "@/lib/auth";

function sameValue(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export async function credentialsAreValid(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  return Boolean(
    adminEmail &&
      adminPassword &&
      sameValue(email.trim().toLowerCase(), adminEmail.trim().toLowerCase()) &&
      sameValue(password, adminPassword),
  );
}

export async function requireAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function isAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return Boolean(await verifySession(token));
}

export async function sessionFor(email: string) {
  return createSession(email.trim().toLowerCase());
}
