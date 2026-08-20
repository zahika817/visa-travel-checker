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

        const [passport, destination, purpose, visaType] =
          await Promise.all([
            prisma.country.findUnique({
              where: { code: passportCode },
            }),

            prisma.country.findUnique({
              where: { code: destinationCode },
            }),

            prisma.travelPurpose.findUnique({
              where: { code: purposeCode },
            }),

            visaTypeCode
              ? prisma.visaType.findUnique({
                  where: { code: visaTypeCode },
                })
              : null,
          ]);

        if (!passport || !destination || !purpose) {
          errors.push(
            `Row ${index + 2}: Reference data missing`,
          );
          continue;
        }

        const existing = await prisma.visaRule.findFirst({
          where: {
            passportCountryId: passport.id,
            destinationCountryId: destination.id,
            purposeId: purpose.id,
            active: true,
          },
        });

        if (existing) {
          skipped.push(
            `${passportCode}-${destinationCode}-${purposeCode}`,
          );
          continue;
        }

        await prisma.visaRule.create({
          data: {
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
          },
        });

        created.push(
          `${passportCode}-${destinationCode}-${purposeCode}`,
        );
      } catch {
        errors.push(`Row ${index + 2}: Import failed`);
      }
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
