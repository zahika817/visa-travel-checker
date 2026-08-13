import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [countries, purposes] = await Promise.all([
      prisma.country.findMany({
        where: {
          active: true,
        },
        orderBy: {
          name: "asc",
        },
        select: {
          code: true,
          name: true,
        },
      }),

      prisma.travelPurpose.findMany({
        where: {
          active: true,
        },
        orderBy: {
          name: "asc",
        },
        select: {
          code: true,
          name: true,
          description: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      countries,
      purposes,
    });
  } catch (error) {
    console.error("Reference data API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load reference data.",
      },
      { status: 500 },
    );
  }
}
