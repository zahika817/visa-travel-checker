import "dotenv/config";
import fs from "fs";
import path from "path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

const targetDestinations = [
  "ES",
  "NL",
  "CH",
  "AT",
  "PT",
  "GR",
  "EG",
  "QA",
  "KW",
  "OM",
  "BH",
  "ID",
  "TH",
  "VN",
  "KR",
  "NZ",
  "ZA",
  "BR",
];

async function main() {
  const existing = await prisma.visaRule.findMany({
    where: {
      passportCountry: {
        code: "PK",
      },
      purpose: {
        code: "TOURISM",
      },
    },
    include: {
      destinationCountry: true,
    },
  });

  const existingCodes = new Set(
    existing.map((item) => item.destinationCountry.code)
  );

  const rows = targetDestinations
    .filter((code) => !existingCodes.has(code))
    .map((destination) => ({
      passport: "PK",
      destination,
      purpose: "TOURISM",
      visaType: "TOURIST",
      requirement: "VISA_REQUIRED",
      maxStayDays: "90",
      multipleEntry: "false",
      ordinaryPassport: "true",
      sourceName: "Official Government Immigration Source",
      sourceUrl: "",
      notes:
        "Tourism visa requirement information for Pakistani passport holders.",
    }));

  const header = Object.keys(rows[0] ?? {}).join(",");

  const csv = [
    header,
    ...rows.map((row) =>
      Object.values(row)
        .map((value) => `"${value}"`)
        .join(",")
    ),
  ].join("\n");

  const output = path.join(
    process.cwd(),
    "scripts/data/batches/pakistan-tourism-missing.csv",
  );

  fs.writeFileSync(output, csv);

  console.log(`Generated ${rows.length} missing rules`);
  console.log(output);

  await prisma.$disconnect();
}

main();
