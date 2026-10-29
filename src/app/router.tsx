import { BrowserRouter, Route, Routes } from 'react-router';
import { FoundationPage } from '../pages/FoundationPage';

export function AppRouter() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<FoundationPage />} />
    <Route path="*" element={<main><h1>Halaman tidak ditemukan</h1><a href="/">Kembali</a></main>} />
  </Routes></BrowserRouter>;
}
