-- AlterTable
ALTER TABLE "VisaRule" ADD COLUMN     "lastVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "sourceName" TEXT,
ADD COLUMN     "sourceUrl" TEXT;
