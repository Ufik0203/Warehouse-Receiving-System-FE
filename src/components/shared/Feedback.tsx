import type { ReactNode } from 'react';
import { Button,Card } from '@heroui/react';
import { ApiError } from '../../config/http-client';
const messages:Record<string,string>={ SELF_ACCOUNT_RESTRICTION:'Anda tidak dapat menurunkan role, menonaktifkan, atau menghapus akun sendiri.', LAST_ACTIVE_SUPERVISOR:'Minimal satu supervisor aktif harus dipertahankan.', USER_DELETED:'Akun terhapus tidak dapat diubah atau dipulihkan.', OVER_RECEIPT:'Jumlah melebihi sisa penerimaan. Data tidak diubah.', IDEMPOTENCY_CONFLICT:'Key sudah terkait operasi berbeda. Periksa riwayat; jangan membuat operasi baru.', RATE_LIMITED:'Terlalu banyak permintaan. Tunggu sebelum mencoba lagi.' };
export function ErrorNotice({error}:{error:unknown}) {
  if(!error)return null;
  const text=error instanceof ApiError?(messages[error.code]??error.message):'Terjadi kesalahan. Silakan coba lagi.';
  return <div role="alert" className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm"><p>{text}</p>{error instanceof ApiError&&error.requestId&&<p className="mt-1 text-xs">Referensi: {error.requestId}</p>}</div>;
}
export function Panel({title,children}:{title:string;children:ReactNode}) {return <Card className="min-w-0 w-full border border-border shadow-none"><Card.Header><Card.Title>{title}</Card.Title></Card.Header><Card.Content className="min-w-0 space-y-4">{children}</Card.Content></Card>;}
export function QueryState({pending,error,retry,hasData=false}:{pending:boolean;error:unknown;retry:()=>unknown;hasData?:boolean}) {
  if(pending&&!hasData)return <p role="status">Memuat data…</p>;
  if(error)return <div className="space-y-2">{hasData&&<p>Data belum berhasil disegarkan.</p>}<ErrorNotice error={error}/><Button variant="secondary" onPress={()=>{void retry();}}>Muat ulang data</Button></div>;
  return null;
}
export function Success({refreshFailed=false,children}:{refreshFailed?:boolean;children:ReactNode}) {return <div role="status" className="rounded-xl bg-success/10 p-3 text-sm text-success"><p>{children}</p>{refreshFailed&&<p>Operasi sudah berhasil. Penyegaran data gagal; muat ulang data, jangan kirim operasi baru.</p>}</div>;}
