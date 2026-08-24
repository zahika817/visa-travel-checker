import VisaChecker from "@/components/visa/VisaChecker";
import Script from "next/script";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function Home() {

  const popularRoutes = await prisma.visaRule.findMany({
    where: {
      active: true,
    },
    include: {
      passportCountry: true,
      destinationCountry: true,
      purpose: true,
    },
    take: 6,
  });

  const popularDestinations = await prisma.country.findMany({
    where: {
      active: true,
    },
    orderBy: {
      destinationRules: {
        _count: "desc",
      },
    },
    take: 6,
  });

  const passportGuides = await prisma.country.findMany({
    where: {
      active: true,
    },
    orderBy: {
      passportRules: {
        _count: "desc",
      },
    },
    take: 6,
  });

  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16">
        <div className="mb-10 max-w-3xl text-center">
          <div className="mb-4 inline-flex rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Visa & Travel Checker
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-zinc-950 sm:text-6xl">
            Check Visa Requirements Worldwide Before You Travel
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
            Find visa requirements for tourism, study, and work travel
            based on your passport country and destination.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="font-semibold">
                🌍 Global Coverage
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Multiple countries and travel routes
              </p>
            </div>

            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="font-semibold">
                ✅ Structured Data
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Organized visa requirement information
              </p>
            </div>

            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="font-semibold">
                ✈️ Travel Purpose Based
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Tourism, study and work options
              </p>
            </div>
          </div>
        </div>

        <VisaChecker />

        <Script
          id="homepage-faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is a visa requirement checker?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "A visa requirement checker helps travelers find visa rules based on their passport country, destination and travel purpose."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How can I check visa requirements?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Select your passport country, destination country and travel purpose to view visa information."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Are visa rules updated?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Visa requirements are maintained using structured travel information and official source references."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Which travel purposes are supported?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The checker supports common travel purposes including tourism, work and study."
                  }
                }
              ]
            }),
          }}
        />

        <section className="mt-16 w-full">
          <h2 className="text-2xl font-bold text-center">
            Popular Visa Routes
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularRoutes.map((route) => (
              <Link
                key={route.id}
                href={`/visa/${route.passportCountry.slug}-to-${route.destinationCountry.slug}/${route.purpose.code.toLowerCase()}`}
                className="rounded-2xl border bg-white p-5 hover:shadow"
              >
                <h3 className="font-semibold">
                  {route.passportCountry.name} →{" "}
                  {route.destinationCountry.name}
                </h3>

                <p className="mt-2 text-sm text-zinc-500">
                  {route.purpose.name} visa requirements
                </p>
              </Link>
            ))}
          </div>
        </section>
        <section className="mt-16 w-full">
          <h2 className="text-2xl font-bold text-center">
            Passport Guides
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {passportGuides.map((country) => (
              <Link
                key={country.id}
                href={`/visa/passport/${country.slug}`}
                className="rounded-2xl border bg-white p-5 hover:shadow"
              >
                <h3 className="font-semibold">
                  {country.name} Passport Visa Requirements
                </h3>

                <p className="mt-2 text-sm text-zinc-500">
                  Explore visa rules for {country.name} passport holders
                </p>
              </Link>
            ))}
          </div>
        </section>



        <section className="mt-16 w-full">
          <h2 className="text-2xl font-bold text-center">
            Popular Destinations
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularDestinations.map((country) => (
              <Link
                key={country.id}
                href={`/visa/country/${country.slug}`}
                className="rounded-2xl border bg-white p-5 hover:shadow"
              >
                <h3 className="font-semibold">
                  {country.name} Visa Requirements
                </h3>

                <p className="mt-2 text-sm text-zinc-500">
                  Check entry rules and visa information
                </p>
              </Link>
            ))}
          </div>
        </section>

      </section>
    </main>
  );
}
