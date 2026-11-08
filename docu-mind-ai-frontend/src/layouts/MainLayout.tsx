import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export const MainLayout = () => (
  <div className="flex h-screen overflow-hidden bg-[#09090d] text-[#f3f3f7] relative">
    {/* Subtle Ambient Glow Mesh */}
    <div className="glow-mesh" />

    {/* Sidebar Navigation */}
    <Sidebar />

    {/* Main View Area */}
    <main className="flex-1 overflow-hidden flex flex-col relative z-10">
      <Outlet />
    </main>
  </div>
);
