import { NextResponse } from "next/server";
import Papa from "papaparse";

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

    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    return NextResponse.json({
      success: true,
      rows: parsed.data,
      count: parsed.data.length,
    });
  } catch (error) {
    console.error("CSV import error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to process CSV file.",
      },
      { status: 500 },
    );
  }
}
