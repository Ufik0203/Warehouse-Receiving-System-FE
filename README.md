# Warehouse Receiving System - Frontend

UI penerimaan gudang: login/logout dan restore session, navigasi sesuai role, supervisor user management, products, create/detail receiving, penerimaan partial/full, stok dan riwayat. OPERATOR dapat bekerja pada receiving dan membaca produk/stok/history; SUPERVISOR juga membuat produk dan mengelola user. Contoh expected 100 diterima 40 lalu60 memperbarui status PARTIAL -> COMPLETED dan stok 100 melalui backend.

Stack aktual: React/ReactDOM 19.3.1, TypeScript 5.9.3 strict, Vite 7.3.7, React Router 7.18.5, TanStack Query 5.105.0, Tailwind 4.3.3 dan HeroUI 3.2.6. Reads memakai useQuery, mutations useMutation; pending receipt menyimpan key/payload per actor agar retry aman. Tidak ada optimistic stock increment; backend tetap otoritas authorization, transaksi dan idempotency.

Repository pasangan: **Warehouse-Receiving-System-BE**. URL GitHub pasangan belum tercantum dalam metadata/dokumen yang tersedia saat penulisan; tidak ditebak. Backend menyediakan Express/Prisma/PostgreSQL/Redis. OpenAPI backend adalah sumber utama; salinan docs/openapi.yaml frontend harus diperbarui bersamaan ketika kontrak berubah, bukan didesain terpisah.

## Hubungan dua repository

Kedua aplikasi memiliki package.json, package-lock.json, node_modules, konfigurasi dan Dockerfile masing-masing. Tidak membutuhkan npm workspaces atau konfigurasi parent. Untuk full application, siapkan kedua checkout; nama folder bebas. Contoh layout yang cocok dengan default build context Compose:

```text
workspace/
  backend/    # checkout Warehouse-Receiving-System-BE
  frontend/   # checkout Warehouse-Receiving-System-FE
```

Compose full deployment berada di checkout backend, `deploy/compose.yaml`. Backend context `..` dihitung dari folder deploy; FRONTEND_CONTEXT default `../../frontend` menunjuk sibling frontend. Jika memakai nama folder lain, isi FRONTEND_CONTEXT dengan path relatif dari folder deploy atau path absolut root checkout frontend. Install/build frontend sendiri tidak memerlukan checkout backend; integrasi runtime dan full deployment memerlukannya.


## Setup dari checkout bersih

Prasyarat **Node.js 24.12.0**, **npm 11.6.2** (engines Node>=24.12.0 <25, npm>=11.6.2 <12). Docker Desktop/Engine Linux containers dan Compose v2 diperlukan oleh backend development/full deployment, bukan untuk install/build/component tests frontend. E2E memerlukan Chrome lokal karena Playwright memakai channel chrome; versi runner terkunci1.64.1. Contoh command menggunakan **PowerShell**.

Dari **root checkout frontend**, tempat package.json ini berada:

```powershell
node --version
npm --version
npm ci
if (-not (Test-Path '.env')) { Copy-Item '.env.example' '.env' }
```

Aktifkan npm baseline sebelum npm ci; gunakan package-lock.json lokal, bukan node_modules/lockfile parent. `.npmrc` engine-strict aktif. File .env frontend opsional karena nilai default sama dengan template: **VITE_API_BASE_URL=/api/v1**. Variabel VITE_* dibundel ke browser; jangan menaruh password, session secret, cookie atau token di sana. API base harus relatif /api/v1, bukan URL backend absolut. Template .env.e2e.example untuk variabel runner terpisah dan tidak otomatis dimuat oleh Playwright.

### Menyiapkan backend pasangan

Dari **root checkout backend**, bukan terminal frontend:

```powershell
npm ci
if (-not (Test-Path 'env/.env')) { Copy-Item 'env/.env.example' 'env/.env' }
notepad env/.env
```

