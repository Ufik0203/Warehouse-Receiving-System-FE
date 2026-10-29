import { NavLink, Outlet, useLocation, Navigate } from "react-router";
import { Button } from "@heroui/react";
import { useAuth } from "../../features/auth/hooks/use-auth";
import { ErrorNotice, QueryState } from "../shared/Feedback";

export function Protected({ supervisor = false }: { supervisor?: boolean }) {
  const auth = useAuth();
  const location = useLocation();
  if (auth.restoring)
    return (
      <main className="mx-auto max-w-md p-8">
        <QueryState
          pending={!auth.error}
          error={auth.error}
          retry={auth.retry}
        />
      </main>
    );
  if (!auth.user)
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  if (supervisor && auth.user.role !== "SUPERVISOR")
    return (
      <main className="p-8">
        <h1>Akses tidak diizinkan</h1>
        <p>Halaman ini hanya untuk supervisor.</p>
        <NavLink className="text-accent underline" to="/receivings">
          Kembali ke penerimaan
        </NavLink>
      </main>
    );
  return <Outlet />;
}
export function AppLayout() {
  const auth = useAuth();
  const nav = [
    ["/receivings", "Penerimaan"],
    ["/products", "Produk"],
    ["/inventory", "Persediaan"],
    ["/inventory/transactions", "Riwayat"],
    ...(auth.user?.role === "SUPERVISOR" ? [["/users", "Pengguna"]] : []),
  ];
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <NavLink to="/receivings" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-accent font-bold text-accent-foreground">
              W
            </span>
            <span className="font-semibold">
              Warehouse
              <span className="block text-xs font-normal text-muted">
                Receiving system
              </span>
            </span>
          </NavLink>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <p>{auth.user?.name}</p>
              <p className="text-xs text-muted">{auth.user?.role}</p>
            </div>
            <Button
              variant="secondary"
              isDisabled={auth.logout.isPending}
              onPress={() => {
                void auth.logout.mutateAsync().catch(() => undefined);
              }}
            >
              Keluar
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-8 lg:grid-cols-[170px_minmax(0,1fr)]">
        <nav
          aria-label="Navigasi utama"
          className="flex flex-wrap content-start gap-2 lg:sticky lg:top-6 lg:flex-col lg:self-start"
        >
          {nav.map(([to, label]) => (
            <NavLink
              key={to}
              to={to ?? "/"}
              end
              className={({ isActive }) =>
                `rounded-xl px-4 py-3 text-sm font-medium ${isActive ? "bg-accent text-accent-foreground" : "text-muted hover:bg-default"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <main className="min-w-0 space-y-5">
          <ErrorNotice error={auth.logout.error} />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
