# AI workflow repository frontend mandiri

Instruksi ini berlaku dari root repository ini; tidak mengasumsikan manifest, file, konfigurasi atau source aplikasi saudara. Semua pekerjaan Git/GitHub hanya manual pengguna; agent tidak menjalankan perintah Git atau tool GitHub, termasuk read-only. Baca [AGENTS](../AGENTS.md), [PRD](prd.md), [technical-spec](technical-spec.md), [API Markdown](api-contract.md), [OpenAPI](openapi.yaml), [review](spec-review.md), [testing](testing.md) dan [sync](api-sync.md).

## Riwayat yang sudah ada

Task 1 review/OpenAPI, Task 2 fondasi, Task 2A UI dan persiapan repository telah dilakukan dalam konteks yang dicatat pada [arsip workflow asli](history/combined/docs/ai-workflow.md) dan [testing](testing.md). Snapshot asli mempertahankan rencana lama/command workspace sebagai bukti historis; jangan menjalankannya sebagai command checkout ini atau menyatakan bahwa seluruh fitur selesai. Pada pekerjaan dokumentasi ini tidak ada task aplikasi yang dijalankan.

## Tahap berikutnya, belum dijalankan

| Tahap sumber | Status | Scope repository ini |
| --- | --- | --- |
| Task 3 boundary backend | CONTRACT_AVAILABLE | Tidak mengimplementasikan server dalam frontend; integrasi nyata pada Task 6 |
| Task 4/5 boundary backend | CONTRACT_AVAILABLE | Kontrak resmi disalin pemilik, hash dan kesamaan lokal diverifikasi |
| Task 6 frontend | IMPLEMENTED; hasil aktual pada testing.md | Auth UI, feature pages, typed HTTP/query keys, pending receipt recovery, component/browser tests |
| Task 7 frontend | PLANNED; NOT_RUN | Production image/gateway dan standalone deployment sesuai backend API origin |

## Checklist aktif

- [x] Task 6 frontend diizinkan pengguna; backend Task 3-5 tersedia.
- [x] Terima pasangan kontrak resmi backend, periksa hash dan freshness artefak tanpa operasi Git/GitHub.
- [x] Sediakan HTTP client trusted same-origin, credentials, CSRF memory, error normalization dan query keys typed.
- [x] Implementasikan useQuery/useMutation termasuk auth dan invalidasi yang ditargetkan; loading/empty/validation/pending/error.
- [x] Hormati role matrix; jangan menampilkan kontrol yang tak berizin dan jangan menganggap UI menggantikan authorization backend.
- [x] Preserve pending key+payload receipt per actor/receiving; retry false, no optimistic stock increment, clear stale query cache, separate success/refetch failure.
- [x] Tunggu bukti receiving kritis backend sebelum mengaktifkan stock mutations; jangan mengubah kontrak replika sendiri.
- [x] Tambahkan script/dependency component/browser ketika suite diimplementasikan, termasuk committed receipt lost-response, reload/reauth, cache isolation dan user switching.
- [x] Catat hasil aktual, pertanyaan terbuka, NOT_RUN dan sinkronisasi kontrak. Git/GitHub manual pengguna.

## Command verifikasi yang tersedia

```powershell
npx --yes --offline=false --package=npm@11.6.2 npm ci --offline=false
npm run lint
npm run typecheck
npm run build
python docs/validation/check-docs.py
```

Tes database backend memerlukan env khusus _test dan Redis nyata sesuai README. Tidak menjalankan migrate/seed/test database hanya untuk mengecek dokumentasi. Script frontend component/e2e belum tersedia dan tetap NOT_RUN. Paket/data/schema aplikasi lain bukan dependency build repo ini.

## Execution log dokumentasi mandiri

- Date: 2026-10-29 (Asia/Jakarta).
- Input: dokumen root proyek sumber dan konfigurasi/package lokal.
- Output: AGENTS scope lokal; README, PRD, technical-spec, API pair, sync protocol, review/mapping/dependency, workflow/testing; source/provenance dan arsip evidence asli.
- Keputusan: backend canonical API, frontend replika byte-identik; command aktif tanpa flags workspace/path parent; histori tidak diubah menjadi PASS baru.
- Pemeriksaan: statis dokumentasi saja, hasil di docs/evidence/documentation-check.json setelah benar-benar dijalankan.
- Implementasi aplikasi, database, browser, Git/GitHub dan Task 3: NOT_RUN pada pekerjaan ini.