Isi credential lokal/seed secara privat, berdasarkan template backend. Nilai penting untuk development:

| Field backend | Nilai/aturan |
| --- | --- |
| NODE_ENV, DEPLOYMENT_MODE, PORT | development, local, 3000. |
| APP_ORIGIN, SESSION_COOKIE_SECURE, TRUST_PROXY | http://localhost:5175, false, kosong. |
| COMPOSE_PROJECT_NAME | wrs-development-laptop. |
| POSTGRES_USER, POSTGRES_DB, POSTGRES_PORT | warehouse_dev, warehouse_development, 55450. |
| REDIS_PORT, REDIS_NAMESPACE | 56400, wrs:dev:laptop. |
| POSTGRES_PASSWORD, REDIS_PASSWORD | Credential acak lokal, cocok dengan URL masing-masing. |
| DATABASE_URL, REDIS_URL | URL privat ke127.0.0.1 port 55450/56400; database warehouse_development. Percent-encode credential secara privat. |
| SESSION_SECRET | Acak minimal 32 byte, tidak dibundel frontend. |
| SEED_SUPERVISOR_*, SEED_OPERATOR_* | Isi NAME/EMAIL/PASSWORD, email berbeda, password 12-128 Unicode code point; nama 1-120. |

Akun login awal ada pada **env/.env checkout backend**, bagian SEED_SUPERVISOR_EMAIL/PASSWORD dan SEED_OPERATOR_EMAIL/PASSWORD. Buka sendiri; tidak ada credential bawaan. Seed tidak menimpa password/hash akun existing, termasuk ketika nilai env diubah. File environment lokal tidak ikut repository.

## Execution: development lokal

Nyalakan Docker Desktop, kemudian pada terminal backend yang sudah dikonfigurasi:

```powershell
npm run dev
```

Backend memvalidasi env/.env/override dan port 3000, memastikan Docker tersedia, menjalankan Compose dependency existing project wrs-development-laptop detached/wait healthy, generate Prisma offline, memeriksa database warehouse_development melalui URL host, migration deploy dan seed idempotent sekali, lalu API watcher. Source restart tidak mengulangi persiapan atau menghapus data/volume.

Pada terminal frontend:

```powershell
npm run dev
```

Buka **http://localhost:5175**. vite.config.ts menetapkan **host localhost, port 5175, strictPort=true**. Request relatif /api/v1 dan /health melewati proxy menuju **http://127.0.0.1:3000**, changeOrigin=false; Origin browser dipertahankan. Jangan mengganti host browser menjadi127.0.0.1 atau mengarahkan langsung browser ke API untuk mengatasi origin. APP_ORIGIN backend harus cocok persis. Cookie local HTTP non-Secure/HttpOnly; CSRF dan authorization tetap wajib.

```powershell
Invoke-WebRequest 'http://localhost:5175/health/live'
Invoke-WebRequest 'http://localhost:5175/health/ready'
```

Readiness200 bukan bukti login. Browser yang belum login memperoleh /api/v1/auth/me 401; bootstrap CSRF, login, me 200, reload tetap login, logout kembali401 merupakan alur yang diharapkan. UI membedakan commit receipt berhasil dari refetch gagal dan mempertahankan key/payload unresolved tanpa membuat operasi stok baru.

Ctrl+C pada masing-masing terminal dev untuk berhenti. Dependency backend tetap hidup; hentikan bila tidak diperlukan, **dari root backend**:

```powershell
docker compose -p wrs-development-laptop --env-file env/.env stop postgres redis
```

npm run build menghasilkan dist; npm run preview tersedia untuk memeriksa build melalui Vite. Vite versi terpasang dapat mewarisi server.proxy, tetapi origin preview belum diselaraskan dengan APP_ORIGIN development. Preview bukan jalur login/deployment yang diverifikasi; gunakan development localhost:5175 atau Docker/nginx untuk integrasi build lokal.

### Troubleshooting

