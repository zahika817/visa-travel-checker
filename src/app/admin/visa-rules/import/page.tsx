"use client";

import { useState } from "react";

export default function ImportVisaRulesPage() {
  const [fileName, setFileName] = useState("");

  return (
    <main className="min-h-screen bg-zinc-50 p-8 text-zinc-900">
      <div className="mx-auto max-w-3xl">

        <h1 className="text-3xl font-bold">
          Import Visa Rules
        </h1>

        <p className="mt-2 text-zinc-600">
          Upload a CSV file to import multiple visa rules.
        </p>

        <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">

          <label className="block text-sm font-semibold">
            CSV File
          </label>

          <input
            type="file"
            accept=".csv"
            onChange={(e) =>
              setFileName(e.target.files?.[0]?.name ?? "")
            }
            className="mt-3 w-full rounded-xl border p-3"
          />

          {fileName && (
            <p className="mt-3 text-sm text-zinc-600">
              Selected: {fileName}
            </p>
          )}

          <button
            className="mt-6 rounded-xl bg-black px-6 py-3 text-white"
          >
            Upload CSV
          </button>

        </div>

        <div className="mt-6 rounded-xl border bg-white p-5 text-sm">
          <h2 className="font-bold">
            CSV Format
          </h2>

          <p className="mt-2 text-zinc-600">
            Required columns: passport, destination, purpose,
            visaType, requirement, maxStayDays, sourceName,
            sourceUrl, notes
          </p>
        </div>

      </div>
    </main>
  );
}
