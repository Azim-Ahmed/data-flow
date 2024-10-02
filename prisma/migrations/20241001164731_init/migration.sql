-- CreateTable
CREATE TABLE "Table" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "position" JSONB NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Relationship" (
    "id" SERIAL NOT NULL,
    "sourceTableId" INTEGER NOT NULL,
    "targetTableId" INTEGER NOT NULL,
    "sourceField" TEXT NOT NULL,
    "targetField" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Relationship_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_sourceTableId_fkey" FOREIGN KEY ("sourceTableId") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_targetTableId_fkey" FOREIGN KEY ("targetTableId") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
