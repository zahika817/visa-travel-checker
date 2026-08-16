import { cookies } from "next/headers";

import { prisma } from "@/lib/db";

const SESSION_COOKIE = "visa_admin_session";

export async function createSession(email: string) {
  const cookieStore = await cookies();

  cookieStore.set(
    SESSION_COOKIE,
    email,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    },
  );
}

export async function getSession() {
  const cookieStore = await cookies();

  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function removeSession() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE);
}


export async function getCurrentAdmin() {
  const email = await getSession();

  if (!email) {
    return null;
  }

  return prisma.adminUser.findUnique({
    where: {
      email,
    },
  });
}
