import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { z } from "zod";
import { DataForm } from "../../src/components/shared/Fields";
import { QueryState, Success } from "../../src/components/shared/Feedback";
import { DataTable } from "../../src/components/shared/DataTable";

describe("form and query feedback", () => {
  it("shows field validation and prevents invalid submission", async () => {
    const submit = vi.fn();
    render(
      <DataForm
        fields={[{ name: "name", label: "Nama" }]}
        initial={{ name: "" }}
        schema={z.object({ name: z.string().min(1, "Nama wajib diisi.") })}
        onSubmit={submit}
        pending={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));
    expect(await screen.findByText("Nama wajib diisi.")).toBeDefined();
    expect(submit).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Nama"), {
      target: { value: "Product" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => expect(submit).toHaveBeenCalledOnce());
  });
  it("prevents double submit before the pending prop rerenders", async () => {
    let finish: (() => void) | undefined;
    const submit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    render(
      <DataForm
        fields={[{ name: "name", label: "Nama" }]}
        initial={{ name: "Product" }}
        schema={z.object({ name: z.string() })}
        onSubmit={submit}
        pending={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));
    expect(submit).toHaveBeenCalledOnce();
    finish?.();
  });
  it("distinguishes loading/empty/error and committed success with failed refresh", () => {
    const view = render(<QueryState pending error={null} retry={vi.fn()} />);
    expect(screen.getByRole("status").textContent).toContain("Memuat");
    view.rerender(<DataTable headers={["Nama"]} rows={[]} />);
    expect(screen.getByText("Belum ada data.")).toBeDefined();
    view.rerender(
      <QueryState
        pending={false}
        error={new Error("private")}
        retry={vi.fn()}
        hasData
      />,
    );
    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("Data belum berhasil disegarkan.")).toBeDefined();
    view.rerender(<Success refreshFailed>Penerimaan tersimpan.</Success>);
    expect(screen.getByRole("status").textContent).toContain(
      "jangan kirim operasi baru",
    );
  });
});
