import { Table } from "@prisma/client";
import { Node } from "@xyflow/react";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



// Function to generate nodes
export const createNodes = (data: Table[]) => {
  return data.map((table: any): Node => ({
    id: table.id,
    type: table.type || "tableNode", // Use type if available, otherwise default
    position: { x: table.position?.x ?? 0, y: table.position?.y || 0 },
    data: {
      name: table.name,
      fields: table.fields,
    },
  }));
};

// Function to generate edges from relationships
export const createEdges = (data: any) => {
  let edges: any[] = [];

  data.forEach((table: any) => {
    // Process relationships where this table is the source
    table.relationshipsFrom.forEach((relation: any) => {
      if (relation.targetTableId) {
        edges.push({
          id: `e${relation.targetTableId}-${relation.sourceTableId}`,
          source: relation.targetTableId.toString(),
          target: relation.sourceTableId.toString(),
          label: relation.relationType || "",
        });
      }
    });
  });

  return edges;
};
