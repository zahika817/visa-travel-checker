import "dotenv/config";
import fs from "fs";
import path from "path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { sourceMap } from "./config/sources";
import { studyDestinations } from "./config/study-destinations";
import { tourismDestinations } from "./config/tourism-destinations";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

const passportCode =
  process.argv[2]?.toUpperCase() ?? "PK";

const purposeCode =
  process.argv[3]?.toUpperCase() ?? "TOURISM";

const visaType =
  purposeCode === "STUDY"
    ? "STUDENT"
    : purposeCode === "WORK"
      ? "WORK"
      : purposeCode === "BUSINESS"
        ? "BUSINESS"
        : "TOURIST";

const destinations =
  purposeCode === "STUDY"
    ? studyDestinations
    : tourismDestinations;

async function main() {
  const existing = await prisma.visaRule.findMany({
    where: {
      passportCountry: {
        code: passportCode,
      },
      purpose: {
        code: purposeCode,
      },
    },
    include: {
      destinationCountry: true,
    },
  });

  const existingCodes = new Set(
    existing.map(
      (item) => item.destinationCountry.code
    )
  );

  const rows = destinations
    .filter(
      (code) => !existingCodes.has(code)
    )
    .map((destination) => ({
      passport: passportCode,
      destination,
      purpose: purposeCode,
      visaType,
      requirement: "VISA_REQUIRED",
      maxStayDays: "90",
      multipleEntry: "false",
      ordinaryPassport: "true",
      sourceName:
        sourceMap[destination]?.name ??
        "Official Immigration Authority",
      sourceUrl:
        sourceMap[destination]?.url ?? "",
      notes:
        `Visa requirement information for ${passportCode} passport holders.`,
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
    `scripts/data/batches/${passportCode}-${purposeCode}-missing.csv`,
  );

  fs.writeFileSync(output, csv);

  console.log(`Generated ${rows.length} rules`);
  console.log(output);

  await prisma.$disconnect();
}

main();
