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


## Task 7 ? verifikasi Docker lokal

Tanggal: 2026-10-29, Windows Docker Desktop/Linux containers, Chrome desktop dan mobile emulation. Project baru **wrs-task7-3d9e72b6**, database **wrs_task7_3d9e72b6_test**, origin **http://localhost:18080**, env privat **deploy/.env.verification di backend**. Project/volume dicek belum ada sebelum up. Tidak menghapus/mereset data, volume atau container existing. Tidak menjalankan Git/GitHub. Bukti Task 2?6 di atas tetap sejarah, termasuk NOT_RUN pada tanggal/cakupan asal; bukan hasil ulang Task 7.

### Hasil aktual terbaru

| Pemeriksaan / command | Exit | Hasil |
| --- | --- | --- |
| Backend npm run lint / typecheck / build pada host; prisma:validate / prisma:generate | 0 | PASS; generate offline dengan Prisma 7.10.1. |
| Frontend npm run lint / typecheck / build; npm run test:component pada host | 0 | PASS; 13 component tests. Host memakai dependency Windows existing. |
| docker compose -f deploy/compose.yaml --env-file deploy/.env.verification build | 0 | PASS API + migrate + web; npm ci lock akhir pada Linux; offline Prisma generate/TypeScript/Vite production build. |
| docker build --target verification untuk kedua checkout | 0 | PASS lint/typecheck Linux dari dependency lock akhir. |
| Backend Linux vitest run, RUN_FOUNDATION_INTEGRATION=true, PostgreSQL/Redis nyata | 0 | PASS **75/75**, 0 skipped/failed; evidence/task7-tests-linux.json. Termasuk 4 boundary tests baru, jadi hasil ini menggantikan suite host 71 sebelum penambahan tes. |
| Frontend Linux vitest run | 0 | PASS **13/13**, 0 skipped/failed; evidence/task7-component-linux.json. |
| docker compose ... up -d --wait pada DB/volume kosong baru | 0 | PASS migrate exit 0 sebelum API start, semua long-running services healthy; evidence/task7-clean-start.json. |
| node scripts/verify-deployment.mjs deploy/.env.verification dari backend | 0 | PASS **14/14** pemeriksaan; evidence/task7-operational.json. |
| node node_modules/@playwright/test/cli.js test dari frontend, E2E_RUNTIME=docker | 0 | PASS **10/10**, expected 10/unexpected 0/skipped 0/flaky 0, tanpa retry, 82.09 detik; evidence/task7-browser.json. |
| OpenAPI validator Python openapi-spec-validator 0.7.2 terhadap kontrak kedua checkout | 0 | PASS; schema-valid, 20 operation; bukti task7-verification.json. |
| python docs/validation/check-docs.py pada masing-masing checkout; frontend --contract-source menunjuk artifact backend eksplisit | 0 | PASS 87 ID, archive/source hashes, local links, manifest dan 20 operation; task7-documentation-check.json. |
| Review final 87 ID dan byte equality source/contract pair | 0 | PASS untuk kelengkapan review/konsistensi, bukan PASS seluruh kemungkinan behavior; final-review.md merinci bukti parsial. |

Hasil Linux adalah final untuk lockfile frontend yang diperbaiki. File task7-tests.json (71 host) / task7-component.json (13 host) tetap mempunyai konteks asal; tidak diubah menjadi run Linux. Salinan evidence lintas repo identik, berasal dari aplikasi masing-masing, bukan pengujian baru.

### Cakupan runtime Docker

Gateway menyajikan static JS dan deep route HTML; proxy API/health mempertahankan path. Local HTTP cookie HttpOnly/SameSite=Lax/Path=/ host-only, CSRF dan reload auth berfungsi. Browser menguji supervisor product/user create/detail/update/delete, operator access restriction, receiving 100 ? 40 ? 60 dan inventory/history, replay receipt setelah respons commit hilang, refetch failure setelah commit, dan cache/pending isolation antar-user. Desktop/mobile screenshot terbaru sudah diperiksa: evidence/task7-chrome-desktop.png dan task7-chrome-mobile.png. Chrome mobile emulation bukan perangkat fisik.

Operational script membandingkan fingerprint akun/hash/migration history sebelum-sesudah migrate+seed ulang (nilai hash password tidak dicetak), restart API dengan session lama tetap valid, stop Redis ? live 200/ready dan protected route 503 ? Redis start/pulih otomatis tanpa fallback, stop PostgreSQL ? ready 503 ? start/pulih dengan marker data tetap ada, SIGTERM API ? shutdown completed/exit 0/listener tutup, lalu gateway restart/session tetap valid. Tidak mematikan dependency project lama. Audit log/image history/frontend bundle tidak menemukan nilai secret/session/token aktual dari flow itu. Ini tidak membuktikan semua kombinasi error sudah difuzz. API uid 1000 dan nginx uid 101; hanya web dipublish loopback 18080, DB/Redis/API tidak dipublish.

Fixture Docker merecreate API saja dengan namespace Redis unik per kasus, satu worker, readiness wait berurutan. Rate limiter produksi tidak diubah, tidak memakai FLUSHALL. Sesudah tes, project Task 7 tetap tersedia dengan data tes; tidak dibersihkan dengan penghapusan volume.

### Command rerun

Dari backend, dengan file env khusus project tes baru dan Docker aktif:

```powershell
docker compose -f deploy/compose.yaml --env-file deploy/.env.verification build
docker compose -f deploy/compose.yaml --env-file deploy/.env.verification up -d --wait
node scripts/verify-deployment.mjs deploy/.env.verification
docker build --target verification -t wrs-backend-check:local .
# Ganti nama project pada --network dengan project tes yang dipilih.
docker run --rm --network wrs-task7-3d9e72b6_data --env-file deploy/.env.verification -e NODE_ENV=test -e RUN_FOUNDATION_INTEGRATION=true -e REDIS_NAMESPACE=wrs:test:task7:linux wrs-backend-check:local node node_modules/vitest/vitest.mjs run
npm run prisma:validate
npm run prisma:generate
```

Run aktual Linux menggunakan tag project `wrs-task7-3d9e72b6-backend-check:local` / `wrs-task7-3d9e72b6-frontend-check:local` dan reporter JSON ke /evidence yang dimount dari docs/evidence aplikasi terkait. Tag contoh rerun di atas dapat dipilih sendiri; source stage sama. Jalankan command secara berurutan. Dari frontend:

```powershell
docker build --target verification -t wrs-frontend-check:local .
docker run --rm wrs-frontend-check:local node node_modules/vitest/vitest.mjs run
# Path berikut dipilih pemilik ke checkout backend, bukan asumsi parent otomatis.
$task7Backend = 'D:\path\to\backend-checkout'
$task7Values = @{}
Get-Content -LiteralPath (Join-Path $task7Backend 'deploy/.env.verification') | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') { $task7Values[$matches[1]] = $matches[2] }
}
$env:E2E_RUNTIME = 'docker'
$env:E2E_BASE_URL = $task7Values['APP_ORIGIN']
$env:E2E_COMPOSE_FILE = Join-Path $task7Backend 'deploy/compose.yaml'
$env:E2E_COMPOSE_ENV = Join-Path $task7Backend 'deploy/.env.verification'
$env:E2E_COMPOSE_PROJECT = $task7Values['COMPOSE_PROJECT_NAME']
$env:E2E_SEED_EMAIL = $task7Values['SEED_SUPERVISOR_EMAIL']
$env:E2E_SEED_PASSWORD = $task7Values['SEED_SUPERVISOR_PASSWORD']
node node_modules/@playwright/test/cli.js test
Remove-Item Env:E2E_SEED_PASSWORD
$task7Values.Clear()
```

