import { it, expect, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "../../src/features/auth/hooks/use-auth";
import { createQueryClient } from "../../src/config/query-client";
import { keys } from "../../src/config/query-keys";
import { resetHttp } from "../../src/config/http-client";

it("clears the previous identity cache when current-user restoration discovers another logged-in account", async () => {
  resetHttp();
  const client = createQueryClient();
  const a = {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Account A",
    email: "a@example.test",
    role: "SUPERVISOR",
    isActive: true,
    deletedAt: null,
    createdAt: "2026-10-29T00:00:00Z",
    updatedAt: "2026-10-29T00:00:00Z",
  };
  const b = {
    ...a,
    id: "22222222-2222-4222-8222-222222222222",
    name: "Account B",
    role: "OPERATOR",
  };
  const fetcher = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(
      new Response(JSON.stringify({ data: a }), { status: 200 }),
    );
  function Probe() {
    const auth = useAuth();
    return <p>{auth.user?.name ?? "No account"}</p>;
  }
  render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </QueryClientProvider>,
  );
  await screen.findByText("Account A");
  const oldKey = keys.list(a.id, "users", {});
  client.setQueryData(oldKey, { private: "A only" });
  fetcher.mockResolvedValue(
    new Response(JSON.stringify({ data: b }), { status: 200 }),
  );
  await act(async () => {
    await client.invalidateQueries({ queryKey: keys.auth() });
  });
  await screen.findByText("Account B");
  await waitFor(() => expect(client.getQueryData(oldKey)).toBeUndefined());
  expect(screen.queryByText("Account A")).toBeNull();
  client.clear();
});
