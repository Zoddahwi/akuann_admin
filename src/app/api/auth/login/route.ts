import { NextResponse } from "next/server";
import { credentialsAreValid, sessionFor } from "@/lib/auth-server";
import { sessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const requestedNext = String(formData.get("next") ?? "/");
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/";

  if (!(await credentialsAreValid(email, password))) {
    return NextResponse.redirect(new URL(`/login?error=invalid&next=${encodeURIComponent(next)}`, request.url), 303);
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set(sessionCookie.name, await sessionFor(email), sessionCookie.options);
  return response;
}
