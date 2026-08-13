"use client";

import { FormEvent, useEffect, useState } from "react";

type Country = {
  code: string;
  name: string;
};

type Purpose = {
  code: string;
  name: string;
  description: string | null;
};

type VisaResult = {
  passport: Country;
  destination: Country;
  purpose: {
    code: string;
    name: string;
  };
  requirement: string;
  visaRequired: boolean;
  visaType: {
    code: string;
    name: string;
  } | null;
  maxStayDays: number | null;
  multipleEntry: boolean;
  ordinaryPassport: boolean;
  effectiveFrom: string | null;
  effectiveUntil: string | null;
};

export default function VisaChecker() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [purposes, setPurposes] = useState<Purpose[]>([]);

  const [passportCode, setPassportCode] = useState("PK");
  const [destinationCode, setDestinationCode] = useState("FR");
  const [purposeCode, setPurposeCode] = useState("TOURISM");

  const [loadingReferenceData, setLoadingReferenceData] = useState(true);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<VisaResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReferenceData() {
      try {
        const response = await fetch("/api/reference-data");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to load reference data.");
        }

        setCountries(data.countries);
        setPurposes(data.purposes);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load reference data.",
        );
      } finally {
        setLoadingReferenceData(false);
      }
    }

    loadReferenceData();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setChecking(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/visa-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          passportCode,
          destinationCode,
          purposeCode,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to determine visa requirements.",
        );
      }

      setResult(data.result);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to determine visa requirements.",
      );
    } finally {
      setChecking(false);
    }
  }

  if (loadingReferenceData) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-zinc-500">Loading visa checker...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl sm:p-8"
      >
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label
              htmlFor="passport"
              className="mb-2 block text-sm font-semibold text-zinc-900"
            >
              Passport
            </label>

            <select
              id="passport"
              value={passportCode}
              onChange={(event) => setPassportCode(event.target.value)}
              className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="destination"
              className="mb-2 block text-sm font-semibold text-zinc-900"
            >
              Destination
            </label>

            <select
              id="destination"
              value={destinationCode}
              onChange={(event) => setDestinationCode(event.target.value)}
              className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="purpose"
              className="mb-2 block text-sm font-semibold text-zinc-900"
            >
              Travel purpose
            </label>

            <select
              id="purpose"
              value={purposeCode}
              onChange={(event) => setPurposeCode(event.target.value)}
              className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
            >
              {purposes.map((purpose) => (
                <option key={purpose.code} value={purpose.code}>
                  {purpose.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={checking}
          className="mt-6 h-12 w-full rounded-xl bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {checking
            ? "Checking visa requirements..."
            : "Check Visa Requirements"}
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl">
          <div className="border-b border-zinc-200 p-6 sm:p-8">
            <p className="text-sm font-medium text-zinc-500">
              {result.passport.name} → {result.destination.name}
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
              {result.visaRequired
                ? "Visa required"
                : "Visa not required"}
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              For {result.purpose.name.toLowerCase()} travel
            </p>
          </div>

          <div className="grid gap-px bg-zinc-200 sm:grid-cols-2">
            <div className="bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Requirement
              </p>

              <p className="mt-2 text-lg font-semibold capitalize text-zinc-950">
                {result.requirement.replaceAll("_", " ")}
              </p>
            </div>

            <div className="bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Visa type
              </p>

              <p className="mt-2 text-lg font-semibold text-zinc-950">
                {result.visaType?.name ?? "Not specified"}
              </p>
            </div>

            <div className="bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Maximum stay
              </p>

              <p className="mt-2 text-lg font-semibold text-zinc-950">
                {result.maxStayDays
                  ? `${result.maxStayDays} days`
                  : "Not specified"}
              </p>
            </div>

            <div className="bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Entry
              </p>

              <p className="mt-2 text-lg font-semibold text-zinc-950">
                {result.multipleEntry
                  ? "Multiple entry"
                  : "Single entry"}
              </p>
            </div>
          </div>

          <div className="border-t border-zinc-200 bg-zinc-50 p-6">
            <p className="text-xs leading-5 text-zinc-500">
              This result is based on the visa rules currently stored in
              the system. Always verify requirements with the destination
              country&apos;s official immigration or consular authority before
              travelling.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
