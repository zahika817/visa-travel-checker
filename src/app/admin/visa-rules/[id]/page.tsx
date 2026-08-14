"use client";

import { FormEvent, useEffect, useState } from "react";

type Rule = {
  id: string;
  requirement: string;
  maxStayDays: number | null;
  sourceName: string | null;
  sourceUrl: string | null;
  notes: string | null;
  active: boolean;

  passportCountry: {
    name: string;
  };

  destinationCountry: {
    name: string;
  };

  purpose: {
    name: string;
  };
};

export default function EditVisaRulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [rule, setRule] = useState<Rule | null>(null);
  const [id, setId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { id } = await params;

      setId(id);

      const response = await fetch(
        `/api/admin/visa-rules/${id}`,
      );

      const data = await response.json();

      setRule(data.rule);
    }

    load();
  }, [params]);


  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const response = await fetch(
      `/api/admin/visa-rules/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requirement: form.get("requirement"),
          maxStayDays: Number(
            form.get("maxStayDays"),
          ),
          sourceName: form.get("sourceName"),
          sourceUrl: form.get("sourceUrl"),
          notes: form.get("notes"),
          active:
            form.get("active") === "on",
        }),
      },
    );


    const data = await response.json();

    setMessage(
      data.success
        ? "Visa rule updated successfully."
        : data.error,
    );
  }


  if (!rule) {
    return (
      <main className="p-8">
        Loading...
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-white p-8 text-zinc-900">

      <div className="mx-auto max-w-3xl">

        <h1 className="text-3xl font-bold">
          Edit Visa Rule
        </h1>

        <p className="mt-2">
          {rule.passportCountry.name}
          {" → "}
          {rule.destinationCountry.name}
          {" → "}
          {rule.purpose.name}
        </p>


        <form
          onSubmit={submit}
          className="mt-8 space-y-5 rounded-2xl border p-6"
        >

          <select
            name="requirement"
            defaultValue={rule.requirement}
            className="w-full rounded-xl border p-3"
          >
            <option value="VISA_REQUIRED">
              Visa Required
            </option>

            <option value="VISA_FREE">
              Visa Free
            </option>

            <option value="EVISA_REQUIRED">
              eVisa Required
            </option>
          </select>


          <input
            name="maxStayDays"
            defaultValue={rule.maxStayDays ?? ""}
            className="w-full rounded-xl border p-3"
          />


          <input
            name="sourceName"
            defaultValue={rule.sourceName ?? ""}
            className="w-full rounded-xl border p-3"
          />


          <input
            name="sourceUrl"
            defaultValue={rule.sourceUrl ?? ""}
            className="w-full rounded-xl border p-3"
          />


          <textarea
            name="notes"
            defaultValue={rule.notes ?? ""}
            className="w-full rounded-xl border p-3"
          />


          <label className="flex gap-2">
            <input
              type="checkbox"
              name="active"
              defaultChecked={rule.active}
            />
            Active
          </label>


          <button className="rounded-xl bg-black px-6 py-3 text-white">
            Save Changes
          </button>


          {message && (
            <p>{message}</p>
          )}

        </form>

      </div>

    </main>
  );
}
