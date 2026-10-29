# Testing dan bukti repository frontend

Dokumen aktif ini diturunkan dari testing root tanpa memindahkan PASS ke scope yang tidak diuji. [Arsip testing asli](history/combined/docs/testing.md) mempertahankan seluruh command, percobaan gagal, exit code, output dan NOT_RUN asal; [manifest](history/manifest.json) memverifikasi byte arsip. [Verifikasi lokal tahap sebelumnya](verification.md) juga tetap tersedia.

## Ringkasan bukti dengan konteks asal

| Bukti asal | Status aktual pada saat itu | Batas konteks |
| --- | --- | --- |
| Task 1 | OpenAPI validator dan dokumen PASS; implementation NOT_RUN | Proyek gabungan, bukan runtime standalone |
| Task 2 backend | Typecheck/lint/build, 8 unit + 7 integration PASS; migrated empty DB, repeated deploy, seed preservation, real health/lifecycle PASS | Windows dan project Docker wrs-task2-cf98214e, DB wrs_task2_cf98214e_test; bukan eksekusi baru |
| Task 2 frontend | Typecheck/lint/build PASS | Fondasi sebelum Task 2A |
| Task 2A | Frontend lint/typecheck/build dan Chrome desktop/mobile smoke PASS | Konfigurasi final optional-property false; demo saja, bukan auth/business flows |
| Persiapan repository terpisah | Kedua npm ci/lint/typecheck/build/dependency tree PASS | Salinan temporary independen, tanpa env lokal atau parent workspace; unit/integration/browser tidak diulang |


Bukti lengkap dan screenshot/log ada di history/combined/docs/evidence dan history/combined/docs/testing.md. Semua referensi path temporary, flag workspace dan config root di dalam arsip adalah konteks historis, bukan petunjuk aktif. Task 2A backend tests dan audit penuh/browser lain tetap NOT_RUN sebagaimana sumber. Signal OS PTY Windows belum terkonfirmasi, meski jalur shutdown dipanggil langsung pada tes Task 2.

## Command aktif dari root repository

```powershell
npx --yes --offline=false --package=npm@11.6.2 npm ci --offline=false
npm run lint
npm run typecheck
npm run build
```

Command di atas adalah petunjuk, tidak dijalankan ulang pada pekerjaan dokumentasi ini. Di backend, codegen/validate offline tidak membutuhkan URL layanan; migration/seed/runtime tetap memerlukan env eksplisit. Di frontend, build tidak membutuhkan backend atau credential. Jangan memakai script yang belum ada pada package.json sebagai command siap pakai.

## Rencana component/browser tests

Frontend tests

- Login memperoleh pre-login CSRF terlebih dahulu.
- Login memakai mutation dan menggunakan CSRF baru dari response.
- Refresh mengambil /auth/me dan tetap mengenali session.
- Operator tidak melihat kontrol user management atau create product.
- Backend tetap menolak akses langsung yang tidak berizin.
- Receiving mutation menginvalidasi query yang benar.
- Mutation pending mencegah submit ganda dari UI.
- Tidak ada optimistic stock increment.
- Response hilang setelah commit tetap menghasilkan pending operation.
- Reload dan login ulang mempertahankan key serta payload operation tersebut.
- Replay menghasilkan stok tetap, bukan bertambah dua kali.
- Refetch failure setelah successful receipt tidak memicu receipt baru.
- Pergantian user tidak menampilkan query cache user sebelumnya.
- Tambahkan coverage loading/empty/validation/pending/error, operator UI, keyboard/accessibility, preview build dan integrasi API sesuai kontrak.


Seluruh tes fitur auth/CSRF/limiter/receiving/user management dan business browser flow tetap **NOT_RUN**; Task 3 belum dimulai. Rencana frontend RTL/Playwright bukan bukti script test sudah tersedia. Database/balance/concurrency adalah enforcement backend; frontend memverifikasi behavior konsumen melalui kontrak, bukan memalsukan SQL proof.

