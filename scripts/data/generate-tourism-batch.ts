import fs from "fs";
import path from "path";
import { tourismDestinations } from "./config/tourism-destinations";

const passport = "PK";

const destinations = [
  ...new Set(
    tourismDestinations.filter(
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
    "Tourism visa requirement information for Pakistani passport holders.",
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
  "scripts/data/batches/pakistan-tourism-batch.csv",
);

fs.writeFileSync(output, csv);

console.log(`Generated ${rows.length} visa rules`);
console.log(output);
