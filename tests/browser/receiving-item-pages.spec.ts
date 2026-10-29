import { test, expect } from "./fixtures";
import { chooseReceivingProduct } from "./receiving-products";
import { randomUUID } from "node:crypto";
import { z } from "zod";

const product = z.object({ id: z.uuid(), sku: z.string(), name: z.string() });
const productPage = z.object({
  data: z.array(product),
  pagination: z.object({ total: z.number() }),
});

test("paginates receiving items separately, retains all values and submits hidden items", async ({
  page,
  request,
}, info) => {
  const base = process.env["E2E_BASE_URL"] ?? "http://localhost:5176";
  const email = process.env["E2E_SEED_EMAIL"];
  const password = process.env["E2E_SEED_PASSWORD"];
  if (!email || !password)
    throw new Error("Isolated seed credentials required.");
  const csrfEnvelope = z.object({ data: z.object({ csrfToken: z.string() }) });
  const csrf = csrfEnvelope.parse(
    await (await request.get("/api/v1/auth/csrf-token")).json(),
  ).data.csrfToken;
  const login = await request.post("/api/v1/auth/login", {
    headers: { Origin: base, "X-CSRF-Token": csrf },
    data: { email, password },
  });
  expect(login.status()).toBe(200);
  const headers = {
    Origin: base,
    "X-CSRF-Token": csrfEnvelope.parse(await login.json()).data.csrfToken,
  };
  const existing = productPage.parse(
    await (await request.get("/api/v1/products?limit=11")).json(),
  ).pagination.total;
  for (let index = existing; index < 11; index++) {
    expect(
      (
        await request.post("/api/v1/products", {
          headers,
          data: {
            sku: `ROWS-${randomUUID().slice(0, 8)}`,
            name: "Item pagination fixture",
          },
        })
      ).status(),
    ).toBe(201);
  }
  const candidates = productPage.parse(
    await (await request.get("/api/v1/products?limit=11")).json(),
  ).data;
  expect(candidates).toHaveLength(11);
  const stockBefore = new Map<string, string>();
  for (const selected of candidates) {
    const balances = z
      .object({
        data: z.array(
          z.object({ productId: z.uuid(), availableQuantity: z.string() }),
        ),
      })
      .parse(
        await (
          await request.get(
            `/api/v1/inventory?q=${encodeURIComponent(selected.sku)}`,
          )
        ).json(),
      ).data;
    stockBefore.set(
      selected.id,
      balances.find((row) => row.productId === selected.id)!.availableQuantity,
    );
  }
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(
    page.getByRole("navigation", { name: "Navigasi utama" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Buat receiving", exact: true }).click();
  const catalogue = page.getByRole("region", {
    name: "Katalog produk pilihan",
    exact: true,
  });
  const items = page.getByRole("region", {
    name: "Halaman item penerimaan",
    exact: true,
  });
  const previous = items.getByRole("button", {
    name: "Item sebelumnya",
    exact: true,
  });
  const next = items.getByRole("button", {
    name: "Item berikutnya",
    exact: true,
  });
  const trigger = (index: number) =>
    page
      .getByLabel(`Produk ${index}`, { exact: true })
      .and(page.getByRole("button"));
  const quantity = (index: number) =>
    page.getByLabel(`Expected quantity ${index}`, { exact: true });
  await page
    .getByLabel("Referensi", { exact: true })
    .fill("All item pages persisted");
  for (let index = 1; index <= 11; index++) {
    await test.step(`Fill global item ${index}`, async () => {
      if (index > 1) {
        await page
          .getByRole("button", { name: "Tambah item", exact: true })
          .click();
        await expect(trigger(index)).toBeFocused();
      }
      const selected = candidates[index - 1]!;
      await chooseReceivingProduct(
        page,
        `Produk ${index}`,
        `${selected.sku} \u00b7 ${selected.name}`,
      );
      await quantity(index).fill(String(index));
      if ([5, 6, 10, 11].includes(index)) {
        const pages = Math.ceil(index / 5);
        await expect(items.getByRole("status")).toHaveText(
          new RegExp(`Halaman ${pages} dari ${pages}.*${index} item`),
        );
        await expect(page.getByRole("spinbutton")).toHaveCount(
          index - (pages - 1) * 5,
        );
        await expect(next).toBeDisabled();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBe(true);
      }
    });
  }
  // Removing the sole row on page three clamps to page two, preserving rows six to ten.
  await page
    .getByRole("button", { name: "Hapus item 11", exact: true })
    .click();
  await expect(items.getByRole("status")).toHaveText(
    /Halaman 2 dari 2.*10 item/,
  );
  await expect(quantity(6)).toHaveValue("6");
  await expect(trigger(6)).toContainText(candidates[5]!.sku);
  await page.getByRole("button", { name: "Tambah item", exact: true }).click();
  await expect(trigger(11)).toBeFocused();
  await chooseReceivingProduct(
    page,
    "Produk 11",
    `${candidates[10]!.sku} \u00b7 ${candidates[10]!.name}`,
  );
  await quantity(11).fill("11");
  await previous.click();
  await previous.click();
  await expect(quantity(1)).toHaveValue("1");
  await expect(trigger(1)).toContainText(candidates[0]!.sku); // Label survives catalogue page three.
  await quantity(2).fill("0");
  await next.click();
  // Catalogue page one contains product one, but row six cannot select it across item pages.
  await catalogue
    .getByRole("button", { name: "Sebelumnya", exact: true })
    .click();
  await expect(catalogue.getByRole("status")).toContainText("Halaman 2 dari");
  await catalogue
    .getByRole("button", { name: "Sebelumnya", exact: true })
    .click();
  await expect(catalogue.getByRole("status")).toContainText("Halaman 1 dari");
  await trigger(6).click();
  await expect(
    page.getByRole("option", {
      name: `${candidates[0]!.sku} \u00b7 ${candidates[0]!.name}`,
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("option", {
      name: `${candidates[5]!.sku} \u00b7 ${candidates[5]!.name}`,
      exact: true,
    }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await next.click();
  let creates = 0;
  page.on("request", (req) => {
    if (
      req.method() === "POST" &&
      new URL(req.url()).pathname === "/api/v1/receivings"
    )
      creates++;
  });
  await page
    .getByRole("button", { name: "Simpan receiving", exact: true })
    .click();
  await expect(page.getByText(/Item 2 belum valid/)).toBeVisible();
  await expect(quantity(2)).toBeFocused();
  await expect(items.getByRole("status")).toHaveText(
    /Halaman 1 dari 3.*11 item/,
  );
  expect(creates).toBe(0);
  await quantity(2).fill("2");
  await expect(page.getByText(/Item 2 belum valid/)).toHaveCount(0);
  await expect(page.getByText("Minimal 1.", { exact: true })).toHaveCount(0);
  await next.click(); // Submit from page two while pages one and three are hidden.
  await expect(quantity(10)).toHaveValue("10");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `docs/evidence/receiving-item-pages-${info.project.name}.png`,
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
  const response = await committed;
  expect(response.status()).toBe(201);
  const doc = z
    .object({
      data: z.object({
        id: z.uuid(),
        reference: z.string(),
        status: z.literal("OPEN"),
        items: z.array(
          z.object({
            productId: z.uuid(),
            expectedQuantity: z.number(),
            receivedQuantity: z.literal(0),
          }),
        ),
      }),
    })
    .parse(await response.json()).data;
  expect(doc.reference).toBe("All item pages persisted");
  expect(doc.items).toHaveLength(11);
  expect(doc.items).toEqual(
    expect.arrayContaining(
      candidates.map((selected, index) => ({
        productId: selected.id,
        expectedQuantity: index + 1,
        receivedQuantity: 0,
      })),
    ),
  );
  expect(creates).toBe(1);
  await expect(
    page.getByRole("link", { name: "Buka receiving", exact: true }),
  ).toBeVisible();
  for (const selected of candidates) {
    const balances = z
      .object({
        data: z.array(
          z.object({ productId: z.uuid(), availableQuantity: z.string() }),
        ),
      })
      .parse(
        await (
          await request.get(
            `/api/v1/inventory?q=${encodeURIComponent(selected.sku)}`,
          )
        ).json(),
      ).data;
    expect(
      balances.find((row) => row.productId === selected.id)?.availableQuantity,
    ).toBe(stockBefore.get(selected.id));
  }
});
