import { notFound } from "next/navigation";

import { findVisaRule, isVisaRequired } from "@/lib/visa/rules";
import { prisma } from "@/lib/db";

type PageProps = {
  params: Promise<{
    route: string;
    purpose: string;
  }>;
};

function parseRoute(route: string) {
  const parts = route.split("-to-");

  if (parts.length !== 2) {
    return null;
  }

  return {
    passport: parts[0],
    destination: parts[1],
  };
}

export async function generateMetadata({ params }: PageProps) {
  const { route, purpose } = await params;

  const countries = parseRoute(route);

  if (!countries) {
    return {};
  }

  const passportName = countries.passport.replace(/-/g, " ");
  const destinationName = countries.destination.replace(/-/g, " ");

  return {
    title: `${passportName} to ${destinationName} Visa Requirements (2026)`,
    description: `Check ${destinationName} visa requirements for ${passportName} passport holders. Find visa type, stay duration, and latest travel information.`,
  };
}

export default async function VisaRoutePage({
  params,
}: PageProps) {
  const { route, purpose } = await params;

  const countries = parseRoute(route);

  if (!countries) {
    notFound();
  }

  const [passport, destination] = await Promise.all([
    prisma.country.findUnique({
      where: {
        slug: countries.passport,
      },
    }),

    prisma.country.findUnique({
      where: {
        slug: countries.destination,
      },
    }),
  ]);

  if (!passport || !destination) {
    notFound();
  }

  const rule = await findVisaRule({
    passportCode: passport.code,
    destinationCode: destination.code,
    purposeCode: purpose.toUpperCase(),
  });

  if (!rule) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-8 text-zinc-900">
      <div className="mx-auto max-w-4xl">

        <h1 className="text-4xl font-bold">
          {rule.passportCountry.name} to{" "}
          {rule.destinationCountry.name} Visa Requirements
        </h1>

        <p className="mt-3 text-zinc-600">
          Updated visa information for{" "}
          {rule.purpose.name.toLowerCase()} travel.
        </p>

        <div className="mt-8 rounded-3xl border bg-white p-8">

          <h2 className="text-2xl font-bold">
            {isVisaRequired(rule.requirement)
              ? "Visa Required"
              : "Visa Free"}
          </h2>

          <div className="mt-6 space-y-3">
            <p>
              Purpose: {rule.purpose.name}
            </p>

            <p>
              Visa Type: {rule.visaType?.name ?? "-"}
            </p>

            <p>
              Maximum Stay:{" "}
              {rule.maxStayDays
                ? `${rule.maxStayDays} days`
                : "Not specified"}
            </p>

            <p>
              Source: {rule.sourceName ?? "-"}
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}
