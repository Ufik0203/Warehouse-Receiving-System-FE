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
