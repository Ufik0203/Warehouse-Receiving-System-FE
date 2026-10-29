import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { CreateReceiving } from "../../src/features/receivings/components/CreateReceiving";
import { productsApi } from "../../src/features/products/api";
import { receivingsApi } from "../../src/features/receivings/api";
import { createQueryClient } from "../../src/config/query-client";

vi.mock("../../src/features/auth/hooks/use-auth", () => ({
  useAuth: () => ({ user: { id: "choice-actor", role: "OPERATOR" } }),
}));
vi.mock("../../src/features/products/api", () => ({
  productsApi: { list: vi.fn() },
}));
vi.mock("../../src/features/receivings/api", () => ({
  receivingsApi: { create: vi.fn() },
}));
const first = {
  id: "11111111-1111-4111-8111-111111111111",
  sku: "FIRST",
  name: "First product",
  unit: "pcs" as const,
  createdAt: "2026-10-30T00:00:00Z",
};
const last = {
  ...first,
  id: "22222222-2222-4222-8222-222222222222",
  sku: "LAST",
  name: "Last product",
};
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(productsApi.list).mockImplementation(async (filters) => ({
    data: filters["page"] === 2 ? [last] : [first],
    pagination: { page: Number(filters["page"]), limit: 5, total: 6 },
  }));
});
function setup() {
  const client = createQueryClient();
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <CreateReceiving />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return client;
}
async function choose(label: string, name: string) {
  fireEvent.click(screen.getByLabelText(label, { selector: "button" }));
  fireEvent.click(await screen.findByRole("option", { name }));
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
}
describe("receiving product choices without search", () => {
  it("removes search and keeps paginated choices with no q parameter", async () => {
    const client = setup();
    await waitFor(() => expect(productsApi.list).toHaveBeenCalled());
    expect(screen.queryByLabelText("Cari produk untuk pilihan")).toBeNull();
    expect(productsApi.list).toHaveBeenCalledWith(
      { page: 1, limit: 5 },
      expect.any(AbortSignal),
    );
    fireEvent.click(await screen.findByRole("button", { name: "Berikutnya" }));
    await waitFor(() =>
      expect(productsApi.list).toHaveBeenCalledWith(
        { page: 2, limit: 5 },
        expect.any(AbortSignal),
      ),
    );
    client.clear();
  });
  it("retains a selected product across pages and submits multiple products with the original reference", async () => {
    const client = setup();
    await screen.findByRole("button", { name: "Berikutnya" });
    await choose("Produk 1", "FIRST · First product");
    fireEvent.change(screen.getByLabelText("Referensi"), {
      target: { value: "Reference preserved" },
    });
    fireEvent.change(screen.getByLabelText("Expected quantity 1"), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Tambah item" }));
    fireEvent.click(screen.getByRole("button", { name: "Berikutnya" }));
    await screen.findByText(/Halaman 2/);
    await choose("Produk 2", "LAST · Last product");
    fireEvent.change(screen.getByLabelText("Expected quantity 2"), {
      target: { value: "3" },
    });
    vi.mocked(receivingsApi.create).mockRejectedValue(
      new Error("Keep state for assertion"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Simpan receiving" }));
    await waitFor(() =>
      expect(receivingsApi.create).toHaveBeenCalledWith({
        reference: "Reference preserved",
        items: [
          { productId: first.id, expectedQuantity: 2 },
          { productId: last.id, expectedQuantity: 3 },
        ],
      }),
    );
    client.clear();
  });
  it("rejects duplicate products and invalid quantities before sending a request", async () => {
    const client = setup();
    await screen.findByRole("button", { name: "Berikutnya" });
    await choose("Produk 1", "FIRST · First product");
    fireEvent.click(screen.getByRole("button", { name: "Tambah item" }));
    fireEvent.click(screen.getByLabelText("Produk 2", { selector: "button" }));
    expect(screen.queryByRole("option", { name: /FIRST/ })).toBeNull();
    fireEvent.click(
      await screen.findByRole("option", { name: "Pilih produk" }),
    );
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(receivingsApi.create).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Hapus item 2" }));
    for (const value of ["0", "-1", "1.5", "1000001"]) {
      fireEvent.change(screen.getByLabelText("Expected quantity 1"), {
        target: { value },
      });
      fireEvent.click(screen.getByRole("button", { name: "Simpan receiving" }));
      expect(receivingsApi.create).not.toHaveBeenCalled();
    }
    client.clear();
  });
});

it("distinguishes one catalogue product from eleven receiving rows", async () => {
  vi.mocked(productsApi.list).mockResolvedValue({
    data: [first],
    pagination: { page: 1, limit: 5, total: 1 },
  });
  const client = setup();
  await screen.findByText(/Halaman 1 dari 1.*1 produk tersedia/);
  for (let index = 1; index < 11; index++)
    fireEvent.click(screen.getByRole("button", { name: "Tambah item" }));
  expect(screen.getAllByLabelText(/Expected quantity/)).toHaveLength(1);
  expect(screen.getByLabelText("Expected quantity 11")).toBeDefined();
  expect(
    screen.getByText(/Item penerimaan.*Halaman 3 dari 3.*11 item/),
  ).toBeDefined();
  expect(screen.getByText(/Halaman 1 dari 1.*1 produk tersedia/)).toBeDefined();
  expect(
    (screen.getByRole("button", { name: "Berikutnya" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  expect(productsApi.list).toHaveBeenCalledWith(
    { page: 1, limit: 5 },
    expect.any(AbortSignal),
  );
  client.clear();
});

it.each([5, 6, 11])(
  "paginates %i real catalogue products into five-item pages using API total",
  async (total) => {
    const catalogue = Array.from({ length: total }, (_, index) => ({
      ...first,
      id: `${String(index + 1).padStart(8, "0")}-1111-4111-8111-111111111111`,
      sku: `PAGE-${index + 1}`,
      name: `Product ${index + 1}`,
    }));
    vi.mocked(productsApi.list).mockImplementation(async (filters) => {
      const page = Number(filters["page"]);
      const limit = Number(filters["limit"]);
      return {
        data: catalogue.slice((page - 1) * limit, page * limit),
        pagination: { page, limit, total },
      };
    });
    const client = setup();
    const pages = Math.ceil(total / 5);
    await screen.findByText(
      new RegExp(`Halaman 1 dari ${pages}.*${total} produk tersedia`),
    );
    expect(
      (screen.getByRole("button", { name: "Sebelumnya" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(
      (screen.getByRole("button", { name: "Berikutnya" }) as HTMLButtonElement)
        .disabled,
    ).toBe(pages === 1);
    for (let page = 1; page <= pages; page++) {
      if (page > 1) {
        fireEvent.click(screen.getByRole("button", { name: "Berikutnya" }));
        await screen.findByText(
          new RegExp(`Halaman ${page} dari ${pages}.*${total} produk tersedia`),
        );
      }
      fireEvent.click(
        screen.getByLabelText("Produk 1", { selector: "button" }),
      );
      await screen.findByRole("option", {
        name: new RegExp(`^PAGE-${(page - 1) * 5 + 1} `),
      });
      expect(screen.getAllByRole("option")).toHaveLength(
        Math.min(5, total - (page - 1) * 5) + 1,
      );
      if (page > 1)
        expect(screen.queryByRole("option", { name: /^PAGE-1 / })).toBeNull();
      fireEvent.click(screen.getByRole("option", { name: "Pilih produk" }));
      await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
      expect(productsApi.list).toHaveBeenCalledWith(
        { page, limit: 5 },
        expect.any(AbortSignal),
      );
    }
    expect(
      (screen.getByRole("button", { name: "Berikutnya" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    if (pages > 1) {
      fireEvent.click(screen.getByRole("button", { name: "Sebelumnya" }));
      await screen.findByText(new RegExp(`Halaman ${pages - 1} dari ${pages}`));
    }
    client.clear();
  },
);
