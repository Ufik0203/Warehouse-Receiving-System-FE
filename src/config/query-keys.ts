import { authEpoch } from './http-client';
export type Resource = 'users' | 'products' | 'receivings' | 'inventory' | 'transactions';
export const keys = {
  auth: () => ['auth','me',authEpoch()] as const,
  scope: (actorId: string, resource: Resource) => ['actor',actorId,authEpoch(),resource] as const,
  list: (actorId: string, resource: Resource, filters: object) => [...keys.scope(actorId,resource),'list',filters] as const,
  detail: (actorId: string, resource: Resource, id: string) => [...keys.scope(actorId,resource),'detail',id] as const
};
