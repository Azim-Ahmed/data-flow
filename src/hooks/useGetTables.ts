"use client";



import { TABLE_API } from "@/services/table";
import { Table } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export const useGetTables = () => {
  return useQuery<Table[]>({
    queryKey: [TABLE_API.getTables.name],
    queryFn: TABLE_API.getTables,
  });
};

export const useGetTableById = (id: string) => {
  return useQuery<Table>({
    queryKey: [TABLE_API.getTables.name,id],  // Unique query key with table ID
    queryFn: () => TABLE_API.getTableById(id),  // Fetch table by ID
    enabled: !!id,  // Only run the query if the id is provided
  });
};