## Status pekerjaan dokumentasi saat ini

Hanya pemeriksaan statis dokumentasi: referensi lokal, 87 ID requirement, hash snapshot sumber, kesamaan kontrak dan konteks arsip yang diperiksa. Typecheck/build/unit/integration/browser/DB/deployment **NOT_RUN** pada pekerjaan ini; PASS terdahulu tetap historis. Hasil pemeriksaan statis baru dicatat terpisah setelah command benar-benar dijalankan pada [evidence dokumentasi](evidence/documentation-check.json).

## Cara mencatat bukti selanjutnya

Catat Command, Environment, Date (Asia/Jakarta), Exit code, Observed output dan Requirement IDs. Jangan mengubah NOT_RUN menjadi PASS karena ada file tes atau salinan evidence. Jangan menghapus data/volume, menjalankan Git/GitHub atau menganggap artifact remote sudah sinkron tanpa perbandingan. Pertanyaan R-10/R-11/R-13 tetap dicatat pada spec-review.md sebelum behavior terdampak dikerjakan.

## Hasil aktual pemeriksaan dokumentasi mandiri

Pada 2026-10-29, `python docs/validation/check-docs.py` dijalankan dari root repository ini dan exit 0: 87 ID source/PRD/mapping konsisten, 13 Markdown aktif diperiksa, semua target link lokal tetap di dalam repository, 39 hash arsip cocok, hash kontrak cocok dan inventaris API Markdown/OpenAPI sama-sama 20 operasi. Perbandingan tambahan replika frontend dengan artefak backend lokal juga exit 0; ini bukan pemeriksaan freshness remote GitHub.

Metadata kontrak aktif kini memperjelas bahwa hanya health fondasi tersedia; endpoint auth/bisnis tetap rencana. File root/snapshot asli tidak diubah. Pemeriksaan di atas bersifat statis, bukan validator penuh schema OpenAPI atau bukti server/client berjalan. Validator schema, unit/integration/build/browser/deployment baru pada pekerjaan ini tetap NOT_RUN. Tidak ada perintah Git/GitHub, penghapusan data atau Task 3 yang dijalankan.


## Bukti aktual Task 6

Tanggal 2026-10-29 (Asia/Jakarta). Task 6 diimplementasikan pada frontend mandiri; kelanjutan setelah usage limit hanya mengaudit hasil/kode aktual, menjalankan verifikasi final berurutan dan menyelesaikan dokumentasi. Tidak memulai ulang atau mengganti implementasi yang sudah benar. Task 2A beserta arsip/screenshot lama tetap historis dan tidak ditimpa.

### Pemeriksaan sebelum melanjutkan

Proses diperiksa sebelum tes: hanya Vite yang masih aktif; tidak ada Playwright/Vitest/backend tes lama. Laporan sebelumnya tersedia dengan 13 component tests dan 10 browser tests lulus. File aktual sudah memuat cache reset saat current-user menemukan identitas lain, ref guard submit, mobile min-width fix dan readiness polling 300 percobaan. Tidak ada perubahan kode aplikasi yang diperlukan pada kelanjutan ini.

Audit backend read-only dilakukan sebelum E2E final: README, package.json, paths/load-env/env validation/Prisma config dan metadata aman env Task 2-5. [Audit environment lengkap](environment.md) membedakan local default env/.env (BELUM ADA), template, serta file tes. Pemilihan bukan berdasarkan nomor terbaru. env/.env.task5 dipakai karena DB _test, origin, target layanan dan seed tersedia/valid; Docker PostgreSQL/Redis target healthy dan env:check lulus. Ini penggunaan kembali database tes Task 5 untuk fixture disposable Task 6, bukan database kosong baru atau data development.

Tidak mencetak password/token/secret/URL bercredential, tidak mengedit file backend atau konfigurasi parent, tidak menjalankan Git/GitHub, tidak menghapus data/volume. Snapshot source/config/docs/environment backend sebelum/sesudah final E2E cocok; node_modules/dist/generated/cache/metadata Git bukan target snapshot. Runtime/backend hasil build hanya dibaca/dijalankan; tidak melakukan build/migrate/seed backend pada Task 6.

