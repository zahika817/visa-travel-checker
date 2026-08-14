"use client";

import { FormEvent, useEffect, useState } from "react";

type Option = {
  code: string;
  name: string;
};

export default function NewVisaRulePage() {
  const [countries, setCountries] = useState<Option[]>([]);
  const [purposes, setPurposes] = useState<Option[]>([]);
  const [visaTypes, setVisaTypes] = useState<Option[]>([]);

  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      const response = await fetch("/api/reference-data");
      const data = await response.json();

      setCountries(data.countries);
      setPurposes(data.purposes);

      setVisaTypes([
        { code: "TOURIST", name: "Tourist Visa" },
        { code: "BUSINESS", name: "Business Visa" },
        { code: "STUDENT", name: "Student Visa" },
        { code: "WORK", name: "Work Visa" },
      ]);
    }

    void loadData();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const payload = {
      passportCode: form.get("passportCode"),
      destinationCode: form.get("destinationCode"),
      purposeCode: form.get("purposeCode"),
      visaTypeCode: form.get("visaTypeCode"),
      requirement: form.get("requirement"),
      maxStayDays: Number(form.get("maxStayDays")),
      multipleEntry: form.get("multipleEntry") === "on",
      sourceName: form.get("sourceName"),
      sourceUrl: form.get("sourceUrl"),
      notes: form.get("notes"),
    };

    const response = await fetch("/api/admin/visa-rules/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    setMessage(
      data.success
        ? "Visa rule created successfully."
        : data.error,
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-zinc-950">
          Create Visa Rule
        </h1>

        <form
          onSubmit={submit}
          className="mt-8 space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm"
        >
          <select name="passportCode" className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm text-zinc-900">
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>

          <select name="destinationCode" className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm text-zinc-900">
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>

          <select name="purposeCode" className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm text-zinc-900">
            {purposes.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>

          <select name="visaTypeCode" className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm text-zinc-900">
            {visaTypes.map((v) => (
              <option key={v.code} value={v.code}>
                {v.name}
              </option>
            ))}
          </select>

          <select name="requirement" className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm text-zinc-900">
            <option value="VISA_REQUIRED">Visa Required</option>
            <option value="VISA_FREE">Visa Free</option>
            <option value="EVISA_REQUIRED">eVisa Required</option>
            <option value="VISA_ON_ARRIVAL">Visa On Arrival</option>
          </select>

          <input
            name="maxStayDays"
            placeholder="Maximum stay days"
            className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm text-zinc-900"
          />

          <input
            name="sourceName"
            placeholder="Source name"
            className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm text-zinc-900"
          />

          <input
            name="sourceUrl"
            placeholder="Source URL"
            className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm text-zinc-900"
          />

          <textarea
            name="notes"
            placeholder="Notes"
            className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm text-zinc-900"
          />

          <label className="flex gap-2">
            <input type="checkbox" name="multipleEntry" />
            Multiple Entry
          </label>

          <button className="rounded-xl bg-black px-6 py-3 text-white">
            Save Rule
          </button>

          {message && (
            <p className="text-sm">{message}</p>
          )}
        </form>
      </div>
    </main>
  );
}
