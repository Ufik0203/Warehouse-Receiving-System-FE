import { test as base,expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname,isAbsolute } from 'node:path';
import { randomUUID } from 'node:crypto';

// Optional external runtime fixture. This never imports or edits backend source.
// A fresh Redis namespace per case preserves the real production rate-limit policy.
export const test=base.extend<{ isolatedBackend:void }>({
 isolatedBackend:[async({playwright},use)=>{
  const entry=process.env['E2E_BACKEND_ENTRY'];const file=process.env['E2E_BACKEND_ENV_FILE'];
  if(!entry||!file)throw new Error('Full browser suite requires explicit E2E_BACKEND_ENTRY and E2E_BACKEND_ENV_FILE for an isolated external backend.');
  if(!isAbsolute(entry)||!isAbsolute(file))throw new Error('External backend paths must be absolute.');
  const config=readFileSync(file,'utf8');const database=config.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim();
  if(!database||!new URL(database).pathname.endsWith('_test'))throw new Error('Browser runtime requires a dedicated _test database.');
  const runtime=spawn(process.execPath,[entry],{cwd:dirname(entry),windowsHide:true,stdio:'pipe',env:{...process.env,BACKEND_ENV_FILE:file,PORT:process.env['E2E_BACKEND_PORT']??'3306',REDIS_NAMESPACE:`wrs:test:task6:${randomUUID()}`}});
  runtime.stdout.resume();runtime.stderr.resume();
  let stopped=false;const exit=new Promise<void>(resolve=>runtime.once('exit',()=>{stopped=true;resolve();}));
  const probe=await playwright.request.newContext();
  try{
   let ready=false;
   for(let attempt=0;attempt<300;attempt++){
    if(stopped)throw new Error('External backend exited before readiness.');
    try{ready=(await probe.get(`${process.env['E2E_BASE_URL']??'http://localhost:5173'}/health/ready`)).ok();}catch{/* Startup not ready yet. */}
    if(ready)break;await new Promise(resolve=>setTimeout(resolve,100));
   }
   if(!ready)throw new Error('External test backend did not become ready.');
   await use();
  }finally{await probe.dispose();if(!stopped)runtime.kill('SIGTERM');await exit;}
 },{auto:true}]
});
export { expect };
