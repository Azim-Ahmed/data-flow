import { nextApi } from "@/api/axios";
import { Table } from "@prisma/client";


export const  TABLE_API = {
  getTables:async():Promise<Table[]>=>{
    return await nextApi.get('/api/tables')
  }
}