| Gejala | Tindakan |
| --- | --- |
| Port 5175/3000 dipakai | Identifikasi pemilik melalui Get-NetTCPConnection/netstat; hentikan hanya proses sendiri. strictPort tidak berpindah port atau membunuh aplikasi lain. |
| Proxy500 atau ECONNREFUSED | Pastikan backend 3000 ready. Vite lama pernah mewarisi target3306 tanpa backend; hapus API_PROXY_TARGET lama dan restart. |
| Conflicting API_PROXY_TARGET | Development biasa menetapkan127.0.0.1:3000; hapus override terminal yang berbeda. Mode test eksplisit hanya untuk fixture tes. |
| Origin/CSRF403 | Browser localhost5175, APP_ORIGIN sama, SESSION_COOKIE_SECURE=false, token baru setelah login. Jangan memakai wildcard origin atau mematikan CSRF. |
| Backend invalid env/Docker unavailable | Isi env/.env dari template backend, hapus override tes yang disebut startup, nyalakan Docker Desktop sampai engine siap. |
| Dependency503 | Periksa status Compose development, URL host-port dan credential backend; jangan mereset volume. |
| Warning workspace config | Jalankan dari root checkout mandiri. Parent workspaces lama dapat membuat npm mengabaikan .npmrc; registration parent proyek sumber ini sudah dilepas. |

Contoh pembersihan override spesifik, tanpa menampilkan nilainya:

```powershell
Remove-Item Env:API_PROXY_TARGET -ErrorAction SilentlyContinue
Remove-Item Env:BACKEND_ENV_FILE -ErrorAction SilentlyContinue
```

Environment process lebih tinggi prioritasnya daripada file backend. Development menolak konflik; jangan mewarisi DATABASE_URL/namespace tes pada terminal dev. File development, tes dan deployment harus berbeda.

## Testing

Dari root frontend setelah npm ci:

```powershell
npm run lint
npm run typecheck
npm run build
npm run test:component
```

Component tests memakai jsdom26.1.0 tanpa backend/DB. Tidak ada script unit/integration backend dalam repository ini; E2E memakai backend HTTP nyata. Jangan menyebut mock component sebagai bukti transaksi PostgreSQL.

### E2E dengan backend eksternal terisolasi

Gunakan database disposable **_test**, Redis namespace **wrs:test:...** dan akun seed disposable. Jangan menjalankan E2E pada data development/deployment. File .env.taskN pembuat bukan prasyarat; semua file lokal berikut dibuat dari template yang disertakan.

Pertama, **terminal di root backend**:

```powershell
if (-not (Test-Path 'env/.env.e2e-review')) { Copy-Item 'env/.env.example' 'env/.env.e2e-review' }
notepad env/.env.e2e-review
```

Isi NODE_ENV=test, PORT=3306, APP_ORIGIN=http://localhost:5173, COMPOSE_PROJECT_NAME=wrs-e2e-review, POSTGRES_DB=wrs_e2e_review_test, POSTGRES_PORT=55461, REDIS_PORT=56411, REDIS_NAMESPACE=wrs:test:e2ereview. Isi kedua set credential seed dan secret acak baru; URL memakai host127.0.0.1/port 55461 atau56411, database/user/password sesuai Compose. DEPLOYMENT_MODE=local, SESSION_COOKIE_SECURE=false. Pilih project/port lain bila contoh sudah digunakan; jangan reset DB existing. Untuk pembaca file pada fixture, tulis DATABASE_URL dan field seed sebagai satu baris nilai biasa tanpa quote pembungkus.

```powershell
$env:BACKEND_ENV_FILE = (Resolve-Path 'env/.env.e2e-review').Path
docker compose -p wrs-e2e-review --env-file env/.env.e2e-review up -d --wait postgres redis
npm run build
npm run db:migrate:deploy
npm run db:seed
Remove-Item Env:BACKEND_ENV_FILE -ErrorAction SilentlyContinue
```

