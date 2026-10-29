# Dependency repository frontend

Manifest dan package-lock.json repository ini menjadi sumber versi terpasang, tanpa dependency dari manifest induk. Node 24.12.0 dan npm 11.6.2 dipertahankan; install memakai npm 11.6.2. [Versi machine-readable](dependency-versions.json) dan [alasan/pengujian dependency asal](history/combined/docs/dependency-plan.md) disertakan lokal.

| Paket | Versi exact | Jenis |
| --- | --- | --- |
| @heroui/react | 3.2.6 | dependencies |
| @heroui/styles | 3.2.6 | dependencies |
| @tanstack/react-query | 5.105.0 | dependencies |
| react | 19.3.1 | dependencies |
| react-dom | 19.3.1 | dependencies |
| react-router | 7.18.5 | dependencies |
| zod | 4.6.7 | dependencies |
| @tailwindcss/vite | 4.3.3 | devDependencies |
| @types/react | 19.3.0 | devDependencies |
| @types/react-dom | 19.3.0 | devDependencies |
| @vitejs/plugin-react | 5.2.0 | devDependencies |
| tailwindcss | 4.3.3 | devDependencies |
| vite | 7.3.7 | devDependencies |
| typescript | 5.9.3 | devDependencies |
| @types/node | 24.19.2 | devDependencies |
| eslint | 9.39.5 | devDependencies |
| @eslint/js | 9.39.5 | devDependencies |
| typescript-eslint | 8.72.1 | devDependencies |

Dependency dev yang semula diwarisi root telah dinyatakan langsung. Lockfile ini menyelesaikan transitive dependencies secara mandiri dan tidak boleh diganti dengan lockfile gabungan. Perubahan versi selanjutnya perlu cek engine/peer dan bukti aktual. Tidak memakai force/legacy-peer-deps atau mengubah baseline tanpa alasan.

React/ReactDOM tetap 19.3.1, Vite 7.3.7, Query 5.105.0, Tailwind 4.3.3 dan HeroUI 3.2.6. Pengecualian exactOptionalPropertyTypes false dan percobaan versi yang gagal dijelaskan dalam technical-spec.md serta arsip Task 2A. Tooling component/browser Task 6 sudah dipasang exact sesuai tambahan di bawah.

Pengujian historis tidak diulang pada pekerjaan dokumentasi ini. Lihat [testing.md](testing.md); semua Git/GitHub manual pengguna.


## Tooling Task 6 (dev only)

| Paket | Exact | Alasan |
| --- | --- | --- |
| vitest | 4.1.12 | Component/security/mutation tests, compatible Node 24 baseline |
| @testing-library/react | 16.3.3 | React 19 component interaction |
| jsdom | 26.1.0 | DOM environment compatible Node 24.12.0 |
| @playwright/test | 1.64.1 | Browser Chrome nyata desktop/mobile emulation |

Versi registry diperiksa aktual. jsdom 30.1.3 ditolak engine-strict karena membutuhkan Node ^24.15.0 (baseline 24.12.0); dipilih 26.1.0 tanpa mengubah Node/npm, force/legacy peer atau pengecualian TypeScript. Install exact npm 11.6.2 lokal melaporkan 318 paket audited, 0 vulnerabilities. Warning deprecated whatwg-encoding dan ESLint existing tetap dicatat, bukan alasan mengganti stack. package-lock.json frontend diperbarui; dependency aplikasi tetap byte-version yang sama dengan baseline.

Dokumentasi resmi tooling: [Testing Library React setup](https://testing-library.com/docs/react-testing-library/setup/), [Vitest](https://vitest.dev/guide/), [Playwright](https://playwright.dev/docs/test-configuration). Verifikasi kompatibilitas aktual melalui lint/typecheck/build/component/browser; bukan sekadar engine/peer range.
