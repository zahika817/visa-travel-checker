import type { MetadataRoute } from "next";

import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rules = await prisma.visaRule.findMany({
    where: {
      active: true,
    },
    select: {
      passportCountry: {
        select: {
          slug: true,
        },
      },
      destinationCountry: {
        select: {
          slug: true,
        },
      },
      purpose: {
        select: {
          code: true,
        },
      },
      updatedAt: true,
    },
  });

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const uniquePages = new Map();

  rules.forEach((rule) => {
    const url = `${siteUrl}/visa/${rule.passportCountry.slug}-to-${rule.destinationCountry.slug}/${rule.purpose.code.toLowerCase()}`;

    uniquePages.set(url, {
      url,
      lastModified: rule.updatedAt,
    });
  });

  return [
    {
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}`,
      lastModified: new Date(),
    },
    ...Array.from(uniquePages.values()),
  ];
}
