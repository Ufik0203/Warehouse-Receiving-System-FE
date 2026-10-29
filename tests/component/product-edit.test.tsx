import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ProductsWorkspace } from "../../src/features/products/components/ProductsWorkspace";
import { productsApi } from "../../src/features/products/api";
import { createQueryClient } from "../../src/config/query-client";
import { keys } from "../../src/config/query-keys";
import { ApiError } from "../../src/config/http-client";

const auth = vi.hoisted(() => ({ role: "SUPERVISOR" }));
vi.mock("../../src/features/auth/hooks/use-auth", () => ({
  useAuth: () => ({ user: { id: "actor-edit", role: auth.role } }),
}));
vi.mock("../../src/features/products/api", () => ({
  productsApi: { list: vi.fn(), create: vi.fn(), update: vi.fn() },
}));
const product = {
  id: "11111111-1111-4111-8111-111111111111",
  sku: "ORIGINAL",
  name: "Original product",
  unit: "pcs" as const,
  createdAt: "2026-10-30T00:00:00Z",
};
beforeEach(() => {
  vi.resetAllMocks();
  auth.role = "SUPERVISOR";
  vi.mocked(productsApi.list).mockResolvedValue({
    data: [product],
    pagination: { page: 1, limit: 20, total: 1 },
  });
});
function setup() {
  const client = createQueryClient();
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <ProductsWorkspace />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return client;
}
describe("product correction form", () => {
  it("prefills current values, validates fields and cancels without a mutation", async () => {
    const client = setup();
    fireEvent.click(
      await screen.findByRole("button", { name: "Edit ORIGINAL" }),
    );
    expect((screen.getByLabelText("SKU edit") as HTMLInputElement).value).toBe(
      "ORIGINAL",
    );
    expect(
      (screen.getByLabelText("Nama produk edit") as HTMLInputElement).value,
    ).toBe("Original product");
    fireEvent.change(screen.getByLabelText("Nama produk edit"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));
    expect(
      await screen.findByText("Nama harus 1–120 karakter Unicode."),
    ).toBeDefined();
    expect(productsApi.update).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByLabelText("SKU edit")).toBeNull();
    client.clear();
  });
  it("prevents duplicate pending submits, refreshes dependent caches and shows the new labels", async () => {
    const client = setup();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    for (const resource of [
      "inventory",
      "receivings",
      "transactions",
      "productHistory",
    ] as const)
      client.setQueryData(keys.detail("actor-edit", resource, "related"), {});
    let finish: (() => void) | undefined;
    vi.mocked(productsApi.update).mockImplementation(async () => {
      await new Promise<void>((resolve) => {
        finish = resolve;
      });
      const changed = {
        ...product,
        sku: "CORRECTED",
        name: "Corrected product",
      };
      vi.mocked(productsApi.list).mockResolvedValue({
        data: [changed],
        pagination: { page: 1, limit: 20, total: 1 },
      });
      return { data: changed };
    });
    fireEvent.click(
      await screen.findByRole("button", { name: "Edit ORIGINAL" }),
    );
    fireEvent.change(screen.getByLabelText("SKU edit"), {
      target: { value: " corrected " },
    });
    fireEvent.change(screen.getByLabelText("Nama produk edit"), {
      target: { value: "Corrected product" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));
    fireEvent.click(screen.getByRole("button", { name: /Simpan|Menyimpan/ }));
    await waitFor(() => expect(productsApi.update).toHaveBeenCalledOnce());
    expect(
      (screen.getByRole("button", { name: "Batal" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    finish?.();
    await screen.findByText("Produk berhasil diperbarui.");
    expect(productsApi.update).toHaveBeenCalledWith(product.id, {
      sku: "CORRECTED",
      name: "Corrected product",
    });
    expect(await screen.findByText("Corrected product")).toBeDefined();
    for (const resource of [
      "products",
      "inventory",
      "receivings",
      "transactions",
      "productHistory",
    ] as const) {
      expect(invalidate).toHaveBeenCalledWith(
        { queryKey: keys.scope("actor-edit", resource) },
        { throwOnError: true },
      );
      if (resource !== "products")
        expect(
          client.getQueryState(keys.detail("actor-edit", resource, "related"))
            ?.isInvalidated,
        ).toBe(true);
    }
    client.clear();
  });
  it("keeps the form and API error after a conflict", async () => {
    vi.mocked(productsApi.update).mockRejectedValue(
      new ApiError(409, "SKU_ALREADY_EXISTS", "SKU already exists."),
    );
    const client = setup();
    fireEvent.click(
      await screen.findByRole("button", { name: "Edit ORIGINAL" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));
    expect(await screen.findByText("SKU already exists.")).toBeDefined();
    expect(screen.getByLabelText("SKU edit")).toBeDefined();
    client.clear();
  });
  it("does not offer editing to operators", async () => {
    auth.role = "OPERATOR";
    const client = setup();
    await screen.findByText("Original product");
    expect(screen.queryByRole("button", { name: "Edit ORIGINAL" })).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Riwayat Edit ORIGINAL" }),
    ).toBeNull();
    client.clear();
  });
});
