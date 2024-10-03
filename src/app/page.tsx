'use client';

import { TableNode } from '@/components/nodes';
import { Button } from '@/components/ui/button';
import { useWorkflow } from '@/hooks/useflow';
import { useGetTables } from '@/hooks/useGetTables';
import { createEdges, createNodes } from '@/lib';
import { TABLE_API } from '@/services/table';
import {
  Background,
  Controls,
  Edge,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';

import { useCallback, useEffect, useMemo } from 'react';

const nodeTypes = {
  tableNode: TableNode,
};
export default function Home() {
  const { data } = useGetTables();
  const { onConnect } = useWorkflow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { getNode } = useReactFlow();
  useEffect(() => {
    if (data && data.length > 0) {
      const initialNodes: any = createNodes(data || []) || [];
      const initialEdges: any = createEdges(data || []) || [];
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [data, setNodes, setEdges]);

  // Ensure the table exists or create a new one if it doesn't
  const ensureTableExists = async (table: any) => {
    try {
      // Try to get the table from the backend
      const existingTable = await TABLE_API.getTableById(table.id);
      if (existingTable) {
        console.log(`Table ${table.name} already exists.`);
        return existingTable.id;
      }
    } catch (error) {
      // If the table is not found, create it
      console.log(`Table ${table.name} not found, creating...`);
      const createdTable = await TABLE_API.createTable({
        name: table.name,
        fields: table.fields,
        position: table.position,
        type: table.type,
      });

      console.log(
        `Table ${table.name} created successfully with ID: ${createdTable.id}.`
      );

      // Step 1: Update nodes with the real table ID
      setNodes((prevNodes: any) =>
        prevNodes.map((n: any) =>
          n.id === table.id ? { ...n, id: createdTable.id } : n
        )
      );

      // Step 2: Update edges with the real table ID
      // Step 2: Update edges with the real table ID
      setEdges((prevEdges: any) =>
        prevEdges.map((e: any) => {
          let newEdge = { ...e };

          // Get the source and target nodes
          const sourceNode = getNode(e.source);
          const targetNode = getNode(e.target);

          console.log({ sourceNode, targetNode });

          // Check if the source or target IDs match the temporary table ID
          const sourceMatch = sourceNode?.id === table.id;
          const targetMatch = targetNode?.id === table.id;

          console.log({ sourceMatch, targetMatch });

          // If the source node ID matches, replace it with the createdTable.id
          if (sourceMatch) {
            newEdge.source = createdTable.id;
            console.log('Source match found');
          }

          // If the target node ID matches, replace it with the createdTable.id
          if (targetMatch) {
            newEdge.target = createdTable.id;
            console.log('Target match found');
          }

          return newEdge;
        })
      );

      return createdTable.id; // Return the real table ID after creation
    }
  };

  const handleSave = useCallback(async () => {
    try {
      // Step 1: Extract nodes and edges
      const tables = nodes.map((node: any) => ({
        id: node.id,
        name: node.data.name,
        fields: node.data.fields,
        position: node.position,
        type: node.type,
        relationships: {
          relations: edges
            .filter(
              (edge: any) => edge.source === node.id || edge.target === node.id
            )
            .map((edge: any) => {
              console.log({edge})
              return ({
                targetTableId:
                  edge.source === node.id ? edge.target : edge.source, // Target is the opposite of the current node
                sourceField:
                  node.data.fields.find(
                    (field: any) => field.name === edge.sourceHandle
                  )?.name || null, // Assuming sourceHandle represents the field
                targetField: edge.targetHandle || null, // Assuming targetHandle represents the field, updated this to not reference nodeIdMap
                relationType: edge.label || 'Many-to-One',
              })
            }),
        },
      }));

    
      // Step 4: Update all nodes (tables) and their relationships with real table IDs
      for (const table of tables) {
        const realTableId = await ensureTableExists(table);
        const updatedTable = {
          ...table,
          id: table.id,
          relationships: {
            relations: await Promise.all(
              table.relationships.relations.map(async (relation: any) => {
                const updatedSourceId = relation.sourceTableId;
                const updatedTargetId = relation.targetTableId;

                return {
                  targetTableId: updatedTargetId, // ID of the target table
                  sourceTableId: updatedSourceId, // ID of the source table
                  sourceField: relation.sourceField, // Field in the source table
                  targetField: relation.targetField, // Field in the target table
                  relationType: relation.relationType || 'Many-to-One',
                };
              })
            ),
          },
        };

        // Update the existing table (this is where you can modify fields, position, etc.)
        await TABLE_API.updateTable(updatedTable);
        console.log(`Table ${table.name} updated successfully.`);
      }

      console.log('Tables and relationships saved successfully.');
    } catch (error) {
      console.error('Error saving tables and relationships:', error);
    }
  }, [nodes, edges]);

  console.log({ nodes, edges });
  return (
    <main className='h-screen bg-gray-900 w-screen flex flex-col items-center justify-center'>
      <div className='flex justify-end w-full px-20 py-5'>
        <Button className='bg-sky-500 hover:bg-sky-600' onClick={handleSave}>
          Save
        </Button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes as any}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        // fitView
        defaultViewport={{
          zoom: 1,
          x: 0,
          y: -200,
        }}
        minZoom={-1}
        maxZoom={3}
        proOptions={{
          hideAttribution: true,
        }}
      >
        <Background gap={40} />
        <Controls />
      </ReactFlow>
    </main>
  );
}
