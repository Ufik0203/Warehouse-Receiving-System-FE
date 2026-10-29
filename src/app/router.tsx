import { BrowserRouter, Route, Routes,Navigate } from 'react-router';
import { AppLayout,Protected } from '../components/layout/AppLayout';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage,UsersPage,UserPage,ReceivingsPage,NewReceivingPage,ReceivingPage,InventoryPage,HistoryPage,NotFoundPage } from '../pages/FeaturePages';

export function AppRouter() {
  return <BrowserRouter><Routes>
    <Route path="/login" element={<LoginPage/>}/>
    <Route element={<Protected/>}><Route element={<AppLayout/>}>
      <Route path="/" element={<Navigate to="/receivings" replace/>}/>
      <Route path="/products" element={<ProductsPage/>}/>
      <Route path="/receivings" element={<ReceivingsPage/>}/>
      <Route path="/receivings/new" element={<NewReceivingPage/>}/>
      <Route path="/receivings/:id" element={<ReceivingPage/>}/>
      <Route path="/inventory" element={<InventoryPage/>}/>
      <Route path="/inventory/transactions" element={<HistoryPage/>}/>
      <Route element={<Protected supervisor/>}><Route path="/users" element={<UsersPage/>}/><Route path="/users/:id" element={<UserPage/>}/></Route>
    </Route></Route>
    <Route path="*" element={<NotFoundPage/>}/>
  </Routes></BrowserRouter>;
}
