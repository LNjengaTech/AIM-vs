-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "HeroSection" ADD COLUMN     "foregroundImageScale" DOUBLE PRECISION DEFAULT 1,
ADD COLUMN     "foregroundImageUrl" TEXT,
ADD COLUMN     "foregroundImageX" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "foregroundImageY" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "specs" JSONB,
ADD COLUMN     "tagline" TEXT,
ALTER COLUMN "headline" DROP NOT NULL,
ALTER COLUMN "subheadline" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "targetRole" "UserRole";

-- AddForeignKey
ALTER TABLE "BOLOMatch" ADD CONSTRAINT "BOLOMatch_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill slugs if any are null (safety measure)
UPDATE "Car" SET "slug" = "id" WHERE "slug" IS NULL;
