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


  useEffect(() => {
    const controller = new AbortController();

    async function fetchRules() {
      const response = await fetch(
        `/api/admin/visa-rules?status=${status}`,
        {
          signal: controller.signal,
        },
      );

      const data = await response.json();

      setRules(data.rules ?? []);
    }

    fetchRules();

    return () => {
      controller.abort();
    };
  }, [status]);

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
              {rules.map((rule) => (
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
                    <Link
                      href={`/admin/visa-rules/${rule.id}`}
                      className="rounded-lg border px-3 py-1"
                    >
                      Edit
                    </Link>
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
