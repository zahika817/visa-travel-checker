import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, VisaRequirement } from "@prisma/client";

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

  const visaType = await prisma.visaType.findUnique({
    where: { code: "TOURIST" },
  });

  if (!passport || !destination || !purpose || !visaType) {
    throw new Error("Required reference data is missing");
  }

  const existingRule = await prisma.visaRule.findFirst({
    where: {
      passportCountryId: passport.id,
      destinationCountryId: destination.id,
      purposeId: purpose.id,
      active: true,
    },
  });

  if (existingRule) {
    console.log("Test rule already exists:", existingRule.id);
    return;
  }

  const rule = await prisma.visaRule.create({
    data: {
      passportCountryId: passport.id,
      destinationCountryId: destination.id,
      purposeId: purpose.id,
      visaTypeId: visaType.id,
      requirement: VisaRequirement.VISA_REQUIRED,
      maxStayDays: 90,
      multipleEntry: false,
      ordinaryPassport: true,
      effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
      priority: 100,
      active: true,
    },
  });

  console.log("TEST RULE CREATED:");
  console.log(rule);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
