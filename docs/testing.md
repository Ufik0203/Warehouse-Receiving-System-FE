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
