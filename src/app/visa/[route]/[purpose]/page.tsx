import { notFound } from "next/navigation";
import Script from "next/script";

import {
  findVisaRule,
  isVisaRequired,
  getVisaRequirementLabel,
} from "@/lib/visa/rules";
import { prisma } from "@/lib/db";

type PageProps = {
  params: Promise<{
    route: string;
    purpose: string;
  }>;
};

export async function generateStaticParams() {
  const rules = await prisma.visaRule.findMany({
    where: {
      active: true,
    },
    select: {
      passportCountry: {
        select: {
          slug: true,
        },
      },
      destinationCountry: {
        select: {
          slug: true,
        },
      },
      purpose: {
        select: {
          code: true,
        },
      },
    },
  });

  const uniqueRoutes = new Map();

  for (const rule of rules) {
    const key = `${rule.passportCountry.slug}-to-${rule.destinationCountry.slug}-${rule.purpose.code.toLowerCase()}`;

    uniqueRoutes.set(key, {
      route: `${rule.passportCountry.slug}-to-${rule.destinationCountry.slug}`,
      purpose: rule.purpose.code.toLowerCase(),
    });
  }

  return Array.from(uniqueRoutes.values());
}



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

    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/visa/${countries.passport}-${"to"}-${countries.destination}/${purpose.toLowerCase()}`,
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
            {getVisaRequirementLabel(rule.requirement)}
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            <div className="rounded-xl bg-zinc-50 p-4">
              <b>🛂 Visa Status</b>
              <p className="mt-2">
                {isVisaRequired(rule.requirement)
                  ? "Visa Required"
                  : "Visa Free"}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-50 p-4">
              <b>🔖 Visa Type</b>
              <p className="mt-2">
                {rule.visaType?.name ?? "-"}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-50 p-4">
              <b>📅 Maximum Stay</b>
              <p className="mt-2">
                {rule.maxStayDays
                  ? `${rule.maxStayDays} days`
                  : "Not specified"}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-50 p-4">
              <b>🔁 Multiple Entry</b>
              <p className="mt-2">
                {rule.multipleEntry ? "Yes" : "No"}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-50 p-4">
              <b>📘 Passport Type</b>
              <p className="mt-2">
                {rule.ordinaryPassport
                  ? "Ordinary Passport"
                  : "Special Passport"}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-50 p-4">
              <b>🎯 Travel Purpose</b>
              <p className="mt-2">
                {rule.purpose.name}
              </p>
            </div>

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


        <div className="mt-8 rounded-3xl border bg-white p-8">
          <h2 className="text-2xl font-bold">
            Official Visa Information Source
          </h2>

          <p className="mt-4 text-zinc-600">
            This information is based on:
          </p>

          <p className="mt-3 font-semibold">
            {rule.sourceName ?? "Official Government Source"}
          </p>

          {rule.sourceUrl && (
            <a
              href={rule.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-blue-600 underline"
            >
              Visit official source →
            </a>
          )}

          <p className="mt-4 text-sm text-zinc-500">
            Last verified:
            {" "}
            {rule.lastVerifiedAt
              ? new Date(rule.lastVerifiedAt).toLocaleDateString()
              : "Not available"}
          </p>
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
                  className="block rounded-2xl border bg-zinc-50 p-5 hover:bg-white"
                >
                  <p className="font-semibold">
                    {passport.name} → {item.destinationCountry.name}
                  </p>

                  <p className="mt-2 text-sm text-zinc-600">
                    {item.destinationCountry.name} visa requirements for{" "}
                    {purpose.toLowerCase()} travel
                  </p>

                  <p className="mt-3 text-sm font-medium">
                    View Details →
                  </p>
                </a>
              ))}

            </div>

          </div>
        )}


        <Script
          id="article-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": `${rule.passportCountry.name} to ${rule.destinationCountry.name} Visa Requirements`,
              "description": `Visa requirements for ${rule.passportCountry.name} passport holders traveling to ${rule.destinationCountry.name} for ${rule.purpose.name.toLowerCase()} purposes.`,
              "dateModified": rule.lastVerifiedAt ?? rule.effectiveFrom,
              "author": {
                "@type": "Organization",
                "name": "Visa Requirement Checker"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Visa Requirement Checker"
              }
            }),
          }}
        />



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
                {
                  "@type": "Question",
                  name: "How long can travelers stay?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: rule.maxStayDays
                      ? `The maximum stay is ${rule.maxStayDays} days.`
                      : "The maximum stay depends on the applicable visa rules.",
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
