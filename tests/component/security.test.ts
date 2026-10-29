import { describe,it,expect,vi,beforeEach } from 'vitest';
import { z } from 'zod';
import { http,resetHttp,ensureCsrf,setAuthLost,trustedUrl } from '../../src/config/http-client';
import { savePending,loadPending,clearPending } from '../../src/features/receivings/api/pending-receipt';
const actor='11111111-1111-4111-8111-111111111111';const doc='22222222-2222-4222-8222-222222222222';const item='33333333-3333-4333-8333-333333333333';
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
beforeEach(()=>resetHttp());
describe('trusted transport, CSRF and session generation',()=>{
 it('rejects external and escaping paths before any credential-bearing fetch',()=>{
  for(const path of ['https://evil.test','//evil.test','/../escape','/\\evil'])expect(()=>trustedUrl(path)).toThrow();
 });
 it('deduplicates bootstrap and sends only the memory token with same-origin credentials',async()=>{
  const fetcher=vi.spyOn(globalThis,'fetch').mockResolvedValueOnce(json({data:{csrfToken:'a'.repeat(64)}})).mockResolvedValueOnce(json({ok:true}));
  await Promise.all([ensureCsrf(),ensureCsrf()]);expect(fetcher).toHaveBeenCalledTimes(1);
  await http('/products',z.object({ok:z.boolean()}),{method:'POST',body:{name:'X'}});
  const options=fetcher.mock.calls[1]?.[1];expect(options?.credentials).toBe('same-origin');expect(options?.redirect).toBe('error');expect(options?.headers).toMatchObject({'X-CSRF-Token':'a'.repeat(64),'Content-Type':'application/json'});
 });
 it('uses the regenerated token and does not persist it in storage',async()=>{
  resetHttp('new-token');const fetcher=vi.spyOn(globalThis,'fetch').mockResolvedValue(json({ok:true}));
  await http('/products',z.object({ok:z.boolean()}),{method:'POST',body:{}});
  expect(fetcher.mock.calls[0]?.[1]?.headers).toMatchObject({'X-CSRF-Token':'new-token'});expect(sessionStorage.length).toBe(0);
 });
 it('rejects a late response from a prior identity even if transport ignores abort',async()=>{
  let finish:((response:Response)=>void)|undefined;
  vi.spyOn(globalThis,'fetch').mockImplementation(()=>new Promise(resolve=>{finish=resolve;}));
  const pending=http('/products',z.object({value:z.string()}));const checked=expect(pending).rejects.toMatchObject({code:'SESSION_CHANGED'});
  resetHttp();finish?.(json({value:'private user A'}));await checked;
 });
 it('clears authentication on 401 without converting dependency 503 into auth loss',async()=>{
  const lost=vi.fn();const release=setAuthLost(lost);
  vi.spyOn(globalThis,'fetch').mockResolvedValueOnce(json({error:{code:'DEPENDENCY_UNAVAILABLE',message:'Unavailable'}},503)).mockResolvedValueOnce(json({error:{code:'UNAUTHENTICATED',message:'Login required'}},401));
  await expect(http('/products',z.unknown())).rejects.toMatchObject({status:503});expect(lost).not.toHaveBeenCalled();
  await expect(http('/products',z.unknown())).rejects.toMatchObject({status:401});expect(lost).toHaveBeenCalledOnce();release();
 });
});
describe('pending receipt recovery',()=>{
 it('preserves original key and payload through navigation/reload while isolating identities',()=>{
  const first=savePending(actor,doc,{items:[{receivingItemId:item,quantity:40}]});
  expect(savePending(actor,doc,{items:[{receivingItemId:item,quantity:60}]})).toEqual(first);
  expect(loadPending(actor,doc)).toEqual(first);expect(loadPending(item,doc)).toBeNull();
  resetHttp();expect(loadPending(actor,doc)).toEqual(first);
  const raw=sessionStorage.getItem(`wrs:pending:${actor}:${doc}`)??'';expect(raw).not.toMatch(/password|csrfToken|sessionId/);
  clearPending(first);expect(loadPending(actor,doc)).toBeNull();
 });
 it('refuses to overwrite corrupted pending storage',()=>{
  sessionStorage.setItem(`wrs:pending:${actor}:${doc}`,'{}');expect(()=>savePending(actor,doc,{items:[{receivingItemId:item,quantity:40}]})).toThrow();
 });
});
