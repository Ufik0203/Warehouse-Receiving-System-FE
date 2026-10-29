import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@heroui/react";
import { productsApi } from "../api";
import { useRead } from "../../../hooks/use-server";
import { Panel, QueryState } from "../../../components/shared/Feedback";
import { DataTable, Pagination } from "../../../components/shared/DataTable";

export function ProductHistoryPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const product = useRead(
    "products",
    {},
    (signal) => productsApi.detail(id, signal),
    id,
  );
  const history = useRead(
    "productHistory",
    { productId: id, page, limit: 20 },
    (signal) => productsApi.history(id, { page, limit: 20 }, signal),
  );
  return (
    <>
      <h1 className="text-2xl font-semibold">Riwayat Edit Produk</h1>
      <Button variant="secondary" onPress={() => navigate("/products")}>
        Kembali ke produk
      </Button>
      <Panel title="Identitas produk">
        <QueryState
          pending={product.isPending}
          error={product.error}
          retry={product.refetch}
          hasData={!!product.data}
        />
        {product.data && (
          <>
            <p>
              {product.data.data.sku} · {product.data.data.name}
            </p>
            <p className="break-all text-sm text-muted">
              ID: {product.data.data.id}
            </p>
          </>
        )}
      </Panel>
      <Panel title="Perubahan SKU dan nama">
        <p className="text-sm text-muted">
          Terpisah dari penerimaan dan transaksi stok. Satu baris menunjukkan
          satu kejadian perubahan.
        </p>
        <QueryState
          pending={history.isPending}
          error={history.error}
          retry={history.refetch}
          hasData={!!history.data}
        />
        {history.data && (
          <>
            <DataTable
              headers={[
                "Waktu perubahan",
                "Pengguna",
                "Field",
                "Sebelum",
                "Sesudah",
              ]}
              rows={history.data.data.map((entry) => [
                <time dateTime={entry.changedAt}>
                  {new Date(entry.changedAt).toLocaleString()}
                </time>,
                entry.actorName,
                <div>
                  {entry.changedFields.map((field) => (
                    <p key={field}>{field === "sku" ? "SKU" : "Nama"}</p>
                  ))}
                </div>,
                <div>
                  {entry.changedFields.map((field) => (
                    <p className="break-words" key={field}>
                      {entry.before[field]}
                    </p>
                  ))}
                </div>,
                <div>
                  {entry.changedFields.map((field) => (
                    <p className="break-words" key={field}>
                      {entry.after[field]}
                    </p>
                  ))}
                </div>,
              ])}
            />
            <Pagination
              page={page}
              total={history.data.pagination.total}
              onPage={setPage}
            />
          </>
        )}
      </Panel>
    </>
  );
}
