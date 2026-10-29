import { useState } from 'react';
import { z } from 'zod';
import { useAuth } from '../../auth/hooks/use-auth';
import { useRead,useAction } from '../../../hooks/use-server';
import { productsApi } from '../api';
import { Field,DataForm } from '../../../components/shared/Fields';
import { Panel,QueryState,ErrorNotice,Success } from '../../../components/shared/Feedback';
import { DataTable,Pagination } from '../../../components/shared/DataTable';
const input=z.object({sku:z.string().trim().toUpperCase().pipe(z.string().min(1).max(40).regex(/^[A-Z0-9_-]+$/,'Gunakan huruf, angka, _ atau -.')),name:z.string().trim().refine(v=>[...v].length>=1&&[...v].length<=120,'Nama harus 1–120 karakter Unicode.')});
export function ProductsWorkspace(){
 const {user}=useAuth();const [page,setPage]=useState(1);const [q,setQ]=useState('');const filters={page,q};
 const result=useRead('products',filters,signal=>productsApi.list(filters,signal));
 const create=useAction(productsApi.create,['products','inventory']);
 return <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]"><Panel title="Daftar produk"><Field label="Cari SKU atau nama" value={q} onChange={v=>{setQ(v);setPage(1);}} error={[...q.trim()].length>100?'Pencarian maksimal 100 karakter.':undefined}/><QueryState pending={result.isPending} error={result.error} retry={result.refetch} hasData={!!result.data}/>{result.data&&<><DataTable headers={['SKU','Nama','Satuan']} rows={result.data.data.map(row=>[row.sku,row.name,row.unit])}/><Pagination page={page} total={result.data.pagination.total} onPage={setPage}/></>}</Panel>{user?.role==='SUPERVISOR'&&<Panel title="Tambah produk"><p className="text-sm text-muted">Produk baru dimulai dengan stok nol.</p><DataForm fields={[{name:'sku',label:'SKU'},{name:'name',label:'Nama produk'}]} initial={{sku:'',name:''}} schema={input} pending={create.isPending} onSubmit={create.mutateAsync} label="Buat produk"/><ErrorNotice error={create.error}/>{create.isSuccess&&<Success refreshFailed={create.data.refreshFailed}>Produk berhasil dibuat.</Success>}</Panel>}</div>;
}
