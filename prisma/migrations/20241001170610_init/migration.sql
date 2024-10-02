-- DropForeignKey
ALTER TABLE "Relationship" DROP CONSTRAINT "Relationship_sourceTableId_fkey";

-- DropForeignKey
ALTER TABLE "Relationship" DROP CONSTRAINT "Relationship_targetTableId_fkey";

-- AlterTable
ALTER TABLE "Relationship" ALTER COLUMN "sourceTableId" DROP NOT NULL,
ALTER COLUMN "targetTableId" DROP NOT NULL,
ALTER COLUMN "sourceField" DROP NOT NULL,
ALTER COLUMN "targetField" DROP NOT NULL,
ALTER COLUMN "relationType" DROP NOT NULL,
ALTER COLUMN "source" DROP NOT NULL,
ALTER COLUMN "target" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Table" ALTER COLUMN "position" DROP NOT NULL,
ALTER COLUMN "type" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_sourceTableId_fkey" FOREIGN KEY ("sourceTableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_targetTableId_fkey" FOREIGN KEY ("targetTableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;