### Environment dan isolasi aktual

Frontend Node 24.12.0/npm installer 11.6.2, React/DOM 19.3.1, HeroUI 3.2.6, Tailwind 4.3.3, Query 5.105.0 dan Vite 7.3.7 dipertahankan. Tooling tes dev exact: Vitest 4.1.12, RTL 16.3.3, jsdom 26.1.0 dan Playwright 1.64.1. Strict/skipLibCheck=false dan pengecualian optional-property Task 2A tetap.

Vite localhost:5173 proxy ke loopback API 3306. External backend dibangun pada Task 5; fixture menjalankannya per kasus memakai file env yang diaudit, dengan override process-only PORT=3306 dan REDIS_NAMESPACE=wrs:test:task6:<UUID per kasus>. Production limiter tidak diubah/dinonaktifkan; tidak FLUSHALL. PostgreSQL 17.11/Redis 8.2.11 nyata pada project wrs-task5-bc403960, database wrs_task5_bc403960_test, host ports 55442/56392. Akun/data disposable dibuat lewat API, bukan SQL fixture/reset. Backend child hanya milik fixture dan dihentikan setelah kasus; jangan menjalankan backend manual pada port 3306 bersamaan.

Browser aktual: installed Google Chrome, channel chrome; executable version yang diaudit 156.0.8078.73. Desktop viewport 1440x1000 dan mobile emulation 390x844 (Chromium dengan touch/mobile flags); bukan Safari/iPhone/device fisik. Worker 1, retries 0; seluruh kasus serial. Trace network dimatikan agar credential/token tidak dipersist ke artefak trace. Screenshot katalog tidak memuat credential.

### Perintah dan hasil final

Seluruh command frontend dijalankan dari root frontend memakai binary lokal, bukan node_modules/config parent. Urutan final: audit/proses/env/health, lint, typecheck, component tests, build, lalu browser setup/readiness dan business actions. Tidak ada tes yang ditumpuk dengan build.

| Command aktual | Hasil final |
| --- | --- |
| Pemeriksaan proses Node (read-only) | Tidak ada tes/backend tes lama; hanya Vite aktif sebelum final |
| docker info dan docker compose --env-file env/.env.task5 ps (cwd backend, read-only) | PASS exit 0; engine 29.8.0, postgres/redis healthy |
| BACKEND_ENV_FILE eksplisit + node node_modules/tsx/dist/cli.mjs src/config/check-env.ts (cwd backend) | PASS exit 0, Environment configuration is valid; tidak mencetak nilai |
| node node_modules/eslint/bin/eslint.js . | PASS exit 0 |
| node node_modules/typescript/bin/tsc --noEmit | PASS exit 0 |
| node node_modules/vitest/vitest.mjs run --reporter=default --reporter=json --outputFile=docs/evidence/task6-component.json | PASS exit 0, 4 file / 13 tes, final 5.46 detik |
| node node_modules/vite/bin/vite.js build | PASS exit 0, final 4.33 detik; typecheck telah dijalankan terpisah sebelumnya |
| node node_modules/@playwright/test/cli.js test | PASS exit 0, 10/10, 31.0 detik, 5 skenario x desktop/mobile, 0 skipped/0 flaky |
| Readiness fixture sebelum setiap browser case | PASS, backend /health/ready nyata lewat proxy sebelum tindakan tes |
| python docs/validation/check-docs.py dengan --contract-source menunjuk artefak backend lokal | PASS exit 0; 87 IDs, 39 archive hashes, 20 operasi, hash dan ketiga artefak kontrak konsisten; bukan remote freshness |
| Snapshot backend source/config/docs/env setelah E2E | PASS, identik dengan baseline read-only sebelum final |
| Audit evidence JSON terhadap nilai secret yang dipakai | PASS, nilai secret yang diaudit tidak ditemukan pada artefak Task 6 |

