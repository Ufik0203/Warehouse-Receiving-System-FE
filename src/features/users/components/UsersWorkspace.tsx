import { useState } from "react";
import { Link, useParams } from "react-router";
import { Button } from "@heroui/react";
import { usersApi } from "../api";
import { createUserInput, updateUserInput } from "../types";
import { useAuth } from "../../auth/hooks/use-auth";
import { useRead, useAction } from "../../../hooks/use-server";
import { DataForm, Choice } from "../../../components/shared/Fields";
import {
  Panel,
  QueryState,
  ErrorNotice,
  Success,
} from "../../../components/shared/Feedback";
import { DataTable, Pagination } from "../../../components/shared/DataTable";

const roles = [
  { value: "OPERATOR", label: "Operator" },
  { value: "SUPERVISOR", label: "Supervisor" },
];

export function UsersWorkspace() {
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("");
  const [isActive, setActive] = useState("");
  const [includeDeleted, setDeleted] = useState("false");
  const filters = { page, role, isActive, includeDeleted };
  const result = useRead("users", filters, (signal) =>
    usersApi.list(filters, signal),
  );
  const create = useAction(usersApi.create, ["users"]);
  return (
    <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
      <Panel title="Daftar pengguna">
        <div className="grid gap-3 sm:grid-cols-3">
          <Choice
            label="Filter role"
            value={role}
            onChange={(v) => {
              setRole(v);
              setPage(1);
            }}
            options={[{ value: "", label: "Semua role" }, ...roles]}
          />
          <Choice
            label="Filter status"
            value={isActive}
            onChange={(v) => {
              setActive(v);
              setPage(1);
            }}
            options={[
              { value: "", label: "Semua status" },
              { value: "true", label: "Aktif" },
              { value: "false", label: "Nonaktif" },
            ]}
          />
          <Choice
            label="Tampilkan terhapus"
            value={includeDeleted}
            onChange={(v) => {
              setDeleted(v);
              setPage(1);
            }}
            options={[
              { value: "false", label: "Tidak" },
              { value: "true", label: "Ya" },
            ]}
          />
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
              headers={["Pengguna", "Role", "Status"]}
              rows={result.data.data.map((row) => [
                <Link className="text-accent underline" to={`/users/${row.id}`}>
                  {row.name}
                  <span className="block text-xs text-muted">{row.email}</span>
                </Link>,
                row.role,
                row.deletedAt
                  ? "Terhapus"
                  : row.isActive
                    ? "Aktif"
                    : "Nonaktif",
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
      <Panel title="Tambah pengguna">
        <DataForm
          fields={[
            { name: "name", label: "Nama" },
            { name: "email", label: "Email", type: "email" },
            { name: "password", label: "Password baru", type: "password" },
            { name: "role", label: "Role", options: roles },
          ]}
          initial={{ name: "", email: "", password: "", role: "OPERATOR" }}
          schema={createUserInput}
          onSubmit={create.mutateAsync}
          pending={create.isPending}
          label="Buat pengguna"
        />
        <ErrorNotice error={create.error} />
        {create.isSuccess && (
          <Success refreshFailed={create.data.refreshFailed}>
            Pengguna berhasil dibuat.
          </Success>
        )}
      </Panel>
    </div>
  );
}
export function UserDetail() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const result = useRead(
    "users",
    {},
    (signal) => usersApi.detail(id, signal),
    id,
  );
  const update = useAction(
    (body: {
      name: string;
      role: "OPERATOR" | "SUPERVISOR";
      isActive: boolean;
    }) => usersApi.update(id, body),
    ["users"],
  );
  const remove = useAction(() => usersApi.remove(id), ["users"]);
  const [confirm, setConfirm] = useState(false);
  const target = result.data?.data;
  return (
    <Panel title="Detail pengguna">
      <QueryState
        pending={result.isPending}
        error={result.error}
        retry={result.refetch}
        hasData={!!target}
      />
      {target && (
        <>
          <p>{target.email}</p>
          <p className="text-sm text-muted">
            {target.role} ·{" "}
            {target.deletedAt
              ? "Terhapus"
              : target.isActive
                ? "Aktif"
                : "Nonaktif"}
          </p>
          {!target.deletedAt ? (
            <>
              <DataForm
                key={id}
                fields={[
                  { name: "name", label: "Nama" },
                  { name: "role", label: "Role", options: roles },
                  {
                    name: "isActive",
                    label: "Status akun",
                    options: [
                      { value: "true", label: "Aktif" },
                      { value: "false", label: "Nonaktif" },
                    ],
                  },
                ]}
                initial={{
                  name: target.name,
                  role: target.role,
                  isActive: String(target.isActive),
                }}
                schema={updateUserInput}
                onSubmit={update.mutateAsync}
                pending={update.isPending || remove.isPending}
              />
              {user?.id === id ? (
                <p className="text-sm text-muted">
                  Anda tidak dapat menurunkan role, menonaktifkan, atau
                  menghapus akun sendiri.
                </p>
              ) : confirm ? (
                <div className="rounded-xl border border-danger/30 p-4">
                  <p className="mb-3">
                    Hapus akun ini? Riwayat penerimaan tetap disimpan dan akun
                    tidak dapat dipulihkan.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      isDisabled={remove.isPending}
                      onPress={() => {
                        void remove
                          .mutateAsync(undefined)
                          .catch(() => undefined);
                      }}
                    >
                      Konfirmasi hapus
                    </Button>
                    <Button
                      variant="secondary"
                      onPress={() => setConfirm(false)}
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="danger-soft" onPress={() => setConfirm(true)}>
                  Hapus pengguna
                </Button>
              )}
            </>
          ) : (
            <p>Akun telah dihapus. Riwayat tetap dapat ditelusuri.</p>
          )}
        </>
      )}
      <ErrorNotice error={update.error ?? remove.error} />
      {update.isSuccess && (
        <Success refreshFailed={update.data.refreshFailed}>
          Pengguna berhasil diperbarui.
        </Success>
      )}
      {remove.isSuccess && (
        <Success refreshFailed={remove.data.refreshFailed}>
          Pengguna berhasil dihapus.
        </Success>
      )}
    </Panel>
  );
}
