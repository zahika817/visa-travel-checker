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
    title: `${data.name} Passport Visa Requirements 2026 - Visa Free Countries & Travel Rules`,
    description: `Find visa requirements, visa free countries, eVisa information and travel rules for ${data.name} passport holders worldwide.`,
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

  const visaFreeCountries = await prisma.visaRule.findMany({
    where: {
      passportCountryId: passport.id,
      active: true,
      requirement: "VISA_FREE",
    },
    include: {
      destinationCountry: true,
    },
    take: 20,
  });

  return (
    <main className="min-h-screen bg-zinc-50 p-8 text-zinc-900">
      <div className="mx-auto max-w-4xl">

        <h1 className="text-4xl font-bold text-zinc-900">
          {passport.name} Passport Visa Requirements 2026
        </h1>

        <p className="mt-4 text-zinc-700">
          Find visa requirements for {passport.name} passport
          holders traveling worldwide.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-zinc-500">
              Total Routes
            </p>
            <p className="mt-2 text-3xl font-bold text-zinc-900">
              {totalRoutes}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-zinc-500">
              Visa Required
            </p>
            <p className="mt-2 text-3xl font-bold text-zinc-900">
              {visaRequired}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-zinc-500">
              Visa Free
            </p>
            <p className="mt-2 text-3xl font-bold text-zinc-900">
              {visaFree}
            </p>
          </div>

        </div>


        <div className="mt-8 rounded-2xl border bg-white p-6">
          <h2 className="text-2xl font-bold text-zinc-900">
            Visa Free Countries for {passport.name} Passport Holders
          </h2>

          <p className="mt-3 text-zinc-600">
            Countries where {passport.name} passport holders can travel
            without a traditional visa requirement.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {visaFreeCountries.map((rule) => (
              <a
                key={rule.id}
                href={`/visa/${passport.slug}-to-${rule.destinationCountry.slug}/tourism`}
                className="rounded-xl border bg-zinc-50 p-4 hover:bg-white"
              >
                <p className="font-semibold text-zinc-900">
                  {rule.destinationCountry.name}
                </p>

                <p className="mt-1 text-sm text-blue-600">
                  Check visa details →
                </p>
              </a>
            ))}
          </div>
        </div>



        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": `Do ${passport.name} passport holders need visas?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `Visa requirements for ${passport.name} passport holders depend on the destination country and travel purpose.`
                  }
                },
                {
                  "@type": "Question",
                  "name": `How many visa routes are available for ${passport.name} passport holders?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `${passport.name} passport holders can check ${totalRoutes} available visa routes and travel requirements on this website.`
                  }
                },
                {
                  "@type": "Question",
                  "name": `Where can I check ${passport.name} visa requirements?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `You can check destination-specific visa requirements for ${passport.name} passport holders using the available visa route pages.`
                  }
                },
                {
                  "@type": "Question",
                  "name": `Which countries are visa free for ${passport.name} passport holders?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `${passport.name} passport holders can view available visa free destinations listed on this page.`
                  }
                }
              ]
            }),
          }}
        />


        <div className="mt-8 space-y-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-2xl border bg-white p-5"
            >
              <h2 className="font-bold text-zinc-900">
                {passport.name} to{" "}
                {rule.destinationCountry.name}
              </h2>

              <p className="mt-2">
                Purpose: {rule.purpose.name}
              </p>

              <a
                href={`/visa/${passport.slug}-to-${rule.destinationCountry.slug}/${rule.purpose.code.toLowerCase()}`}
                className="mt-4 inline-block text-blue-600 underline"
              >
                View Visa Requirements →
              </a>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
