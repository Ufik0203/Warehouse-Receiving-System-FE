import { http } from '../../../config/http-client';
import { dataSchema,pageSchema,queryString } from '../../../config/api-types';
import { receivingSchema,detailSchema,receiptSchema } from '../types';
import type { ReceiptPayload } from '../types';
export const receivingsApi={
  list:(filters:Record<string,string|number|undefined>,signal?:AbortSignal)=>http('/receivings'+queryString(filters),pageSchema(receivingSchema),{signal}),
  detail:(id:string,signal?:AbortSignal)=>http(`/receivings/${id}`,dataSchema(detailSchema),{signal}),
  create:(body:{reference:string;items:Array<{productId:string;expectedQuantity:number}>})=>http('/receivings',dataSchema(detailSchema),{method:'POST',body}),
  receive:(id:string,key:string,body:ReceiptPayload)=>http(`/receivings/${id}/receipts`,dataSchema(receiptSchema),{method:'POST',key,body})
};
