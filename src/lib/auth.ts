const encoder = new TextEncoder();

export const SESSION_COOKIE = "akuann_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

type SessionPayload = {
  email: string;
  exp: number;
};

function toBase64Url(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return atob(padded);
}

async function signingKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to a random value of at least 32 characters.");
  }

  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signature(value: string) {
  const key = await signingKey();
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(String.fromCharCode(...new Uint8Array(signed)));
}

export async function createSession(email: string) {
  const payload: SessionPayload = { email, exp: Date.now() + SESSION_DURATION_MS };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  return `${encodedPayload}.${await signature(encodedPayload)}`;
}

export async function verifySession(token: string | undefined) {
  if (!token) return null;

  const [encodedPayload, encodedSignature] = token.split(".");
  if (!encodedPayload || !encodedSignature) return null;

  try {
    const expectedSignature = await signature(encodedPayload);
    if (encodedSignature !== expectedSignature) return null;

    const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;
    if (!payload.email || !payload.exp || payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const sessionCookie = {
  name: SESSION_COOKIE,
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  },
};
