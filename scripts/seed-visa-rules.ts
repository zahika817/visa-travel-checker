import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  VisaRequirement,
} from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL missing");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const rules = [
  {
    passport: "PK",
    destination: "GB",
    purpose: "TOURISM",
    visaType: "TOURIST",
    requirement: VisaRequirement.VISA_REQUIRED,
    maxStayDays: 180,
    sourceName: "UK Government",
    sourceUrl: "https://www.gov.uk",
    notes: "Tourist visa requirement for Pakistani passport holders.",
  },
  {
    passport: "PK",
    destination: "GB",
    purpose: "STUDY",
    visaType: "STUDENT",
    requirement: VisaRequirement.VISA_REQUIRED,
    maxStayDays: 365,
    sourceName: "UK Government",
    sourceUrl: "https://www.gov.uk",
    notes: "Student visa requirement for Pakistani students.",
  },
  {
    passport: "PK",
    destination: "SA",
    purpose: "RELIGIOUS",
    visaType: "TOURIST",
    requirement: VisaRequirement.VISA_REQUIRED,
    maxStayDays: 90,
    sourceName: "Saudi Government",
    sourceUrl: "https://www.mofa.gov.sa",
    notes: "Religious travel visa information.",
  },
  {
    passport: "PK",
    destination: "AE",
    purpose: "BUSINESS",
    visaType: "BUSINESS",
    requirement: VisaRequirement.VISA_REQUIRED,
    maxStayDays: 90,
    sourceName: "UAE Government",
    sourceUrl: "https://u.ae",
    notes: "Business travel visa requirement.",
  },
];

async function main() {
  for (const item of rules) {
    const passport = await prisma.country.findUnique({
      where: { code: item.passport },
    });

    const destination = await prisma.country.findUnique({
      where: { code: item.destination },
    });

    const purpose = await prisma.travelPurpose.findUnique({
      where: { code: item.purpose },
    });

    const visaType = await prisma.visaType.findUnique({
      where: { code: item.visaType },
    });

    if (!passport || !destination || !purpose || !visaType) {
      console.log("Missing reference data:", item);
      continue;
    }

    const exists = await prisma.visaRule.findFirst({
      where: {
        passportCountryId: passport.id,
        destinationCountryId: destination.id,
        purposeId: purpose.id,
        active: true,
      },
    });

    if (exists) {
      console.log(
        "Already exists:",
        item.passport,
        "→",
        item.destination,
        item.purpose,
      );
      continue;
    }

    await prisma.visaRule.create({
      data: {
        passportCountryId: passport.id,
        destinationCountryId: destination.id,
        purposeId: purpose.id,
        visaTypeId: visaType.id,
        requirement: item.requirement,
        maxStayDays: item.maxStayDays,
        sourceName: item.sourceName,
        sourceUrl: item.sourceUrl,
        notes: item.notes,
        lastVerifiedAt: new Date(),
      },
    });

    console.log(
      "Created:",
      item.passport,
      "→",
      item.destination,
      item.purpose,
    );
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
