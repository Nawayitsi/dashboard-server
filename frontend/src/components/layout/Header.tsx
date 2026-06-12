import { Bell, LogOut, User as UserIcon, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSidebarStore } from '../../store/sidebarStore';

export function Header() {
  const { user, clearAuth } = useAuthStore();
  const { toggle } = useSidebarStore();

  return (
    <header className="h-16 flex items-center justify-between px-6 glass-panel rounded-2xl mb-6 shadow-md border-white/5 relative z-30 select-none">
      {/* Search Bar / Welcome Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggle}
          className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-sm font-medium text-gray-400">Welcome back,</h2>
          <h1 className="text-lg font-bold text-white leading-tight">
            {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username || 'User'}
          </h1>
        </div>
      </div>

      {/* Actions (Notifications, User Info) */}
      <div className="flex items-center gap-4">
        {/* Realtime Alert Status / Active Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          System Live
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-200 border border-white/5">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#4F8CFF]"></span>
        </button>

        {/* Profile Details */}
        <div className="flex items-center gap-3 pl-2 border-l border-white/10">
          <div className="flex items-center gap-2">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.username} 
                className="h-9 w-9 rounded-xl border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/20 font-bold text-sm">
                {user?.username?.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-none">{user?.username}</span>
              <span className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">{user?.role}</span>
            </div>
          </div>

          {/* Log Out */}
          <button 
            onClick={clearAuth}
            className="p-2 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors border border-white/5"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
