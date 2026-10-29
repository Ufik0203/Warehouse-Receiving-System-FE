import { describe,it,expect,vi } from 'vitest';
import { renderHook,act,waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { createQueryClient } from '../../src/config/query-client';
import { useAction } from '../../src/hooks/use-server';
import { keys } from '../../src/config/query-keys';
vi.mock('../../src/features/auth/hooks/use-auth',()=>({useAuth:()=>({user:{id:'actor-A'}})}));
describe('mutation outcome and targeted invalidation',()=>{
 it('invalidates receiving/inventory/history without optimistically changing stock or unrelated user cache',async()=>{
  const client=createQueryClient();const stockKey=keys.list('actor-A','inventory',{});client.setQueryData(stockKey,{availableQuantity:'0'});
  const invalidate=vi.spyOn(client,'invalidateQueries').mockResolvedValue(undefined);const operation=vi.fn(async()=>({receiptId:'confirmed'}));
  function Wrapper({children}:PropsWithChildren){return <QueryClientProvider client={client}>{children}</QueryClientProvider>;}
  const hook=renderHook(()=>useAction(operation,['receivings','inventory','transactions']),{wrapper:Wrapper});
  await act(async()=>{await hook.result.current.mutateAsync(undefined);});
  await waitFor(()=>expect(hook.result.current.isSuccess).toBe(true));
  expect(operation).toHaveBeenCalledOnce();expect(invalidate).toHaveBeenCalledTimes(3);
  for(const resource of ['receivings','inventory','transactions'] as const)expect(invalidate).toHaveBeenCalledWith({queryKey:keys.scope('actor-A',resource)},{throwOnError:true});
  expect(client.getQueryData(stockKey)).toEqual({availableQuantity:'0'});expect(hook.result.current.data?.refreshFailed).toBe(false);expect(client.getMutationCache().getAll()[0]?.options.retry).toBe(false);client.clear();
 });
 it('keeps a committed mutation successful even when refetch fails, with no automatic resend',async()=>{
  const client=createQueryClient();vi.spyOn(client,'invalidateQueries').mockRejectedValue(new Error('refresh failed'));const operation=vi.fn(async()=>({receiptId:'confirmed'}));
  function Wrapper({children}:PropsWithChildren){return <QueryClientProvider client={client}>{children}</QueryClientProvider>;}
  const hook=renderHook(()=>useAction(operation,['receivings']),{wrapper:Wrapper});
  await act(async()=>{await hook.result.current.mutateAsync(undefined);});
  await waitFor(()=>expect(hook.result.current.isSuccess).toBe(true));
  expect(hook.result.current.isSuccess).toBe(true);expect(hook.result.current.data?.refreshFailed).toBe(true);expect(operation).toHaveBeenCalledOnce();client.clear();
 });
});