Build backend menghasilkan dist/server.js dan Prisma Client. **Jangan** menjalankan npm run dev backend dengan file tes: guard dev menolaknya. Fixture Playwright akan memulai built server eksternal per kasus pada port 3306, dengan namespace Redis unik untuk menjaga limiter produksi. Pastikan port 3306 belum dipakai proses lain.

Kedua, **terminal di root frontend** untuk Vite fixture (berbeda dari development biasa):

```powershell
$env:API_PROXY_TARGET = 'http://127.0.0.1:3306'
npm run dev -- --mode test --port 5173
```

--mode test memungkinkan proxy khusus tes; port strict tetap berlaku. Origin dan E2E_BASE_URL localhost5173 cocok dengan env backend tes. Jalankan runner hanya setelah Vite ready; backend per kasus akan dimulai fixture, bukan server manual.

Ketiga, **terminal lain di root frontend**, gunakan Chrome lokal terpasang dan path checkout backend yang benar:

```powershell
# Path sibling contoh; ganti dengan path absolut bila nama/layout checkout berbeda.
$e2eBackend = (Resolve-Path '..ackend').Path
$e2eFile = Join-Path $e2eBackend 'env/.env.e2e-review'
$e2eValues = @{}
Get-Content -LiteralPath $e2eFile | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') { $e2eValues[$matches[1]] = $matches[2] }
}
Remove-Item Env:E2E_RUNTIME -ErrorAction SilentlyContinue
$env:E2E_EVIDENCE_PREFIX = 'review-e2e'
$env:E2E_BASE_URL = 'http://localhost:5173'
$env:E2E_BACKEND_PORT = '3306'
$env:E2E_BACKEND_ENTRY = (Resolve-Path (Join-Path $e2eBackend 'dist/server.js')).Path
$env:E2E_BACKEND_ENV_FILE = (Resolve-Path $e2eFile).Path
$env:E2E_SEED_EMAIL = $e2eValues['SEED_SUPERVISOR_EMAIL']
$env:E2E_SEED_PASSWORD = $e2eValues['SEED_SUPERVISOR_PASSWORD']
New-Item -ItemType Directory -Force 'docs/evidence' | Out-Null
npm run test:browser
Remove-Item Env:E2E_SEED_PASSWORD -ErrorAction SilentlyContinue
$e2eValues.Clear()
```

Variabel tersebut juga dideskripsikan pada .env.e2e.example; template tidak otomatis dimuat. Jangan mengirim E2E_* credential lewat VITE_*. Gunakan terminal khusus tanpa override backend/test lama. Fixture memeriksa path absolut dan DB _test, satu worker/no retry; ia menunggu readiness, menguji Chrome desktop/mobile emulation lalu menghentikan proses backend yang dibuatnya. Sesudah runner selesai, Ctrl+C Vite fixture pada terminalnya dan hapus API_PROXY_TARGET sebelum dev biasa. Stop dependency project wrs-e2e-review dari backend bila tidak diperlukan, tanpa menghapus volume. Browser suite menambah data disposable melalui API.

JSON/screenshot baru ditulis ke docs/evidence sebagai **output ignored**, otomatis dihasilkan; tidak membutuhkan evidence/manifest/script docs yang tidak disertakan sebagai input. Mode browser Docker opsional tersedia pada fixture: memerlukan E2E_RUNTIME=docker, path absolut E2E_COMPOSE_FILE/E2E_COMPOSE_ENV, E2E_COMPOSE_PROJECT dengan prefix wrs-task7-, database _test, E2E_BASE_URL gateway serta seed credentials. Ia merecreate API project tes dengan namespace baru per kasus; jangan arahkan ke deployment pemilik. Jalur eksternal di atas cukup untuk mengulang E2E tanpa file task lokal lama.

### Hasil historis dan validasi README

