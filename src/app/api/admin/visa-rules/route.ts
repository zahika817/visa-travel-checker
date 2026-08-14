import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status") ?? "active";

    const where =
      status === "all"
        ? {}
        : {
            active: status === "active",
          };

    const rules = await prisma.visaRule.findMany({
      where,

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

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      rules,
    });

  } catch (error) {
    console.error("Admin visa rules GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load visa rules.",
      },
      { status: 500 },
    );
  }
}
