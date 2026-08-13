import { NextResponse } from "next/server";

import { findVisaRule, isVisaRequired } from "@/lib/visa/rules";

type VisaCheckRequest = {
  passportCode?: unknown;
  destinationCode?: unknown;
  purposeCode?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VisaCheckRequest;

    if (
      typeof body.passportCode !== "string" ||
      typeof body.destinationCode !== "string" ||
      typeof body.purposeCode !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "passportCode, destinationCode, and purposeCode are required.",
        },
        { status: 400 },
      );
    }

    const passportCode = body.passportCode.trim().toUpperCase();
    const destinationCode = body.destinationCode.trim().toUpperCase();
    const purposeCode = body.purposeCode.trim().toUpperCase();

    if (!passportCode || !destinationCode || !purposeCode) {
      return NextResponse.json(
        {
          success: false,
          error: "All visa-check fields must contain a value.",
        },
        { status: 400 },
      );
    }

    const rule = await findVisaRule({
      passportCode,
      destinationCode,
      purposeCode,
    });

    if (!rule) {
      return NextResponse.json(
        {
          success: false,
          error: "No visa rule was found for this travel combination.",
          query: {
            passportCode,
            destinationCode,
            purposeCode,
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      result: {
        passport: rule.passportCountry,
        destination: rule.destinationCountry,
        purpose: rule.purpose,
        requirement: rule.requirement,
        visaRequired: isVisaRequired(rule.requirement),
        visaType: rule.visaType,
        maxStayDays: rule.maxStayDays,
        multipleEntry: rule.multipleEntry,
        ordinaryPassport: rule.ordinaryPassport,
        effectiveFrom: rule.effectiveFrom,
        effectiveUntil: rule.effectiveUntil,
      },
    });
  } catch (error) {
    console.error("Visa check API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to process visa check.",
      },
      { status: 500 },
    );
  }
}