[docs/testing.md](docs/testing.md) mencatat13 component tests,10 browser desktop/mobile dan login development yang sudah PASS pada run sebelumnya, termasuk perbaikan mobile/cache/startup. Backend unit terakhir19 PASS; Linux Task 7 backend 75 PASS sebelum penambahan3 guard unit dev. Angka ini bukan klaim full regression baru/satu versi suite. Pada perubahan README ini, npm ci/lint/typecheck/build/component/E2E/deployment ulang **NOT_RUN**; hanya pemeriksaan statis instruksi/path/tautan/syntax dilakukan. Tidak membuat atau meninggalkan server baru.

## Deployment Docker lokal

Seluruh command bagian ini dijalankan **dari root checkout backend**, termasuk bila membaca README frontend. Docker Desktop/Engine dan Compose v2 harus aktif. Ini berbeda dari Compose dependency development pada compose.yaml di root backend.

Buat file lokal dari template yang disertakan, tanpa menimpa file existing:

```powershell
if (-not (Test-Path 'deploy/.env')) { Copy-Item 'deploy/.env.example' 'deploy/.env' }
notepad deploy/.env
```

Isi privat sebelum build/up:

| Variabel | Pengaturan deployment lokal |
| --- | --- |
| COMPOSE_PROJECT_NAME | Project tersendiri, default wrs-local; jangan reuse project tes/development. |
| FRONTEND_CONTEXT | Root checkout frontend, relatif terhadap deploy/compose.yaml atau absolut. |
| WEB_PORT, APP_ORIGIN | Default 8080 dan http://localhost:8080; ubah keduanya bersama bila port berbeda. |
| APP_SUBNET, GATEWAY_IP | Subnet yang belum dipakai dan IP gateway dalam subnet; template 172.29.70.0/24 dan 172.29.70.10. |
| POSTGRES_USER, POSTGRES_DB, POSTGRES_PASSWORD | Identitas database deployment dan credential lokal sendiri. |
| REDIS_PASSWORD, REDIS_NAMESPACE | Credential Redis dan namespace deployment, terpisah dari tes/development. |
| DATABASE_URL | URL PostgreSQL privat memakai host internal postgres, port 5432, database/user/password sesuai field service. |
| REDIS_URL | URL Redis privat memakai host internal redis, port 6379 dan credential sesuai REDIS_PASSWORD. |
| SESSION_SECRET | Nilai acak minimal 32 byte; jangan masukkan ke source, frontend atau laporan. |
| SEED_SUPERVISOR_*, SEED_OPERATOR_* | name/email/password akun awal; dua email berbeda, password 12-128 Unicode code point. |
| DEPLOYMENT_MODE, SESSION_COOKIE_SECURE | local dan false untuk HTTP lokal. |

Percent-encode credential pada URL secara lokal. Jangan memakai localhost pada URL antarcontainer. File Compose --env-file tidak sama dengan BACKEND_ENV_FILE loader Node; jangan memakai env development/test sebagai deployment. Process environment dapat menimpa interpolasi Compose: gunakan terminal bersih dari override task lain. Mengganti env tidak otomatis mengganti password PostgreSQL di volume existing atau password akun seed lama.

```powershell
docker compose -f deploy/compose.yaml --env-file deploy/.env build
docker compose -f deploy/compose.yaml --env-file deploy/.env up -d --wait
docker compose -f deploy/compose.yaml --env-file deploy/.env ps -a
Invoke-WebRequest 'http://localhost:8080/health/live'
Invoke-WebRequest 'http://localhost:8080/health/ready'
docker compose -f deploy/compose.yaml --env-file deploy/.env logs --tail 80 migrate api web
```

Sesuaikan URL health jika WEB_PORT diubah. Buka **http://localhost:8080** dan login memakai akun seed dalam deploy/.env yang diisi pemilik. Build pertama memerlukan jaringan untuk image/npm/OS packages. Dockerfile memakai Node 24.12.0/npm 11.6.2 dan npm ci dari lockfile lokal; Prisma Client digenerate offline saat build. Image Node, PostgreSQL 17.11, Redis 8.2.11 dan nginx 1.30.6 dipin digest pada konfigurasi.

