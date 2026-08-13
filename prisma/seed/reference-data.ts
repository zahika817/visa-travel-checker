import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const travelPurposes = [
  ["TOURISM", "Tourism", "tourism", "Leisure and holiday travel."],
  ["BUSINESS", "Business", "business", "Business meetings, commercial activities, and professional travel."],
  ["TRANSIT", "Transit", "transit", "Passing through a country while traveling to another destination."],
  ["STUDY", "Study", "study", "Education, study, and academic programs."],
  ["WORK", "Work", "work", "Employment and work-related travel."],
  ["FAMILY_VISIT", "Family Visit", "family-visit", "Visiting family members or relatives."],
  ["MEDICAL", "Medical", "medical", "Medical treatment and healthcare-related travel."],
  ["CONFERENCE", "Conference", "conference", "Conferences, seminars, exhibitions, and professional events."],
  ["RELIGIOUS", "Religious", "religious", "Religious travel and pilgrimage."],
  ["OTHER", "Other", "other", "Other legitimate travel purposes not covered above."],
] as const;

const visaTypes = [
  ["SHORT_STAY", "Short-Stay Visa", "For temporary visits and short stays."],
  ["TOURIST", "Tourist Visa", "For tourism and leisure travel."],
  ["BUSINESS", "Business Visa", "For business and professional travel."],
  ["TRANSIT", "Transit Visa", "For travelers passing through a country."],
  ["STUDENT", "Student Visa", "For study and academic programs."],
  ["WORK", "Work Visa", "For employment and work activities."],
  ["FAMILY_VISIT", "Family Visit Visa", "For visiting family members or relatives."],
  ["MEDICAL", "Medical Visa", "For medical treatment."],
  ["RELIGIOUS", "Religious Visa", "For religious travel and pilgrimage."],
  ["E_VISA", "e-Visa", "An electronically issued visa."],
  ["VISA_ON_ARRIVAL", "Visa on Arrival", "A visa issued after arrival at the destination."],
  ["ETA", "Electronic Travel Authorization", "An electronic authorization required before travel."],
  ["OTHER", "Other", "Other visa categories."],
] as const;

async function main() {
  for (const [code, name, slug, description] of travelPurposes) {
    await prisma.travelPurpose.upsert({
      where: { code },
      update: {
        name,
        slug,
        description,
        active: true,
      },
      create: {
        code,
        name,
        slug,
        description,
        active: true,
      },
    });
  }

  for (const [code, name, description] of visaTypes) {
    await prisma.visaType.upsert({
      where: { code },
      update: {
        name,
        description,
        active: true,
      },
      create: {
        code,
        name,
        description,
        active: true,
      },
    });
  }

  console.log(`Seeded ${travelPurposes.length} travel purposes.`);
  console.log(`Seeded ${visaTypes.length} visa types.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