Runner menerima E2E_BACKEND_ENTRY dan E2E_BACKEND_ENV_FILE absolute serta credential seed melalui process environment lokal, tidak melalui VITE_* atau source. Credential tidak dicantumkan pada perintah publik. Template .env.e2e.example dan README mendokumentasikan variabel yang perlu disediakan pemilik. Script npm test:component/test:browser adalah alias binary di atas; lint/typecheck/build tersedia melalui npm scripts baseline pula.

Bukti baru: [component JSON](evidence/task6-component.json), [browser JSON](evidence/task6-browser.json), [ringkasan final](evidence/task6-verification.json), [desktop](evidence/task6-chrome-desktop.png), [mobile](evidence/task6-chrome-mobile.png). Screenshot diperiksa secara visual; mobile table scroll berada di panel dan body tidak melebar, juga diperiksa dengan assertion browser. UTF-8 source diperiksa: separator Unicode asli valid; tampilan mojibake Get-Content Windows bukan alasan mengubah source yang benar.

### Cakupan yang benar-benar lulus

| Area | Bukti |
| --- | --- |
| Login/reload/logout/CSRF | Browser login dengan pre-login token, server regeneration, mutation sesudah login diterima, current-user restore saat reload dan logout nyata. Unit bootstrap dedup, token memory baru, credentials same-origin dan redirect guard. |
| Role dan CRUD | Supervisor membuat produk dan user, membuka detail, mengubah status dan soft delete lewat UI/API nyata. Operator tidak melihat kontrol create product/user navigation; direct /users menampilkan forbidden. Backend tetap menegakkan role. |
| Form dan feedback | Loading/empty/error/success, field validation, code-point/password rules, unknown response decoder, no double-submit sebelum pending render, navigasi keyboard dan responsive UI. Browser menolak input receipt 101 saat remaining 100 di sisi client sebelum send; ini bukan bukti baru server OVER_RECEIPT (bukti backend Task 4 tetap historis). |
| Receiving/stock/history | Receiving dibuat melalui UI expected 100, receive 40 lalu 60, status PARTIAL/COMPLETED, stok 100 dan history +40/+60 nyata. Double-click receipt menghasilkan satu request, tanpa optimistic increment. |
| Targeted invalidation | Component hook memeriksa receivings/inventory/history keys, tidak mengubah saldo cache secara optimistis. Browser melihat detail/inventory/history sesudah mutation. Mutation retry false. |
| Commit dengan respons hilang | Interceptor route.fetch benar-benar menerima 201 dari backend sebelum respons dibatalkan ke browser. Pending tersimpan; navigasi, reload dan real server logout/reauth user sama mempertahankannya. Retry key/payload identik menerima 200 dan receipt ID asli. History backend tepat satu transaksi quantity 100, bukan pertambahan kedua. |
| Post-commit refetch failure | Receipt 201 diterima, detail GET sengaja 503. Pending dihapus karena commit terkonfirmasi, UI tetap menyatakan sukses dengan refresh warning, tombol operasi baru disabled. Muat ulang data hanya GET, request receipt tetap satu. |
| Isolasi user/cache | Logout membersihkan query dan token memory namun mempertahankan pending actor A. User B tidak melihat cache/users page atau pending A dan tidak otomatis POST receipt A. Kembali sebagai A memulihkan pending. Respons lama ditahan/dibatalkan saat pergantian user; unit juga membuktikan epoch guard menolak late response yang mengabaikan abort. |
| Perubahan identitas via current-user | Component test me mengembalikan user B setelah A; cache privat A dihapus walaupun perubahan tidak melalui tombol login UI. |
| Pending data safety | SessionStorage hanya version/actor/doc/key/payload/timestamp; tidak password/SID/CSRF. Operasi unresolved tidak dioverwrite dan storage korup tidak ditimpa dengan key baru. |

### Riwayat percobaan dan perbaikan