Urutan aktual `up`: PostgreSQL/Redis healthy -> service **migrate** menjalankan migration deploy **dan seed** hingga exit0 -> **api** readiness healthy -> **web**. Job migrate memakai target Dockerfile sendiri, bukan dijalankan tiap replica API. API/image tidak menjalankan npm run dev. Untuk deploy perubahan migration atau rerun job eksplisit, dengan target deployment sudah diperiksa dan dependency healthy:

```powershell
docker compose -f deploy/compose.yaml --env-file deploy/.env run --rm migrate
```

Web adalah nginx static server/gateway port internal 8080, publish hanya 127.0.0.1:WEB_PORT. API3000, PostgreSQL 5432 dan Redis 6379 hanya jaringan container. `/api/v1` dan `/health` diproxy tanpa menghapus prefix; reload deep route memakai SPA fallback. Gateway meneruskan Origin, menimpa forwarded headers dan hanya IP gateway yang dipercaya API. Tidak ada automatic mutation retry. Root filesystem API/web read-only dengan tmpfs; keduanya non-root.

Untuk menghentikan tanpa kehilangan data, lalu menjalankan kembali:

```powershell
docker compose -f deploy/compose.yaml --env-file deploy/.env stop
docker compose -f deploy/compose.yaml --env-file deploy/.env up -d --wait
```

`up` mengikuti dependency order di atas dan dapat menjalankan ulang job yang sudah exit; seed tetap idempotent dan tidak mengganti password existing. Jangan reset/drop database, menghapus volume atau memakai prune sebagai langkah rutin. Periksa/redaksi log sebelum dibagikan; jangan membagikan resolved Compose config atau container environment yang mengandung secret.

Deployment ini **HTTP lokal**, terpisah dari production publik. HTTPS nanti membutuhkan terminasi TLS/certificate nyata, APP_ORIGIN https yang benar, DEPLOYMENT_MODE=https, SESSION_COOKIE_SECURE=true dan trusted proxy sesuai topologi. Hanya mengganti env pada listener HTTP tidak cukup. HTTPS/TLS browser, VPS/domain/public hosting **NOT_RUN**.


## Dokumentasi submission

Hanya tujuh dokumen berikut yang diperlukan dari folder docs:

- [PRD](docs/prd.md): requirement, role dan aturan bisnis.
- [Technical specification](docs/technical-spec.md): arsitektur dan keputusan teknis.
- [ERD](docs/erd.mmd): diagram entitas/relasi Mermaid.
- [OpenAPI](docs/openapi.yaml): kontrak request, response dan error API.
- [Data flow](docs/data-flow.mmd): diagram alur Mermaid.
- [AI workflow](docs/ai-workflow.md): tahapan implementasi dan checklist.
- [Testing](docs/testing.md): perintah, hasil historis, kegagalan awal dan batas verifikasi.

README ini memuat instruksi operasional yang diperlukan; tidak membutuhkan panduan tambahan, manifest, screenshot atau script di docs yang tidak disertakan. Referensi historis dalam dokumen testing tidak berarti file evidence lokal ikut submission. Source, tests, template environment, Dockerfile, konfigurasi dan semua migrasi Prisma di luar docs tetap diperlukan. Semua pekerjaan Git/GitHub dilakukan manual oleh pemilik.


## Keterbatasan

Cookie/session/CSRF ditangani lewat same-origin backend; visibilitas tombol bukan enforcement authorization. Tidak ada fitur reset password/registrasi publik atau inventory adjustment. Matriks seluruh UI states dan audit error/log/fuzzing belum exhaustive. HTTPS/production publik, browser Firefox/WebKit/Safari, mobile fisik, load/stress/performance SLA dan audit accessibility menyeluruh NOT_RUN. Build sebelumnya memberi warning Zod PURE annotation dan chunk JS sekitar 651kB; bukan SLA produksi. TypeScript strict aktif; exactOptionalPropertyTypes=false frontend merupakan pengecualian kompatibilitas HeroUI/React Aria terdokumentasi.

