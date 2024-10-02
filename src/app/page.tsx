'use client';

import { TableNode } from '@/components/nodes';
import { useGetTables } from '@/hooks/useGetTables';
import { createEdges, createNodes } from '@/lib';
import {
  Background,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';

const nodeTypes = {
  tableNode: TableNode,
};
export default function Home() {
  const { data } = useGetTables();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      const initialNodes: any = createNodes(data || []) || [];
      const initialEdges: any = createEdges(data || []) || [];
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [data, setNodes, setEdges]);

  return (
    <main className='h-screen bg-gray-900 w-screen flex flex-col items-center justify-center'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes as any}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