- jsdom 30.1.3 ditolak engine-strict (memerlukan Node ^24.15.0 pada jalur Node 24, baseline 24.12.0). Dipilih jsdom 26.1.0; Node/npm dan stack aplikasi tidak diganti. Install akhir melaporkan 0 vulnerabilities. Peringatan deprecated whatwg-encoding/ESLint existing tidak disembunyikan.
- Typecheck tes sempat menemukan nama schema document menutupi global DOM; schema test dinamai documentSchema. Bukan perubahan kontrak.
- Run component awal 10 tes lulus; tambahan invalidation test sempat membaca observer sebelum notification TanStack selesai. Assertion memakai waitFor; versi final 13/13 lulus. Perubahan current-user/cache mempunyai regression test tersendiri.
- Suite browser awal berbagi limiter namespace dan terkena 429 pada login berulang. Diperbaiki dengan backend child/namespace unik per kasus, bukan menaikkan rate limit atau menghapus counter Redis. Deklarasi fixture juga disesuaikan dengan object-destructuring Playwright.
- Mobile sempat timeout karena grid/table intrinsic width memperlebar halaman. Panel min-w-0 dan grid-cols-1 memperbaiki overflow; screenshot dan assertion mobile final lulus.
- Startup readiness awal terlalu singkat saat verifikasi bersaing dengan build: dua kasus setup tidak siap. Readiness ditambah menjadi 300 polling dengan jeda 100ms dan verifikasi akhir berurutan. Tidak menjalankan proses tes paralel/bertumpuk untuk menutupi masalah.
- Perintah gabungan yang menunggu review izin otomatis sampai timeout **NOT_RUN / tidak dieksekusi**; bukan FAIL tes dan bukan PASS. Perintah dipecah, kemudian checks aktual dijalankan. Kelanjutan ini memeriksa proses/bukti yang masih tersedia sebelum final run baru.
- Build lulus dengan warning PURE annotations Zod yang dihapus Rollup serta JS chunk 651.25 kB (gzip 203.41 kB), CSS 428.66 kB (gzip 40.13 kB). Warning tidak disembunyikan; tidak mengklaim SLA/performance produksi. Playwright juga mencetak NO_COLOR/FORCE_COLOR warning yang tidak memengaruhi hasil.

### NOT_RUN dan batas kesiapan

- Task 7 deployment, nginx/TLS/public hosting, production load/stress/performance dan code-splitting tuning: NOT_RUN.
- Firefox/WebKit/Safari, device mobile fisik dan audit aksesibilitas menyeluruh: NOT_RUN. Chrome desktop/mobile emulation bukan klaim lintas browser.
- Fresh isolated npm ci pada kelanjutan final: NOT_RUN; local dependency install/lock/typecheck/build sudah diverifikasi, bukti persiapan repository tetap historis.
- Full schema validator OpenAPI baru pada Task 6: NOT_RUN karena pasangan kontrak tidak diubah dan byte-identik backend; checker/hash/operation comparison lulus, validator backend Task 5 tetap bukti asal.
- Mematikan server PostgreSQL/Redis secara fisik, multi-process stress dan property/fuzzing menyeluruh: NOT_RUN. Task 6 menguji protokol UI dengan backend nyata; tidak mengklaim ulang seluruh SQL proof Task 4/5.
- Backend default local env/.env belum tersedia; audit tidak membuat/mengubahnya. Jalur manual default memerlukan konfigurasi pemilik. Ini tidak menghalangi E2E pada DB tes yang telah diaudit.

Task 6 selesai sesuai scope. Tidak ada blocker fungsional yang ditemukan untuk pembahasan Task 7, tetapi deployment tidak dimulai. Pemilik perlu menyediakan environment development/production yang sesuai dan mengevaluasi build/performance warnings sebelum deployment. Kontrak frontend tetap identik backend, tidak perlu perubahan backend untuk menyesuaikan UI. Seluruh Git/GitHub tetap manual pemilik.
