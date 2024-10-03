import { nextApi } from "@/api/axios";
import { Table } from "@prisma/client";


export const  TABLE_API = {
  getTables:async():Promise<Table[]>=>{
    return await nextApi.get('/api/tables')
  },
  createTable: async (table:any): Promise<Table> => {
    // Remove id, createdAt, and updatedAt, as these will be auto-handled by the database
    return await nextApi.post('/api/tables', table);
  },
  updateTable:async(table:Partial<Table>):Promise<Table> =>{
    return await nextApi.put(`/api/tables/${table.id}`, table)
  },
  updateMultipleTables: async (tables: Partial<Table>[]): Promise<Table[]> => {
    const response = await nextApi.put('/api/tables', tables);
    return response.data;
  },
  getTableById: async (id:string): Promise<Table> => {
    return await nextApi.get(`/api/tables/${id}`)
  }
}