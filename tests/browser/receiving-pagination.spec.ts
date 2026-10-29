import { test, expect } from "./fixtures";
import { chooseReceivingProduct } from "./receiving-products";
import { z } from "zod";

const product = z.object({ id: z.uuid(), sku: z.string(), name: z.string() });
test("catalogue boundaries 5, 6 and 11 preserve receiving rows and exclude duplicate choices", async ({
  page,
  request,
}, info) => {
  const base = process.env["E2E_BASE_URL"] ?? "http://localhost:5173";
  const email = process.env["E2E_SEED_EMAIL"];
  const password = process.env["E2E_SEED_PASSWORD"];
  if (!email || !password)
    throw new Error("Disposable seed credentials required.");
  const bootstrap = await request.get("/api/v1/auth/csrf-token");
  const auth = await request.post("/api/v1/auth/login", {
    headers: {
      Origin: base,
      "X-CSRF-Token": (await bootstrap.json()).data.csrfToken,
    },
    data: { email, password },
  });
  expect(auth.status()).toBe(200);
  const headers = {
    Origin: base,
    "X-CSRF-Token": (await auth.json()).data.csrfToken,
  };
  const initial = await request.get("/api/v1/products?limit=5");
  const initialTotal = (await initial.json()).pagination.total;
  test.skip(
    initialTotal !== 0,
    "Boundary fixture requires its own empty catalogue. Prepare a fresh test database; never clear shared data.",
  );
  const catalogue: Array<z.infer<typeof product>> = [];
  async function addUntil(total: number) {
    while (catalogue.length < total) {
      const ordinal = String(catalogue.length + 1).padStart(2, "0");
      const response = await request.post("/api/v1/products", {
        headers,
        data: { sku: `PAGER-${ordinal}`, name: `Catalogue ${ordinal}` },
      });
      expect(response.status()).toBe(201);
      catalogue.push(
        z.object({ data: product }).parse(await response.json()).data,
      );
    }
  }
  const responses: Array<{
    page: number;
    limit: number;
    total: number;
    rows: number;
  }> = [];
  page.on("response", async (response) => {
    if (
      response.request().method() === "GET" &&
      new URL(response.url()).pathname === "/api/v1/products" &&
      response.status() === 200
    ) {
      const result = z
        .object({
          data: z.array(product),
          pagination: z.object({
            page: z.number(),
            limit: z.number(),
            total: z.number(),
          }),
        })
        .parse(await response.json());
      responses.push({ ...result.pagination, rows: result.data.length });
    }
  });
  await addUntil(5);
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(
    page.getByRole("navigation", { name: "Navigasi utama" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Buat receiving", exact: true }).click();
  const pager = page.getByRole("region", {
    name: "Katalog produk pilihan",
    exact: true,
  });
  await expect(
    pager.getByText(/Halaman 1 dari 1.*5 produk tersedia/),
  ).toBeVisible();
  await expect(
    pager.getByRole("button", { name: "Sebelumnya" }),
  ).toBeDisabled();
  await expect(
    pager.getByRole("button", { name: "Berikutnya" }),
  ).toBeDisabled();
  await addUntil(6);
  await page.reload();
  await expect(
    pager.getByText(/Halaman 1 dari 2.*6 produk tersedia/),
  ).toBeVisible();
  await pager.getByRole("button", { name: "Berikutnya" }).click();
  await expect(
    pager.getByText(/Halaman 2 dari 2.*6 produk tersedia/),
  ).toBeVisible();
  await page
    .getByLabel("Produk 1", { exact: true })
    .and(page.getByRole("button"))
    .click();
  await expect(page.getByRole("option")).toHaveCount(2); // Placeholder and product six only.
  await expect(page.getByRole("option", { name: /^PAGER-06 / })).toBeVisible();
  await expect(page.getByRole("option", { name: /^PAGER-01 / })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await pager.getByRole("button", { name: "Sebelumnya" }).click();
  await expect(
    pager.getByText(/Halaman 1 dari 2.*6 produk tersedia/),
  ).toBeVisible();
  await addUntil(11);
  await page.reload();
  await expect(
    pager.getByText(/Halaman 1 dari 3.*11 produk tersedia/),
  ).toBeVisible();
  await page
    .getByLabel("Referensi", { exact: true })
    .fill("Pagination keeps items");
  const first = catalogue[0]!;
  const sixth = catalogue[5]!;
  const eleventh = catalogue[10]!;
  await chooseReceivingProduct(
    page,
    "Produk 1",
    `${first.sku} · ${first.name}`,
  );
  await page.getByLabel("Expected quantity 1", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Tambah item", exact: true }).click();
  await pager.getByRole("button", { name: "Berikutnya" }).click();
  await expect(
    pager.getByText(/Halaman 2 dari 3.*11 produk tersedia/),
  ).toBeVisible();
  await chooseReceivingProduct(
    page,
    "Produk 2",
    `${sixth.sku} · ${sixth.name}`,
  );
  await page.getByLabel("Expected quantity 2", { exact: true }).fill("3");
  await pager.getByRole("button", { name: "Berikutnya" }).click();
  await expect(
    pager.getByText(/Halaman 3 dari 3.*11 produk tersedia/),
  ).toBeVisible();
  await expect(
    pager.getByRole("button", { name: "Berikutnya" }),
  ).toBeDisabled();
  await expect(
    page.getByLabel("Produk 1", { exact: true }).and(page.getByRole("button")),
  ).toContainText(first.sku);
  await expect(
    page.getByLabel("Produk 2", { exact: true }).and(page.getByRole("button")),
  ).toContainText(sixth.sku);
  await expect(page.getByLabel("Expected quantity 1")).toHaveValue("2");
  await expect(page.getByLabel("Expected quantity 2")).toHaveValue("3");
  await page.getByRole("button", { name: "Tambah item", exact: true }).click();
  await page
    .getByLabel("Produk 3", { exact: true })
    .and(page.getByRole("button"))
    .click();
  await expect(page.getByRole("option", { name: /^PAGER-01 / })).toHaveCount(0);
  await expect(page.getByRole("option", { name: /^PAGER-06 / })).toHaveCount(0);
  await expect(page.getByRole("option", { name: /^PAGER-02 / })).toHaveCount(0); // Old unselected options must not accumulate.
  await page
    .getByRole("option", {
      name: `${eleventh.sku} · ${eleventh.name}`,
      exact: true,
    })
    .click();
  await page.getByLabel("Expected quantity 3").fill("4");
  await expect(page.getByText(/Item penerimaan.*3 item/)).toBeVisible();
  await expect(pager.getByText(/11 produk tersedia/)).toBeVisible();
  await page.screenshot({
    path: `docs/evidence/receiving-pagination-${info.project.name}.png`,
    fullPage: true,
  });
  const committed = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname === "/api/v1/receivings",
  );
  await page
    .getByRole("button", { name: "Simpan receiving", exact: true })
    .click();
  const created = await committed;
  expect(created.status()).toBe(201);
  const doc = z
    .object({
      data: z.object({
        reference: z.string(),
        items: z.array(
          z.object({ productId: z.uuid(), expectedQuantity: z.number() }),
        ),
      }),
    })
    .parse(await created.json()).data;
  expect(doc.reference).toBe("Pagination keeps items");
  expect(doc.items).toEqual(
    expect.arrayContaining([
      { productId: first.id, expectedQuantity: 2 },
      { productId: sixth.id, expectedQuantity: 3 },
      { productId: eleventh.id, expectedQuantity: 4 },
    ]),
  );
  await expect
    .poll(() =>
      responses.some(
        (result) =>
          result.total === 5 && result.rows === 5 && result.limit === 5,
      ),
    )
    .toBe(true);
  expect(
    responses.some(
      (result) => result.total === 6 && result.page === 2 && result.rows === 1,
    ),
  ).toBe(true);
  expect(
    responses.some(
      (result) => result.total === 11 && result.page === 2 && result.rows === 5,
    ),
  ).toBe(true);
  expect(
    responses.some(
      (result) => result.total === 11 && result.page === 3 && result.rows === 1,
    ),
  ).toBe(true);
});
