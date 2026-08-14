import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: Params,
) {
  try {
    const { id } = await params;

    const rule = await prisma.visaRule.findUnique({
      where: {
        id,
      },
      include: {
        passportCountry: {
          select: {
            code: true,
            name: true,
          },
        },
        destinationCountry: {
          select: {
            code: true,
            name: true,
          },
        },
        purpose: {
          select: {
            code: true,
            name: true,
          },
        },
        visaType: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });

    if (!rule) {
      return NextResponse.json(
        {
          success: false,
          error: "Visa rule not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      rule,
    });

  } catch (error) {
    console.error("Get visa rule error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load visa rule.",
      },
      { status: 500 },
    );
  }
}


export async function PATCH(
  request: Request,
  { params }: Params,
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const updatedRule = await prisma.visaRule.update({
      where: {
        id,
      },
      data: {
        requirement: body.requirement,
        maxStayDays: body.maxStayDays ?? null,
        multipleEntry: body.multipleEntry ?? false,
        ordinaryPassport: body.ordinaryPassport ?? true,

        sourceName: body.sourceName ?? null,
        sourceUrl: body.sourceUrl ?? null,

        lastVerifiedAt: new Date(),

        notes: body.notes ?? null,

        active: body.active ?? true,
      },
    });


    return NextResponse.json({
      success: true,
      rule: updatedRule,
    });


  } catch (error) {
    console.error("Update visa rule error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to update visa rule.",
      },
      { status: 500 },
    );
  }
}


export async function DELETE(
  request: Request,
  { params }: Params,
) {
  try {
    const { id } = await params;

    const rule = await prisma.visaRule.update({
      where: {
        id,
      },
      data: {
        active: false,
      },
    });

    return NextResponse.json({
      success: true,
      rule,
    });

  } catch (error) {
    console.error("Deactivate visa rule error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to deactivate visa rule.",
      },
      { status: 500 },
    );
  }
}
