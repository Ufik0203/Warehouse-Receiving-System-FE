import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',fullyParallel:false,workers:1,timeout:process.env['E2E_RUNTIME']==='docker'?120000:60000,expect:{timeout:10000},retries:0,
 reporter:[['list'],['json',{outputFile:process.env['E2E_RUNTIME']==='docker'?'docs/evidence/task7-browser.json':'docs/evidence/task6-browser.json'}]],
 use:{baseURL:process.env['E2E_BASE_URL']??'http://localhost:5173',trace:'off',screenshot:'only-on-failure'},
 projects:[{name:'chrome-desktop',use:{channel:'chrome',viewport:{width:1440,height:1000}}},{name:'chrome-mobile',use:{channel:'chrome',viewport:{width:390,height:844},isMobile:true,hasTouch:true}}]});
