import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { CreateReceiving } from "../../src/features/receivings/components/CreateReceiving";
import { productsApi } from "../../src/features/products/api";
import { receivingsApi } from "../../src/features/receivings/api";
import { createQueryClient } from "../../src/config/query-client";

vi.mock("../../src/features/auth/hooks/use-auth", () => ({
  useAuth: () => ({ user: { id: "item-pages-actor", role: "OPERATOR" } }),
}));
vi.mock("../../src/features/products/api", () => ({
  productsApi: { list: vi.fn() },
}));
vi.mock("../../src/features/receivings/api", () => ({
  receivingsApi: { create: vi.fn() },
}));
const catalogue = Array.from({ length: 11 }, (_, index) => ({
  id: `${String(index + 1).padStart(8, "0")}-1111-4111-8111-111111111111`,
  sku: `ITEM-${index + 1}`,
  name: `Product ${index + 1}`,
  unit: "pcs" as const,
  createdAt: "2026-10-30T00:00:00Z",
}));
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(productsApi.list).mockImplementation(async (filters) => {
    const page = Number(filters["page"]);
    const limit = Number(filters["limit"]);
    return {
      data: catalogue.slice((page - 1) * limit, page * limit),
      pagination: { page, limit, total: catalogue.length },
    };
  });
  vi.mocked(receivingsApi.create).mockRejectedValue(
    new Error("Keep form state available for inspection"),
  );
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
async function select(index: number, product = index) {
  const target = Math.ceil(product / 5);
  while (!screen.queryByText(new RegExp(`^Halaman ${target} dari`))) {
    fireEvent.click(screen.getByRole("button", { name: "Berikutnya" }));
    await screen.findByText(new RegExp(`^Halaman ${target} dari`));
  }
  fireEvent.click(
    screen.getByLabelText(`Produk ${index}`, { selector: "button" }),
  );
  fireEvent.click(
    await screen.findByRole("option", {
      name: new RegExp(`^ITEM-${product} `),
    }),
  );
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
}
describe("receiving item pages independent from the catalogue", () => {
  it.each([5, 6, 10, 11])(
    "shows at most five rows and focuses the newly added global item among %i",
    async (count) => {
      const client = setup();
      await screen.findByText(/produk tersedia/);
      for (let index = 1; index < count; index++)
        fireEvent.click(screen.getByRole("button", { name: "Tambah item" }));
      const pages = Math.ceil(count / 5);
      expect(
        screen.getByText(
          new RegExp(
            `Item penerimaan.*Halaman ${pages} dari ${pages}.*${count} item`,
          ),
        ),
      ).toBeDefined();
      expect(screen.getAllByLabelText(/Expected quantity/)).toHaveLength(
        count - (pages - 1) * 5,
      );
      await waitFor(() =>
        expect(document.activeElement).toBe(
          screen.getByLabelText(`Produk ${count}`, { selector: "button" }),
        ),
      );
      expect(
        (
          screen.getByRole("button", {
            name: "Item berikutnya",
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(true);
      client.clear();
    },
  );
  it("clamps an emptied final page and removes a stable row without replacing surviving values", async () => {
    const client = setup();
    await screen.findByText(/produk tersedia/);
    await select(1);
    fireEvent.change(screen.getByLabelText("Expected quantity 1"), {
      target: { value: "7" },
    });
    for (let index = 1; index < 6; index++)
      fireEvent.click(screen.getByRole("button", { name: "Tambah item" }));
    fireEvent.click(screen.getByRole("button", { name: "Hapus item 6" }));
    expect(
      screen.getByText(/Item penerimaan.*Halaman 1 dari 1.*5 item/),
    ).toBeDefined();
    expect(
      (screen.getByLabelText("Expected quantity 1") as HTMLInputElement).value,
    ).toBe("7");
    expect(
      screen.getByLabelText("Produk 1", { selector: "button" }).textContent,
    ).toContain("ITEM-1");
    while (screen.queryByRole("button", { name: "Hapus item 2" }))
      fireEvent.click(screen.getByRole("button", { name: "Hapus item 2" }));
    expect(
      (
        screen.getByRole("button", {
          name: "Hapus item 1",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    client.clear();
  });
  it("opens the page of a hidden invalid item and sends all six items after correction from another page", async () => {
    const client = setup();
    await screen.findByText(/produk tersedia/);
    for (let index = 1; index <= 6; index++) {
      if (index > 1)
        fireEvent.click(screen.getByRole("button", { name: "Tambah item" }));
      await select(index);
      fireEvent.change(screen.getByLabelText(`Expected quantity ${index}`), {
        target: { value: String(index) },
      });
    }
    fireEvent.click(screen.getByRole("button", { name: "Item sebelumnya" }));
    fireEvent.change(screen.getByLabelText("Expected quantity 2"), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Item berikutnya" }));
    fireEvent.click(screen.getByRole("button", { name: "Simpan receiving" }));
    expect(receivingsApi.create).not.toHaveBeenCalled();
    expect(await screen.findByText(/Item 2 belum valid/)).toBeDefined();
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByLabelText("Expected quantity 2"),
      ),
    );
    fireEvent.change(screen.getByLabelText("Expected quantity 2"), {
      target: { value: "2" },
    });
    expect(screen.queryByText(/Item 2 belum valid/)).toBeNull();
    expect(screen.queryByText("Minimal 1.")).toBeNull();
    // Item one remains unavailable for item six even though item one is on a hidden page.
    fireEvent.click(screen.getByRole("button", { name: "Item berikutnya" }));
    fireEvent.click(screen.getByRole("button", { name: "Sebelumnya" }));
    await screen.findByText(/^Halaman 1 dari/);
    fireEvent.click(screen.getByLabelText("Produk 6", { selector: "button" }));
    expect(screen.queryByRole("option", { name: /^ITEM-1 / })).toBeNull();
    fireEvent.click(screen.getByRole("option", { name: /^ITEM-6 / }));
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "Item sebelumnya" }));
    fireEvent.click(screen.getByRole("button", { name: "Simpan receiving" }));
    await waitFor(() =>
      expect(receivingsApi.create).toHaveBeenCalledWith({
        reference: "",
        items: catalogue.slice(0, 6).map((product, index) => ({
          productId: product.id,
          expectedQuantity: index + 1,
        })),
      }),
    );
    await waitFor(() =>
      expect(
        (
          screen.getByRole("button", {
            name: "Hapus item 2",
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(false),
    );
    fireEvent.click(screen.getByRole("button", { name: "Hapus item 2" }));
    expect(
      (screen.getByLabelText("Expected quantity 2") as HTMLInputElement).value,
    ).toBe("3");
    expect(
      screen.getByLabelText("Produk 2", { selector: "button" }).textContent,
    ).toContain("ITEM-3");
    expect(
      (screen.getByLabelText("Expected quantity 5") as HTMLInputElement).value,
    ).toBe("6");
    expect(
      screen.getByLabelText("Produk 5", { selector: "button" }).textContent,
    ).toContain("ITEM-6");
    expect(screen.queryByLabelText("Expected quantity 6")).toBeNull();
    client.clear();
  });
  it("finds the first blank product on another page and retains the 50-item contract limit", async () => {
    const client = setup();
    await screen.findByText(/produk tersedia/);
    for (let index = 1; index < 11; index++)
      fireEvent.click(screen.getByRole("button", { name: "Tambah item" }));
    fireEvent.click(screen.getByRole("button", { name: "Simpan receiving" }));
    expect(await screen.findByText(/Item 1 belum valid/)).toBeDefined();
    expect(receivingsApi.create).not.toHaveBeenCalled();
    expect(
      screen.getByText(/Item penerimaan.*Halaman 1 dari 3.*11 item/),
    ).toBeDefined();
    for (let index = 11; index < 50; index++)
      fireEvent.click(screen.getByRole("button", { name: "Tambah item" }));
    expect(
      (screen.getByRole("button", { name: "Tambah item" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(
      screen.getByText(/Item penerimaan.*Halaman 10 dari 10.*50 item/),
    ).toBeDefined();
    client.clear();
  });
});
