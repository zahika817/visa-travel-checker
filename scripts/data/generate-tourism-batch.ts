import fs from "fs";
import path from "path";
import { PK } from "./config/passports/PK";
import { IN } from "./config/passports/IN";
import { AE } from "./config/passports/AE";
import { SA } from "./config/passports/SA";
import { QA } from "./config/passports/QA";
import { OM } from "./config/passports/OM";

const passport = process.argv[2]?.toUpperCase();

if (!passport) {
  throw new Error("Passport country code required. Example: PK");
}

const passportDestinations =
  passport === "PK"
    ? PK
    : passport === "IN"
      ? IN
      : passport === "AE"
        ? AE
        : passport === "SA"
          ? SA
          : passport === "QA"
            ? QA
            : passport === "OM"
              ? OM
              : null;

if (!passportDestinations) {
  throw new Error(`No tourism config found for passport: ${passport}`);
}

const destinations = [
  ...new Set(
    passportDestinations.filter(
      (destination) => destination !== passport,
    ),
  ),
];

if (destinations.length === 0) {
  throw new Error("No tourism destinations configured");
}

const rows = destinations.map((destination) => ({
  passport,
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
    `Tourism visa requirement information for ${passport} passport holders.`,
}));

const header = Object.keys(rows[0]).join(",");

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
  `scripts/data/batches/${passport.toLowerCase()}-tourism-batch.csv`,
);

fs.writeFileSync(output, csv);

console.log(`Generated ${rows.length} visa rules`);
console.log(output);
