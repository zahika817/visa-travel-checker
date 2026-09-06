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

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: "CSV file size must be less than 5MB.",
        },
        { status: 400 },
      );
    }

    const text = await file.text();

    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });

    const requiredHeaders = [
      "passport",
      "destination",
      "purpose",
      "requirement",
    ];

    const headers = parsed.meta.fields ?? [];

    const missingHeaders = requiredHeaders.filter(
      (header) => !headers.includes(header),
    );

    if (missingHeaders.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid CSV format. Missing columns: ${missingHeaders.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const created: string[] = [];
    const skipped: string[] = [];
    const errors: {
      row: number;
      message: string;
      value?: string;
    }[] = [];
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
          errors.push({
            row: index + 2,
            message: "Missing required fields",
          });
          continue;
        }

        if (!validRequirements.includes(requirement as VisaRequirement)) {
          errors.push({
            row: index + 2,
            message: "Invalid requirement",
            value: requirement,
          });
          continue;
        }

        const passport = countryMap.get(passportCode);
        const destination = countryMap.get(destinationCode);
        const purpose = purposeMap.get(purposeCode);

        const visaType = visaTypeCode
          ? visaTypeMap.get(visaTypeCode)
          : null;

        if (!passport || !destination || !purpose) {
          errors.push({
            row: index + 2,
            message: "Reference data missing",
            value: `${passportCode}-${destinationCode}-${purposeCode}`,
          });
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
            ? Number.isNaN(Number(row.maxStayDays))
              ? null
              : Number(row.maxStayDays)
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
        errors.push({
          row: index + 2,
          message: "Import failed",
        });
      }
    }

    if (records.length > 0) {
      await prisma.$transaction([
        prisma.visaRule.createMany({
          data: records,
        }),
      ]);
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
