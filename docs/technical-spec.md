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
| src/pages | Halaman route; FeaturePages/LoginPage menyusun fitur; FoundationPage adalah source demo Task 2A yang tidak diroute |
| src/features | Lokasi auth/users/products/receivings/inventory saat diizinkan |
| src/components/layout / src/components/shared | Lokasi komponen lintas fitur yang diperlukan, bukan abstraksi kosong |
| tests | Component/security suite Vitest+RTL dan browser Chrome Playwright |
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

global.css mengimpor tailwindcss terlebih dahulu, lalu @heroui/styles. Vite memakai react() dan tailwindcss(); tidak memakai heroui() plugin v2, Tailwind v3 config atau HeroUIProvider. Gunakan public component subpaths dan API compound HeroUI v3; Card.Header/Title/Content/Footer dan Button onPress/variant/isDisabled sudah digunakan pada demo. Demo counter hanya source historis; halaman aktif kini memakai server reads/mutations Task 6.

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

Task 6 frontend telah diimplementasikan; backend Task 3-5 tersedia sesuai pasangan kontrak resmi yang diverifikasi. Proses yang direncanakan harus mengikuti [api-contract.md](api-contract.md), replika identik dari backend, dengan aturan [api-sync.md](api-sync.md). Jangan mengedit replika secara independen untuk mengarang endpoint/error.

R-10/R-11/R-13 dan pertanyaan stakeholder pada [spec-review.md](spec-review.md) tidak diselesaikan dengan asumsi UI. Role matrix mengikuti PRD: operator tidak melihat user management/create product, namun backend tetap wajib menolak akses langsung. Tidak menambah role admin, fitur AI, pecahan quantity atau koreksi receipt.

Tidak mengimpor model/client Prisma, tidak melakukan transaction/ledger/balance writes dari browser. Deployment frontend/nginx direncanakan kemudian, tanpa dependency build ke backend. Semua pekerjaan Git/GitHub manual pengguna; agent tidak menjalankan perintah Git atau tool GitHub.


## Implementasi Task 6

R-10/R-11/R-13 mengikuti replika API backend yang sudah disalin pemilik, bukan keputusan baru frontend. DTO di-decode Zod pada boundary HTTP; form memvalidasi normalisasi/code-point/numeric constraints sebelum send, backend tetap otoritatif. Batas password tidak memakai trim atau HTML maxLength UTF-16.

HTTP menolak path eksternal/traversal, credentials same-origin, redirect error dan CSRF memory. Token bootstrap didedup, diganti setelah login regeneration; CSRF_INVALID yang dipastikan sebelum service boleh diulang satu kali dengan bootstrap baru. Mutation lain tidak retry otomatis. Setiap request membawa AbortSignal dan generation guard; respons epoch lama ditolak walau transport mengabaikan abort. 401 menghentikan akses dan membersihkan query cache; 503 tidak dianggap auth loss. Current-user dapat menemukan identitas berbeda dari tab lain dan juga memicu cache reset/token reset.

Query keys typed terpusat dengan actor+epoch; auth/me per epoch. Invalidasi users list/detail; products+inventory setelah product create; receivings setelah create; receivings/inventory/history setelah receipt. AllSettled invalidation mempertahankan hasil mutation yang sudah commit, dengan indikator refreshFailed. Tidak mengubah stok secara optimistis.

Pending receipt berupa record version/actor/receiving/key/payload/createdAt pada sessionStorage. Store menolak overwrite operasi unresolved atau data korup, mengisolasi lookup berdasarkan actor, dan tidak menyimpan password/SID/token. Key+payload tersimpan sebelum request. Logout/reauth tidak menghapusnya; aktor lain tidak menampilkan/mengirimnya. Confirmed success menghapus pending sebelum refetch. IDEMPOTENCY_CONFLICT tidak otomatis membuat key baru. Operasi yang tegas ditolak validasi/domain tertentu bisa ditutup secara eksplisit; unknown outcome tetap memakai key lama. Bila post-commit refresh gagal, form baru tetap disabled sampai detail fresh.

