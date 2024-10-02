import { prisma } from '@/lib';
import { NextRequest, NextResponse } from 'next/server';

// POST: Create a new table
export async function POST(req: NextRequest) {
  try {
    // Parse the request body to extract the necessary fields
    const body = await req.json();
    const { name, fields, relationships, position, type } = body;

    // Create a new table entry in the database with position and type
    const table = await prisma.table.create({
      data: {
        name,
        fields,
        position: position || {},  // Including optional position for the table
        type: type || null,        // Including optional node type for React Flow
      },
    });

    // Handle creating relationships if provided
    if (relationships && relationships.relations) {
      const relationshipPromises = relationships.relations.map((relation: any) => {
        return prisma.relationship.create({
          data: {
            sourceTableId: table.id,               // Use the ID of the created table as the source
            targetTableId: relation.targetTableId, // Target table ID from the request
            sourceField: relation.sourceField || null,  // Optional
            targetField: relation.targetField || null,  // Optional
            relationType: relation.relationType || null, // Optional
            source: relation.source || null,  // Optional ReactFlow source node ID
            target: relation.target || null,  // Optional ReactFlow target node ID
          },
        });
      });

      // Execute all relationship creations in parallel
      await Promise.all(relationshipPromises);
    }

    // Respond with the created table and its relationships
    return NextResponse.json({ table });
  } catch (error) {
    console.error('Error creating table or relationships:', error);

    return NextResponse.json(
      { error: 'Failed to create table or relationships' },
      { status: 500 }
    );
  }
}

// PUT: Update a table and its relationships
export async function PUT(req: NextRequest) {
  try {
    // Parse the request body to extract the necessary fields
    const body = await req.json();
    const { id, name, fields, relationships, position, type } = body;

    // Update the table with new name, fields, position, and type
    const updatedTable = await prisma.table.update({
      where: { id },
      data: {
        name,
        fields,
        position: position || {},  // Update optional position for the node
        type: type || null,        // Update optional node type for React Flow
      },
    });

    // If relationships are provided, update them
    if (relationships && relationships.relations) {
      // Delete old relationships
      await prisma.relationship.deleteMany({
        where: {
          OR: [
            { sourceTableId: id },
            { targetTableId: id },
          ],
        },
      });

      // Recreate the relationships
      const relationshipPromises = relationships.relations.map((relation: any) => {
        return prisma.relationship.create({
          data: {
            sourceTable: relation.sourceTableId ? { connect: { id: relation.sourceTableId } } : undefined, // Optional connect
            targetTable: relation.targetTableId ? { connect: { id: relation.targetTableId } } : undefined, // Optional connect
            sourceField: relation.sourceField || null,  // Optional
            targetField: relation.targetField || null,  // Optional
            relationType: relation.relationType || null, // Optional
            source: relation.source || null,   // Optional ReactFlow source node ID
            target: relation.target || null,   // Optional ReactFlow target node ID
          },
        });
      });

      // Execute all relationship updates in parallel
      await Promise.all(relationshipPromises);
    }

    // Respond with the updated table and relationships
    return NextResponse.json({ updatedTable });
  } catch (error) {
    console.error('Error updating table or relationships:', error);

    return NextResponse.json(
      { error: 'Failed to update table or relationships' },
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
        OR: [
          { sourceTableId: id },
          { targetTableId: id },
        ],
      },
    });

    // Delete the table
    await prisma.table.delete({
      where: { id },
    });

    // Respond with a success message
    return NextResponse.json({ message: 'Table and its relationships deleted successfully' });
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
        relationshipsFrom: true,  // Get all relationships where this table is the source
        relationshipsTo: true,    // Get all relationships where this table is the target
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