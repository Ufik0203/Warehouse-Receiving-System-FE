# Warehouse Receiving System - Frontend

Frontend Task 6: login/logout dan restore session, navigasi sesuai role, supervisor user management, products, receiving create/detail/partial/full receipt, inventory dan history. Backend tetap menegakkan authorization dan transaksi. Semua Git/GitHub manual pemilik; agent tidak menjalankan perintah Git atau mengubah metadata Git.

## Install dan menjalankan

Dari root repository frontend mandiri, gunakan Node 24.12.0 dan npm 11.6.2. Tidak memerlukan manifest/config/node_modules parent atau backend untuk install/build.

```powershell
npx --yes --offline=false --package=npm@11.6.2 npm ci --offline=false
npm run lint
npm run typecheck
npm run build
npm run test:component
npm run dev
```

Buka http://localhost:5173. VITE_API_BASE_URL hanya /api/v1 (default); template .env.example tidak mengandung secret. API credentials same-origin, CSRF hanya memory dan semua request menuju API yang sama. Jangan menaruh password/session secret pada VITE_*.

Pemilik backend menjalankan repository mandirinya sendiri dengan APP_ORIGIN=http://localhost:5173, PostgreSQL/Redis/migration/seed yang sesuai. Default proxy Vite menuju localhost:3000. Untuk backend pada port lain, pilih target backend terpercaya pada process environment sebelum Vite dimulai:

```powershell
$env:API_PROXY_TARGET = 'http://127.0.0.1:3306'
npm run dev
```

API_PROXY_TARGET adalah konfigurasi server development, bukan env publik browser. Periksa /health/ready melalui proxy sebelum integrasi. Preview hanya build statis, bukan konfigurasi gateway production; deployment Task 7 belum dikerjakan.

## Struktur dan keputusan

src/app berisi router/providers; src/config memusatkan env, typed DTO decoding, HTTP/CSRF, QueryClient dan query keys. src/features/auth/users/products/receivings/inventory memisahkan API/types/components; hooks lintas fitur di src/hooks. src/pages menyusun route feature components, src/components/layout/shared untuk layout/form/table/feedback. Source FoundationPage Task 2A tetap dipertahankan tetapi tidak menjadi route bisnis.

React/ReactDOM 19.3.1, Router 7.18.5, Query 5.105.0, Tailwind 4.3.3 dan HeroUI 3.2.6 tetap. TextField/Label/Input/FieldError, Select/ListBox compound, Button dan Card memakai API v3. CSS Tailwind sebelum HeroUI. TypeScript strict/noUncheckedIndexedAccess/skipLibCheck=false; pengecualian exactOptionalPropertyTypes=false Task 2A tetap.

Server reads useQuery, mutations useMutation dengan retry false. Cache per actor+session generation, request lama dibatalkan/ditolak saat auth hilang atau identitas berganti (termasuk current-user dari tab lain). Logout gagal tidak mengklaim session hancur. Password/SID/CSRF tidak disimpan pada browser storage.

Receipt menyimpan key+payload sebelum send dalam sessionStorage per actor/receiving. Unknown outcome tidak membuat key baru atau mengubah payload; reload/navigasi/logout tetap mempertahankannya. User lain tidak melihat atau otomatis mengirim operasi tersebut. Retry memakai operasi asli; conflict perlu pemeriksaan riwayat. Setelah sukses terkonfirmasi, pending dihapus. Kegagalan refetch ditampilkan sebagai refresh error, bukan gagal commit; form receipt baru diblokir sampai detail berhasil dimuat ulang. Tidak ada optimistic stock increment.

## Component dan browser tests

```powershell
npm run test:component
npm run test:browser
```

Browser suite memakai Chrome terpasang, desktop dan mobile emulation. Backend/DB/Redis nyata diperlukan; mock komponen bukan bukti integrasi. Suite tidak mengimpor atau mengedit source backend. Untuk full suite, pemilik menyediakan backend yang telah dibangun beserta env database khusus _test; test fixture menjalankan proses backend eksternal per kasus dengan namespace Redis baru agar limiter tetap sesuai produksi, bukan dinonaktifkan. API port harus kosong dan cocok dengan API_PROXY_TARGET. Seluruh data fixture disposable dibuat lewat HTTP; tidak melakukan SQL/FLUSHALL atau menghapus volume.

Isi process environment E2E_BACKEND_ENTRY (absolute built server.js), E2E_BACKEND_ENV_FILE (absolute env database _test), E2E_BACKEND_PORT=3306, E2E_BASE_URL=http://localhost:5173, E2E_SEED_EMAIL dan E2E_SEED_PASSWORD. Credential seed hanya diberikan lokal melalui environment/provider secret; tidak dimasukkan VITE_*, contoh publik, source atau laporan. Vite harus sudah berjalan sebelum suite. Fixture memeriksa database _test dan readiness, lalu menghentikan hanya proses miliknya setelah setiap kasus. File/konfigurasi backend tidak berubah.

Contoh nama variabel tanpa secret tersedia di .env.e2e.example; file ini hanya template, tidak otomatis dimuat. Install/build/component tests tidak memerlukan path backend atau credential.

## Kontrak dan bukti

[API Markdown](docs/api-contract.md), [OpenAPI](docs/openapi.yaml), [manifest](docs/contract-version.json) adalah replika resmi backend; jangan diedit independen. Hash dan perbandingan lokal telah lulus. [Prosedur sync](docs/api-sync.md), [PRD](docs/prd.md), [technical spec](docs/technical-spec.md), [workflow](docs/ai-workflow.md), [testing](docs/testing.md), [dependency plan](docs/dependency-plan.md) dan [source/provenance](docs/provenance.md) berada di repo ini.

```powershell
python docs/validation/check-docs.py
```

Bukti Task 2A tetap historis. Bukti Task 6 menyimpan laporan component/browser dan screenshot desktop/mobile di docs/evidence; detail command/hasil/NOT_RUN ada pada testing.md. Tidak mengklaim deployment, browser lain, device fisik atau freshness remote GitHub telah diuji.


## Audit environment dan status final

Lihat [audit environment read-only](docs/environment.md) untuk membedakan default env/.env backend (belum ada), template dan file verifikasi Task 2-5. Task 6 memilih target berdasarkan DB _test, origin, seed dan health aktual; bukan nomor terbaru. Compose --env-file dan BACKEND_ENV_FILE adalah dua pilihan yang berbeda. File backend tidak diubah.

Bukti final component/browser dan batas NOT_RUN tersedia pada [testing Task 6](docs/testing.md#bukti-aktual-task-6); riwayat timeout permission review bukan eksekusi tes gagal maupun PASS. Runtime backend tes per kasus tidak dibiarkan berjalan pada port 3306 setelah suite; cara menjalankan manual tertera pada audit environment.
