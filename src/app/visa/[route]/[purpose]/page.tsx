import { notFound } from "next/navigation";
import Script from "next/script";

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

  const title = `${passportName} to ${destinationName} Visa Requirements (2026)`;

  const description = `Check ${destinationName} visa requirements for ${passportName} passport holders. Find visa type, stay duration, and latest travel information.`;

  return {
    title,
    description,

    openGraph: {
      title,
      description,
      type: "article",
      siteName: "Visa & Travel Checker",
    },

    twitter: {
      card: "summary",
      title,
      description,
    },
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

  const [passport, destination, travelPurpose] = await Promise.all([
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

    prisma.travelPurpose.findUnique({
      where: {
        code: purpose.toUpperCase(),
      },
    }),
  ]);

  if (!passport || !destination || !travelPurpose) {
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

  const relatedRules = await prisma.visaRule.findMany({
    where: {
      passportCountryId: passport.id,
      purposeId: travelPurpose.id,
      active: true,
      NOT: {
        destinationCountryId: destination.id,
      },
    },
    include: {
      destinationCountry: true,
    },
    take: 5,
  });

  return (
    <main className="min-h-screen bg-zinc-50 p-8 text-zinc-900">
      <div className="mx-auto max-w-4xl">

        <nav className="mb-6 text-sm text-zinc-500">
          Home {" > "} Visa {" > "}
          {rule.passportCountry.name} to{" "}
          {rule.destinationCountry.name}
        </nav>

        <Script
          id="breadcrumb-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Visa",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: `${rule.passportCountry.name} to ${rule.destinationCountry.name} Visa Requirements`,
                },
              ],
            }),
          }}
        />

        <h1 className="text-4xl font-bold">
          {rule.passportCountry.name} to{" "}
          {rule.destinationCountry.name} Visa Requirements
        </h1>

        <p className="mt-3 text-zinc-600">
          Updated visa information for{" "}
          {rule.purpose.name.toLowerCase()} travel.
        </p>

        <div className="mt-6 rounded-3xl border bg-white p-8">

          <h2 className="text-2xl font-bold">
            {rule.passportCountry.name} to{" "}
            {rule.destinationCountry.name} Travel Information
          </h2>

          <p className="mt-4 text-zinc-600 leading-7">
            Travelers holding a {rule.passportCountry.name} passport
            who plan to visit {rule.destinationCountry.name} for{" "}
            {rule.purpose.name.toLowerCase()} should check the latest
            visa requirements, permitted stay duration, and official
            travel information before departure.
          </p>

        </div>


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


        <div className="mt-8 rounded-3xl border bg-white p-8">

          <h2 className="text-2xl font-bold">
            Frequently Asked Questions
          </h2>

          <div className="mt-6 space-y-5">

            <div>
              <h3 className="font-semibold">
                Do {rule.passportCountry.name} citizens need a visa for {rule.destinationCountry.name}?
              </h3>
              <p className="mt-2 text-zinc-600">
                {isVisaRequired(rule.requirement)
                  ? `Yes, travelers from ${rule.passportCountry.name} require a visa for this travel purpose.`
                  : `No visa is generally required for this travel purpose.`}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">
                How long can travelers stay?
              </h3>
              <p className="mt-2 text-zinc-600">
                Maximum stay:
                {" "}
                {rule.maxStayDays
                  ? `${rule.maxStayDays} days`
                  : "Not specified"}
              </p>
            </div>

          </div>

        </div>


        {relatedRules.length > 0 && (
          <div className="mt-8 rounded-3xl border bg-white p-8">

            <h2 className="text-2xl font-bold">
              Related Visa Routes
            </h2>

            <div className="mt-5 space-y-3">

              {relatedRules.map((item) => (
                <a
                  key={item.id}
                  href={`/visa/${passport.slug}-to-${item.destinationCountry.slug}/${purpose.toLowerCase()}`}
                  className="block rounded-xl border p-4 hover:bg-zinc-50"
                >
                  {passport.name} to{" "}
                  {item.destinationCountry.name} Visa Requirements
                </a>
              ))}

            </div>

          </div>
        )}


        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: `Do ${rule.passportCountry.name} citizens need a visa for ${rule.destinationCountry.name}?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: isVisaRequired(rule.requirement)
                      ? "A visa is required for this travel purpose."
                      : "A visa is not required for this travel purpose.",
                  },
                },
              ],
            }),
          }}
        />

      </div>
    </main>
  );
}
