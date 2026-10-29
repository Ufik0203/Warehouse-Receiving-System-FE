# Technical specification frontend mandiri

Ditulis dari technical specification proyek sumber; [source dan provenance](provenance.md) mempertahankan konteks asal. Dokumen ini berlaku pada root repository frontend, bukan path folder aplikasi di proyek gabungan. PRD dan kontrak lengkap tersedia lokal.

## Stack dan struktur

Node 24.12.0/npm 11.6.2, React/ReactDOM 19.3.1, TypeScript 5.9.3, Vite 7.3.7, Router 7.18.5, TanStack Query 5.105.0, Zod 4.6.7, Tailwind 4.3.3 dan HeroUI 3.2.6. Dependency exact dan toolchain dev lokal ada di package.json/package-lock.json serta [dependency-plan.md](dependency-plan.md).

| Path | Peran |
| --- | --- |
| src/main.tsx | Entry; satu import CSS global |
| src/app/router.tsx | BrowserRouter dan route/fallback |
| src/app/providers.tsx | QueryClientProvider dengan satu QueryClient per app |
| src/config/env.ts | VITE_API_BASE_URL same-origin /api/v1 |
| src/config/query-client.ts | Konfigurasi server state; mutation retry false |
| src/styles/global.css | CSS-first Tailwind/HeroUI, override minimum @layer base |
| src/pages | Halaman route; FoundationPage hanya demo UI |
| src/features | Lokasi auth/users/products/receivings/inventory saat diizinkan |
| src/components/layout / src/components/shared | Lokasi komponen lintas fitur yang diperlukan, bukan abstraksi kosong |
| tests | Lokasi component/browser suite mendatang; belum tersedia |
| .env.example | Template environment publik tanpa secret |
| vite.config.ts / tsconfig.json / eslint.config.js | Konfigurasi lokal tanpa extends atau import dari parent |

```powershell
npx --yes --offline=false --package=npm@11.6.2 npm ci --offline=false
npm run lint
npm run typecheck
npm run build
npm run dev
```

Build tidak memerlukan backend/env file. Vite dev mem-proxy /api dan /health ke localhost:3000 backend terpisah; ini boundary HTTP, bukan dependency file. Preview hanya untuk build statis. Template .env dapat disalin dari .env.example; VITE_API_BASE_URL default /api/v1. Jangan mengekspos database URL, Redis URL, password, signing secret atau session ID ke environment publik frontend.

## Fondasi UI Task 2A

global.css mengimpor tailwindcss terlebih dahulu, lalu @heroui/styles. Vite memakai react() dan tailwindcss(); tidak memakai heroui() plugin v2, Tailwind v3 config atau HeroUIProvider. Gunakan public component subpaths dan API compound HeroUI v3; Card.Header/Title/Content/Footer dan Button onPress/variant/isDisabled sudah digunakan pada demo. Counter adalah state lokal; belum ada business mutation atau data warehouse pada UI.

