import { prisma } from "@/lib/db";

export async function getAdminStats() {
  const [
    totalVisaRules,
    activeVisaRules,
    totalCountries,
    totalAdmins,
  ] = await Promise.all([
    prisma.visaRule.count(),
    prisma.visaRule.count({
      where: {
        active: true,
      },
    }),
    prisma.country.count(),
    prisma.adminUser.count(),
  ]);

  return {
    totalVisaRules,
    activeVisaRules,
    totalCountries,
    totalAdmins,
  };
}
