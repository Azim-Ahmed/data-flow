import { prisma } from '@/lib';
import { NextRequest, NextResponse } from 'next/server';

// POST: Create a new table
// POST: Create a new table
export async function POST(req: NextRequest) {
  try {
    const { name, fields, position, type, relationships } = await req.json();

    // Step 1: Create the table (if not already existing)
    const createdTable = await prisma.table.create({
      data: {
        name,
        fields,
        position,
        type,
      },
    });

    // Step 2: Handle relationships (ensure both source and target tables exist)
    if (relationships?.relations) {
      await Promise.all(
        relationships.relations.map(async (relation: any) => {
          // Check if both source and target tables exist
          const targetTableExists = await prisma.table.findUnique({
            where: { id: relation.targetTableId },
          });

          const sourceTableExists = await prisma.table.findUnique({
            where: { id: relation.sourceTableId },
          });

          if (targetTableExists || sourceTableExists) {
            await prisma.relationship.create({
              data: {
                sourceTableId: relation.sourceTableId ||  null,
                targetTableId: relation.targetTableId || null,
                sourceField: relation.sourceField || null,
                targetField: relation.targetField || null,
                relationType: relation.relationType || null,
              },
            });
          }else{
            
          }

          // If both tables exist, create the relationship
          
        })
      );
    }

    return NextResponse.json({
      message: 'Table and relationships created successfully',
      table: createdTable,
    });
  } catch (error) {
    console.error('Error creating table or relationships:', error);
    return NextResponse.json(
      { error: 'Failed to create table and relationships' },
      { status: 500 }
    );
  }
}

// PUT: Update a table and its relationships
export async function PUT(req: NextRequest) {
  try {
    // Parse the request body which is expected to be an array of table updates
    const body = await req.json();

    // Ensure the body is an array of updates
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected an array of table updates.' },
        { status: 400 }
      );
    }

    // Iterate through each table update in the array
    const updatePromises = body.map(async (tableUpdate: any) => {
      const { id, name, fields, position, type, relationships } = tableUpdate;

      // Convert table id to an integer if necessary
      const tableId = id;

      // Update the table itself (name, fields, position, type)
      const updatedTable = await prisma.table.update({
        where: { id: tableId },
        data: {
          name: name || undefined,
          fields: fields || undefined,
          position: position || undefined,
          type: type || undefined,
        },
      });

      // If relationships are provided, handle them
      if (relationships?.relations) {
        // Delete old relationships for both source and target tables
        await prisma.relationship.deleteMany({
          where: {
            OR: [{ sourceTableId: tableId }, { targetTableId: tableId }],
          },
        });

        // Recreate the relationships
        const relationshipPromises = relationships.relations.map(
          async (relation: any) => {
            await prisma.relationship.create({
              data: {
                sourceTableId: relation.sourceTableId || tableId,
                targetTableId: relation.targetTableId,
                sourceField: relation.sourceField || null,
                targetField: relation.targetField || null,
                relationType: relation.relationType || null,
                source: relation.source || null,
                target: relation.target || null,
              },
            });
          }
        );

        // Execute relationship updates in parallel for this table
        await Promise.all(relationshipPromises);
      }

      return updatedTable;
    });

    // Execute all updates in parallel
    const updatedTables = await Promise.all(updatePromises);

    // Return the list of updated tables
    return NextResponse.json({ updatedTables });
  } catch (error) {
    console.error('Error updating multiple tables or relationships:', error);
    return NextResponse.json(
      { error: 'Failed to update multiple tables or relationships' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a table and its relationships
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    // Delete the relationships where the table is either source or target
    await prisma.relationship.deleteMany({
      where: {
        OR: [{ sourceTableId: id }, { targetTableId: id }],
      },
    });

    // Delete the table
    await prisma.table.delete({
      where: { id },
    });

    // Respond with a success message
    return NextResponse.json({
      message: 'Table and its relationships deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting table or relationships:', error);

    return NextResponse.json(
      { error: 'Failed to delete table or relationships' },
      { status: 500 }
    );
  }
}

// GET: Fetch all tables with relationships
export async function GET(req: NextRequest) {
  try {
    // Retrieve all tables with their relationships from the database
    const tables = await prisma.table.findMany({
      include: {
        relationshipsFrom: true, // Get all relationships where this table is the source
        relationshipsTo: true, // Get all relationships where this table is the target
      },
    });

    // Return the list of tables and their relationships as JSON
    return NextResponse.json(tables);
  } catch (error) {
    console.error('Error fetching tables or relationships:', error);

    return NextResponse.json(
      { error: 'Failed to fetch tables or relationships' },
      { status: 500 }
    );
  }
}
