import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      passportCode,
      destinationCode,
      purposeCode,
      visaTypeCode,
      requirement,
      maxStayDays,
      multipleEntry,
      ordinaryPassport,
      sourceName,
      sourceUrl,
      notes,
    } = body;

    const passport = await prisma.country.findUnique({
      where: {
        code: passportCode,
      },
    });

    const destination = await prisma.country.findUnique({
      where: {
        code: destinationCode,
      },
    });

    const purpose = await prisma.travelPurpose.findUnique({
      where: {
        code: purposeCode,
      },
    });

    const visaType = visaTypeCode
      ? await prisma.visaType.findUnique({
          where: {
            code: visaTypeCode,
          },
        })
      : null;

    if (!passport || !destination || !purpose) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid country or purpose data.",
        },
        { status: 400 },
      );
    }

    const existingRule = await prisma.visaRule.findFirst({
      where: {
        passportCountryId: passport.id,
        destinationCountryId: destination.id,
        purposeId: purpose.id,
        active: true,
      },
    });

    if (existingRule) {
      return NextResponse.json(
        {
          success: false,
          error: "Active visa rule already exists for this combination.",
        },
        { status: 409 },
      );
    }

    const rule = await prisma.visaRule.create({
      data: {
        passportCountryId: passport.id,
        destinationCountryId: destination.id,
        purposeId: purpose.id,
        visaTypeId: visaType?.id ?? null,
        requirement,
        maxStayDays: maxStayDays ?? null,
        multipleEntry: multipleEntry ?? false,
        ordinaryPassport: ordinaryPassport ?? true,
        sourceName: sourceName ?? null,
        sourceUrl: sourceUrl ?? null,
        lastVerifiedAt: new Date(),
        notes: notes ?? null,
        priority: 0,
        active: true,
      },
    });

    return NextResponse.json({
      success: true,
      rule,
    });
  } catch (error) {
    console.error("Create visa rule error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to create visa rule.",
      },
      { status: 500 },
    );
  }
}
