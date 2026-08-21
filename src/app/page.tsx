import VisaChecker from "@/components/visa/VisaChecker";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16">
        <div className="mb-10 max-w-3xl text-center">
          <div className="mb-4 inline-flex rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Visa & Travel Checker
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-zinc-950 sm:text-6xl">
            Check Visa Requirements Worldwide Before You Travel
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
            Find visa requirements for tourism, study, and work travel
            based on your passport country and destination.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="font-semibold">
                🌍 Global Coverage
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Multiple countries and travel routes
              </p>
            </div>

            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="font-semibold">
                ✅ Structured Data
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Organized visa requirement information
              </p>
            </div>

            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="font-semibold">
                ✈️ Travel Purpose Based
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Tourism, study and work options
              </p>
            </div>
          </div>
        </div>

        <VisaChecker />
      </section>
    </main>
  );
}