Diperlukan `npm ci` frontend dan Chrome lokal sebelum browser tests. Credential hanya dibaca ke process environment, tidak dicetak. Suite menambah data disposable; gunakan project khusus. Command browser menulis evidence/task7-browser.json; simpan bukti lama dahulu bila ingin mempertahankan setiap run.

Validator docs (stdlib) dijalankan dari masing-masing root `python docs/validation/check-docs.py`; frontend dapat menerima `--contract-source` path absolut folder docs backend. Validator schema menggunakan tool terisolasi, tidak menambah application dependency:

```powershell
python -m pip install --target .cache/doc-tools -r docs/validation/requirements.txt
$env:PYTHONPATH = (Resolve-Path .cache/doc-tools).Path
python -m openapi_spec_validator docs/openapi.yaml
```

Actual Task 7 memakai cache validator backend untuk memvalidasi kedua artifact dengan path eksplisit. Tidak mengasumsikan cache backend tersedia di repository frontend mandiri; command instalasi di atas berlaku lokal masing-masing.

### Riwayat masalah dan perbaikan Task 7

- Docker npm ci frontend pertama benar-benar gagal EUSAGE: metadata optional bundled Tailwind oxide-wasm32-wasi tidak lengkap, missing @emnapi/wasi-threads 1.2.3. Repair package-lock-only biasa tidak menyelesaikannya. Satu percobaan copy lock dari cwd salah gagal FileNotFound dan build ulang masih memakai lock lama; ini masalah tooling/path, bukan kegagalan business tests.
- Lock dibuat ulang dari manifest exact pada Linux Node 24.12.0/npm 11.6.2. Dry-run lalu Docker npm ci/build dan verification suite Linux final lulus. Tidak mengubah direct dependency, tidak memakai force/legacy-peer-deps. Detail path transitive/hoisting di evidence/task7-lock-repair.json.
- Base image slim diperiksa dan belum memiliki OpenSSL/libssl; ditambahkan openssl/ca-certificates sebelum deployment. Ini tindakan persiapan, bukan klaim migration pernah gagal.
- Redis reconnectStrategy=false sebelumnya tidak memulihkan koneksi otomatis. Keputusan dicatat sebelum perubahan; backoff maksimum 2 detik, connect timeout 3 detik, disableOfflineQueue dan dependency readiness/fail-closed dipertahankan. Stop/start Redis nyata kemudian lulus.
- Warning pg 8.23.1 query-in-flight internal Prisma adapter serta Vite Zod PURE annotation/chunk JS sekitar 651 kB tetap terlihat. Tidak disembunyikan atau dinyatakan selesai; build/test lulus, SLA performance tidak diuji.
- Perintah yang tidak dieksekusi karena approval timeout pada Task 6 tetap NOT_RUN, bukan tes gagal atau PASS Task 7. Docker browser Task 7 menghasilkan report lengkap; proses lama sudah selesai sebelum pencatatan final, tidak dijalankan bertumpuk.

### NOT_RUN / keterbatasan terbaru

HTTPS/TLS/cookie browser HTTPS, VPS/domain/public hosting, Firefox/WebKit/Safari, device mobile fisik, production load/stress/performance SLA, exhaustive fuzzing dan accessibility audit menyeluruh: **NOT_RUN**. Tiga requirement mempunyai bukti parsial pada final-review.md; tidak dinyatakan PASS menyeluruh. Ini tidak menghalangi penyelesaian deployment Docker lokal, tetapi bukan clearance production publik. Tidak mengubah PROJECT_SPEC.md, applied migrations, prior task evidence atau metadata Git.

Pemeriksaan integritas review tambahan: `python docs/validation/check-final-review.py` pada kedua repository, exit 0, PASS 87 ID unik; 78 VERIFIED + 6 VERIFIED_STATIC + 3 IMPLEMENTED_PARTIALLY_VERIFIED. Memeriksa report 75/13/10/14 dan hash source; tidak menjalankan ulang tes aplikasi. Bukti: evidence/task7-review-check.json dan ringkasan evidence/task7-verification.json.


## Development laptop ? 2026-10-29

Environment baru backend env/.env; project wrs-development-laptop, database warehouse_development (bukan _test), Redis namespace wrs:dev:laptop, port PG55450/Redis56400. Existing env files dipastikan tidak berubah. Database baru terbukti 0 tabel sebelum migration/seed; keduanya exit 0. Secret acak hanya file ignored. Backend npm dev tsx watch port3000 dan Vite npm dev port5174 berhasil startup, tetap RUNNING. Command final memakai npx --workspaces=false --yes --package=npm@11.6.2 npm --workspaces=false; parent workspace tidak diubah. Detail command dan akun seed lokal pada README bagian Development laptop.

Chrome real browser smoke: backend ready 200, proxy ready 200, supervisor login/reload/logout dan operator login/reload/logout PASS, cookie HttpOnly true/Secure false. Report docs/evidence/development-verification.json berasal dari frontend browser runner; backend menyimpan salinan identik. Tidak menulis credential, cookie atau token ke report.

Percobaan awal npm offline tidak dieksekusi karena ENOTCACHED (tool preparation, bukan kegagalan aplikasi); npm pinned kemudian tersedia melalui npx online. Get-NetTCPConnection ditolak sandbox, port diperiksa melalui netstat/Docker listing. Command dengan hanya inner --workspaces=false masih warning; kedua flags menghilangkannya. Tidak mengubah parent, dependency aplikasi, schema, database/volume/container existing atau Git metadata. Full regression lint/typecheck/build/unit/E2E suite ulang: NOT_RUN untuk perubahan env/docs ini; bukti Task 7 tetap berlaku pada konteks sebelumnya, bukan diklaim run baru.

Checker dokumentasi dijalankan ulang: python docs/validation/check-docs.py pada masing-masing repository (frontend dengan --contract-source backend docs eksplisit), exit 0 PASS 87 ID/20 operasi/archive dan contract hashes. Rule checker disesuaikan agar menerima --workspaces=false yang menonaktifkan workspace; perintah yang bergantung workspace tetap ditolak. Bukti Task 7 tersimpan terpisah, tidak ditimpa.


## Startup development satu command ? 2026-10-29

Panduan aktif development.md. Kedua npm run dev baru berhasil tanpa flag/workspace warning: backend sekali setup Docker/migrate/seed lalu watcher3000, frontend localhost5175 strictPort proxy127.0.0.1:3000. Proses lama yang telah dipastikan milik Warehouse dihentikan: PID16396/26852(Vite),26940(watcher). Tidak menghentikan portfolio atau container/runtime Task7.

PASS lint/typecheck/build kedua aplikasi (exit0), backend19 unit tests termasuk3 development guards dan frontend13 components. Browser Chrome supervisor/operator: me401 sebelum login, bootstrap CSRF200, login200 dengan Origin5175, me200, reload tetap login, logout lalu me401, nol API500. Negative HTTP: missingCSRF403/wrongOrigin403. Negative startup (expected exit1): backend port3000 occupied, frontend5175 occupied, inherited REDIS_NAMESPACE tes dan API_PROXY_TARGET3306 ditolak. Source touch restart API tanpa mengulang setup.

