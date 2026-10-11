import Link from "next/link";

export default function Home() {
  const fabwashUrl =
    process.env.NEXT_PUBLIC_FABWASH_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "");

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex max-w-6xl items-center px-6 py-6">
        <Link className="text-xl font-bold" href="/">
          Nexora
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 sm:pt-20">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Nexora applications
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
          Choose an application for your business.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-300">
          Select an application to visit its home page, where you can sign in
          or register your company.
        </p>

        <div className="mt-12 grid max-w-4xl gap-5 sm:grid-cols-2">
          <article className="rounded-2xl border border-cyan-400/40 bg-slate-900 p-6 shadow-xl">
            <div className="text-4xl" aria-hidden="true">
              🧵
            </div>
            <h2 className="mt-4 text-2xl font-semibold">FabWash</h2>
            <p className="mt-2 text-slate-300">
              Textile fabric receiving and washing operations for your company.
            </p>
            {fabwashUrl ? (
              <a
                href={fabwashUrl}
                className="mt-6 inline-flex rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
              >
                Open FabWash
              </a>
            ) : (
              <p className="mt-6 text-sm text-amber-200">
                FabWash is not configured for this deployment.
              </p>
            )}
          </article>

          <article className="flex flex-col justify-center rounded-2xl border border-dashed border-slate-700 p-6 text-slate-400">
            <h2 className="text-lg font-semibold text-slate-200">
              More applications
            </h2>
            <p className="mt-2 text-sm">
              Additional Nexora applications will appear here when available.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