Untuk setiap task berikutnya catat task/tanggal/input/instruksi/file berubah/keputusan/command/hasil aktual/keterbatasan; pengguna mengurus seluruh riwayat Git manual. Tidak membuat atau mengarang commit/PR/log pengujian.


## Execution log Task 6

Pengguna mengizinkan frontend bisnis. Audit awal hanya menemukan demo Task 2A; checker menerima kontrak resmi terbaru byte-identik backend. Sumber/stack/kompatibilitas Task 2A dipertahankan. Implementasi hanya frontend; backend hasil build dijalankan sebagai runtime tes eksternal, tidak mengubah file backend/parent. Tidak menjalankan Git/GitHub atau deployment Task 7.

- [x] Typed HTTP trusted same-origin, DTO decoding, CSRF/regeneration, error normalization dan generation/abort guard.
- [x] Auth useQuery/useMutation, reload/logout, role navigation/protected/forbidden/fallback routes.
- [x] Supervisor users, products create/read, receiving list/create/detail/partial/full, inventory/history.
- [x] Strict client validation, loading/empty/error/pending/success dan targeted invalidation.
- [x] Pending receipt key+payload actor/doc-scoped, lost-response/reload/reauth/replay recovery, no optimistic stock increments.
- [x] Clear cache saat auth/user berubah, termasuk current-user dari tab lain; late response guard.
- [x] Component dan browser tests terhadap backend nyata; mobile/desktop visual diperiksa.
- [ ] Browser lain/device fisik/audit aksesibilitas penuh dan deployment/performance Task 7 tetap NOT_RUN.

Checklist dan NOT_RUN sebelum bagian ini adalah histori tahap dokumentasi, bukan klaim Task 6 belum dilakukan. Rincian hasil perintah dan keterbatasan terbaru di testing.md.


## Penutupan verifikasi Task 6 setelah usage limit

2026-10-29: baca progres, source/evidence aktual dan proses aktif sebelum melanjutkan. Tidak ada tes lama; hanya Vite. Audit backend read-only dan [environment](environment.md) selesai sebelum final E2E. Tidak mengubah implementasi yang benar atau file backend. Verifikasi berurutan: lint/typecheck/build, 13 component tests, 10 Chrome desktop/mobile browser tests, contract checker dan backend hash snapshot semuanya lulus; rincian failure awal/NOT_RUN di testing.md. Review izin yang timeout bukan eksekusi tes. README dan panduan environment diperjelas. Task 7 tetap NOT_RUN.


## Execution log Task 7 ? Docker deployment lokal dan final review

2026-10-29, diizinkan pengguna untuk kedua repository. Tidak mengembalikan workspaces atau menjalankan Git/GitHub. Bukti Task 2?6 dipertahankan sebagai histori.

- [x] Audit environment; project/database/volume baru untuk deployment tes, existing dipertahankan.
- [x] Dockerfiles mandiri, npm/Node pinned, lockfile dan Prisma generate offline.
- [x] PostgreSQL/Redis healthy ? migrate/seed 0 ? API ready ? nginx/web.
- [x] Same-origin proxy, SPA fallback, cookie/CSRF, trusted gateway tunggal dan port internal.
- [x] Perbaikan Redis reconnect terbatas/backoff dengan fail-closed tetap berlaku.
- [x] Linux lint/typecheck/build, Prisma validate/generate, 75 backend + 13 component tests.
- [x] 10 browser desktop/mobile terhadap runtime Docker; namespace limiter unik tanpa melonggarkan kebijakan.
- [x] Migration/seed ulang, session/data persistence, outage/recovery dan graceful SIGTERM.
- [x] Validator OpenAPI, kontrak kedua repository dan review 87 ID; lihat final-review.md.
- [x] README/testing/deployment notes dan batas bukti diperbarui.
- [ ] HTTPS publik, browser lain, device fisik, load/fuzz/accessibility audit menyeluruh: NOT_RUN.

