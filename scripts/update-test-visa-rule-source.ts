import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passport = await prisma.country.findUnique({
    where: { code: "PK" },
  });

  const destination = await prisma.country.findUnique({
    where: { code: "FR" },
  });

  const purpose = await prisma.travelPurpose.findUnique({
    where: { code: "TOURISM" },
  });

  if (!passport || !destination || !purpose) {
    throw new Error("Required reference data is missing");
  }

  const rule = await prisma.visaRule.findFirst({
    where: {
      passportCountryId: passport.id,
      destinationCountryId: destination.id,
      purposeId: purpose.id,
      active: true,
    },
    orderBy: {
      priority: "desc",
    },
  });

  if (!rule) {
    throw new Error("Test visa rule not found");
  }

  const updated = await prisma.visaRule.update({
    where: {
      id: rule.id,
    },
    data: {
      sourceName: "Development Test Source",
      sourceUrl: null,
      lastVerifiedAt: new Date(),
      notes:
        "Development test rule. Replace with verified official source data before production use.",
    },
  });

  console.log("UPDATED VISA RULE SOURCE:");
  console.log({
    id: updated.id,
    sourceName: updated.sourceName,
    sourceUrl: updated.sourceUrl,
    lastVerifiedAt: updated.lastVerifiedAt,
    notes: updated.notes,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
