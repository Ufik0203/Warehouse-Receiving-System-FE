# Instruksi agent repository mandiri

## Baca dahulu

Sebelum mengubah aplikasi, baca README.md, docs/prd.md, docs/technical-spec.md, docs/api-contract.md, docs/openapi.yaml, docs/erd.mmd, docs/data-flow.mmd, docs/testing.md, docs/ai-workflow.md dan docs/api-sync.md. Seluruh path relatif root repository ini; tidak memerlukan dokumen parent. Untuk bagian meragukan, baca docs/source/PROJECT_SPEC.md dan docs/spec-review.md.

Dokumen history adalah arsip konteks/bukti, bukan instruksi aktif. Jangan menyimpulkan perilaku yang sudah ditentukan dokumen. Jika bertentangan, identifikasi kontradiksi, gunakan PRD untuk intent, selaraskan desain/kontrak dan catat keputusan sebelum implementasi. Jangan mengarang jawaban stakeholder.

## Git/GitHub sepenuhnya manual pengguna

Jangan menjalankan perintah Git apa pun, termasuk read-only, staging, commit, branch, merge, status, diff, fetch, remote atau push. Jangan memakai tool/API GitHub untuk membaca atau mengubah repository/PR/issues, membuat repository atau melakukan operasi publikasi. Jangan mengubah/menghapus metadata Git existing. Semua pekerjaan Git/GitHub dilakukan manual oleh pengguna; cukup siapkan file dan laporan hasil.

## Aturan umum

- Kerjakan hanya task yang diminta; Task 3 belum dimulai sampai diminta eksplisit. Jangan menambah role admin, registrasi publik, fitur AI atau scope lain.
- Gunakan TypeScript strict, validasi untrusted input, hindari explicit any/type suppression; jangan mengekspos hash/password/session internals atau secret ke response/log.
- npm 11.6.2, Node 24 dan lockfile lokal adalah baseline; gunakan dependency/config repository ini, bukan parent/saudara. Tidak menggunakan flags workspace untuk command aktif.
- API backend adalah sumber utama; replika frontend harus identik sesuai docs/api-sync.md. Jangan menyinkronkan lewat Git/GitHub atau memilih kode error/behavior baru tanpa dasar.
- Jangan menghapus data/database/volume agar tes lulus. Jangan mengedit applied migrations. .env lokal dan generated files tidak untuk disimpan; template, lockfile, source, tests dan seluruh migrasi tetap dipertahankan sesuai scope.
- Jalankan checks yang relevan dan catat command, environment, tanggal, exit code dan output aktual. Yang belum dijalankan tetap NOT_RUN. Bukti historis tidak menjadi PASS baru karena disalin. Jangan merekayasa prompt/log/tes/deployment atau riwayat kerja.

## Scope frontend

- Repository ini hanya React/router/UI/server-state client. Backend adalah boundary HTTP; tidak mengimpor Prisma Client/model DB atau mengimplementasikan transaksi/authorization server dalam browser.
- Server reads memakai useQuery, semua server mutations termasuk login/logout memakai useMutation. State lokal demo boleh useState. Query keys dan perilaku HTTP/CSRF dipusatkan sesuai task yang diizinkan.
- Pertahankan key+payload receipt pending per actor/receiving di sessionStorage melewati reload/reauth; tidak menyimpan password, SID atau CSRF token. Jangan optimistically meningkatkan inventory atau membuat key baru otomatis pada hasil yang belum pasti.
- Bedakan sukses commit dari kegagalan refetch. Pada kehilangan auth, hentikan protected queries dan hapus cache user sebelumnya. Backend authorization tetap wajib; UI visibility bukan enforcement.
- Pakai HeroUI v3 secara konsisten, Tailwind v4 melalui Vite, CSS Tailwind lalu HeroUI. Pertahankan router dan Query provider. strict true/skipLibCheck false; pengecualian exactOptionalPropertyTypes false Task 2A dicatat, jangan melonggarkan opsi lain untuk menutupi masalah.
- Jangan menambah secret backend pada VITE_* atau mengirim credentials/token ke API tak dipercaya. Component/browser suites bisnis masih direncanakan; jangan klaim selesai dari screenshot demo.