Task 7 lokal selesai; bukan persetujuan untuk deploy publik. Requirement dengan bukti parsial dicatat eksplisit pada final-review.md, tidak dianggap PASS penuh. Tidak ada penghapusan database/volume atau metadata Git.


## Perbaikan startup development ? 2026-10-29

- [x] npm run dev mandiri tanpa warning workspace; root registration disesuaikan minimal.
- [x] Backend once-only preparation, safe dev target/override/port checks, existing Compose project dan seed preservation.
- [x] Vite localhost5175 strictPort/proxy3000, Origin/CSRF tetap ditegakkan.
- [x] Bersihkan hanya proses Warehouse lama; browser login/reload/logout aktual dan checks lint/typecheck/build/unit/component lulus.
- [ ] Docker engine dimatikan secara nyata dan full SQL regression ulang: NOT_RUN.

Panduan aktif development.md; bukti/history sebelumnya dipertahankan. Tidak menjalankan Git/GitHub.


## Penyempurnaan setelah Task 7 ? edit produk (2026-10-30)

Permintaan pengguna memperluas BR-P06 hanya untuk koreksi sku/name SUPERVISOR, tanpa delete/archive/active status. Progres awal sudah punya create/list/detail, tidak ada PATCH. Tidak menambah dependency, schema atau migration.

- [x] PRD/keputusan history-current-label sebelum verifikasi; source PROJECT_SPEC.md tetap.
- [x] PATCH strict partial schema, minimal field, middleware auth/CSRF/role existing, repository atomic update/unique DB constraint, mapper DTO existing.
- [x] 404 PRODUCT_NOT_FOUND,409 SKU_ALREADY_EXISTS, own SKU allowed; invalid/dependency responses existing.
- [x] UI prefill Edit/Simpan/Batal, validasi/error/pending/double-submit guard, useMutation/HeroUIv3, invalidate products/inventory/receivings/transactions termasuk detail.
- [x] OpenAPI + API Markdown backend authority, hash manifest dan frontend identik; checker kini21 operasi,87 ID existing tetap.
- [x] Lint/typecheck/build kedua aplikasi,19 unit +63 integration real PG/Redis +17 component +12 browser desktop/mobile.
- [x] Existing received product, concurrent unique race, atomic conflict, immutable IDs/quantities/FK/receipt/balance dan receipt replay tanpa stok ganda diverifikasi.
- [x] Proses runtime verifikasi dihentikan; dependency tes hanya stopped, volume/data dipertahankan.
- [ ] Production Docker build ulang, HTTPS, load/fuzz dan browser/device lain: NOT_RUN pada penyempurnaan ini.

Bukti rinci/percobaan awal ada di testing.md, tanpa menimpa laporan Task2?7. Tidak menjalankan Git/GitHub.


## Lanjutan penyempurnaan Task7 ? Riwayat Edit Produk (2026-10-30)

Melanjutkan edit yang sudah lulus, bukan mengulang/mengganti fiturnya. Scope tambahan diizinkan pengguna: log permanent dan halaman supervisor terpisah.

- [x] Audit progres; keputusan log transaction/row lock/no-op/actor snapshot dan no backfill didokumentasikan.
- [x] Model ProductEditHistory multi-file, forward migration CHECK/FK/index tanpa mengedit initial migration.
- [x] Product lock + read-before + UPDATE + INSERT log atomik, actorID dari server; no-op/failure tidak log.
- [x] GET product history strict pagination, supervisor only, repeatable snapshot list/count.
- [x] Route /products/:id/history dan tombol Riwayat Edit supervisor, identitas/back/states/pagination; cache productHistory terpisah.
- [x] Upgrade DB tes terisi mempertahankan tujuh tabel lama; fresh empty DB deploy dua migrasi, repeat deploy unchanged.
- [x] Component20/20, unit19/19 dan integration67/67 nyata; browser14/14 desktop/mobile lulus; bukti dan batas aktual pada testing.md.
- [x] OpenAPI/Markdown/manifest backend dan frontend tersinkron22 operasi; ERD/data-flow mengikuti transaksi baru.
- [ ] Docker production rebuild/deployment, HTTPS dan browser lain pada penambahan ini: NOT_RUN.

