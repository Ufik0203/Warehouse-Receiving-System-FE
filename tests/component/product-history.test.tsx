import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ProductHistoryPage } from "../../src/features/products/components/ProductHistoryPage";
import { productsApi } from "../../src/features/products/api";
import { createQueryClient } from "../../src/config/query-client";
import { ApiError } from "../../src/config/http-client";

vi.mock("../../src/features/auth/hooks/use-auth", () => ({
  useAuth: () => ({ user: { id: "history-supervisor", role: "SUPERVISOR" } }),
}));
vi.mock("../../src/features/products/api", () => ({
  productsApi: { detail: vi.fn(), history: vi.fn() },
}));
const id = "11111111-1111-4111-8111-111111111111";
const event = {
  id,
  productId: id,
  actorId: id,
  actorName: "Editor snapshot",
  changedAt: "2026-10-30T00:00:00Z",
  changedFields: ["name"] as Array<"name">,
  before: { sku: "CURRENT", name: "Before name" },
  after: { sku: "CURRENT", name: "After name" },
};
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(productsApi.detail).mockResolvedValue({
    data: {
      id,
      sku: "CURRENT",
      name: "Current product",
      unit: "pcs",
      createdAt: "2026-10-30T00:00:00Z",
    },
  });
});
function setup() {
  const client = createQueryClient();
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/products/${id}/history`]}>
        <Routes>
          <Route
            path="/products/:id/history"
            element={<ProductHistoryPage />}
          />
          <Route path="/products" element={<p>Products destination</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return client;
}
describe("separate product correction history page", () => {
  it("shows product identity, loading and empty history without inventory rows", async () => {
    let finish: (() => void) | undefined;
    vi.mocked(productsApi.history).mockImplementation(async () => {
      await new Promise<void>((resolve) => {
        finish = resolve;
      });
      return { data: [], pagination: { page: 1, limit: 20, total: 0 } };
    });
    const client = setup();
    await screen.findByText("CURRENT · Current product");
    expect(
      screen.getByRole("heading", { name: "Riwayat Edit Produk" }),
    ).toBeDefined();
    expect(screen.getByText(/Memuat data/)).toBeDefined();
    finish?.();
    expect(await screen.findByText("Belum ada data.")).toBeDefined();
    expect(screen.queryByText("Stok tersedia")).toBeNull();
    client.clear();
  });
  it("shows snapshot actor, changed field and before/after values with event pagination", async () => {
    vi.mocked(productsApi.history).mockImplementation(async (_id, filters) => ({
      data: [
        {
          ...event,
          actorName: filters.page === 1 ? "Editor snapshot" : "Earlier editor",
        },
      ],
      pagination: { page: filters.page, limit: 20, total: 21 },
    }));
    const client = setup();
    await screen.findByText("Editor snapshot");
    expect(screen.getByText("Before name")).toBeDefined();
    expect(screen.getByText("After name")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Berikutnya" }));
    await screen.findByText("Earlier editor");
    expect(productsApi.history).toHaveBeenLastCalledWith(
      id,
      { page: 2, limit: 20 },
      expect.any(AbortSignal),
    );
    fireEvent.click(screen.getByRole("button", { name: "Kembali ke produk" }));
    expect(await screen.findByText("Products destination")).toBeDefined();
    client.clear();
  });
  it("shows API failure and allows a safe read retry", async () => {
    vi.mocked(productsApi.history).mockRejectedValue(
      new ApiError(
        503,
        "DEPENDENCY_UNAVAILABLE",
        "History temporarily unavailable.",
      ),
    );
    const client = setup();
    await screen.findByText("History temporarily unavailable.");
    vi.mocked(productsApi.history).mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 20, total: 0 },
    });
    fireEvent.click(screen.getByRole("button", { name: "Muat ulang data" }));
    await waitFor(() =>
      expect(screen.queryByText("History temporarily unavailable.")).toBeNull(),
    );
    expect(await screen.findByText("Belum ada data.")).toBeDefined();
    client.clear();
  });
});
