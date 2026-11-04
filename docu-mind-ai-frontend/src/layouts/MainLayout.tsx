import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export const MainLayout = () => (
  <div className="flex h-screen overflow-hidden bg-[#0f0f13]">
    <Sidebar />
    <main className="flex-1 overflow-hidden flex flex-col">
      <Outlet />
    </main>
  </div>
);
