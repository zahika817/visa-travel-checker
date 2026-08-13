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
            Know your visa requirements before you travel.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
            Check visa requirements based on your passport, destination, and
            purpose of travel.
          </p>
        </div>

        <VisaChecker />
      </section>
    </main>
  );
}