HeroUI v3 TextField/Select/ListBox/Card/Button dan Tailwind layout dipertahankan, semua form berlabel, error dekat field, status/error live region dan link focus-visible. Table overflow berada di dalam panel; mobile body tidak melebar. Ref guard mencegah duplicate submit sebelum React pending render.

Acuan resmi versi terpasang: [HeroUI TextField v3](https://heroui.com/en/docs/react/components/text-field), [Select v3](https://heroui.com/en/docs/react/components/select), [TanStack Query v5 cancellation](https://tanstack.com/query/v5/docs/framework/react/guides/query-cancellation), [Playwright configuration](https://playwright.dev/docs/test-configuration). Tanda tangan public types HeroUI 3.2.6 dan Query 5.105.0 diverifikasi melalui strict typecheck aktual.

Tidak ada perubahan backend/config parent, kontrak replika atau stack runtime. Test tooling ditambahkan exact; engine jsdom terbaru tidak kompatibel dengan Node baseline sehingga dipilih versi kompatibel tanpa melonggarkan engine. Build memberi warning Zod PURE annotation dan chunk JS >500 kB; tidak disembunyikan. Code splitting/performance production masih evaluasi Task 7, bukan bukti SLA yang sudah PASS.


### Baseline deployment Task 7 terverifikasi

Dockerfiles/lockfile pada masing-masing root repository; Compose backend deploy/compose.yaml menerima context checkout frontend eksplisit. Node 24.12.0/npm 11.6.2, nginx 1.30.6-alpine, PostgreSQL 17.11, Redis 8.2.11 pinned digest. Migration/seed job terpisah sebelum API; gateway HTTP lokal port internal 8080, API tidak dipublish. TRUST_PROXY hanya alamat gateway statis, DNS nginx diperbarui untuk API recreation; tidak ada automatic mutation retry. Runtime non-root/read-only, secret hanya runtime env. Lihat deployment.md dan testing.md untuk detail dan bukti. OpenAPI/Markdown tidak berubah; reconnect Redis memulihkan koneksi otomatis dengan backoff maksimum 2 detik, disableOfflineQueue/fail-closed tetap berlaku. Tidak menambahkan endpoint atau aturan bisnis. HTTPS production tetap NOT_RUN.


### Startup development satu command

Lihat development.md: npm run dev backend memvalidasi env/.env/override, memeriksa port3000 dan Docker, Compose project wrs-development-laptop healthy, Prisma generate, query target lalu migrate deploy/seed sekali sebelum watcher. Vite development localhost5175 strictPort, proxy127.0.0.1:3000 mempertahankan Origin. APP_ORIGIN5175/local cookie non-Secure. Mode test eksplisit mempertahankan alternate fixture proxy. Kontrak API/security tidak berubah. Root workspace registration lama dihapus minimal; dependency dan kedua lockfile aplikasi tetap.


## Penyempurnaan setelah Task 7: edit produk (2026-10-30)

Keputusan sebelum verifikasi: PATCH hanya sku/name oleh SUPERVISOR. Schema partial strict dari create, minimal satu; repository single SQL UPDATE dengan whitelist sku/name, service memetakan P2025 ke PRODUCT_NOT_FOUND404 dan P2002 ke SKU_ALREADY_EXISTS409. Tidak pre-check SKU yang rentan race; unique constraint existing tetap otoritatif. Single update atomik termasuk name jika SKU conflict. Mapper ProductDto existing dipertahankan; tidak mengubah schema, migration atau dependency.

Inventory repository include product dan receiving detail include product menampilkan label produk TERKINI, termasuk ledger lama. Receipt mapper menyimpan/mengembalikan receivingItemId/productId/quantity, tidak label; payload hash/replay tidak berubah. Tidak membuat snapshot label, produk pengganti, balance baru atau mengubah hubungan/quantity/receipt.

Frontend supervisor Edit -> prefilled SKU/name -> Simpan/Batal memakai DataForm/HeroUIv3 dan useAction(useMutation). Pending menonaktifkan edit/save/cancel, ref guard mencegah double-submit; error tetap pada form. Setelah commit invalidate seluruh prefix actor untuk products/inventory/receivings/transactions, termasuk detail/inactive queries; tidak optimistically mengubah stok. Refetch failure tetap success dengan refresh warning existing. Operator tidak melihat aksi dan server tetap menolak.

Audit awal menemukan OpenAPI frontend tertinggal (metadata dan beberapa ketentuan R-10/R-11/Task5), sementara backend authority lebih lengkap. Sinkronisasi kali ini memakai backend sebagai sumber, memperbarui kedua artifact kontrak dan manifest identik; bukan mengambil behavior dari salinan frontend lama.


## Tambahan riwayat edit produk setelah Task7 (2026-10-30)

Menggantikan keputusan single UPDATE pada penyempurnaan edit sebelumnya: service kini READ COMMITTED transaction, repository SELECT products.id FOR UPDATE, baca label aktual, deteksi normalized no-op, baca actor name dari User berdasarkan req.user.id, UPDATE sku/name, INSERT ProductEditHistory, COMMIT. Semua operasi memakai transaction client yang sama. Unique SKU tetap database arbiter; log failure membatalkan product dan sebaliknya. In-flight authorization mengikuti BR-U12 existing; request baru tetap reload role/status/authVersion.

Model multi-file product-edit-history.prisma/table product_edit_history: UUIDid/product_id/actor_id, snapshot actor_name varchar120, changed_at timestamptz6 default clock_timestamp(), before/after_sku varchar40 dan before/after_name varchar120. Clock timestamp saat insert dipilih agar request yang menunggu lock tidak memakai waktu awal transaksi untuk ordering. FK produk/actor RESTRICT update/delete; soft delete User tidak memutus FK dan actorName tidak di-join ulang. Index(product_id,changed_atDESC,idDESC), index(actor_id), CHECK effective change, SKU format dan panjang nama nonempty. Migrasi forward202610300002_product_edit_history menambah tabel saja, tidak mengubah applied initial migration/data lama. Log historis sebelum fitur tidak direkayasa/backfill. Tidak ada mutation API untuk log; bukan fitur stock/receiving.

GET /api/v1/products/:id/history supervisor-only, strict page/limit existing, paginated DTO, REPEATABLE READ untuk exists/list/count satu snapshot. Route UI /products/:id/history dalam Protected supervisor, tombol Riwayat Edit pada daftar, identitas produk/current label, kembali, event table before/after dan actor snapshot/time, loading/empty/error/retry/pagination. Resource cache productHistory terpisah dari transactions; edit invalidate productHistory beserta products/inventory/receivings/transactions. Tidak mencampur audit dengan ledger. Tidak menambah dependency.

Readiness LIMIT0 juga memeriksa product_edit_history; image/API versi baru tidak menyatakan ready bila migrasi tabel log belum tersedia. Tidak mengubah health response contract.


## Penyesuaian UI setelah Task7: pilihan produk receiving tanpa pencarian (2026-10-30)

Hanya CreateReceiving: hapus label/input Cari produk untuk pilihan, state search, handler reset page dan filter q milik input tersebut. Tidak ada debounce terpisah. Query pilihan kini {page,limit:100}; Pagination existing tetap menjangkau seluruh halaman produk. known options map existing mempertahankan pilihan yang sudah dipilih saat pindah halaman. Tidak memuat seluruh katalog sekaligus atau membatasi ke halaman pertama. Pilihan produk, quantity/ref, max50 item, unique-product validation dan quantity integer1..1000000 tidak diubah. Pencarian halaman produk/inventory dan dukungan q pada API tetap ada.

Tes browser receiving existing memakai helper paginated dropdown, bukan mengisi input pencarian yang sudah dihapus. Helper menargetkan tombol Select dan menunggu popup selesai ditutup agar label dialog/listbox animasi tidak menjadi selector ganda. JSdom test setup menyediakan CSS.escape test-only untuk membuka HeroUI/React Aria Select asli; bukan perubahan runtime aplikasi/dependency.


## Koreksi pagination katalog pada CreateReceiving (2026-10-30)

Menggantikan page size100 khusus selector receiving menjadi5; tidak mengubah default API20/max100, shared Pagination atau halaman lain. Pager existing adalah KATALOG PRODUK dari GET /products, bukan rows receiving. API total=COUNT productWhere, skip=(page-1)*limit; frontend memakai response.pagination.total, bukan data.length/rows.length. Query key tetap ['actor',actorId,authEpoch,'products','list',{page,limit:5}], sehingga beda halaman/limit tidak bertabrakan dengan cache halaman produk.

Pager lokal katalog menghitung max(1,ceil(total/5)); Previous disabled page<=1, Next disabled page>=totalPages, keduanya disabled ketika fetching/mutation. Handler prev/next dibatasi1..totalPages dan benar-benar mengganti query page/limit5. UI menampilkan Katalog produk pilihan + Halaman X dari Y + total produk. Pagination baris receiving ditentukan terpisah pada penyempurnaan berikutnya. Rows tetap maksimal50 dan validator quantity/reference/duplicate tidak diubah.

Tidak lagi menggabungkan seluruh opsi halaman lama ke dropdown. Opsi=halaman katalog saat ini, ditambah hanya selected product milik baris sendiri bila berada di halaman lain; hint menjelaskannya. Label tersimpan dipakai mempertahankan pilihan/quantity; selected product baris lain tidak ditawarkan untuk mencegah pemilihan ganda. Unique-product Zod guard tetap defense-in-depth. Total katalog tidak berkurang karena row form dipilih/ditambah.

## Pagination baris item receiving setelah Task 7 (2026-10-30)

CreateReceiving mempunyai dua pager independen: **Katalog produk pilihan** membaca total produk API dengan page/limit5 existing; **Item penerimaan** hanya membatasi tampilan array lokal menjadi5 baris. Tidak menambah parameter/request API untuk pagination item. Label `Item penerimaan — Halaman X dari Y · N item` memakai seluruh rows.length, Y=max(1,ceil(N/5)); nomor field/heading tetap indeks global, bukan indeks slice. Batas1–50 item tetap sesuai kontrak.

State rows menyimpan UUID key, productId dan expectedQuantity untuk seluruh halaman; React key, update dan delete menggunakan UUID stabil. visibleRows hanya slice untuk render; unmount field tidak menghapus state. Tambah item membuka halaman item baru dan memfokuskan trigger pilihan produknya setelah render. Hapus mempertahankan minimal1 item dan clamp halaman terakhir yang kosong. Navigasi item tidak mengganti halaman katalog atau mengambil data produk tambahan. Tombol pager dibedakan menjadi Item sebelumnya/Item berikutnya dan disabled pada batas/pending mutation.

Opsi produk memeriksa duplikat terhadap SELURUH rows, termasuk halaman tersembunyi. Pilihan sendiri dari halaman katalog lain tetap memakai label tersimpan. Submit memvalidasi dan mengirim SELURUH rows, bukan visibleRows. Jika ada kesalahan item, urutkan menurut indeks global, buka halaman item invalid pertama, tampilkan nomor item/pesan dan fokuskan produk atau quantity yang salah; tidak mengirim mutation. Guard duplicate Zod tetap berlaku, dengan error pada field item kedua yang berulang. Ref/reference validation, quantity integer1..1000000, max50, kontrak dan perilaku create/receipt tidak berubah.

Mengubah field item membersihkan error field/pesan submit lama; submit berikutnya tetap memvalidasi seluruh data. Grid form menggunakan track minmax(0,1fr), min-width0 dan wrapping label Select secara lokal supaya SKU/nama Unicode panjang tidak memperlebar halaman mobile. Shared Fields, CSS global, pager katalog dan halaman lain tidak diubah.
