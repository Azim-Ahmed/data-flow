'use client';
import { Node } from '@xyflow/react';
import React, { createContext, useReducer, ReactNode, useContext } from 'react';

// Define the shape of the state
interface NodeStoreState {
  drawerOpen: boolean;
  sidebarOpen: boolean;
  selectedNode: any;
}

// Define the actions
type Action =
  | { type: 'SET_DRAWER_OPEN'; payload: boolean }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_SELECTED_NODE'; payload: Node | null };

// Initialize the default state
const initialState: NodeStoreState = {
  drawerOpen: false,
  sidebarOpen: false,
  selectedNode: null,
};

// Create the context
const NodeStoreContext = createContext<
  | {
      state: NodeStoreState;
      dispatch: React.Dispatch<Action>;
    }
  | undefined
>(undefined);

// Define the reducer function
const nodeStoreReducer = (
  state: NodeStoreState,
  action: Action
): NodeStoreState => {
  switch (action.type) {
    case 'SET_DRAWER_OPEN':
      return { ...state, drawerOpen: action.payload };
    case 'SET_SIDEBAR_OPEN':
      return { ...state, sidebarOpen: action.payload };
    case 'SET_SELECTED_NODE':
      return { ...state, selectedNode: action.payload };
    default:
      // No change needed here
      throw new Error(`Unhandled action type: ${(action as Action).type}`);
  }
};

// Create the provider component
export const NodeStoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(nodeStoreReducer, initialState);
  return (
    <NodeStoreContext.Provider value={{ state, dispatch }}>
      {children}
    </NodeStoreContext.Provider>
  );
};

// Custom hook to use the NodeStore context
export const useNodeStore = () => {
  const context = useContext(NodeStoreContext);
  if (context === undefined) {
    throw new Error('useNodeStore must be used within a NodeStoreProvider');
  }
  return context;
};
