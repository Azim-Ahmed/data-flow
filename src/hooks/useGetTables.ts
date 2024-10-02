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
