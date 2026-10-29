# AI workflow repository frontend mandiri

Instruksi ini berlaku dari root repository ini; tidak mengasumsikan manifest, file, konfigurasi atau source aplikasi saudara. Semua pekerjaan Git/GitHub hanya manual pengguna; agent tidak menjalankan perintah Git atau tool GitHub, termasuk read-only. Baca [AGENTS](../AGENTS.md), [PRD](prd.md), [technical-spec](technical-spec.md), [API Markdown](api-contract.md), [OpenAPI](openapi.yaml), [review](spec-review.md), [testing](testing.md) dan [sync](api-sync.md).

## Riwayat yang sudah ada

Task 1 review/OpenAPI, Task 2 fondasi, Task 2A UI dan persiapan repository telah dilakukan dalam konteks yang dicatat pada [arsip workflow asli](history/combined/docs/ai-workflow.md) dan [testing](testing.md). Snapshot asli mempertahankan rencana lama/command workspace sebagai bukti historis; jangan menjalankannya sebagai command checkout ini atau menyatakan bahwa seluruh fitur selesai. Pada pekerjaan dokumentasi ini tidak ada task aplikasi yang dijalankan.

## Tahap berikutnya, belum dijalankan

| Tahap sumber | Status | Scope repository ini |
| --- | --- | --- |
| Task 3 boundary backend | NOT_STARTED; pengujian NOT_RUN | Tunggu task backend diizinkan; tidak mengimplementasikan server auth dalam frontend |
| Task 4/5 boundary backend | PLANNED; NOT_RUN | Kontrak products/receivings/inventory/users akan disediakan backend |
| Task 6 frontend | PLANNED; NOT_RUN | Auth UI, feature pages, typed HTTP/query keys, pending receipt recovery, component/browser tests |
| Task 7 frontend | PLANNED; NOT_RUN | Production image/gateway dan standalone deployment sesuai backend API origin |

## Checklist aktif

- [ ] Mulai task UI bisnis hanya setelah pengguna memintanya; Task 3 belum dimulai.
- [ ] Terima pasangan kontrak resmi backend, periksa hash dan freshness artefak tanpa operasi Git/GitHub.
- [ ] Sediakan HTTP client trusted same-origin, credentials, CSRF memory, error normalization dan query keys typed.
- [ ] Implementasikan useQuery/useMutation termasuk auth dan invalidasi yang ditargetkan; loading/empty/validation/pending/error.
- [ ] Hormati role matrix; jangan menampilkan kontrol yang tak berizin dan jangan menganggap UI menggantikan authorization backend.
- [ ] Preserve pending key+payload receipt per actor/receiving; retry false, no optimistic stock increment, clear stale query cache, separate success/refetch failure.
- [ ] Tunggu bukti receiving kritis backend sebelum mengaktifkan stock mutations; jangan mengubah kontrak replika sendiri.
- [ ] Tambahkan script/dependency component/browser ketika suite diimplementasikan, termasuk committed receipt lost-response, reload/reauth, cache isolation dan user switching.
- [ ] Catat hasil aktual, pertanyaan terbuka, NOT_RUN dan sinkronisasi kontrak. Git/GitHub manual pengguna.

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
