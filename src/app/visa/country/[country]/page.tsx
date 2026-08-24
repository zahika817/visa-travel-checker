import { notFound } from "next/navigation";
import Script from "next/script";
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
    title: `${data.name} Visa Requirements`,
    description: `Check visa requirements, travel rules and entry information for ${data.name}.`,
  };
}

export default async function DestinationPage({
  params,
}: PageProps) {
  const { country } = await params;

  const destination = await prisma.country.findUnique({
    where: {
      slug: country,
    },
  });

  if (!destination) {
    notFound();
  }

  const rules = await prisma.visaRule.findMany({
    where: {
      destinationCountryId: destination.id,
      active: true,
    },
    include: {
      passportCountry: true,
      purpose: true,
    },
    take: 20,
  });

  const totalRoutes = await prisma.visaRule.count({
    where: {
      destinationCountryId: destination.id,
      active: true,
    },
  });

  const purposes = await prisma.travelPurpose.findMany({
    where: {
      visaRules: {
        some: {
          destinationCountryId: destination.id,
          active: true,
        },
      },
    },
    select: {
      name: true,
    },
  });

  return (
    <main className="min-h-screen bg-zinc-50 p-8 text-zinc-900">
      <div className="mx-auto max-w-4xl">

        <h1 className="text-4xl font-bold text-zinc-900">
          {destination.name} Visa Requirements
        </h1>

        <p className="mt-4 text-zinc-700">
          Find visa requirements and travel information for
          travelers visiting {destination.name}.
        </p>

        <Script
          id="destination-faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": `Do travelers need a visa for ${destination.name}?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `Visa requirements for ${destination.name} depend on the traveler's passport and travel purpose.`
                  }
                },
                {
                  "@type": "Question",
                  "name": `What visa purposes are available for ${destination.name}?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `Available purposes include ${purposes.map((p) => p.name).join(", ")}.`
                  }
                },
                {
                  "@type": "Question",
                  "name": `How many visa routes are available for ${destination.name}?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `${destination.name} has ${totalRoutes} available visa routes.`
                  }
                }
              ]
            }),
          }}
        />


        <div className="mt-8 rounded-2xl border bg-white p-6">
          <p className="text-sm text-zinc-500">
            Available Visa Routes
          </p>

          <p className="mt-2 text-3xl font-bold text-zinc-900">
            {totalRoutes}
          </p>
        </div>

        <Script
          id="destination-faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": `Do travelers need a visa for ${destination.name}?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `Visa requirements for ${destination.name} depend on the traveler's passport and travel purpose.`
                  }
                },
                {
                  "@type": "Question",
                  "name": `What visa purposes are available for ${destination.name}?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `Available purposes include ${purposes.map((p) => p.name).join(", ")}.`
                  }
                },
                {
                  "@type": "Question",
                  "name": `How many visa routes are available for ${destination.name}?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `${destination.name} has ${totalRoutes} available visa routes.`
                  }
                }
              ]
            }),
          }}
        />


        <div className="mt-8 rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-bold text-zinc-900">
            Available Travel Purposes
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            {purposes.map((purpose) => (
              <span
                key={purpose.name}
                className="rounded-full bg-zinc-100 px-4 py-2 text-sm"
              >
                {purpose.name}
              </span>
            ))}
          </div>
        </div>



        <div className="mt-8 space-y-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-2xl border bg-white p-5"
            >
              <h2 className="font-bold text-zinc-900">
                {rule.passportCountry.name} to{" "}
                {destination.name}
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
