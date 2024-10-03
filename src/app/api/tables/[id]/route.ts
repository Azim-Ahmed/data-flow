import { prisma } from "@/lib";
import { NextRequest, NextResponse } from "next/server";

interface GetTableParams {
  params: { id: string };
}


export async function PUT(req: NextRequest, { params: { id } }: GetTableParams) {
  try {
    // Parse the request body to extract the necessary fields
    const body = await req.json();
    const { relationships } = body;

    const tableId = id;

    // Step 1: Ensure the table exists
    const tableExists = await prisma.table.findUnique({ where: { id: tableId } });
    if (!tableExists) {
      return NextResponse.json({ error: 'Source table not found' }, { status: 404 });
    }

    // Step 2: Handle relationships if provided
    if (relationships && relationships.relations) {
      // Delete old relationships for both source and target tables
      await prisma.relationship.deleteMany({
        where: {
          OR: [{ sourceTableId: tableId }, { targetTableId: tableId }],
        },
      });

      // Recreate the relationships
      const relationshipPromises = relationships.relations.map(async (relation: any) => {
        // Step 3: Check if the target table exists before creating the relationship
        const targetTableExists = await prisma.table.findUnique({
          where: { id: relation.targetTableId },
        });

        if (!targetTableExists) {
          throw new Error(`Target table with ID ${relation.targetTableId} does not exist.`);
        }

        // Step 4: Create the relationship
        await prisma.relationship.create({
          data: {
            sourceTableId: relation.sourceTableId || tableId,
            targetTableId: relation.targetTableId,
            sourceField: relation.sourceField || null,
            targetField: relation.targetField || null,
            relationType: relation.relationType || null,
            source: relation.source || null, // Optional ReactFlow source node ID
            target: relation.target || null, // Optional ReactFlow target node ID
          },
        });
      });

      // Execute all relationship updates in parallel
      await Promise.all(relationshipPromises);
    }

    return NextResponse.json({ message: 'Relationships updated successfully' });
  } catch (error) {
    console.error('Error updating table or relationships:', error);
    return NextResponse.json(
      { error: 'Failed to update table or relationships' },
      { status: 500 }
    );
  }
}


interface GetTableParams {
  params: { id: string };
}

export async function GET(req: NextRequest, { params: { id } }: GetTableParams) {
  try {
    // Convert the id to a valid integer or use the provided id as-is if it's a string
    const tableId = id;

    // Fetch the table by its ID, including relationshipsFrom and relationshipsTo
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        relationshipsFrom: true, // Fetch the relationships where this table is the source
        relationshipsTo: true,   // Fetch the relationships where this table is the target
      },
    });

    // If the table is not found, return a 404 response
    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    // Return the table data (fields as JSON will be included automatically)
    return NextResponse.json(table);
  } catch (error) {
    console.error('Error fetching table:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table' },
      { status: 500 }
    );
  }
}