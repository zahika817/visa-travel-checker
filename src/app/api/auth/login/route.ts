import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body.email?.toLowerCase();
    const password = body.password;

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required.",
        },
        { status: 400 },
      );
    }

    const admin = await prisma.adminUser.findUnique({
      where: {
        email,
      },
    });

    if (!admin || !admin.active) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials.",
        },
        { status: 401 },
      );
    }

    const validPassword = await bcrypt.compare(
      password,
      admin.passwordHash,
    );

    if (!validPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials.",
        },
        { status: 401 },
      );
    }

    await createSession(admin.email);

    return NextResponse.json({
      success: true,
      user: {
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to login.",
      },
      { status: 500 },
    );
  }
}
