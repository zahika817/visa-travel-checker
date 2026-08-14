import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-zinc-950">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-zinc-600">
          Manage visa rules and travel data.
        </p>

        <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Visa Rules
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Create, update and verify visa requirements.
          </p>

          <Link
            href="/admin/visa-rules"
            className="mt-5 inline-block rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Manage Visa Rules
          </Link>
        </div>
      </div>
    </main>
  );
}
