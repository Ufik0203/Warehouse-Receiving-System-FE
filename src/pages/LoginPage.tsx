import { Navigate, useSearchParams } from "react-router";
import { z } from "zod";
import { useAuth } from "../features/auth/hooks/use-auth";
import { DataForm } from "../components/shared/Fields";
import { Panel, ErrorNotice, QueryState } from "../components/shared/Feedback";

const input = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Masukkan email valid."))
    .refine((v) => [...v].length <= 254),
  password: z
    .string()
    .refine(
      (v) => [...v].length >= 1 && [...v].length <= 128,
      "Masukkan password maksimal 128 karakter.",
    ),
});
export function LoginPage() {
  const auth = useAuth();
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/receivings";
  const destination =
    next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")
      ? next
      : "/receivings";
  if (auth.user) return <Navigate to={destination} replace />;
  return (
    <main className="grid min-h-screen place-items-center bg-background p-5">
      <div className="w-full max-w-md space-y-6">
        <div>
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
            Warehouse
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Masuk ke gudang
          </h1>
          <p className="mt-2 text-muted">
            Kelola penerimaan barang dengan catatan yang dapat ditelusuri.
          </p>
        </div>
        <Panel title="Login">
          {auth.restoring ? (
            <QueryState
              pending={!auth.error}
              error={auth.error}
              retry={auth.retry}
            />
          ) : (
            <>
              <DataForm
                fields={[
                  { name: "email", label: "Email", type: "email" },
                  { name: "password", label: "Password", type: "password" },
                ]}
                initial={{ email: "", password: "" }}
                schema={input}
                onSubmit={auth.login.mutateAsync}
                pending={auth.login.isPending}
                label="Masuk"
              />
              <ErrorNotice error={auth.login.error} />
            </>
          )}
        </Panel>
        <p className="text-xs text-muted">
          Akun disediakan oleh supervisor. Hubungi pengelola jika Anda belum
          memiliki akses.
        </p>
      </div>
    </main>
  );
}
