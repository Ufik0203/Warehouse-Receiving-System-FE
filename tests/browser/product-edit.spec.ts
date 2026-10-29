import { test, expect } from './fixtures';
import { randomUUID } from 'node:crypto';

test('supervisor corrects a received product; refreshed inventory/history and receipt replay preserve stock', async ({ page, request }) => {
  const base = process.env['E2E_BASE_URL'] ?? 'http://localhost:5173';
  const email = process.env['E2E_SEED_EMAIL']; const password = process.env['E2E_SEED_PASSWORD'];
  if (!email || !password) throw new Error('Disposable seed credentials required.');
  const bootstrap = await request.get('/api/v1/auth/csrf-token');
  const login = await request.post('/api/v1/auth/login', { headers: { Origin: base, 'X-CSRF-Token': (await bootstrap.json()).data.csrfToken }, data: { email, password } });
  expect(login.status()).toBe(200);
  const headers = { Origin: base, 'X-CSRF-Token': (await login.json()).data.csrfToken };
  const sku = `PE-${randomUUID().slice(0, 8).toUpperCase()}`;
  const created = await request.post('/api/v1/products', { headers, data: { sku, name: 'Before correction' } });
  expect(created.status()).toBe(201); const product = (await created.json()).data;
  const duplicateSku = `DUP-${randomUUID().slice(0, 8).toUpperCase()}`;
  expect((await request.post('/api/v1/products', { headers, data: { sku: duplicateSku, name: 'Other product' } })).status()).toBe(201);
  const receivingResponse = await request.post('/api/v1/receivings', { headers, data: { items: [{ productId: product.id, expectedQuantity: 10 }] } });
  expect(receivingResponse.status()).toBe(201); const doc = (await receivingResponse.json()).data;
  const key = randomUUID(); const receiptBody = { items: [{ receivingItemId: doc.items[0].id, quantity: 10 }] };
  const receipt = await request.post(`/api/v1/receivings/${doc.id}/receipts`, { headers: { ...headers, 'Idempotency-Key': key }, data: receiptBody });
  expect(receipt.status()).toBe(201); const original = await receipt.json();
  await page.goto('/login'); await page.getByLabel('Email', { exact: true }).fill(email); await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Masuk', exact: true }).click(); await expect(page.getByRole('navigation', { name: 'Navigasi utama' })).toBeVisible();
  // Prime related server-state queries before the product correction.
  await page.goto(`/receivings/${doc.id}`); await expect(page.getByRole('cell', { name: /Before correction/ })).toBeVisible();
  await page.getByRole('link', { name: 'Persediaan', exact: true }).click();
  await page.getByLabel('Cari SKU atau nama', { exact: true }).fill(sku); await expect(page.getByRole('cell', { name: '10 pcs', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Riwayat', exact: true }).click(); await expect(page.getByRole('cell', { name: new RegExp(sku) })).toBeVisible();
  await page.getByRole('link', { name: 'Produk', exact: true }).click(); await page.getByLabel('Cari SKU atau nama', { exact: true }).fill(sku);
  await page.getByRole('button', { name: `Edit ${sku}`, exact: true }).click();
  await expect(page.getByLabel('SKU edit', { exact: true })).toHaveValue(sku);
  await page.getByRole('button', { name: 'Batal', exact: true }).click(); await expect(page.getByLabel('SKU edit', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: `Edit ${sku}`, exact: true }).click();
  await page.getByLabel('Nama produk edit', { exact: true }).fill(''); await page.getByRole('button', { name: 'Simpan', exact: true }).click();
  await expect(page.getByText('Nama harus 1–120 karakter Unicode.', { exact: true })).toBeVisible();
  await page.getByLabel('SKU edit', { exact: true }).fill(duplicateSku); await page.getByLabel('Nama produk edit', { exact: true }).fill('Corrected product');
  await page.getByRole('button', { name: 'Simpan', exact: true }).click(); await expect(page.getByText('SKU already exists.', { exact: true })).toBeVisible();
  const corrected = `FIX-${randomUUID().slice(0, 8).toUpperCase()}`;
  await page.getByLabel('SKU edit', { exact: true }).fill(` ${corrected.toLowerCase()} `);
  let calls = 0; let release: (() => void) | undefined;
  await page.route(`**/api/v1/products/${product.id}`, async route => {
    if (route.request().method() === 'PATCH') { calls++; await new Promise<void>(resolve => { release = resolve; }); }
    await route.continue();
  });
  await page.getByRole('button', { name: 'Simpan', exact: true }).click();
  await expect(page.getByRole('button', { name: /Menyimpan/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Batal', exact: true })).toBeDisabled();
  await expect.poll(() => release !== undefined).toBe(true); release?.();
  await expect(page.getByText('Produk berhasil diperbarui.', { exact: true })).toBeVisible(); expect(calls).toBe(1);
  await page.getByLabel('Cari SKU atau nama', { exact: true }).fill(corrected); await expect(page.getByText('Corrected product', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Persediaan', exact: true }).click(); await page.getByLabel('Cari SKU atau nama', { exact: true }).fill(corrected);
  await expect(page.getByRole('cell', { name: '10 pcs', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Riwayat', exact: true }).click(); await expect(page.getByRole('cell', { name: new RegExp(corrected) })).toBeVisible();
  await page.getByRole('link', { name: doc.number, exact: true }).click(); await expect(page.getByRole('cell', { name: /Corrected product/ })).toBeVisible();
  const replay = await request.post(`/api/v1/receivings/${doc.id}/receipts`, { headers: { ...headers, 'Idempotency-Key': key }, data: receiptBody });
  expect(replay.status()).toBe(200); expect(await replay.json()).toEqual(original);
  const inventory = await request.get(`/api/v1/inventory?q=${corrected}`);
  expect((await inventory.json()).data[0]).toMatchObject({ productId: product.id, availableQuantity: '10' });
});
