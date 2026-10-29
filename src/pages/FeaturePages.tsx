import { Link, useParams, useSearchParams } from "react-router";
import { ProductsWorkspace } from "../features/products/components/ProductsWorkspace";
import {
  UsersWorkspace,
  UserDetail,
} from "../features/users/components/UsersWorkspace";
import { ReceivingsWorkspace } from "../features/receivings/components/ReceivingsWorkspace";
import { CreateReceiving } from "../features/receivings/components/CreateReceiving";
import { ReceiptForm } from "../features/receivings/components/ReceiptForm";
import {
  InventoryWorkspace,
  HistoryWorkspace,
} from "../features/inventory/components/InventoryWorkspace";
import { useRead } from "../hooks/use-server";
import { receivingsApi } from "../features/receivings/api";
import { Panel, QueryState } from "../components/shared/Feedback";
import { DataTable } from "../components/shared/DataTable";

const Heading = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div>
    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
      {title}
    </h1>
    <p className="mt-1 text-sm text-muted">{description}</p>
  </div>
);
export function ProductsPage() {
  return (
    <>
      <Heading title="Produk" description="Katalog barang dan satuan gudang." />
      <ProductsWorkspace />
    </>
  );
}
export function UsersPage() {
  return (
    <>
      <Heading
        title="Pengguna"
        description="Kelola akses operator dan supervisor."
      />
      <UsersWorkspace />
    </>
  );
}
export function UserPage() {
  const { id } = useParams();
  return (
    <>
      <Heading
        title="Akun pengguna"
        description="Perubahan akses membatalkan session lama."
      />
      <UserDetail key={id} />
    </>
  );
}
export function ReceivingsPage() {
  return (
    <>
      <Heading
        title="Penerimaan"
        description="Pantau dokumen dan barang yang masih ditunggu."
      />
      <ReceivingsWorkspace />
    </>
  );
}
export function NewReceivingPage() {
  return (
    <>
      <Heading
        title="Dokumen baru"
        description="Tentukan produk dan jumlah yang diharapkan."
      />
      <CreateReceiving />
    </>
  );
}
export function InventoryPage() {
  return (
    <>
      <Heading
        title="Persediaan"
        description="Saldo berdasarkan penerimaan yang telah tersimpan."
      />
      <InventoryWorkspace />
    </>
  );
}
export function HistoryPage() {
  const [params] = useSearchParams();
  return (
    <>
      <Heading
        title="Riwayat transaksi"
        description="Telusuri barang masuk, dokumen, dan pelaku."
      />
      <HistoryWorkspace
        key={params.toString()}
        productId={params.get("productId") ?? ""}
        receivingId={params.get("receivingId") ?? ""}
      />
    </>
  );
}
export function ReceivingPage() {
  const { id = "" } = useParams();
  const query = useRead(
    "receivings",
    {},
    (signal) => receivingsApi.detail(id, signal),
    id,
  );
  const document = query.data?.data;
  return (
    <>
      <Heading
        title="Detail penerimaan"
        description="Jumlah dan status terbaru berasal dari gudang."
      />
      <QueryState
        pending={query.isPending}
        error={query.error}
        retry={query.refetch}
        hasData={!!document}
      />
      {document && (
        <>
          <Panel title={document.number}>
            <p>Referensi: {document.reference || "—"}</p>
            <p>
              Status: <strong>{document.status}</strong>
            </p>
            <DataTable
              headers={["Produk", "Expected", "Received", "Remaining"]}
              rows={document.items.map((item) => [
                `${item.sku} · ${item.productName}`,
                item.expectedQuantity,
                item.receivedQuantity,
                item.remainingQuantity,
              ])}
            />
          </Panel>
          <ReceiptForm
            key={document.id}
            document={document}
            canSubmit={!query.isError && !query.isFetching}
          />
        </>
      )}
    </>
  );
}
export function NotFoundPage() {
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-semibold">Halaman tidak ditemukan</h1>
      <Link className="text-accent underline" to="/receivings">
        Kembali ke penerimaan
      </Link>
    </main>
  );
}
