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

  const countries = await prisma.country.findMany({
    where: {
      active: true,
    },
    select: {
      slug: true,
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
      changeFrequency: "monthly",
      priority: 0.8,
    });
  });

  countries.forEach((country) => {
    const passportUrl = `${siteUrl}/visa/passport/${country.slug}`;

    uniquePages.set(passportUrl, {
      url: passportUrl,
      lastModified: country.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    });

    const destinationUrl = `${siteUrl}/visa/country/${country.slug}`;

    uniquePages.set(destinationUrl, {
      url: destinationUrl,
      lastModified: country.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });

  uniquePages.set(`${siteUrl}/visa-checker`, {
    url: `${siteUrl}/visa-checker`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  });

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...Array.from(uniquePages.values()),
  ];
}