Percobaan awal frontend build dan backend Vitest gagal startup tool akibat spawn EPERM sandbox, belum menjalankan assertions; rerun dengan izin subprocess yang sesuai PASS. Warning Zod PURE dan chunk651kB tetap existing, bukan disembunyikan. npm global10.4.0 berhasil dispatch npm run dev, baseline packageManager/lock11.6.2 tidak berubah. Environment credential existing dipertahankan; origin saja diselaraskan5175. Root workspaces registration dilepas minimal agar plain npm membaca config repository; root aggregate scripts memakai --prefix.

Bukti baru development-startup-browser.json, development-startup-security.json dan backend development-startup-unit.json; bukti development-verification/Task2?7 lama tetap disimpan. Negative Docker engine mati/dependency awal berhenti, full SQL integration/concurrency ulang, Firefox/WebKit/device fisik NOT_RUN. Test security/browser menggunakan database development hanya untuk login/session, tidak menjalankan destructive fixture atau full integration suite di sana.

Final checks: IPv4/IPv6 backend socket entries share one API PID26748; Vite PID12160 binds ::1:5175 (localhost). No5173/5174 listeners. Final HTTP /200, /health/ready200, /api/v1/auth/me401. python docs/validation/check-docs.py both exit0 PASS87 IDs/20 ops/contracts/archive; frontend compared explicit backend artifact. Aggregate evidence development-startup-verification.json, watcher source restart verified without preparation repeat. Runtime Task7 remains healthy.


## Penyempurnaan setelah Task 7: edit produk ? 2026-10-30

Scope baru diizinkan pengguna: supervisor PATCH SKU/name saja. BR-P06 diperluas di PRD; tidak menambah delete/archive/active status, dependency, schema atau migration. Riwayat membaca label produk terkini melalui relasi product; receipt tetap DTO historis ID/quantity, tanpa snapshot label baru. Mapper DTO produk existing digunakan kembali.

### Environment dan hasil aktual

Project tes baru **wrs-product-edit-5fe0384e**, database **wrs_edit_5fe0384e_test**, PostgreSQL host127.0.0.1:55470, Redis host127.0.0.1:56420; namespace dasar **wrs:test:productedit:5fe0384e**. File privat backend env/.env.product-edit dibuat dari env/.env.example dengan random credentials; file development/deployment/tes lama tidak diganti. Browser fixture menjalankan built API3310 dengan namespace unik per kasus (prefix fixture wrs:test:task6:UUID) dan Vite localhost5176 --mode test. Tidak melonggarkan limiter produksi. Unit/integration dijalankan selesai sebelum browser final pada database sama, tidak bertumpuk dengan fixture lain.

