import { NextResponse } from "next/server";
import Papa from "papaparse";

import { prisma } from "@/lib/db";
import { VisaRequirement } from "@prisma/client";

const validRequirements = Object.values(VisaRequirement);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "CSV file is required.",
        },
        { status: 400 },
      );
    }

    const text = await file.text();

    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });

    const created: string[] = [];
    const skipped: string[] = [];
    const errors: string[] = [];
    const records = [];

    const [countries, purposes, visaTypes] = await Promise.all([
      prisma.country.findMany(),
      prisma.travelPurpose.findMany(),
      prisma.visaType.findMany(),
    ]);

    const countryMap = new Map(
      countries.map((item) => [item.code, item])
    );

    const purposeMap = new Map(
      purposes.map((item) => [item.code, item])
    );

    const visaTypeMap = new Map(
      visaTypes.map((item) => [item.code, item])
    );

    const existingRules = await prisma.visaRule.findMany({
      where: {
        active: true,
      },
      select: {
        passportCountryId: true,
        destinationCountryId: true,
        purposeId: true,
      },
    });

    const existingSet = new Set(
      existingRules.map(
        (item) =>
          `${item.passportCountryId}-${item.destinationCountryId}-${item.purposeId}`
      )
    );

    for (const [index, row] of parsed.data.entries()) {
      try {
        const passportCode = row.passport?.trim().toUpperCase();
        const destinationCode = row.destination?.trim().toUpperCase();
        const purposeCode = row.purpose?.trim().toUpperCase();
        const visaTypeCode = row.visaType?.trim().toUpperCase();
        const requirement = row.requirement?.trim().toUpperCase();

        if (
          !passportCode ||
          !destinationCode ||
          !purposeCode ||
          !requirement
        ) {
          errors.push(`Row ${index + 2}: Missing required fields`);
          continue;
        }

        if (!validRequirements.includes(requirement as VisaRequirement)) {
          errors.push(`Row ${index + 2}: Invalid requirement`);
          continue;
        }

        const passport = countryMap.get(passportCode);
        const destination = countryMap.get(destinationCode);
        const purpose = purposeMap.get(purposeCode);

        const visaType = visaTypeCode
          ? visaTypeMap.get(visaTypeCode)
          : null;

        if (!passport || !destination || !purpose) {
          errors.push(
            `Row ${index + 2}: Reference data missing`,
          );
          continue;
        }

        const existingKey =
          `${passport.id}-${destination.id}-${purpose.id}`;

        if (existingSet.has(existingKey)) {
          skipped.push(
            `${passportCode}-${destinationCode}-${purposeCode}`,
          );
          continue;
        }

        records.push({
          passportCountryId: passport.id,
          destinationCountryId: destination.id,
          purposeId: purpose.id,
          visaTypeId: visaType?.id ?? null,
          requirement: requirement as VisaRequirement,
          maxStayDays: row.maxStayDays
            ? Number(row.maxStayDays)
            : null,

          multipleEntry:
            row.multipleEntry?.toLowerCase() === "true",

          ordinaryPassport:
            row.ordinaryPassport?.toLowerCase() !== "false",

          effectiveFrom: row.effectiveFrom
            ? new Date(row.effectiveFrom)
            : null,

          effectiveUntil: row.effectiveUntil
            ? new Date(row.effectiveUntil)
            : null,

          priority: row.priority
            ? Number(row.priority)
            : 0,

          sourceName: row.sourceName || null,
          sourceUrl: row.sourceUrl || null,
          notes: row.notes || null,
          lastVerifiedAt: new Date(),
          active: true,
        });

        created.push(
          `${passportCode}-${destinationCode}-${purposeCode}`,
        );
      } catch {
        errors.push(`Row ${index + 2}: Import failed`);
      }
    }

    if (records.length > 0) {
      await prisma.visaRule.createMany({
        data: records,
      });
    }

    return NextResponse.json({
      success: true,
      report: {
        created: created.length,
        skipped: skipped.length,
        errors,
      },
    });
  } catch (error) {
    console.error("CSV import error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to import CSV file.",
      },
      { status: 500 },
    );
  }
}