Bukti tahap edit awal/Task2?7 tetap historis; laporan baru product-history-* terpisah. Seluruh Git/GitHub manual pemilik. Data/volume/credential development/deployment tidak diubah.

- [x] Browser history terpisah/21event pagination/operator403 dan semua regresi14/14 lulus; runtime tes dihentikan dan volume dipertahankan.


## Penyesuaian UI: hapus pencarian pilihan receiving (2026-10-30)

- [x] Baca progres dan pertahankan pagination/known choices existing.
- [x] Hapus hanya input/state/handler pencarian CreateReceiving; q API dan pencarian halaman lain tidak disentuh.
- [x] Tes lintas halaman (>100 produk), pilihan tetap terjaga, multi-produk, quantity/ref dan duplicate validation.
- [x] Lint/typecheck/build frontend; component23/23 dan browser16/16 desktop/mobile.
- [x] Bukti awal gagal dan perbaikan test environment/selector disimpan terpisah; runtime verifikasi dihentikan, dependency development aktif dipertahankan.
- [ ] Backend full integration ulang, Docker production rebuild, browser/device lain: NOT_RUN pada perubahan UI ini.

Tidak mengubah business rule, kontrak, schema, stok atau alur receipt. Tidak menjalankan Git/GitHub. Bukti rinci pada testing.md.


## Pagination receiving: katalog5 per halaman (2026-10-30)

- [x] Reproduksi UI lama: satu produk,11rows receiving, total tetap1 dan Next disabled; audit SQL development1 produk/3dokumen/3items.
- [x] Telusuri GET products.page/limit, COUNT total, TanStack key, handlers dan disabled math; pisahkan katalog vsrows diUI.
- [x] Ubah hanya CreateReceiving menjadi limit5/local pager; per-row pinned selection, quantity tetap, exclude duplicate choices.
- [x] Batas5/6/11 serta data berubah/lintas halaman diuji component dan browser realAPI.
- [x] Lint/typecheck/build,27component,2browser boundary +4browser regression PASS.
- [x] Runtime tes dihentikan; development tetaphealthy dan seluruh216file backend tidak berubah.
- [ ] Full browser suite seluruh fitur, backend integration ulang, production Docker rebuild: NOT_RUN pada perubahan form ini.

Tidak mengubah source backend, API contract/default global, schema, stok, receipt atau aturan bisnis. Bukti sebelumnya tetap, detail pada testing.md.

## Pagination baris item receiving setelah Task 7 (2026-10-30)

- [x] Pertahankan pager katalog5 produk dan pisahkan pager baris formulir5 item, dengan label/jumlah/nomor global yang jelas.
- [x] UUID key stabil, state seluruh rows tetap tersimpan; tambah membuka/fokus item baru, hapus clamp halaman dan minimal1; maksimal50 tetap.
- [x] Pilihan/quantity dan label produk bertahan lintas halaman item/katalog; duplicate product dicegah terhadap seluruh rows.
- [x] Validasi seluruh item sebelum mutation; error tersembunyi membuka/fokus item invalid pertama; submit mengirim seluruh array.
- [x] Tes batas5/6/10/11, penghapusan baris tengah dan terakhir, retensi nilai, error tersembunyi serta submit lintas halaman.
- [x] Perbaiki overflow label panjang mobile secara lokal dan pesan error lama setelah koreksi input; tanpa mengubah shared Fields atau CSS global.
- [x] Prettier3.6.2, lint/typecheck/build PASS; component34/34; browser terpilih6/6 Chrome desktop/mobile dengan PostgreSQL/Redis nyata.
- [x] Screenshot desktop/mobile ditinjau; kontrak backend/frontend identik; bukti awal dan final terpisah pada testing.md/evidence.
- [x] Runtime tes selesai; Vite14500 dihentikan, listener3310/5176 kosong, dependency tes dikembalikan stopped, development tetap healthy/data-volume utuh.
- [ ] Full browser suite semua fitur, backend full integration ulang, production rebuild/deployment dan perangkat fisik/browser lain: NOT_RUN pada perubahan form ini.

Tidak menjalankan Git/GitHub, mengubah backend/dependency/lockfile/kontrak/schema/PROJECT_SPEC.md, atau memulai task lain.