| Command / pemeriksaan | Exit | Aktual |
| --- | --- | --- |
| docker info; docker compose --env-file env/.env.product-edit up -d --wait postgres redis (backend) | 0 | Docker Engine29.8.0; project/volume baru, dependency healthy. |
| BACKEND_ENV_FILE target tes + RUN_FOUNDATION_INTEGRATION=true, npm run verify:database; npm run db:seed | 0 | DB public schema kosong terbukti, migration pertama dan deploy ulang identik, seed berhasil. |
| npm run lint; npm run typecheck; npm run build (masing-masing repository) | 0 | PASS strict types, generate Prisma7.10.1 offline dan production build. |
| npm run test:unit -- --reporter=default --reporter=json --outputFile=docs/evidence/product-edit-unit.json (backend) | 0 | **19/19 PASS**,0 skip/fail. |
| npm run test:integration -- --reporter=default --reporter=json --outputFile=docs/evidence/product-edit-integration.json (backend dengan env tes eksplisit) | 0 | **63/63 PASS**,0 skip/fail, PostgreSQL/Redis nyata; termasuk4 test edit baru dan seluruh auth/users/receiving/foundation. |
| npm run test:component -- --reporter=default --reporter=json --outputFile=docs/evidence/product-edit-components.json (frontend) | 0 | **17/17 PASS**,0 skip/fail;4 test form edit baru. |
| npm run dev -- --mode test --port 5176 (frontend, API_PROXY_TARGET=http://127.0.0.1:3310) | RUNNING selama suite | Vite fixture siap; dihentikan setelah suite. |
| npm run test:browser (frontend dengan E2E environment di bawah) | 0 | **12/12 PASS**,0 skipped/flaky/retry,40.65s;2 browser edit baru desktop/mobile +10 regression existing. |
| Python openapi_spec_validator0.7.2 terhadap backend dan frontend docs/openapi.yaml | 0 | Kedua schema valid. |
| python docs/validation/check-docs.py (kedua repo; frontend --contract-source explicit backend docs) | 0 | 87ID existing,21 operasi, links/archive/source/manifest hashes dan byte-equal contract pair. |

Perintah di atas adalah eksekusi aktual; blok berikut hanya bentuk rerun setelah menyediakan env tes sendiri. Dari backend: set BACKEND_ENV_FILE ke path absolut env khusus `_test`, RUN_FOUNDATION_INTEGRATION=true, lakukan Compose/verify:database (hanya schema kosong)/seed/build, kemudian unit/integration. Jangan menjalankan verify:database pada DB yang sudah berisi tabel atau men-deploy ke development untuk tes. Template env/.env.example disertakan; file .env.product-edit lokal bukan prasyarat checkout orang lain.

Frontend runner memakai E2E_BACKEND_ENTRY path absolut built dist/server.js, E2E_BACKEND_ENV_FILE path absolut file tes, E2E_BACKEND_PORT=3310, E2E_BASE_URL=http://localhost:5176, E2E_EVIDENCE_PREFIX=product-edit, serta E2E_SEED_EMAIL/PASSWORD dari file tes yang dibaca privat ke process env; E2E_RUNTIME unset (external). Fixture mengelola start/readiness/stop API per kasus. E2E_EVIDENCE_PREFIX opsional kini divalidasi filename-safe dan menjaga report/screenshot task lama tidak ditimpa; default task6/task7 tetap untuk command historis. Jangan memasukkan credential runner ke VITE_*. Semua Git/GitHub tetap manual pengguna.

### Bukti perilaku

- Supervisor normalize trim/uppercase SKU dan trim120 astral Unicode name; name-only/own SKU/no-op diterima. Anonymous dengan CSRF valid401, operator403, missing/invalidCSRF403. Invalid UUID/body kosong/null/extra field/unit/id/stock/name/sku invalid400, UUID tidak ada404 PRODUCT_NOT_FOUND.
- Duplicate SKU dengan name berbeda409 SKU_ALREADY_EXISTS tanpa perubahan row sebagian. Dua update produk berbeda ke satu SKU menghasilkan200/409, unique database tetap arbiternya. PATCH saat PostgreSQL unavailable503 melalui mapper existing.
- Produk yang sudah received penuh dapat diperbaiki pada ID/createdAt/unit sama. Snapshot DB header/items/receipt/ledger/balance sebelum-sesudah identik. Receipt lama replay200 dengan ID/body asli dan header replay; balance/counter/FK tetap, reconciliation seluruh dataset lulus.
- Inventory/history/detail mengembalikan label baru. Form supervisor prefill, Batal, validation, pending disabled, double-submit guard, API409 tampil dan nilai dipertahankan. Component membuktikan invalidate products/inventory/receivings/transactions termasuk inactive detail; browser mengunjungi kembali related pages dengan label baru/stok10 dan replay tanpa menggandakanstok.
- Operator tidak ditawari Edit pada component; backend tetap enforcement403. Existing browser tests partial40/full60, commit response hilang/retry, refetch failure sesudah commit dan isolasi cache/user semuanya tetap lulus.

### Percobaan awal (dipertahankan, bukan disembunyikan)

- Integration awal61/63 PASS,2 FAIL pada test baru: fixture `EDIT-`/`RACE-` +UUID36 menghasilkan41 karakter, ditolak400 sesuai max40 existing. Diperbaiki panjang suffix fixture, tidak melonggarkan requirement. Bukti product-edit-integration-initial.json.
- Run kedua62/63 PASS: API race sudah200/409, assertion count mencari SKU lowercase sebelum normalisasi sehingga0. Lookup tes diperbaiki ke uppercase; bukti product-edit-integration-second.json. Run final63/63 PASS.
- Browser awal10/12 PASS: dua test baru mencari exact text nama pada cell yang menampilkan `SKU ? nama`. Selector disesuaikan ke accessible cell/regex tanpa mengubah UI agar tes lulus. Bukti product-edit-browser-initial.json; run final12/12 PASS.
- Warning pg query-in-flight internal adapter, Vite Zod PURE annotation/chunk sekitar652kB, serta NO_COLOR/FORCE_COLOR browser tetap muncul; tidak diklaim selesai.

### Cleanup, sinkronisasi dan batas

Vite verifikasi PID23632 dihentikan setelah suite, fixture API3310 sudah berhenti, tidak ada listener3310/5176 tersisa. Dua dependency container project tes hanya stopped, volume/database/credential tetap dipertahankan. Tidak menghentikan aplikasi/project lain atau memakai prune/reset/Git.

Audit awal menemukan OpenAPI frontend tertinggal dari authority backend (metadata Task5 dan aturan beberapa endpoint); pasangan API Markdown/OpenAPI dan contract-version.json kini disalin identik dari backend setelah21 operasi divalidasi. Checker statis diperbarui dari20 menjadi21 operasi; bukti Task2?7 tetap mempunyai konteks20 operasi pada tanggal asal dan tidak ditimpa. File evidence B/E integration asal backend, component/browser asal frontend; salinan identik di repo pasangan untuk review bukan run baru.

Production Docker image build/deployment ulang untuk penyempurnaan ini, HTTPS/TLS publik, Firefox/WebKit/Safari, device fisik, load/stress/fuzz/accessibility audit menyeluruh: **NOT_RUN**. Tidak ada perubahan PROJECT_SPEC.md, .gitignore, applied migrations, model schema atau dependency/lockfile yang diperlukan oleh edit ini.

Validasi akhir checker kedua repo exit0 PASS87 ID/21 operasi/hash kontrak. Satu pemanggilan ulang schema validator sempat memakai path backend/.cache dari cwd backend (path ganda), sehingga tool tidak ditemukan; ini kesalahan path tool, bukan kegagalan schema. Command diperbaiki menjadi .cache/doc-tools dari cwd backend; validator kedua kontrak kembali exit0 OK. Docker ps memastikan hanya project tes baru stopped; listener3310/5176 tidak tersisa.


## Riwayat Edit Produk ? lanjutan setelah Task7 (2026-10-30)

Scope tambahan pengguna melanjutkan edit SKU/name existing: log permanen dan halaman khusus supervisor, bukan mengganti riwayat penerimaan/ledger. Keputusan PRD/technical-spec ditulis sebelum implementasi. Tidak menambah dependency/role, delete/archive produk, mutation log atau backfill edit masa lalu.

### Migration dan isolasi data

Memakai kembali project tes **wrs-product-edit-5fe0384e** (saat audit awal stopped), database **wrs_edit_5fe0384e_test**, host PostgreSQL127.0.0.1:55470 dan Redis127.0.0.1:56420. File env/.env.product-edit existing dipertahankan beserta credential. Tidak memakai/mengubah target development/deployment. Namespace dasar wrs:test:productedit:5fe0384e; browser fixture tetap membuat namespace unik per kasus untuk limiter tanpa melonggarkan produksi.

Migrasi forward baru **202610300002_product_edit_history**; model multi-file baru beserta relasi Product/User, indeks dan CHECK/FK. Fingerprint tujuh tabel existing (users/products/receivings/receiving_items/receipts/inventory_transactions/inventory_balances) sebelum-sesudah upgrade sama. Tabel log baru kosong setelah upgrade: tidak merekayasa edit terdahulu. Repeated deploy mempertahankan migration history. DB kosong baru **wrs_history_empty_720d76e6_test** dibuat dalam PostgreSQL tes yang sama untuk memverifikasi kedua migration dari nol dan deploy ulang. Database/volume tidak dihapus, initial migration dan PROJECT_SPEC.md hash tetap.

### Command dan hasil aktual

Semua tanggal hasil2026-10-30; command backend dari root backend, frontend dari root frontend.

| Pemeriksaan | Exit | Hasil |
| --- | --- | --- |
| docker compose --env-file env/.env.product-edit up -d --wait postgres redis | 0 | Dependency tes existing healthy; hanya project tes ini dijalankan. |
| node .cache/verify-history-migration.mjs | 0 | PASS6 checks: upgrade preserves all seven tables, no fake past logs, upgrade repeat, fresh empty schema, both migrations, fresh repeat. Script lokal ignored untuk audit eksekusi ini; bukan prasyarat checkout orang lain. |
| npm run prisma:validate; npm run prisma:generate (backend) | 0 | PASS Prisma7.10.1 multi-file schema dan generated client. |
| npm run lint; npm run typecheck; npm run build (backend) | 0 | PASS pada versi akhir termasuk readiness tabel log. |
| npm run lint; npm run typecheck; npm run build (frontend) | 0 | PASS pada versi akhir tombol/halaman history. |
| npm run test:unit -- --reporter=default --reporter=json --outputFile=docs/evidence/product-history-unit.json | 0 | **19/19 PASS**,0 skip/fail. |
| npm run test:integration -- --reporter=default --reporter=json --outputFile=docs/evidence/product-history-integration.json | 0 | **67/67 PASS**,0 skip/fail: auth19, receiving/products28, users13, foundation7. |
| npm run test:component -- --reporter=default --reporter=json --outputFile=docs/evidence/product-history-components.json | 0 | **20/20 PASS**,0 skip/fail;3 halaman history baru,4 form edit dan regresi security/cache. |
| npm run dev -- --mode test --port 5176, API_PROXY_TARGET=http://127.0.0.1:3310 (frontend) | RUNNING saat suite | Vite fixture terpisah; bukan development5175. |
| npm run test:browser dengan E2E vars di bawah | 0 | **14/14 PASS**,0 skipped/flaky/retry,46.9s, Chrome desktop/mobile. |
| python -m openapi_spec_validator terhadap kedua OpenAPI (isolated Python cache0.7.2) | 0 | Schema valid; kontrak/manifest byte-equal,22 API operations. |
| python docs/validation/check-docs.py kedua repo, frontend --contract-source backend docs eksplisit | 0 | PASS87ID existing/22ops, local links, archive/source/contract hashes. |

Integration process environment BACKEND_ENV_FILE=absolute env/.env.product-edit, RUN_FOUNDATION_INTEGRATION=true. Browser env: E2E_BACKEND_ENTRY=absolute built dist/server.js, E2E_BACKEND_ENV_FILE=absolute file tes, E2E_BACKEND_PORT=3310, E2E_BASE_URL=http://localhost:5176, E2E_EVIDENCE_PREFIX=product-history, E2E_SEED_EMAIL/PASSWORD dibaca privat ke process env dari credential disposable. E2E_RUNTIME unset (external), workers1/retries0. Persiapan/generate/build/integration selesai sebelum browser menggunakan DB yang sama; tidak ada test suite bertumpuk. Bukti product-history-* tidak menimpa product-edit-* atau Task2?7.

### Pembuktian aturan bisnis

- Authenticated supervisor PATCH memakai actorID req.user, actorName dari database server dan PostgreSQL clock_timestamp() saat INSERT. Client actorId/changedAt ditolak400. Satu event berisi kedua label before/after dan changedFields efektif saja. GET supervisor200, anonymous401/operator403, UUID/query invalid400/missing404, produk belum diedit200 empty page.
- No-op sesudah trim/uppercase tidak menulis product/log. Duplicate SKU409 dan invalid edit tidak log keberhasilan. Dua edit bersamaan pada produk sama terserialisasi oleh FOR UPDATE: before event kedua tepat after event pertama. Pagination1 item mengembalikan urutan waktuDESC/idDESC dan count konsisten.
- Atomic proof sengaja menyebabkan CHECK violation PostgreSQL SESUDAH UPDATE produk dan INSERT log; tes terlebih dahulu mengamati kedua write di transaction client. Rollback mengembalikan produk/log/balance/receiving/receipt/ledger seperti semula. Snapshot actorName tidak berubah setelah actor di-rename dan soft-delete; FK tetap, log terbaca.
- CHECK effective-change/SKU/name dan FK Product/User RESTRICT update/delete diverifikasi melalui catalog PostgreSQL. Readiness LIMIT0 turut membaca metadata tabel log; schema belum dimigrasi tidak dianggap ready.
- Component membuktikan loading/empty/error/retry, actor/before/after, event pagination, kembali ke produk, invalidasi cache productHistory terpisah dan operator tidak ditawari tombol. Halaman berada dalam Protected supervisor; backend tetap menegakkan role.
- Browser desktop/mobile membuka tombol Riwayat Edit ke /products/:id/history, identity/current label, empty state, melakukan edit melalui UI, menampilkan event yang benar, menambah total21 event dan pindah halaman2. Screenshot halaman mobile/desktop ditinjau; horizontal table scroll tetap di dalam panel tanpa overflow halaman. Operator direct route forbidden dan API403.
- History inventory tetap satu transaksi+10 untuk receipt test, tidak berisi21 edit. Receipt replay lama200 dengan DTO/id asli dan balance tetap10. Semua regresi product edit, partial40/full60, lost response/replay, refetch failure dan cache isolation tetap PASS.

### Riwayat percobaan dan keterbatasan

- Satu command prisma:validate awal dipanggil dari folder parent yang tidak mempunyai script tersebut: npm Missing script, pemeriksaan Prisma belum dieksekusi; command dari backend kemudian PASS. Tidak mengubah konfigurasi parent untuk menutupi kesalahan cwd.
- Typecheck awal menemukan mock atomic-failure mengembalikan Promise biasa sementara repository addHistory terinfer sebagai Prisma relation client. Repository dibuat async dengan return Promise row yang tepat; tidak memakai any/type suppression. Typecheck/build akhir PASS, integration final diulang PASS67.
- Tidak ada kegagalan assertion fitur pada integration/component/browser riwayat. Warning pg query-in-flight adapter existing, Vite Zod PURE/chunk sekitar654kB dan NO_COLOR/FORCE_COLOR tetap tercatat, bukan dianggap selesai.
- Production Docker image rebuild/deployment untuk tambahan ini, HTTPS publik, Firefox/WebKit/Safari, device mobile fisik, load/fuzz/accessibility menyeluruh dan automated Mermaid render **NOT_RUN**. ERD/data-flow direview statis terhadap model/transaction; tidak mengklaim render otomatis.
- Edit sebelum migrasi tidak dapat dibackfill tanpa mengarang nilai lama; UI empty wajar sampai perubahan efektif baru terjadi. Tidak ada update/delete log pada API; DBA tetap bertanggung jawab atas backup/operasi database di luar aplikasi.

### Cleanup/provenance

Fixture API3310 sudah berhenti; Vite tugas PID7780 dihentikan setelah suite. Project tes PostgreSQL/Redis dikembalikan ke stopped seperti awal, volume/database baru dan existing dipertahankan; tidak ada listener3310/5176 tersisa. Tidak menghentikan portfolio, development atau deployment lain, menjalankan Git, reset atau prune. Salinan evidence backend (unit/integration/migrations) dan frontend (component/browser/screenshots) di repo pasangan identik untuk review; salinan bukan run baru. Laporan product-edit awal tetap mempunyai scope tanpa model/migrasi saat itu; laporan lanjutan ini mencatat penambahan model/migrasi sekarang.


## Pilihan produk receiving tanpa pencarian ? 2026-10-30

Scope frontend CreateReceiving saja: input/label Cari produk untuk pilihan dan state/handler pencariannya dihapus. Query selector page/limit100, pagination dan known choices existing tetap. Field reference/quantity dan validator bisnis tidak berubah. ProductsWorkspace masih mempunyai pencarian dan API q tidak diubah. Backend source/config/schema/migration/dependency/credential tidak diubah.

### Hasil aktual

| Command dari root frontend | Exit | Hasil |
| --- | --- | --- |
| npm run lint | 0 | PASS final. |
| npm run typecheck | 0 | PASS final. |
| npm run build | 0 | PASS; existing Zod PURE/chunk sekitar654kB warning tetap muncul. |
| npm run test:component -- --reporter=default --reporter=json --outputFile=docs/evidence/receiving-choice-components.json | 0 | **23/23 PASS**,0 skipped/fail;3 test form baru. |
| npm run test:browser dengan E2E_EVIDENCE_PREFIX=receiving-choice | 0 | **16/16 PASS**,0 skipped/flaky/retry,59.84s, Chrome desktop/mobile;2 kasus baru +14 regression existing. |

Browser memakai built backend existing, PostgreSQL/Redis nyata project **wrs-product-edit-5fe0384e**, database **wrs_edit_5fe0384e_test**, host PostgreSQL55470/Redis56420, file private env/.env.product-edit yang sudah tersedia (tidak ditampilkan/diubah). Ini DB tes terpisah dari development/deployment. Namespace limiter unik tiap kasus dari fixture existing, limiter produksi tidak dilonggarkan. Vite fixture API_PROXY_TARGET=http://127.0.0.1:3310 dan `npm run dev -- --mode test --port 5176`; runner E2E_BACKEND_ENTRY/ENV_FILE path absolut built server.js/file tes, E2E_BACKEND_PORT3310, E2E_BASE_URL=http://localhost:5176, E2E_SEED_EMAIL/PASSWORD privat di process env, E2E_RUNTIME unset. Tidak memerlukan rebuild/migrasi backend pada pekerjaan frontend ini.

### Pembuktian

- Component memastikan label/input tidak ada, productsApi.list menerima page1/2+limit100 tanpa q, dan pilihan dari halaman awal bertahan ketika memilih produk dari halaman kedua (fixture total101).
- Component memverifikasi payload dua productId berbeda, quantity2 dan3 serta reference asli. Duplicate selection ditolak sebelum mutation; quantity0,-1,1.5,1000001 juga tidak mengirim request.
- Browser nyata memastikan katalog melampaui100 produk, memilih produk awal dan produk pada halaman berikutnya melalui dropdown/pagination, dan produk pertama tetap dipilih. Seluruh request selector tanpa q.
- Browser mencoba duplicate product dan quantity0: tidak ada POST receiving. Setelah koreksi, tepat1 POST membuat dokumen OPEN dengan2 item, expected2/3, received0, reference tetap dan kedua balance0. Tidak melakukan receipt atau mengubah stok untuk test ini.
- Seluruh regresi sebelumnya (edit/history produk, receiving partial/full, idempotent lost-response replay, post-commit refetch failure dan user/cache isolation) tetap lulus di desktop/mobile. Pencarian pada halaman produk lain dan q API tetap dipakai oleh regresi tersebut.

### Percobaan awal dan perbaikannya

- Lint awal menemukan helper pagination di-import tetapi pemanggilan lama belum diganti; pemanggilan tes diperbaiki. Typecheck awal menemukan opsi exact Playwright dipakai pada Testing Library findByRole; opsi tes diperbaiki sesuai API library, tanpa type suppression.
- Component pertama21/23 PASS,2 FAIL saat membuka Select karena jsdom tidak menyediakan CSS.escape. Ditambahkan shim CSS.escape khusus tests/setup.ts (hex-escaped DOM identifiers); actual HeroUI Select tetap diuji. Laporan awal receiving-choice-components-initial.json dipertahankan. Final23/23 PASS.
- Browser pertama14/16 PASS,2 FAIL pada selector label yang turut menemukan dialog/listbox yang sedang exiting. Helper dibatasi ke tombol Select dan menunggu listbox ditutup, tidak mengubah UI atau validation untuk meluluskan tes. Bukti receiving-choice-browser-initial.json disimpan. Final16/16 PASS.
- Suite lama history mempunyai path screenshot tetap. Screenshot rerun dipisahkan ke receiving-choice-page-*, dan screenshot historis frontend dipulihkan byte-identik dari salinan backend sebelumnya; screenshot helper kini menghormati optional E2E_EVIDENCE_PREFIX agar run mendatang tidak menimpa bukti lama. JSON Task2?7/product-edit/product-history tidak ditimpa.

### Cleanup dan NOT_RUN

Vite verifikasi PID29208 dihentikan; API3310 milik fixture sudah berhenti, tidak ada listener3310/5176 tersisa. PostgreSQL/Redis project tes dikembalikan ke stopped sesuai keadaan awal; data dan volume dipertahankan. **wrs-development-laptop-postgres-1 dan wrs-development-laptop-redis-1 tetap running healthy**, tidak disentuh. Tidak menghentikan runtime pengguna atau menjalankan Git/prune/reset.

Backend full integration ulang, OpenAPI schema validator ulang (kontrak tidak berubah; byte/hash equality diperiksa), Docker image/deployment ulang, browser selainChrome, perangkat fisik dan load/accessibility menyeluruh: **NOT_RUN** pada perubahan kecil ini. Bukti backend dan kontrak terdahulu tetap sesuai konteks asal, bukan dianggap run baru.


## Pagination katalog receiving5 data ? 2026-10-30

### Reproduksi dan akar masalah

Audit read-only PostgreSQL development warehouse_development: **products1, receivingDocuments3, receivingItems3**. Hitungan sama setelah selesai. Tidak ada listener API/frontend development pada snapshot audit; tidak mengklaim menangkap response browser development yang sedang aktif. Existing source query memanggil productsApi.list({page,limit:100}), total dari response.pagination.total (SQLCOUNT products), dengan TanStack key actor/epoch/products/list/filters. Jumlah rows form tidak masuk query maupun total.

Focused component reproduction pada source lama membuat11 item receiving dengan satu produk katalog: UI tetap Halaman1/1data dan Next disabled, request page1limit100. **1PASS/3skipped** karena -t memilih hanya reproduksi, bukan klaim suite penuh; report receiving-pagination-reproduction.json. Limit100 berarti halaman2 baru pada produk101, sehingga5/6/11 sebelumnya tetap satu halaman. Penambahan item/dokumen receiving tidak menambah product master.

Selain label ambigu, map known lama menggabungkan seluruh opsi halaman yang pernah dipilih. Perbaikan scoped: local limit5/ceil(total/5), label katalog terpisah dari jumlah receiving rows, pilihan tersimpan hanya dipin pada barisnya, opsi row lain tidak menawarkan produk yang sudah dipilih. Schema bisnis original tetap. Shared Pagination/API/default halaman lain tidak diubah.

### Command dan hasil aktual

| Command / pemeriksaan | Exit | Aktual |
| --- | --- | --- |
| npm run lint (frontend) | 0 | PASS final, termasuk browser tests yang diperbarui. |
| npm run typecheck (frontend) | 0 | PASS. |
| npm run build (frontend) | 0 | PASS; existing Zod PURE/chunk sekitar655kB warning tetap terlihat. |
| npm run test:component -- --reporter=default --reporter=json --outputFile=docs/evidence/receiving-pagination-components.json | 0 | **27/27 PASS**,0 skip/fail; batas5/6/11, navigation, form-state preservation dan duplicate/quantity guards. |
| npm run test:browser -- tests/browser/receiving-pagination.spec.ts --project=chrome-desktop | 0 | **1PASS**,0skipped/retry,7.2s; real API/PG dengan catalogue0 awal ->5 ->6 ->11. |
| Command boundary sama --project=chrome-mobile | 0 | **1PASS**,0skipped/retry,5.5s, database kosong terpisah. |
| npm run test:browser -- tests/browser/receiving-product-choice.spec.ts tests/browser/warehouse.spec.ts --grep 'creates a multi-product\|creates receiving through UI' | 0 | **4/4 PASS**,0skip/retry,15.2s: multi-item creation dan partial40/full60, desktop/mobile. Tanda pipe dalam arg grep adalah regex alternation; jangan menambahkan backslash saat menjalankan string PowerShell. |
| Audit hash216 file backend sebelum/sesudah (exclude generated/cache/build/dependencies) | 0 | Semua unchanged. Backend source/config/credential/contract/migrations tidak diubah. |
| Checker dokumentasi frontend terhadap artifact backend eksplisit | 0 | PASS87ID/22operasi/manifest dan byte equality; command dicatat terpisah dari tes runtime. |

### Sumber data API dan pembuktian batas

Component dataset5/6/11 memakai array nyata di fixture, dislice menurut filters.page/limit; menguji jumlah opsi pada tiap halaman, Next/Previous disabled, requestlimit5 serta halaman sebelumnya kembali. Total tidak diganti panjang current page atau banyak rows. Reproduksi versi baru dengan11rows dan1catalogueproduct menampilkan kedua hitungan secara terpisah.

Browser memakai database baru pada PostgreSQL project TES existing wrs-product-edit-5fe0384e: **wrs_pagination_desktop_fb9cb963_test** dan **wrs_pagination_mobile_22fa78a6_test**. Keduanya dimigrasi/seed secara terisolasi, tanpa reset atau menghapus data database lain. Credential berasal environment tes existing, tidak ditampilkan dan tidak mengganti file backend. Clone env tersimpan privat di frontend .cache/.env.pagination-desktop atau -mobile. Metadata preparation pada receiving-pagination-databases.json. Helper seed sempat gagal persiapan awal, PATH local node_modules/.bin diperbaiki lalu migrate/seed berhasil; bukan kegagalan business test. Database desktop yang telah dibuat dipakai ulang, tidak dihapus untuk menutupi masalah.

Runner menggunakan E2E_BACKEND_ENTRY absolute built backend/dist/server.js, E2E_BACKEND_ENV_FILE absolute clone env per-project, E2E_BACKEND_PORT3310, E2E_BASE_URL=http://localhost:5176, E2E_SEED_EMAIL/PASSWORD privat, E2E_RUNTIME unset. Vite test API_PROXY_TARGET=http://127.0.0.1:3310 dan npm run dev -- --mode test --port5176. E2E_EVIDENCE_PREFIX per-run receiving-pagination-desktop/mobile/regression menjaga bukti lama. Persiapan menggunakan source/backend build existing, bukan mengubah source dependency frontend.

Network browser membuktikan: total5/page1rows5/limit5 -> Nextdisabled; total6/page1rows5 danpage2rows1 ->dua halaman; total11/page2rows5 danpage3rows1 ->tiga halaman. UI endpoint tetap GET /api/v1/products?page=N&limit=5. Dropdown halaman baru tidak menyimpan opsi tak terpilih dari halaman sebelumnya. Pilihan PAGER01/PAGER06 tetap tampil pada row sendiri saatpage3, quantity2/3 tetap; produk yang sudah dipilih tidak ada pada dropdown row3. Pilih PAGER11 quantity4 lalu dokumen dibuat dengan3 productId berbeda dan reference sama. Screenshot desktop/mobile halaman3 sudah ditinjau.

Boundary spec membutuhkan catalogue kosong sendiri dan dijalankan terpisah per-project; guard akan SKIP/NOT_RUN pada database katalog nonempty, bukan menghapus data shared atau menyatakan PASS. Untuk rerun sediakan database tes BARU per-project dari template/isolated setup, jangan reset database bekas. Laporan di atas benar-benar berjalan pada kedua target kosong (guard tidak skip). Empat regresi dijalankan setelah boundary selesai dengan database desktop yang sudah terisi; fixture sendiri mengisolasi namespace limiter per kasus, tanpa melonggarkan limiter produksi.

Tes multi-item existing disesuaikan untuk mengambil produk pertama/keenam dan membandingkan stock sebelum/sesudah, agar tidak harus menyusuri ratusan halaman katalog fixture lama. Duplicate selection kini diuji tidak tersedia, bukan mencoba memilih opsi yang memang telah diblokir. Stock/receipt 40+60 tetap terverifikasi pada regresi terpisah.

### Percobaan awal dan batas

Component pertama25/27 PASS,2FAIL karena fixture label lama membawa separator encoding yang tidak cocok setelah refactor. Label SKU/name menggunakan Unicode escape eksplisit, fixture dinormalisasi; receiving-pagination-components-initial.json dipertahankan. Final27/27 PASS. Tidak melonggarkan validation atau memakai type suppression. Suite browser seluruh fitur dan backend full integration ulang **NOT_RUN** pada pekerjaan form ini; enam browser terpilih di atas PASS, jangan menyebut seluruh suite dijalankan. OpenAPI validator baru, Docker rebuild/deployment, browser selainChrome/device fisik/load/accessibility menyeluruh juga NOT_RUN.

Cleanup: API3310 fixture sudah berhenti; Vite verifikasi PID25068 dihentikan; dependency project TES dikembalikan stopped. Dua database baru dan semua volume/data dipertahankan. **wrs-development-laptop PostgreSQL/Redis tetap running healthy**. Count development terakhir sama1produk/3dokumen/3items. Tidak menjalankan Git/prune/reset. Seluruh proof Task2?7/product-edit/product-history/receiving-choice tetap disimpan.

## Pagination baris item receiving — 2026-10-30

Penyempurnaan frontend setelah Task7, terpisah dari pagination KATALOG pada bukti sebelumnya. Hanya CreateReceiving dan tes/dokumentasi terkait berubah. Pernyataan lama bahwa seluruh baris selalu ditampilkan adalah konteks versi sebelumnya; versi ini menampilkan5 baris per halaman. Kontrak/PRD bisnis, source backend, migrasi, dependency/lockfile dan PROJECT_SPEC.md tidak diubah.

### Perintah dan hasil aktual

Seluruh command aplikasi dijalankan dari root repository frontend, Node/npm dan dependency existing. Hasil final berlaku untuk kode terakhir setelah perbaikan mobile/error di bawah.

| Perintah | Exit | Hasil aktual |
| --- | --- | --- |
| `npm run lint` | 0 | PASS. |
| `npm run typecheck` | 0 | PASS, strict tetap. |
| `npm run build` | 0 | PASS,1952 modules; warning existing Zod PURE annotation dan chunk JS658.17kB (>500kB) tetap ada. |
| `npm run test:component -- --reporter=default --reporter=json --outputFile=docs/evidence/receiving-item-pages-components.json` | 0 | **34/34 PASS**,8 files,0skip/fail;7 kasus baru (termasuk empat boundary parameter). |
| `npm run test:browser -- tests/browser/receiving-item-pages.spec.ts tests/browser/receiving-product-choice.spec.ts tests/browser/warehouse.spec.ts --grep 'paginates receiving items separately\|creates a multi-product\|creates receiving through UI'` | 0 | **6/6 PASS**,46.7s,0skip/flaky/retry;3 kasus pada Chrome desktop1440x1000 dan mobile390x844. Pipe pada argumen grep adalah regex alternation; gunakan tanpa backslash ketika menjalankan PowerShell. |
| `npx --yes --package=prettier@3.6.2 prettier --write <lima file TS/TSX yang berubah>` lalu `--check` pada file yang sama | 0 | PASS semua file. Tidak ditemukan konfigurasi Prettier lokal; memakai default versi3.6.2, tool sementara tanpa mengubah dependency/lockfile. |
| `python docs/validation/check-docs.py --contract-source ../backend/docs` | 0 | PASS87 requirement,22 operasi, manifest/archive/source hashes dan byte equality kontrak terhadap authority backend. Pemeriksaan statis, bukan schema-validator/runtime API baru. |
| `Get-FileHash -Algorithm SHA256 ../PROJECT_SPEC.md` | 0 | Tetap901d39dc9ed68be7aa86fbcecf177c16fd57d0e767ace0360f2c74f825cfef8b. |

Lima target Prettier: `src/features/receivings/components/CreateReceiving.tsx`, `tests/component/receiving-item-pages.test.tsx`, `tests/component/receiving-product-choice.test.tsx`, `tests/browser/receiving-item-pages.spec.ts`, `tests/browser/receiving-pagination.spec.ts`. Jalankan dengan path eksplisit dipisahkan spasi, bukan literal placeholder di tabel. Dua tes katalog lama hanya disesuaikan terhadap label/count item baru; batas dan behavior katalog tetap diuji component serta browser multi-produk.

### Pembuktian perilaku

- Batas5/6/10/11 item menghasilkan1/2/2/3 halaman; render maksimal5 field quantity dengan nomor global. Pager item memakai seluruh rows.length; total katalog tetap dari API. Menambah row tidak mengubah jumlah produk katalog.
- Tambah membuka halaman row baru dan memfokuskan trigger produk. Maksimal50 serta minimal1 dipertahankan. Hapus row11 dari halaman3 membuka halaman2; component juga menghapus row2 dari enam row terisi dan memastikan produk/quantity3 bergeser utuh ke posisi2, dan produk/quantity6 ke posisi5.
- Component menyimpan enam item, browser sebelas. Pilihan dan quantity tetap setelah navigasi item/katalog; label selected product yang tidak berada pada halaman katalog saat ini tetap benar. Fixture component catalogue dislice sesuai page/limit5.
- Browser menampilkan row6 sambil katalog pada halaman1, lalu membuktikan produk row1 yang tersembunyi tidak tersedia untuk dipilih dua kali; own product6 tetap tersedia. Guard duplikat seluruh array tetap ada sebelum mutation.
- Quantity0 pada row2 disimpan lalu disembunyikan; submit dari halaman3 tidak mengirim POST, membuka halaman1, menampilkan pesan Item2 dan fokus quantity2. Blank product pada halaman tersembunyi juga terdeteksi component. Setelah koreksi error lama hilang, seluruh data divalidasi ulang.
- Component submit dari halaman1 mengirim seluruh6 item. Browser submit dari halaman2 mengirim seluruh11 productId/expectedQuantity1..11, termasuk halaman1 dan3 yang tersembunyi; server201, OPEN, receivedQuantity0 dan reference tetap. Tepat1 POST, tidak ada POST pada submit invalid. Balance seluruh11 produk dibandingkan sebelum/sesudah dan tetap sama.
- Regresi browser multi-produk/catalogue dan receiving partial40/full60, inventory/history serta duplicate-submit tetap PASS desktop/mobile. Stock hanya berubah pada kasus receipt regresi yang memang menggunakan database tes.
- Screenshot final `receiving-item-pages-chrome-desktop.png` dan `receiving-item-pages-chrome-mobile.png` telah ditinjau. Assertion tidak ada horizontal overflow dijalankan pada batas5/6/10/11 dan halaman submit; label SKU/nama panjang tetap dibungkus dalam form.

### Runtime terisolasi dan urutan verifikasi

Docker Engine29.8.0 tersedia. Hanya project TES existing **wrs-product-edit-5fe0384e** dihidupkan memakai Compose backend dan private env/.env.product-edit: PostgreSQL127.0.0.1:55470, database **wrs_edit_5fe0384e_test**; Redis127.0.0.1:56420. Tidak memakai database development atau deployment, tidak reset/migrate ulang/menghapus data. Database tes terisi dipakai kembali; fixture hanya menambah data tes bila perlu.

Urutan: `docker compose --env-file env/.env.product-edit up -d --wait postgres redis` (dari repository backend) -> healthy -> Vite test `API_PROXY_TARGET=http://127.0.0.1:3310`, `npm run dev -- --mode test --port 5176` -> pemeriksaan frontend lint/typecheck/build/component -> browser. Readiness backend ditunggu fixture sebelum tiap kasus; satu worker, tidak ada suite browser bertumpuk.

Runner menggunakan E2E_BACKEND_ENTRY path absolut backend built server.js existing; E2E_BACKEND_ENV_FILE path absolut file tes yang sama; E2E_BACKEND_PORT3310, E2E_BASE_URL=http://localhost:5176, E2E_EVIDENCE_PREFIX=receiving-item-pages dan E2E_RUNTIME unset. Credential seed dibaca privat ke environment process, tidak dicatat pada laporan. Fixture memberi namespace Redis `wrs:test:task6:<UUID>` baru per kasus, tanpa melonggarkan rate limit produksi; backend process milik fixture dihentikan setelah kasus. Repository frontend tetap tidak mengimpor model/source backend.

Log Vite mencatat ECONNREFUSED sementara pada `/health/ready` selama process backend per-kasus sedang startup/restart. Probe readiness mengulang sampai200 sebelum alur browser berjalan; final seluruh kasus PASS. Exit1 Vite setelah cleanup berasal dari penghentian process verifikasi yang disengaja, bukan hasil tes/build.

### Percobaan awal dan perbaikan

- Component awal34/34 PASS, tetapi typecheck awal exit2 karena opsi `exact` Playwright ikut dipakai pada Testing Library getByRole di dua lokasi tes baru. Dihapus sesuai API Testing Library; tidak menggunakan type suppression. Lint awal PASS, build pada percobaan itu belum dijalankan karena guard typecheck. Ringkasan `receiving-item-pages-checks-initial.json` dipertahankan, hasil final terpisah.
- Browser awal **1PASS desktop/1FAIL mobile timeout60s**; bukan timeout izin. Snapshot/screenshot menunjukkan label produk panjang meluber pada grid mobile. Screenshot desktop juga memperlihatkan pesan invalid lama setelah input diperbaiki. Track grid diubah lokal menjadi minmax(0,1fr), child min-width0 dan selected label wrap-anywhere; edit field membersihkan error/pesan lama. Tes ditambah assertion overflow per-boundary, error clearance dan step item untuk diagnostik, tanpa menaikkan timeout/retry atau mengubah backend. Final6/6 PASS setelah lint/typecheck/build/component diulang pada kode terbaru.
- Bukti awal `receiving-item-pages-browser-initial.json`, `receiving-item-pages-chrome-desktop-initial.png`, `receiving-item-pages-chrome-mobile-initial.png` dipertahankan. Bukti final menggunakan prefix receiving-item-pages, tidak menimpa laporan task/penyempurnaan terdahulu.
- Prettier pertama terhalang sandbox cache-only (ENOTCACHED). Command tool sementara dijalankan kembali dengan akses yang diperlukan dan berhasil; ini bukan kegagalan tes aplikasi. Tidak menginstal dependency aplikasi atau mengubah konfigurasi npm.

### Cleanup dan batas

Vite verifikasi PID14500 dihentikan setelah path/argumen dicocokkan; tidak ada listener3310/5176 tersisa. Dua container project tes dikembalikan stopped sesuai keadaan awal; data/database/volume tetap ada. **wrs-development-laptop-postgres-1** dan **wrs-development-laptop-redis-1** tetap running healthy. Tidak menghentikan runtime lain, menjalankan Git/prune/reset, atau mengubah file backend.

Full browser suite seluruh fitur (termasuk browser boundary katalog yang membutuhkan database kosong baru), backend full integration ulang, OpenAPI schema validator baru, Docker production rebuild/deployment, browser selainChrome, perangkat fisik, load/accessibility menyeluruh: **NOT_RUN** pada perubahan form ini. Bukti historis tetap berlaku hanya untuk konteks asalnya. Tidak ada blocker untuk penggunaan form yang telah diverifikasi.
