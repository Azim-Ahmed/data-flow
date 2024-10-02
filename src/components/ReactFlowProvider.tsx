"use client";

import { ReactFlowProvider as Provider } from "@xyflow/react";

export function ReactFlowProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}
