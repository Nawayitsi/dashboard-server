import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Grid2X2, 
  Activity, 
  Network, 
  ShieldAlert, 
  HardDrive, 
  FileTerminal, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Terminal
} from 'lucide-react';
import { useSidebarStore } from '../../store/sidebarStore';
import { cn } from '../../utils/cn';

const menuItems = [
  { path: '/', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/apps', name: 'Applications', icon: Grid2X2 },
  { path: '/monitoring', name: 'Monitoring', icon: Activity },
  { path: '/infrastructure', name: 'Topology', icon: Network },
  { path: '/security', name: 'Security', icon: ShieldAlert },
  { path: '/storage', name: 'Storage', icon: HardDrive },
  { path: '/logs', name: 'System Logs', icon: FileTerminal },
  { path: '/settings', name: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { isOpen, toggle } = useSidebarStore();

  return (
    <aside
      className={cn(
        "fixed top-4 bottom-4 left-4 z-40 flex flex-col glass-panel rounded-2xl transition-all duration-300 select-none shadow-2xl",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/5">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#4F8CFF] to-[#7A5CFF] text-white shadow-lg shadow-[#4F8CFF]/20 shrink-0">
            <Terminal className="h-5 w-5" />
          </div>
          {isOpen && (
            <span className="font-bold text-lg bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent truncate tracking-wide">
              HomelabOS
            </span>
          )}
        </div>
        
        {isOpen && (
          <button
            onClick={toggle}
            className="rounded-lg p-1.5 hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 relative group",
                isActive
                  ? "text-white bg-white/10 shadow-inner border-l-2 border-[#4F8CFF]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {isOpen ? (
              <span className="truncate">{item.name}</span>
            ) : (
              <div className="absolute left-full ml-4 px-2 py-1.5 bg-[#0B0D10]/95 border border-white/10 rounded-md text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle when sidebar is closed */}
      {!isOpen && (
        <div className="p-4 border-t border-white/5 flex justify-center">
          <button
            onClick={toggle}
            className="rounded-xl p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
