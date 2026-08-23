import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

type PageProps = {
  params: Promise<{
    country: string;
  }>;
};

export async function generateStaticParams() {
  const countries = await prisma.country.findMany({
    where: {
      active: true,
    },
    select: {
      slug: true,
    },
  });

  return countries.map((country) => ({
    country: country.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { country } = await params;

  const data = await prisma.country.findUnique({
    where: {
      slug: country,
    },
  });

  if (!data) {
    return {};
  }

  return {
    title: `${data.name} Passport Visa Requirements`,
    description: `Check visa requirements and travel rules for ${data.name} passport holders worldwide.`,
  };
}

export default async function PassportPage({
  params,
}: PageProps) {
  const { country } = await params;

  const passport = await prisma.country.findUnique({
    where: {
      slug: country,
    },
  });

  if (!passport) {
    notFound();
  }

  const rules = await prisma.visaRule.findMany({
    where: {
      passportCountryId: passport.id,
      active: true,
    },
    include: {
      destinationCountry: true,
      purpose: true,
    },
    take: 20,
  });

  const totalRoutes = await prisma.visaRule.count({
    where: {
      passportCountryId: passport.id,
      active: true,
    },
  });

  const visaRequired = await prisma.visaRule.count({
    where: {
      passportCountryId: passport.id,
      active: true,
      requirement: "VISA_REQUIRED",
    },
  });

  const visaFree = await prisma.visaRule.count({
    where: {
      passportCountryId: passport.id,
      active: true,
      requirement: "VISA_FREE",
    },
  });

  return (
    <main className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-4xl">

        <h1 className="text-4xl font-bold">
          {passport.name} Passport Visa Requirements
        </h1>

        <p className="mt-4 text-zinc-600">
          Find visa requirements for {passport.name} passport
          holders traveling worldwide.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-zinc-500">
              Total Routes
            </p>
            <p className="mt-2 text-3xl font-bold">
              {totalRoutes}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-zinc-500">
              Visa Required
            </p>
            <p className="mt-2 text-3xl font-bold">
              {visaRequired}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-zinc-500">
              Visa Free
            </p>
            <p className="mt-2 text-3xl font-bold">
              {visaFree}
            </p>
          </div>

        </div>



        <div className="mt-8 space-y-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-2xl border bg-white p-5"
            >
              <h2 className="font-bold">
                {passport.name} to{" "}
                {rule.destinationCountry.name}
              </h2>

              <p className="mt-2">
                Purpose: {rule.purpose.name}
              </p>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
