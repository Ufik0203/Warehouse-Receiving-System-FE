import { http } from '../../../config/http-client';
import { dataSchema,pageSchema,queryString } from '../../../config/api-types';
import { productSchema } from '../types';
export const productsApi={
  list:(filters:Record<string,string|number|undefined>,signal?:AbortSignal)=>http('/products'+queryString(filters),pageSchema(productSchema),{signal}),
  create:(body:{sku:string;name:string})=>http('/products',dataSchema(productSchema),{method:'POST',body})
};