Build/component/browser input tidak memerlukan file docs di luar tujuh dokumen submission. Dokumen testing mempertahankan konteks bukti lokal yang mungkin tidak ikut repository; report/screenshot baru dapat dihasilkan oleh suite. Tidak ada kebutuhan manifest/API Markdown/docs validator sebagai prasyarat build atau npm run dev.

## Pemeriksaan README pada 2026-10-29

PASS pemeriksaan statis nama npm scripts terhadap package.json, keberadaan template/config, tepat tujuh tautan dokumen submission yang tersedia, serta syntax seluruh blok PowerShell. Audit source/config tidak menemukan input build/test pada docs yang diabaikan; E2E menulis report/screenshot baru sebagai output. Secret environment lokal tidak ditemukan dalam isi README. Suite aplikasi dan startup/deployment dari checkout bersih tidak diulang pada pekerjaan dokumentasi ini: **NOT_RUN**. Hanya README backend/frontend diubah; tidak membuat server, mengubah konfigurasi, menjalankan Git, atau mengubah database/volume.

## Penyempurnaan setelah Task 7: edit produk

SUPERVISOR dapat memperbaiki SKU/nama melalui Edit pada daftar produk dan PATCH /api/v1/products/:id. Produk terpakai tetap boleh diedit; SKU unik, normalisasi/batas existing berlaku. Inventory/detail/history menampilkan label produk terkini, sedangkan receipt/stock/replay tidak berubah. Tidak menambah delete/arsip/status aktif. Kontrak terbaru pada docs/openapi.yaml dan hasil verifikasi2026-10-30 pada docs/testing.md.

## Riwayat Edit Produk

SUPERVISOR dapat membuka tombol **Riwayat Edit** pada daftar produk menuju `/products/:id/history`. Halaman khusus ini menampilkan identitas produk, waktu server, nama pelaku saat perubahan, field dan nilai sebelum/sesudah, serta loading/empty/error/pagination. GET `/api/v1/products/:id/history` supervisor-only memakai page/limit(default20,max100); bukan `/inventory/transactions`.

Migrasi forward `202610300002_product_edit_history` menambah tabel permanen. Product update dan log ditulis dalam satu transaksi dengan row lock; no-op/failed edit tidak menghasilkan log. Actor soft-delete/rename tidak menghilangkan nama snapshot. Log hanya tersedia mulai fitur ini aktif; perubahan masa lalu tidak direkayasa. Tidak ada edit/delete log atau delete/archive produk. Receipt/stock/idempotency tidak berubah.

Development npm run dev akan deploy migrasi pending sekali sebelum watcher; jangan reset database. Untuk runtime manual dari backend gunakan env target yang telah diperiksa dan npm run db:migrate:deploy sebelum npm start. Docker menggunakan job migrate pada image baru, lalu readiness kini memeriksa tabel log. Production Docker rebuild/deployment untuk fitur tambahan ini NOT_RUN; lihat docs/testing.md untuk verifikasi tes nyata.

## Pagination form receiving

Form dokumen baru menyediakan dua pager terpisah: **Katalog produk pilihan** untuk halaman produk API dan **Item penerimaan** untuk baris formulir. Masing-masing menampilkan5 data per halaman. Nomor item mengikuti seluruh formulir; tambah item membuka dan memfokuskan item baru, sedangkan hapus menyesuaikan halaman kosong. Pilihan/quantity seluruh halaman tetap tersimpan, produk duplikat dicegah lintas halaman, dan Simpan receiving memvalidasi serta mengirim seluruh1–50 item. Kesalahan pada item tersembunyi membuka halaman item invalid pertama. Kontrak API tetap sama; bukti pemeriksaan pada docs/testing.md.
