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
    select: { id: true, code: true, name: true },
  });

  const destination = await prisma.country.findUnique({
    where: { code: "FR" },
    select: { id: true, code: true, name: true },
  });

  const purpose = await prisma.travelPurpose.findUnique({
    where: { code: "TOURISM" },
    select: { id: true, code: true, name: true },
  });

  console.log("PASSPORT:", passport);
  console.log("DESTINATION:", destination);
  console.log("PURPOSE:", purpose);

  if (!passport || !destination || !purpose) {
    throw new Error("Reference data missing");
  }

  const rule = await prisma.visaRule.findFirst({
    where: {
      passportCountryId: passport.id,
      destinationCountryId: destination.id,
      purposeId: purpose.id,
      active: true,
    },
  });

  console.log("RULE RESULT:", rule);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
