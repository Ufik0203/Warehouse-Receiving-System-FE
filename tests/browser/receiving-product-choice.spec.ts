import { test, expect } from './fixtures';
import { chooseReceivingProduct } from './receiving-products';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

const product = z.object({ id: z.uuid(), sku: z.string(), name: z.string() });
const productPage = z.object({ data: z.array(product), pagination: z.object({ total: z.number() }) });
test('creates a multi-product receiving from paginated choices without selector search', async ({ page, request }) => {
  const base = process.env['E2E_BASE_URL'] ?? 'http://localhost:5173';
  const email = process.env['E2E_SEED_EMAIL']; const password = process.env['E2E_SEED_PASSWORD'];
  if (!email || !password) throw new Error('Disposable seed credentials required.');
  const csrf = z.object({ data: z.object({ csrfToken: z.string() }) }).parse(await (await request.get('/api/v1/auth/csrf-token')).json()).data.csrfToken;
  const login = await request.post('/api/v1/auth/login', { headers: { Origin: base, 'X-CSRF-Token': csrf }, data: { email, password } });
  expect(login.status()).toBe(200);
  const token = z.object({ data: z.object({ csrfToken: z.string() }) }).parse(await login.json()).data.csrfToken;
  const headers = { Origin: base, 'X-CSRF-Token': token };
  const existing = productPage.parse(await (await request.get('/api/v1/products?limit=100')).json()).pagination.total;
  // Add only disposable fixtures needed to cross the API page boundary; never remove existing products.
  for (let index = existing; index < 6; index++) {
    expect((await request.post('/api/v1/products', { headers, data: { sku: `MID-${randomUUID().slice(0, 8)}`, name: 'Pagination fixture' } })).status()).toBe(201);
  }
  const candidates = productPage.parse(await (await request.get('/api/v1/products?limit=6')).json()).data;
  const first = candidates[0]!; const last = candidates[5]!;
  const stockBefore = new Map<string,string>();
  for (const selected of [first,last]) {
    const balances = z.object({data:z.array(z.object({productId:z.uuid(),availableQuantity:z.string()}))}).parse(await (await request.get(`/api/v1/inventory?q=${selected.sku}`)).json()).data;
    stockBefore.set(selected.id,balances.find(row=>row.productId===selected.id)!.availableQuantity);
  }
  const operatorEmail = `${randomUUID()}@receiving-choice.test`; const operatorPassword = randomUUID();
  expect((await request.post('/api/v1/users', { headers, data: { name: 'Choice operator', email: operatorEmail, password: operatorPassword, role: 'OPERATOR' } })).status()).toBe(201);
  const selectionRequests: URL[] = [];
  page.on('request', req => { const url = new URL(req.url()); if (req.method() === 'GET' && url.pathname === '/api/v1/products') selectionRequests.push(url); });
  await page.goto('/login'); await page.getByLabel('Email', { exact: true }).fill(operatorEmail); await page.getByLabel('Password', { exact: true }).fill(operatorPassword);
  await page.getByRole('button', { name: 'Masuk', exact: true }).click(); await expect(page.getByRole('navigation', { name: 'Navigasi utama' })).toBeVisible();
  await page.getByRole('link', { name: 'Buat receiving', exact: true }).click();
  await expect(page.getByLabel('Cari produk untuk pilihan', { exact: true })).toHaveCount(0);
  await page.getByLabel('Referensi', { exact: true }).fill('Reference unchanged');
  await chooseReceivingProduct(page, 'Produk 1', `${first.sku} · ${first.name}`);
  await page.getByLabel('Expected quantity 1', { exact: true }).fill('2');
  await page.getByRole('button', { name: 'Tambah item', exact: true }).click();
  await chooseReceivingProduct(page, 'Produk 2', `${last.sku} · ${last.name}`);
  expect(selectionRequests.some(url => Number(url.searchParams.get('page')) > 1)).toBe(true);
  expect(selectionRequests.every(url => !url.searchParams.has('q'))).toBe(true);
  await expect(page.getByLabel('Produk 1', { exact: true })).toContainText(first.sku);
  await page.getByLabel('Produk 2',{exact:true}).and(page.getByRole('button')).click();
  await expect(page.getByRole('option',{name:new RegExp(first.sku)})).toHaveCount(0);
  await page.keyboard.press('Escape'); await expect(page.getByRole('listbox')).toHaveCount(0);
  let creates = 0; page.on('request', req => { if (req.method() === 'POST' && new URL(req.url()).pathname === '/api/v1/receivings') creates++; });
  await page.getByLabel('Expected quantity 2', { exact: true }).fill('0'); await page.getByRole('button', { name: 'Simpan receiving', exact: true }).click();
  await expect(page.getByText('Minimal 1.', { exact: true })).toBeVisible(); expect(creates).toBe(0);
  await page.getByLabel('Expected quantity 2', { exact: true }).fill('3'); await page.getByRole('button', { name: 'Simpan receiving', exact: true }).click();
  await page.getByRole('link', { name: 'Buka receiving', exact: true }).click();
  await expect(page.getByRole('cell', { name: new RegExp(first.sku) })).toBeVisible(); await expect(page.getByRole('cell', { name: new RegExp(last.sku) })).toBeVisible(); expect(creates).toBe(1);
  const id = page.url().split('/').at(-1);
  const result = await request.get(`/api/v1/receivings/${id}`); expect(result.status()).toBe(200);
  const doc = z.object({ data: z.object({ reference: z.string(), status: z.literal('OPEN'), items: z.array(z.object({ productId: z.uuid(), expectedQuantity: z.number(), receivedQuantity: z.literal(0) })) }) }).parse(await result.json()).data;
  expect(doc.reference).toBe('Reference unchanged'); expect(doc.items).toHaveLength(2);
  expect(doc.items).toEqual(expect.arrayContaining([{ productId: first.id, expectedQuantity: 2, receivedQuantity: 0 }, { productId: last.id, expectedQuantity: 3, receivedQuantity: 0 }]));
  for (const selected of [first, last]) {
    const stock = await request.get(`/api/v1/inventory?q=${selected.sku}`); expect(stock.status()).toBe(200);
    const balances=z.object({data:z.array(z.object({productId:z.uuid(),availableQuantity:z.string()}))}).parse(await stock.json()).data;
    expect(balances.find(row=>row.productId===selected.id)?.availableQuantity).toBe(stockBefore.get(selected.id));
  }
});
