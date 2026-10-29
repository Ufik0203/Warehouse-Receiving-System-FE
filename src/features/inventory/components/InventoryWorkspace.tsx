import { useState } from "react";
import { Link } from "react-router";
import { z } from "zod";
import { inventoryApi } from "../api";
import { useRead } from "../../../hooks/use-server";
import { Field } from "../../../components/shared/Fields";
import { Panel, QueryState } from "../../../components/shared/Feedback";
import { DataTable, Pagination } from "../../../components/shared/DataTable";

export function InventoryWorkspace() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const filters = { q, page };
  const query = useRead("inventory", filters, (signal) =>
    inventoryApi.balances(filters, signal),
  );
  return (
    <Panel title="Saldo persediaan">
      <Field
        label="Cari SKU atau nama"
        value={q}
        onChange={(v) => {
          setQ(v);
          setPage(1);
        }}
      />
      <QueryState
        pending={query.isPending}
        error={query.error}
        retry={query.refetch}
        hasData={!!query.data}
      />
      {query.data && (
        <>
          <DataTable
            headers={["SKU", "Produk", "Stok tersedia", "Riwayat"]}
            rows={query.data.data.map((row) => [
              row.sku,
              row.productName,
              `${row.availableQuantity} ${row.unit}`,
              <Link
                className="text-accent underline"
                to={`/inventory/transactions?productId=${row.productId}`}
              >
                Lihat transaksi
              </Link>,
            ])}
          />
          <Pagination
            page={page}
            total={query.data.pagination.total}
            onPage={setPage}
          />
        </>
      )}
    </Panel>
  );
}
export function HistoryWorkspace({
  productId = "",
  receivingId = "",
}: {
  productId?: string;
  receivingId?: string;
}) {
  const [page, setPage] = useState(1);
  const [product, setProduct] = useState(productId);
  const [receiving, setReceiving] = useState(receivingId);
  const invalid = [product, receiving].some(
    (value) => value !== "" && !z.uuid().safeParse(value).success,
  );
  const filters = {
    page,
    productId: invalid ? undefined : product,
    receivingId: invalid ? undefined : receiving,
  };
  const query = useRead("transactions", filters, (signal) =>
    inventoryApi.history(filters, signal),
  );
  return (
    <Panel title="Riwayat barang masuk">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Filter produk ID"
          value={product}
          onChange={(v) => {
            setProduct(v);
            setPage(1);
          }}
          error={
            product && !z.uuid().safeParse(product).success
              ? "Gunakan UUID valid."
              : undefined
          }
        />
        <Field
          label="Filter penerimaan ID"
          value={receiving}
          onChange={(v) => {
            setReceiving(v);
            setPage(1);
          }}
          error={
            receiving && !z.uuid().safeParse(receiving).success
              ? "Gunakan UUID valid."
              : undefined
          }
        />
      </div>
      <QueryState
        pending={query.isPending}
        error={query.error}
        retry={query.refetch}
        hasData={!!query.data}
      />
      {query.data && !invalid && (
        <>
          <DataTable
            headers={["Waktu", "Produk", "Jumlah", "Dokumen", "Pelaku"]}
            rows={query.data.data.map((row) => [
              new Date(row.createdAt).toLocaleString(),
              `${row.sku} · ${row.productName}`,
              `+${row.quantity}`,
              <Link
                className="text-accent underline"
                to={`/receivings/${row.receivingId}`}
              >
                {row.receivingNumber}
              </Link>,
              row.actorName,
            ])}
          />
          <Pagination
            page={page}
            total={query.data.pagination.total}
            onPage={setPage}
          />
        </>
      )}
    </Panel>
  );
}
