# Environment backend dan integrasi Task 6

Audit read-only pada 2026-10-29 (Asia/Jakarta). Dibaca: README/package.json backend, paths.ts, src/config/load-env.ts, src/config/env.ts, prisma.config.ts dan metadata aman seluruh file env Task 2-5. Tidak mencetak credential/secret atau URL bercredential; tidak membuat/mengubah file backend.

## Pemilihan file oleh aplikasi

Loader tidak memilih nomor task terbaru. Ia memakai BACKEND_ENV_FILE jika di-set, selain itu env/.env pada root package backend yang ditemukan dari package.json bernama @wrs/backend. Explicit path di-resolve terhadap working directory, sehingga runner E2E mewajibkan absolute path. dotenv override=false: nilai process environment menang atas file. Prisma migrate/seed memakai loader yang sama; validate/generate offline tidak memerlukan DB.

Docker Compose --env-file hanya memilih konfigurasi Compose; itu tidak otomatis memilih file dotenv aplikasi Node. BACKEND_ENV_FILE perlu disetel terpisah bila menjalankan aplikasi dengan file verifikasi. Jangan menyalin database URL/secret ke VITE_*.

## Inventaris aktual

Path pada tabel relatif root backend. Database/port/namespace di bawah bukan credential.

| File | Tujuan dan kondisi aktual | API port dalam file | PostgreSQL / Redis host port | Database / namespace |
| --- | --- | --- | --- | --- |
| env/.env.example | Template local development, credential kosong; bukan konfigurasi siap jalan | 3000 | 5432 / 6379 | warehouse / wrs |
| env/.env | Default local development menurut README/loader; saat audit BELUM ADA | - | - | Belum dikonfigurasi |
| env/.env.verification | Task 2 fondasi/schema/seed; NODE_ENV=test dan integration flag true | 3301 | 55439 / 56389 | wrs_task2_cf98214e_test; REDIS_NAMESPACE tidak disetel (default runtime wrs) |
| env/.env.task3 | Task 3 auth/security, NODE_ENV=test | 3303 | 55440 / 56390 | wrs_task3_067f8e38_test / wrs:test:067f8e38 |
| env/.env.task4 | Task 4 receiving/concurrency, NODE_ENV=test | 3304 | 55441 / 56391 | wrs_task4_1fa1a1ad_test / wrs:test:task4:1fa1a1ad |
| env/.env.task5 | Task 5 user management, NODE_ENV=test | 3305 | 55442 / 56392 | wrs_task5_bc403960_test / wrs:test:task5:bc403960 |

Task 2-5 semuanya memakai local deployment, APP_ORIGIN=http://localhost:5173, database _test dan integration flag true. Required runtime/seed values pada file tes hadir; nilainya tidak dipublikasikan. Template belum memiliki nilai koneksi/secret/seed yang dibutuhkan. File Task 2 tidak layak dipakai begitu saja untuk suite namespace-isolated karena namespace-nya default wrs; perlu override proses tes yang eksplisit, bukan mengedit file.

Tidak menjalankan verify:database ulang: script tersebut hanya untuk public schema kosong, sedangkan DB existing sudah terisi. Tidak melakukan migration/seed/deletion agar E2E lulus.

## Pilihan integrasi/E2E yang benar-benar digunakan

Task 6 memakai env/.env.task5 sebagai input runtime eksternal karena audit memastikan: database khusus _test sudah termigrasi, layanan PostgreSQL/Redis target healthy, origin cocok dengan frontend localhost:5173, dan credential seed tersedia untuk membuat akun disposable melalui HTTP. Pemilihan berdasarkan sifat/keadaan ini, bukan angka 5. Task lain dengan kondisi setara dapat dipilih eksplisit oleh pemilik; tidak ada kewajiban membuat .env.task6.

Fixture frontend menimpa hanya process environment child: PORT=3306 serta REDIS_NAMESPACE=wrs:test:task6:<UUID baru per kasus>. Seluruh rate limit produksi tetap. Ia menjalankan hasil build backend, menunggu /health/ready melalui Vite, baru menjalankan tindakan tes. Child dihentikan setelah kasus; file env backend tetap identik. Port 3306 harus bebas sebelum suite, jangan menjalankan backend manual pada port itu bersamaan. Data disposable dibuat melalui API pada database tes; tidak FLUSHALL/reset/drop dan tidak menghapus volume.

Frontend menggunakan .env.example sebagai template VITE_API_BASE_URL=/api/v1; .env frontend opsional karena default sama. API_PROXY_TARGET adalah environment proses Vite/server development, bukan nilai publik VITE_*. Template .env.e2e.example hanya daftar nama variabel runner; tidak otomatis dibaca dan tidak berisi secret. E2E_BACKEND_ENTRY/E2E_BACKEND_ENV_FILE adalah input runtime opsional untuk suite, bukan dependency install/build aplikasi frontend.

## Perintah untuk pemilik menjalankan backend

Dari root backend, untuk development biasa, sesudah pemilik menyediakan env/.env sendiri dan dalam shell bersih tanpa override BACKEND_ENV_FILE/koneksi/port lama:

```powershell
npm run env:check
npm run dev
```

Saat audit env/.env belum tersedia, sehingga jalur default tersebut belum siap dipakai. Audit ini tidak membuatnya. Bila dependency lokal perlu dijalankan, pemilik memilih file yang benar untuk Compose terlebih dahulu; jangan mengganti target DB existing tanpa sengaja.

Untuk review frontend pada DB tes yang telah diperiksa, dari root backend (bukan bersamaan dengan suite otomatis):

```powershell
$env:BACKEND_ENV_FILE = (Resolve-Path 'env/.env.task5').Path
$env:PORT = '3306'
$env:REDIS_NAMESPACE = 'wrs:test:task6:manual'
npm run env:check
npm start
```

npm start menjalankan dist/server.js yang sudah dibangun Task 5. Bila belum dibangun, pemilik backend menyiapkannya sendiri; frontend tidak membangun atau memodifikasi repo backend. Perintah di atas hanya contoh operasional, bukan klaim backend review manual sedang berjalan setelah tes.

Di terminal frontend dengan Node/npm baseline:

```powershell
$env:API_PROXY_TARGET = 'http://127.0.0.1:3306'
npm run dev
```

Buka http://localhost:5173 sesuai APP_ORIGIN. localhost dan 127.0.0.1 adalah origin berbeda; jangan mengganti alamat browser tanpa menyesuaikan origin yang dipercaya melalui konfigurasi milik pemilik backend.

Untuk suite otomatis, hentikan backend manual pada port 3306 dan berikan E2E_BACKEND_ENTRY (absolute built server.js), E2E_BACKEND_ENV_FILE (absolute file tes yang dipilih), E2E_BACKEND_PORT=3306, E2E_BASE_URL=http://localhost:5173, E2E_SEED_EMAIL/E2E_SEED_PASSWORD melalui environment lokal aman. Jangan mencetak nilainya. Vite tetap berjalan, lalu dari frontend:

```powershell
npm run test:browser
```

File backend hanya dibaca; Compose/DB/volume existing dipertahankan. Hasil pemeriksaan aktual dan keterbatasan ada pada [testing](testing.md#bukti-aktual-task-6).
