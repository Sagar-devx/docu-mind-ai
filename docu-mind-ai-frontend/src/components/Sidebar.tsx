import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, MessageSquare, Search, LogOut, Sparkles, Shield, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/documents', icon: FileText,        label: 'Documents' },
  { to: '/chat',      icon: MessageSquare,   label: 'AI Chat' },
  { to: '/search',    icon: Search,          label: 'Semantic Search' },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    queryClient.clear();
    toast.success('Signed out successfully');
    navigate('/login', { replace: true });
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="w-68 h-screen bg-[#0d0d14]/90 backdrop-blur-xl border-r border-white/[0.06] flex flex-col shrink-0 relative z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/[0.06] cursor-pointer group" onClick={() => navigate('/')}>
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0d0d14]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg tracking-tight">DocuMind</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <div className="text-[#71718a] text-xs font-medium">Neural Document RAG</div>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="px-4 py-3 text-[11px] font-semibold text-[#525266] uppercase tracking-wider">
        Workspace
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/25 shadow-sm shadow-indigo-950'
                  : 'text-[#8e8ea6] hover:bg-white/[0.04] hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-indigo-400' : 'text-[#62627a] group-hover:text-white'
                  }`}
                />
                <span className="flex-1">{label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400/80 animate-in fade-in" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Workspace Status */}
      <div className="p-3 mx-3 mb-2 rounded-xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.06]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-[#71718a]">Knowledge Base</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        </div>
        <div className="text-[11px] text-[#71718a] truncate">
          Encrypted Workspace Storage
        </div>
      </div>

      {/* User Section & Logout */}
      <div className="p-3 border-t border-white/[0.06] bg-[#0b0b11]/60">
        <div className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0">
              {getInitials(user?.username)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                {user?.username || 'User'}
                {user?.role === 'ADMIN' && (
                  <span title="Admin User" className="inline-flex items-center">
                    <Shield className="w-3 h-3 text-amber-400 shrink-0" />
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#6b6b84] truncate">{user?.email || 'Logged In'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[#62627a] hover:text-rose-400 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
