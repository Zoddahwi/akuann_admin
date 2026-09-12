type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, next } = await searchParams;
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-md items-center px-6 py-12">
      <section className="w-full rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-neutral-400">Akuann Studio</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-500">Use your studio administrator credentials to access the dashboard.</p>

        {error === "invalid" && (
          <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Your email or password is incorrect.
          </p>
        )}

        <form action="/api/auth/login" method="post" className="mt-7 space-y-5">
          <input type="hidden" name="next" value={safeNext} />
          <label className="block text-sm font-medium text-neutral-800">
            Email
            <input name="email" type="email" autoComplete="email" required className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2.5 outline-none transition focus:border-neutral-900" />
          </label>
          <label className="block text-sm font-medium text-neutral-800">
            Password
            <input name="password" type="password" autoComplete="current-password" required className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2.5 outline-none transition focus:border-neutral-900" />
          </label>
          <button type="submit" className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700">
            Sign in
          </button>
        </form>
      </section>
    </div>
  );
}
