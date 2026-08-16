import Link from "next/link";

import { getCurrentAdmin } from "@/lib/auth";
import { getAdminStats } from "@/lib/admin-stats";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function AdminPage() {
  const admin = await getCurrentAdmin();
  const stats = await getAdminStats();
  return (
    <main className="min-h-screen bg-zinc-50 p-8 text-zinc-900">
      <div className="mx-auto max-w-6xl">

        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">
            Admin Dashboard
          </h1>

          <LogoutButton />
        </div>

        <p className="mt-2 text-zinc-600">
          Manage visa rules, travel data and verification sources.
        </p>

        {admin && (
          <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">
              Logged in as
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              {admin.name}
            </h2>

            <p className="text-sm text-zinc-600">
              {admin.email} · {admin.role}
            </p>
          </div>
        )}


        <div className="mt-8 grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">
              Visa Rules
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {stats.totalVisaRules}
            </h2>

            <p className="mt-2 text-sm">
              Create and update visa requirements.
            </p>
          </div>


          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">
              Data Quality
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {stats.activeVisaRules}
            </h2>

            <p className="mt-2 text-sm">
              Track official sources and updates.
            </p>
          </div>


          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">
              Public Tool
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {stats.totalCountries}
            </h2>

            <p className="mt-2 text-sm">
              Test visitor visa searches.
            </p>
          </div>

        </div>


        <div className="mt-8 grid gap-6 md:grid-cols-2">


          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h2 className="text-xl font-semibold">
              Visa Rules Management
            </h2>

            <p className="mt-2 text-zinc-600">
              Add, edit, activate or deactivate visa rules.
            </p>

            <Link
              href="/admin/visa-rules"
              className="mt-5 inline-block rounded-xl bg-black px-5 py-3 text-white"
            >
              Manage Rules
            </Link>

          </div>


          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h2 className="text-xl font-semibold">
              Public Visa Checker
            </h2>

            <p className="mt-2 text-zinc-600">
              Open the user-facing visa search tool.
            </p>

            <Link
              href="/visa-checker"
              className="mt-5 inline-block rounded-xl border px-5 py-3"
            >
              Open Checker
            </Link>

          </div>


          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h2 className="text-xl font-semibold">
              Bulk Import Rules
            </h2>

            <p className="mt-2 text-zinc-600">
              Import multiple visa rules using CSV files.
            </p>

            <Link
              href="/admin/visa-rules/import"
              className="mt-5 inline-block rounded-xl bg-black px-5 py-3 text-white"
            >
              Import Rules
            </Link>

          </div>


        </div>

      </div>
    </main>
  );
}
