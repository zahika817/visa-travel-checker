-- CreateEnum
CREATE TYPE "VisaRequirement" AS ENUM ('VISA_FREE', 'VISA_REQUIRED', 'VISA_ON_ARRIVAL', 'EVISA_REQUIRED', 'ETA_REQUIRED', 'ENTRY_NOT_PERMITTED', 'SPECIAL_PERMISSION');

-- CreateTable
CREATE TABLE "TravelPurpose" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelPurpose_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaRule" (
    "id" TEXT NOT NULL,
    "passportCountryId" TEXT NOT NULL,
    "destinationCountryId" TEXT NOT NULL,
    "purposeId" TEXT NOT NULL,
    "visaTypeId" TEXT,
    "requirement" "VisaRequirement" NOT NULL,
    "maxStayDays" INTEGER,
    "multipleEntry" BOOLEAN NOT NULL DEFAULT false,
    "ordinaryPassport" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveUntil" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TravelPurpose_code_key" ON "TravelPurpose"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TravelPurpose_slug_key" ON "TravelPurpose"("slug");

-- CreateIndex
CREATE INDEX "TravelPurpose_active_idx" ON "TravelPurpose"("active");

-- CreateIndex
CREATE INDEX "TravelPurpose_name_idx" ON "TravelPurpose"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VisaType_code_key" ON "VisaType"("code");

-- CreateIndex
CREATE INDEX "VisaType_active_idx" ON "VisaType"("active");

-- CreateIndex
CREATE INDEX "VisaType_name_idx" ON "VisaType"("name");

-- CreateIndex
CREATE INDEX "VisaRule_passportCountryId_idx" ON "VisaRule"("passportCountryId");

-- CreateIndex
CREATE INDEX "VisaRule_destinationCountryId_idx" ON "VisaRule"("destinationCountryId");

-- CreateIndex
CREATE INDEX "VisaRule_purposeId_idx" ON "VisaRule"("purposeId");

-- CreateIndex
CREATE INDEX "VisaRule_visaTypeId_idx" ON "VisaRule"("visaTypeId");

-- CreateIndex
CREATE INDEX "VisaRule_requirement_idx" ON "VisaRule"("requirement");

-- CreateIndex
CREATE INDEX "VisaRule_active_idx" ON "VisaRule"("active");

-- CreateIndex
CREATE INDEX "VisaRule_priority_idx" ON "VisaRule"("priority");

-- CreateIndex
CREATE INDEX "VisaRule_effectiveFrom_idx" ON "VisaRule"("effectiveFrom");

-- CreateIndex
CREATE INDEX "VisaRule_effectiveUntil_idx" ON "VisaRule"("effectiveUntil");

-- CreateIndex
CREATE INDEX "VisaRule_passportCountryId_destinationCountryId_purposeId_a_idx" ON "VisaRule"("passportCountryId", "destinationCountryId", "purposeId", "active");

-- AddForeignKey
ALTER TABLE "VisaRule" ADD CONSTRAINT "VisaRule_passportCountryId_fkey" FOREIGN KEY ("passportCountryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaRule" ADD CONSTRAINT "VisaRule_destinationCountryId_fkey" FOREIGN KEY ("destinationCountryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaRule" ADD CONSTRAINT "VisaRule_purposeId_fkey" FOREIGN KEY ("purposeId") REFERENCES "TravelPurpose"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaRule" ADD CONSTRAINT "VisaRule_visaTypeId_fkey" FOREIGN KEY ("visaTypeId") REFERENCES "VisaType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
