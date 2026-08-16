"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type VisaRule = {
  id: string;
  requirement: string;
  maxStayDays: number | null;
  active: boolean;
  sourceName: string | null;

  passportCountry: {
    name: string;
  };

  destinationCountry: {
    name: string;
  };

  purpose: {
    name: string;
  };

  visaType: {
    name: string;
  } | null;
};

export default function VisaRulesPage() {
  const [rules, setRules] = useState<VisaRule[]>([]);
  const [status, setStatus] = useState("active");
  const [search, setSearch] = useState("");
  const [passportFilter, setPassportFilter] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("");


  useEffect(() => {
    const controller = new AbortController();

    async function fetchRules() {
      try {
        const response = await fetch(
          `/api/admin/visa-rules?status=${status}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to load visa rules: ${response.status}`);
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setRules(data.rules ?? []);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        if (!controller.signal.aborted) {
          console.error("Failed to load visa rules:", error);
        }
      }
    }

    fetchRules();

    return () => {
      controller.abort();
    };
  }, [status]);

  const filteredRules = rules.filter((rule) => {
    const value = search.toLowerCase();

    const matchesSearch =
      value === "" ||
      rule.passportCountry.name.toLowerCase().includes(value) ||
      rule.destinationCountry.name.toLowerCase().includes(value) ||
      rule.purpose.name.toLowerCase().includes(value) ||
      (rule.sourceName ?? "").toLowerCase().includes(value);

    return (
      matchesSearch &&
      rule.passportCountry.name.toLowerCase().includes(
        passportFilter.toLowerCase()
      ) &&
      rule.destinationCountry.name.toLowerCase().includes(
        destinationFilter.toLowerCase()
      ) &&
      rule.purpose.name.toLowerCase().includes(
        purposeFilter.toLowerCase()
      )
    );
  });

  return (
    <main className="min-h-screen bg-white p-8 text-zinc-900">
      <div className="mx-auto max-w-7xl">

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            Visa Rules
          </h1>

          <Link
            href="/admin/visa-rules/new"
            className="rounded-xl bg-black px-5 py-3 text-white"
          >
            Create Rule
          </Link>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search country, purpose, source..."
          className="mt-6 w-full max-w-md rounded-xl border p-3"
        />

        <div className="mt-4 flex flex-wrap gap-3">

          <input
            value={passportFilter}
            onChange={(e) => setPassportFilter(e.target.value)}
            placeholder="Passport country"
            className="rounded-xl border p-3"
          />

          <input
            value={destinationFilter}
            onChange={(e) => setDestinationFilter(e.target.value)}
            placeholder="Destination country"
            className="rounded-xl border p-3"
          />

          <input
            value={purposeFilter}
            onChange={(e) => setPurposeFilter(e.target.value)}
            placeholder="Purpose"
            className="rounded-xl border p-3"
          />

        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-6 rounded-xl border p-3"
        >
          <option value="active">
            Active Rules
          </option>

          <option value="inactive">
            Inactive Rules
          </option>

          <option value="all">
            All Rules
          </option>
        </select>


        <div className="mt-6 text-sm text-zinc-600">
          Showing {filteredRules.length} of {rules.length} visa rules
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border">

          <table className="w-full text-left text-sm">

            <thead className="border-b bg-zinc-100">
              <tr>
                <th className="p-4">Passport</th>
                <th className="p-4">Destination</th>
                <th className="p-4">Purpose</th>
                <th className="p-4">Requirement</th>
                <th className="p-4">Source</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="border-b">

                  <td className="p-4">
                    {rule.passportCountry.name}
                  </td>

                  <td className="p-4">
                    {rule.destinationCountry.name}
                  </td>

                  <td className="p-4">
                    {rule.purpose.name}
                  </td>

                  <td className="p-4">
                    {rule.requirement}
                  </td>

                  <td className="p-4">
                    {rule.sourceName ?? "-"}
                  </td>

                  <td className="p-4">
                    {rule.active ? "Active" : "Inactive"}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">

                      <Link
                        href={`/admin/visa-rules/${rule.id}`}
                        className="rounded-lg border px-3 py-1"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={async () => {
                          await fetch(
                            `/api/admin/visa-rules/${rule.id}`,
                            {
                              method: "PATCH",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                active: !rule.active,
                              }),
                            },
                          );

                          window.location.reload();
                        }}
                        className={
                          rule.active
                            ? "rounded-lg border border-red-500 px-3 py-1 text-red-600"
                            : "rounded-lg border border-green-500 px-3 py-1 text-green-600"
                        }
                      >
                        {rule.active ? "Deactivate" : "Activate"}
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>
    </main>
  );
}
