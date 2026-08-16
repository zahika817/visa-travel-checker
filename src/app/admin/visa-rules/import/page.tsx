"use client";

import { useState } from "react";

type ImportReport = {
  created: number;
  skipped: number;
  errors: string[];
};

export default function ImportVisaRulesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [message, setMessage] = useState("");

  async function uploadCSV() {
    if (!file) {
      setMessage("Please select a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      "/api/admin/visa-rules/import",
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();

    if (data.success) {
      setReport(data.report);
      setMessage("CSV import completed successfully.");
    } else {
      setMessage(data.error);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-8 text-zinc-900">
      <div className="mx-auto max-w-4xl">

        <h1 className="text-3xl font-bold">
          Import Visa Rules
        </h1>

        <p className="mt-2 text-zinc-600">
          Upload CSV and import visa rules into database.
        </p>

        <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">

          <input
            type="file"
            accept=".csv"
            onChange={(e) =>
              setFile(e.target.files?.[0] ?? null)
            }
            className="w-full rounded-xl border p-3"
          />

          <button
            onClick={uploadCSV}
            className="mt-5 rounded-xl bg-black px-6 py-3 text-white"
          >
            Import CSV
          </button>

          {message && (
            <p className="mt-4 text-sm">
              {message}
            </p>
          )}

        </div>

        {report && (
          <div className="mt-6 rounded-2xl border bg-white p-6">

            <h2 className="text-xl font-bold">
              Import Report
            </h2>

            <div className="mt-4 space-y-2 text-sm">
              <p>
                Created: {report.created}
              </p>

              <p>
                Skipped: {report.skipped}
              </p>

              <p>
                Errors: {report.errors.length}
              </p>
            </div>

            {report.errors.length > 0 && (
              <pre className="mt-4 overflow-auto rounded-xl bg-zinc-100 p-4 text-sm">
                {JSON.stringify(report.errors, null, 2)}
              </pre>
            )}

          </div>
        )}

      </div>
    </main>
  );
}
