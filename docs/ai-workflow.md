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
