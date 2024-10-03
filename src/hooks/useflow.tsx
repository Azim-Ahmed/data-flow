import { nanoid } from 'nanoid';
import { DragEvent, useCallback, useMemo, useRef, useState } from 'react';

import { lowerCase } from 'lodash';
import {
  addEdge,
  Edge,
  Node,
  ReactFlowInstance,
  useReactFlow,
  XYPosition,
} from '@xyflow/react';
import { nextApi } from '@/api/axios';
import { TABLE_API } from '@/services/table';
import { useQueryClient } from '@tanstack/react-query';
export const useWorkflow = () => {
  const { getNodes, setEdges, setNodes } = useReactFlow();

  const reactWorkflowWrapper = useRef<HTMLDivElement | null>(null);
  const [reactWorkflowInstance, setReactWorkflowInstance] =
    useState<ReactFlowInstance | null>(null);
  const queryClient = useQueryClient();
  const nodes = getNodes();


  const onConnect = useCallback(
    (params: any) => {
      const { source, target } = params;
      const nodes = getNodes();
      const sourceNode = nodes.find(node => node.id === source);
      const targetNode = nodes.find(node => node.id === target);

      if (!sourceNode || !targetNode) {
        console.error('Source or target node not found.');
        return;
      }

      // Step 1: Add the source-to-target edge immediately in the frontend
      const sourceToTargetEdge: Edge = {
        id: nanoid(),
        source,
        target,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#dedede', strokeWidth: '3px' },
      };

      setEdges(prevEdges => [...prevEdges, sourceToTargetEdge]);
     

      // Step 2: Create a new node locally (without API call)
      const tempNodeId = nanoid();
      const newNodePosition = {
        x: targetNode.position.x + 200, // Offset from the target node
        y: targetNode.position.y || 0,
      };

      const newNode: Node = {
        id: tempNodeId,
        type: 'tableNode',
        position: newNodePosition as XYPosition,
        data: {
          name: 'Order',
          fields: [
            { name: 'Name', type: 'String' },
            { name: 'Product Name', type: 'String' },
            { name: 'Order Date', type: 'Date' },
            { name: 'Quantity', type: 'Number' },
          ],
        },
      };

      setNodes(prevNodes => [...prevNodes, newNode]);

      // Step 3: Add the connection between the target node and the new node
      const targetToTempNodeEdge: Edge = {
        id: nanoid(),
        source: target,
        target: tempNodeId,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#dedede', strokeWidth: '3px' },
      };

      setEdges(prevEdges => [...prevEdges, targetToTempNodeEdge]);
    },
    [getNodes, setEdges, setNodes]
  );
  function constructEdge(
    id: any,
    source: any,
    target: any,
    newColor: any,
    type: any
  ) {
    const edge = {
      id,
      type,
      source,
      target,
      style: { stroke: newColor, strokeWidth: '4px' },
      data: { label: '' },
    };
    console.log({ edge });
    return edge;
  }

  const addNodeClick = (item: any, currentId: string) => {
    const filteredNode: any = nodes.find(node => node.id === currentId);
    const newNodeId = nanoid();

    let newColor = '#dedede';
    const newNode: Node = {
      id: newNodeId,
      data: { label: item.label, icon: item.icon },
      position: {
        x: filteredNode?.position?.x + 400,
        y: filteredNode?.position?.y,
      },
      type: lowerCase(item.label),
    };
    const type = 'smoothstep';
    const newEdge: Edge = constructEdge(
      nanoid(),
      currentId,
      newNodeId,
      newColor,
      type
    );

    setNodes(prev => prev.concat(newNode));
    setEdges(prev => prev.concat(newEdge as Edge));
  };

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const reactWorkflowBounds =
        reactWorkflowWrapper?.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow/type');
      const label = event.dataTransfer.getData('application/reactflow/label');
      const icon = event.dataTransfer.getData('application/reactflow/icon');
      const description = event.dataTransfer.getData(
        'application/reactflow/description'
      );

      let app_id: string;

      if (typeof type === 'undefined' || !type || !reactWorkflowBounds) return;

      const position = reactWorkflowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      if (!position) return;

      const newNode = {
        id: nanoid(),
        type,
        position,
        data: { label, icon, description },
      };

      setNodes((nds: Node[]) => nds.concat(newNode));
    },
    [reactWorkflowInstance, setEdges, setNodes]
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeDeleteClick = (nodeId: string) => {
    setNodes(nds => nds.filter(node => node.id !== nodeId));
    setEdges(eds =>
      eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId)
    );
  };

  const onNodeDuplicate = (nodeId: string) => {
    const nodeToDuplicate = nodes.find(node => node.id === nodeId);
    if (!nodeToDuplicate) return;

    const newNodeId = nanoid();
    const newNode: Node = {
      ...nodeToDuplicate,
      id: newNodeId,
      data: { ...nodeToDuplicate.data }, // Deep copy of data to ensure independence
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50,
      },
      selected: false,
    };

    setNodes(nds => nds.concat(newNode));

    // const connectedEdges = edges.filter((edge) => edge.source === nodeId || edge.target === nodeId);
    // const newEdges = connectedEdges.map((edge) => ({
    //   ...edge,
    //   id: nanoid(),
    //   source: edge.source === nodeId ? newNodeId : edge.source,
    //   target: edge.target === nodeId ? newNodeId : edge.target,
    // }));

    // setEdges((eds) => eds.concat(newEdges));
  };

  return {
    reactWorkflowWrapper,
    onConnect,
    addNodeClick,
    onDrop,
    onDragOver,
    setReactWorkflowInstance,
    onNodeDeleteClick,
  };
};
