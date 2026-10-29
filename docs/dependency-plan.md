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

React/ReactDOM tetap 19.3.1, Vite 7.3.7, Query 5.105.0, Tailwind 4.3.3 dan HeroUI 3.2.6. Pengecualian exactOptionalPropertyTypes false dan percobaan versi yang gagal dijelaskan dalam technical-spec.md serta arsip Task 2A. Frontend browser-suite penuh belum dipasang.

Pengujian historis tidak diulang pada pekerjaan dokumentasi ini. Lihat [testing.md](testing.md); semua Git/GitHub manual pengguna.
