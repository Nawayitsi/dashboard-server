import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSidebarStore } from '../../store/sidebarStore';
import { cn } from '../../utils/cn';

export function MainLayout() {
  const { isOpen } = useSidebarStore();

  return (
    <div className="min-h-screen bg-[#0B0D10] bg-radial-glow text-gray-100 flex p-4 relative">
      {/* Side Navigation panel */}
      <Sidebar />

      {/* Main viewport Container */}
      <main
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          isOpen ? "lg:pl-68" : "lg:pl-24"
        )}
      >
        <Header />
        
        {/* Page content with smooth enter animation container */}
        <div className="flex-1 overflow-x-hidden pb-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
