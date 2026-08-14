import { VisaRequirement } from "@prisma/client";

import { prisma } from "@/lib/db";

export type VisaRuleLookupInput = {
  passportCode: string;
  destinationCode: string;
  purposeCode: string;
};

export async function findVisaRule({
  passportCode,
  destinationCode,
  purposeCode,
}: VisaRuleLookupInput) {
  const passportCodeNormalized = passportCode.trim().toUpperCase();
  const destinationCodeNormalized = destinationCode.trim().toUpperCase();
  const purposeCodeNormalized = purposeCode.trim().toUpperCase();

  const [passport, destination, purpose] = await Promise.all([
    prisma.country.findUnique({
      where: {
        code: passportCodeNormalized,
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    }),

    prisma.country.findUnique({
      where: {
        code: destinationCodeNormalized,
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    }),

    prisma.travelPurpose.findUnique({
      where: {
        code: purposeCodeNormalized,
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    }),
  ]);

  if (!passport || !destination || !purpose) {
    return null;
  }

  const now = new Date();

  const rule = await prisma.visaRule.findFirst({
    where: {
      passportCountryId: passport.id,
      destinationCountryId: destination.id,
      purposeId: purpose.id,
      active: true,

      AND: [
        {
          OR: [
            { effectiveFrom: null },
            { effectiveFrom: { lte: now } },
          ],
        },
        {
          OR: [
            { effectiveUntil: null },
            { effectiveUntil: { gte: now } },
          ],
        },
      ],
    },

    select: {
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

      sourceName: true,
      sourceUrl: true,
      lastVerifiedAt: true,
      notes: true,

      requirement: true,
      maxStayDays: true,
      multipleEntry: true,
      ordinaryPassport: true,
      effectiveFrom: true,
      effectiveUntil: true,
    },

    orderBy: [
      {
        priority: "desc",
      },
      {
        effectiveFrom: "desc",
      },
    ],
  });

  return rule;
}

export function isVisaRequired(requirement: VisaRequirement) {
  return (
    requirement === VisaRequirement.VISA_REQUIRED ||
    requirement === VisaRequirement.EVISA_REQUIRED ||
    requirement === VisaRequirement.ETA_REQUIRED ||
    requirement === VisaRequirement.VISA_ON_ARRIVAL ||
    requirement === VisaRequirement.SPECIAL_PERMISSION
  );
}
