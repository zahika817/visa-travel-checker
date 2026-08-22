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

const passportCode =
  process.argv[2]?.toUpperCase() ?? "PK";

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

const sourceMap: Record<
  string,
  { name: string; url: string }
> = {
  GB: {
    name: "UK Government",
    url: "https://www.gov.uk",
  },
  US: {
    name: "U.S. Department of State",
    url: "https://travel.state.gov",
  },
  CA: {
    name: "Government of Canada",
    url: "https://www.canada.ca",
  },
  AU: {
    name: "Australian Government",
    url: "https://www.homeaffairs.gov.au",
  },
  DE: {
    name: "German Government",
    url: "https://www.auswaertiges-amt.de",
  },
  FR: {
    name: "French Government",
    url: "https://www.diplomatie.gouv.fr",
  },
};

async function main() {
  const existing = await prisma.visaRule.findMany({
    where: {
      passportCountry: {
        code: passportCode,
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
      passport: passportCode,
      destination,
      purpose: "TOURISM",
      visaType: "TOURIST",
      requirement: "VISA_REQUIRED",
      maxStayDays: "90",
      multipleEntry: "false",
      ordinaryPassport: "true",
      sourceName:
        sourceMap[destination]?.name ??
        "Official Government Immigration Source",
      sourceUrl:
        sourceMap[destination]?.url ?? "",
      notes:
        `Tourism visa requirement information for ${passportCode} passport holders.`,
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
    `scripts/data/batches/${passportCode}-tourism-missing.csv`,
  );

  fs.writeFileSync(output, csv);

  console.log(`Generated ${rows.length} missing rules`);
  console.log(output);

  await prisma.$disconnect();
}

main();
