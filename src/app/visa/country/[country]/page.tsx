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

  return (
    <main className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-4xl">

        <h1 className="text-4xl font-bold">
          {destination.name} Visa Requirements
        </h1>

        <p className="mt-4 text-zinc-600">
          Find visa requirements and travel information for
          travelers visiting {destination.name}.
        </p>

        <div className="mt-8 rounded-2xl border bg-white p-6">
          <p className="text-sm text-zinc-500">
            Available Visa Routes
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalRoutes}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-2xl border bg-white p-5"
            >
              <h2 className="font-bold">
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
