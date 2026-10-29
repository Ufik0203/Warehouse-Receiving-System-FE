import { test,expect } from './fixtures';
import type { APIRequestContext,Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
const base=process.env['E2E_BASE_URL']??'http://localhost:5173';
type Account={id:string;name:string;email:string;password:string};
type Admin={context:APIRequestContext;csrf:string};
async function data<T>(response:{status:()=>number;json:()=>Promise<unknown>},schema:z.ZodType<T>):Promise<T>{
  expect(response.status()).toBeLessThan(300);return z.object({data:schema}).parse(await response.json()).data;
}
const user=z.object({id:z.uuid(),name:z.string(),email:z.string()});
const product=z.object({id:z.uuid(),sku:z.string(),name:z.string()});
const documentSchema=z.object({id:z.uuid(),items:z.array(z.object({id:z.uuid(),productId:z.uuid(),remainingQuantity:z.number()}))});
async function admin(context:APIRequestContext):Promise<Admin>{
 const email=process.env['E2E_SEED_EMAIL'];const password=process.env['E2E_SEED_PASSWORD'];if(!email||!password)throw new Error('Provide disposable-test seed credentials via process environment.');
 expect((await context.get('/health/ready')).status()).toBe(200);
 const bootstrap=await data(await context.get('/api/v1/auth/csrf-token'),z.object({csrfToken:z.string()}));
 const login=await data(await context.post('/api/v1/auth/login',{headers:{Origin:base,'X-CSRF-Token':bootstrap.csrfToken},data:{email,password}}),z.object({csrfToken:z.string()}));
 return {context,csrf:login.csrfToken};
}
async function account(admin:Admin,role:'OPERATOR'|'SUPERVISOR'):Promise<Account>{
 const password=randomUUID()+'-Test';const result=await data(await admin.context.post('/api/v1/users',{headers:{Origin:base,'X-CSRF-Token':admin.csrf},data:{name:`UI-${role}-${randomUUID().slice(0,6)}`,email:`${randomUUID()}@example.test`,password,role}}),user);
 return {...result,password};
}
async function createDocument(admin:Admin,actorId:string){
 const sku='E2E-'+randomUUID().slice(0,8).toUpperCase();
 const item=await data(await admin.context.post('/api/v1/products',{headers:{Origin:base,'X-CSRF-Token':admin.csrf},data:{sku,name:'Browser product'}}),product);
 const receiving=await data(await admin.context.post('/api/v1/receivings',{headers:{Origin:base,'X-CSRF-Token':admin.csrf},data:{reference:'E2E '+actorId,items:[{productId:item.id,expectedQuantity:100}]}}),documentSchema);
 return {product:item,document:receiving};
}
async function login(page:Page,who:Account){
 await expect(page.getByRole('heading',{name:'Masuk ke gudang'})).toBeVisible();
 await page.getByLabel('Email',{exact:true}).fill(who.email);await page.getByLabel('Password',{exact:true}).fill(who.password);await page.getByRole('button',{name:'Masuk',exact:true}).click();
 await expect(page.getByRole('navigation',{name:'Navigasi utama'})).toBeVisible();
}
async function select(page:Page,label:string,option:string){await page.getByLabel(label,{exact:true}).click();await page.getByRole('option',{name:option,exact:true}).click();}
test('supervisor manages products/users; operator routes and mobile layout respect role',async({page,request},info)=>{
 const root=await admin(request);const supervisor=await account(root,'SUPERVISOR');const operator=await account(root,'OPERATOR');
 await page.goto('/login');await login(page,supervisor);await page.getByRole('link',{name:'Produk',exact:true}).focus();await page.keyboard.press('Enter');
 await page.getByRole('button',{name:'Buat produk',exact:true}).click();await expect(page.getByText('Nama harus 1–120 karakter Unicode.')).toBeVisible();
 const sku='E2E-'+randomUUID().slice(0,8).toUpperCase();await page.getByLabel('SKU',{exact:true}).fill(sku);await page.getByLabel('Nama produk',{exact:true}).fill('UI product');await page.getByRole('button',{name:'Buat produk',exact:true}).click();await expect(page.getByText('Produk berhasil dibuat.')).toBeVisible();
 await page.getByRole('link',{name:'Pengguna',exact:true}).click();const email=`${randomUUID()}@example.test`;const name='New-'+randomUUID().slice(0,6);
 await page.getByLabel('Nama',{exact:true}).fill(name);await page.getByLabel('Email',{exact:true}).fill(email);await page.getByLabel('Password baru',{exact:true}).fill(randomUUID());await page.getByRole('button',{name:'Buat pengguna',exact:true}).click();await expect(page.getByText('Pengguna berhasil dibuat.')).toBeVisible();
 await page.getByRole('link',{name:new RegExp(name)}).click();await select(page,'Status akun','Nonaktif');await page.getByRole('button',{name:'Simpan',exact:true}).click();await expect(page.getByText('Pengguna berhasil diperbarui.')).toBeVisible();
 await page.getByRole('button',{name:'Hapus pengguna',exact:true}).click();await page.getByRole('button',{name:'Konfirmasi hapus',exact:true}).click();await expect(page.getByText('Pengguna berhasil dihapus.')).toBeVisible();
 await page.getByRole('button',{name:'Keluar',exact:true}).click();await login(page,operator);await page.reload();await expect(page.getByRole('navigation')).toBeVisible();
 await expect(page.getByRole('link',{name:'Pengguna',exact:true})).toHaveCount(0);await page.goto('/products');await expect(page.getByRole('heading',{name:'Produk',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Buat produk',exact:true})).toHaveCount(0);
 await page.screenshot({path:`docs/evidence/${process.env['E2E_RUNTIME']==='docker'?'task7':'task6'}-${info.project.name}.png`,fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.goto('/users');await expect(page.getByRole('heading',{name:'Akses tidak diizinkan'})).toBeVisible();await page.goto('/does-not-exist');await expect(page.getByRole('heading',{name:'Halaman tidak ditemukan'})).toBeVisible();
});
test('creates receiving through UI and receives 40 then 60, with inventory/history and duplicate-submit protection',async({page,request})=>{
 const root=await admin(request);const who=await account(root,'OPERATOR');const fixture=await createDocument(root,who.id);
 await page.goto('/login');await login(page,who);await page.getByRole('link',{name:'Buat receiving',exact:true}).click();
 await page.getByLabel('Referensi',{exact:true}).fill('Browser 100');await page.getByLabel('Cari produk untuk pilihan',{exact:true}).fill(fixture.product.sku);
 await select(page,'Produk 1',`${fixture.product.sku} · ${fixture.product.name}`);await page.getByLabel('Expected quantity 1',{exact:true}).fill('100');await page.getByRole('button',{name:'Simpan receiving',exact:true}).click();await page.getByRole('link',{name:'Buka receiving',exact:true}).click();
 const id=page.url().split('/').at(-1)??'';await page.getByLabel(`Terima ${fixture.product.sku}`,{exact:true}).fill('101');await page.getByRole('button',{name:'Simpan penerimaan',exact:true}).click();await expect(page.getByText('Gunakan bilangan bulat 1 sampai remaining (maksimal 1.000.000).')).toBeVisible();
 let posts=0;page.on('request',req=>{if(req.method()==='POST'&&req.url().endsWith(`/receivings/${id}/receipts`))posts++;});
 await page.getByLabel(`Terima ${fixture.product.sku}`,{exact:true}).fill('40');await page.getByRole('button',{name:'Simpan penerimaan',exact:true}).dblclick();await expect(page.getByText('PARTIAL',{exact:true})).toBeVisible();expect(posts).toBe(1);
 await page.getByLabel(`Terima ${fixture.product.sku}`,{exact:true}).fill('60');await page.getByRole('button',{name:'Simpan penerimaan',exact:true}).click();await expect(page.getByText('COMPLETED',{exact:true})).toBeVisible();expect(posts).toBe(2);
 await page.getByRole('link',{name:'Persediaan',exact:true}).click();await page.getByLabel('Cari SKU atau nama',{exact:true}).fill(fixture.product.sku);await expect(page.getByRole('cell',{name:'100 pcs',exact:true})).toBeVisible();
 await page.goto(`/inventory/transactions?receivingId=${id}`);await expect(page.getByRole('cell',{name:'+40',exact:true})).toBeVisible();await expect(page.getByRole('cell',{name:'+60',exact:true})).toBeVisible();
});
test('recovers a committed lost response across navigation/reload/reauth with original key and payload',async({page,request})=>{
 const root=await admin(request);const who=await account(root,'OPERATOR');const fixture=await createDocument(root,who.id);const id=fixture.document.id;
 await page.goto(`/receivings/${id}`);await login(page,who);
 let originalKey='';let originalPayload='';let receiptId='';let posted=0;
 await page.route(`**/api/v1/receivings/${id}/receipts`,async route=>{
  posted++;originalKey=route.request().headers()['idempotency-key']??'';originalPayload=route.request().postData()??'';
  const response=await route.fetch();expect(response.status()).toBe(201);const raw:unknown=await response.json();receiptId=z.object({data:z.object({id:z.uuid()})}).parse(raw).data.id;await route.abort('failed');
 });
 await page.getByLabel(`Terima ${fixture.product.sku}`,{exact:true}).fill('100');await page.getByRole('button',{name:'Simpan penerimaan',exact:true}).click();await expect(page.getByRole('button',{name:'Coba ulang operasi tersimpan',exact:true})).toBeEnabled();expect(posted).toBe(1);
 const stored=await page.evaluate(()=>Object.entries(sessionStorage).filter(([key])=>key.startsWith('wrs:pending:')).map(([,value])=>JSON.parse(value) as unknown));expect(stored).toHaveLength(1);
 await page.unroute(`**/api/v1/receivings/${id}/receipts`);await page.getByRole('link',{name:'Produk',exact:true}).click();await page.goto(`/receivings/${id}`);await page.reload();await expect(page.getByRole('button',{name:'Coba ulang operasi tersimpan'})).toBeVisible();
 // Real server logout destroys the session; the browser then restores as unauthenticated.
 const bootstrap=await data(await page.request.get('/api/v1/auth/csrf-token'),z.object({csrfToken:z.string()}));
 expect((await page.request.post('/api/v1/auth/logout',{headers:{Origin:base,'Content-Type':'application/json','X-CSRF-Token':bootstrap.csrfToken}})).status()).toBe(204);
 await page.reload();await login(page,who);await expect(page.getByRole('button',{name:'Coba ulang operasi tersimpan'})).toBeVisible();
 await page.route(`**/api/v1/receivings/${id}/receipts`,async route=>{posted++;expect(route.request().headers()['idempotency-key']).toBe(originalKey);expect(route.request().postData()).toBe(originalPayload);const response=await route.fetch();expect(response.status()).toBe(200);const raw:unknown=await response.json();expect(z.object({data:z.object({id:z.string()})}).parse(raw).data.id).toBe(receiptId);await route.fulfill({response});});
 await page.getByRole('button',{name:'Coba ulang operasi tersimpan'}).click();await expect(page.getByText(new RegExp(`Penerimaan telah dikonfirmasi.*${receiptId}`))).toBeVisible();expect(posted).toBe(2);
 expect(await page.evaluate(()=>Object.keys(sessionStorage).filter(key=>key.startsWith('wrs:pending:')).length)).toBe(0);
 const history=await data(await request.get(`/api/v1/inventory/transactions?receivingId=${id}`),z.array(z.object({quantity:z.number()})));expect(history).toHaveLength(1);expect(history[0]?.quantity).toBe(100);
});
test('committed receipt plus failed refetch never offers a new operation until data is refreshed',async({page,request})=>{
 const root=await admin(request);const who=await account(root,'OPERATOR');const fixture=await createDocument(root,who.id);const id=fixture.document.id;
 await page.goto(`/receivings/${id}`);await login(page,who);await expect(page.getByLabel(`Terima ${fixture.product.sku}`)).toBeVisible();
 await page.route(`**/api/v1/receivings/${id}`,route=>route.fulfill({status:503,json:{error:{code:'DEPENDENCY_UNAVAILABLE',message:'Refresh unavailable',requestId:'e2e-refetch'}}}));
 let posts=0;page.on('request',req=>{if(req.method()==='POST'&&req.url().endsWith(`/receivings/${id}/receipts`))posts++;});
 await page.getByLabel(`Terima ${fixture.product.sku}`).fill('40');await page.getByRole('button',{name:'Simpan penerimaan',exact:true}).click();await expect(page.getByText(/Operasi sudah berhasil. Penyegaran data gagal/)).toBeVisible();await expect(page.getByRole('button',{name:'Simpan penerimaan',exact:true})).toBeDisabled();expect(posts).toBe(1);
 expect(await page.evaluate(()=>Object.keys(sessionStorage).filter(key=>key.startsWith('wrs:pending:')).length)).toBe(0);
 await page.unroute(`**/api/v1/receivings/${id}`);await page.getByRole('button',{name:'Muat ulang data'}).click();await expect(page.getByText('PARTIAL',{exact:true})).toBeVisible();expect(posts).toBe(1);
});
test('switching users clears old data, ignores late requests and never replays another actor pending receipt',async({page,request})=>{
 const root=await admin(request);const a=await account(root,'SUPERVISOR');const b=await account(root,'OPERATOR');const fixture=await createDocument(root,a.id);const id=fixture.document.id;
 await page.goto(`/receivings/${id}`);await login(page,a);
 await page.route(`**/api/v1/receivings/${id}/receipts`,route=>route.abort('failed'));
 await page.getByLabel(`Terima ${fixture.product.sku}`).fill('40');await page.getByRole('button',{name:'Simpan penerimaan',exact:true}).click();await expect(page.getByRole('button',{name:'Coba ulang operasi tersimpan'})).toBeEnabled();
 await page.getByRole('link',{name:'Pengguna',exact:true}).click();await expect(page.getByText(a.email,{exact:true})).toBeVisible();
 let late:(()=>Promise<void>)|undefined;let started:(()=>void)|undefined;const waiting=new Promise<void>(resolve=>{started=resolve;});
 await page.route('**/api/v1/users?**',async route=>{const response=await route.fetch();started?.();await new Promise<void>(resolve=>{late=async()=>{try{await route.fulfill({response});}catch{/* Request was aborted on session change. */}resolve();};});});
 await page.getByLabel('Filter status',{exact:true}).click();await page.getByRole('option',{name:'Aktif',exact:true}).click();await waiting;
 await page.getByRole('button',{name:'Keluar',exact:true}).click();await login(page,b);await late?.();await expect(page.getByText(a.email,{exact:true})).toHaveCount(0);await expect(page.getByRole('link',{name:'Pengguna',exact:true})).toHaveCount(0);
 let posted=0;page.on('request',req=>{if(req.method()==='POST'&&req.url().endsWith(`/receivings/${id}/receipts`))posted++;});
 await page.goto(`/receivings/${id}`);await expect(page.getByLabel(`Terima ${fixture.product.sku}`)).toBeVisible();await expect(page.getByRole('button',{name:'Coba ulang operasi tersimpan'})).toHaveCount(0);expect(posted).toBe(0);
 await page.getByRole('button',{name:'Keluar',exact:true}).click();await login(page,a);await page.goto(`/receivings/${id}`);await expect(page.getByRole('button',{name:'Coba ulang operasi tersimpan'})).toBeVisible();
});
