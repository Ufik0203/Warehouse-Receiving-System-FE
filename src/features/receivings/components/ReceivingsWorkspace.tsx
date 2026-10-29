import { useState } from "react";
import { Link } from "react-router";
import { receivingsApi } from "../api";
import { useRead } from "../../../hooks/use-server";
import { Choice } from "../../../components/shared/Fields";
import { Panel, QueryState } from "../../../components/shared/Feedback";
import { DataTable, Pagination } from "../../../components/shared/DataTable";

export function ReceivingsWorkspace() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const filters = { page, status };
  const result = useRead("receivings", filters, (signal) =>
    receivingsApi.list(filters, signal),
  );
  return (
    <Panel title="Daftar penerimaan">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Choice
          label="Filter status"
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          options={[
            { value: "", label: "Semua status" },
            ...["OPEN", "PARTIAL", "COMPLETED"].map((value) => ({
              value,
              label: value,
            })),
          ]}
        />
        <Link
          className="rounded-xl bg-accent px-4 py-2.5 font-medium text-accent-foreground"
          to="/receivings/new"
        >
          Buat penerimaan
        </Link>
      </div>
      <QueryState
        pending={result.isPending}
        error={result.error}
        retry={result.refetch}
        hasData={!!result.data}
      />
      {result.data && (
        <>
          <DataTable
            headers={["Dokumen", "Referensi", "Status", "Dibuat"]}
            rows={result.data.data.map((row) => [
              <Link
                className="break-all text-accent underline"
                to={`/receivings/${row.id}`}
              >
                {row.number}
              </Link>,
              row.reference || "—",
              row.status,
              new Date(row.createdAt).toLocaleDateString(),
            ])}
          />
          <Pagination
            page={page}
            total={result.data.pagination.total}
            onPage={setPage}
          />
        </>
      )}
    </Panel>
  );
}