strict dan noUncheckedIndexedAccess tetap true, skipLibCheck false. exactOptionalPropertyTypes false hanya pada frontend karena konflik GroupProps/OverlayArrowProps React Aria terhadap DOMProps. Optional prop dapat menerima undefined eksplisit; ini pengecualian tambahan yang perlu dievaluasi ulang setelah tipe upstream diperbaiki. Backend mempertahankan pengaturan lebih ketat dalam repository-nya sendiri. Tidak memakai explicit any, @ts-ignore atau patch node_modules. [Riwayat eksperimen asli](history/combined/docs/testing.md#bukti-aktual-task-2a) mempertahankan kegagalan dan hasil akhirnya.

## Frontend dan TanStack Query

Semua server-state read menggunakan useQuery. Semua operasi perubahan state server menggunakan useMutation, termasuk login dan logout.

Query key:

```text
["auth", "me"]
```



```text
["users", "list", filters]
["users", "detail", userId]
```



```text
["products", "list", filters]
["products", "detail", productId]
```



```text
["receivings", "list", filters]
["receivings", "detail", receivingId]
```



```text
["inventory", "list", filters]
["inventory", "transactions", filters]
```


Invalidasi:

| Mutation | Query yang diperbarui |
| --- | --- |
| Login | Set data auth/me, gunakan CSRF baru |
| Logout | Hapus seluruh query cache dan CSRF memory |
| Create/update/delete user | User list dan detail terkait |
| Create product | Product list dan inventory list |
| Create receiving | Receiving list |
| Receive items | Receiving detail, receiving list, inventory list, transaction history |



TanStack Query mendukung invalidasi query terkait melalui callback mutation. Promise invalidasi dapat ditunggu agar status mutation tetap pending sampai pembaruan selesai. TanStack Query React Docs

Ketentuan mutation penerimaan:
- retry: false secara eksplisit.
- Buat idempotency key sebelum mengirim mutation.
- Simpan key dan payload bersama sebagai satu pending operation.
- Simpan pending operation di sessionStorage, dipisahkan berdasarkan actor dan receiving ID.
- Tidak menyimpan password, session ID, atau CSRF token dalam pending operation.
- Jika response hilang atau terjadi 5xx, retry menggunakan key dan payload yang sama.
- Reload, login ulang, atau logout tidak boleh otomatis membuat key baru untuk operasi yang belum diketahui hasilnya.
- IDEMPOTENCY_CONFLICT memerlukan pemeriksaan riwayat; jangan otomatis mengirim ulang dengan key baru.
- Tidak melakukan optimistic increment stok.
- Kegagalan refetch setelah mutation sukses ditampilkan sebagai masalah refresh, bukan mengubah status receipt menjadi gagal.
- Pada 401, hentikan protected queries dan hapus cached data user sebelumnya.
- CSRF token kedaluwarsa dapat diambil ulang; mutating request hanya boleh diulang sekali setelah error CSRF yang dipastikan terjadi sebelum service dijalankan.

## Boundary autentikasi dan CSRF dari desain server

Bagian berikut adalah protokol frontend/backend dari sumber, bukan izin mengimplementasikan server pada repository frontend. Backend menegakkan semua validasi/authorization; UI tidak menjadi otoritas role atau stock.

## Login dan CSRF flow

Gunakan synchronizer token yang terikat session. Token dikirim melalui JSON response dan dikembalikan frontend melalui X-CSRF-Token. Login juga dilindungi menggunakan pre-login session. Setelah login berhasil, buat session baru untuk mencegah session fixation. Pola ini mengikuti panduan OWASP dan tersedia melalui csrf-sync. OWASP Cheat Sheet Series

Alur yang ditetapkan:
1. Frontend meminta GET /api/v1/auth/csrf-token.
2. Backend membuat anonymous session bila diperlukan.
3. Backend membuat token acak minimal 32 byte dan menyimpannya dalam session.
4. Backend menyimpan session sebelum mengirim token.
5. Frontend menyimpan token dalam memory.
6. Frontend mengirim login dengan cookie dan header CSRF.
7. Backend memvalidasi CSRF, input, rate limit, dan password.
8. Setelah kredensial valid, backend menjalankan session regeneration.
9. Session baru diisi userId, authVersion, dan authenticatedAt.
10. Buat CSRF token baru untuk session baru.
11. Simpan session baru sebelum mengirim response login.
12. Response berisi user dan CSRF token baru.
Ketentuan tambahan:
- Token stabil selama session tersebut berlaku.
- GET /csrf-token mengembalikan token yang masih berlaku, bukan selalu merotasinya.
- POST, PATCH, PUT, dan DELETE wajib menjalani pemeriksaan CSRF.
- Token tidak dikirim melalui URL atau ditulis ke log.
- Mutating request wajib memakai JSON.
- Periksa Origin terhadap APP_ORIGIN; bila tidak ada, gunakan origin dari Referer.
- Request perubahan data tanpa Origin/Referer yang dipercaya ditolak dalam aplikasi ini.
- GET bisnis tidak mengubah state bisnis.
- Endpoint CSRF bootstrap hanya menginisialisasi state keamanan session.
Logout menghancurkan session Redis, menunggu hasilnya, lalu menghapus cookie dengan atribut yang sesuai.



## Scope dan pertanyaan terbuka

Baru fondasi React/router/Query serta demo UI tersedia. Task 3 backend belum dimulai; frontend auth/business pages dan component/browser suites penuh belum tersedia. Proses yang direncanakan harus mengikuti [api-contract.md](api-contract.md), replika identik dari backend, dengan aturan [api-sync.md](api-sync.md). Jangan mengedit replika secara independen untuk mengarang endpoint/error.

R-10/R-11/R-13 dan pertanyaan stakeholder pada [spec-review.md](spec-review.md) tidak diselesaikan dengan asumsi UI. Role matrix mengikuti PRD: operator tidak melihat user management/create product, namun backend tetap wajib menolak akses langsung. Tidak menambah role admin, fitur AI, pecahan quantity atau koreksi receipt.

Tidak mengimpor model/client Prisma, tidak melakukan transaction/ledger/balance writes dari browser. Deployment frontend/nginx direncanakan kemudian, tanpa dependency build ke backend. Semua pekerjaan Git/GitHub manual pengguna; agent tidak menjalankan perintah Git atau tool GitHub.
