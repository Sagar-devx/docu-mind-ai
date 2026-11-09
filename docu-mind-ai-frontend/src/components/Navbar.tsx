import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import { Terminal, Menu } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export const Navbar = ({ title, subtitle, actions }: Props) => {
  const { user } = useAuth();
  const { toggleSidebar } = useLayout();

  return (
    <header className="h-16 bg-[#0c0c13]/70 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-10 gap-3">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 -ml-1 rounded-xl text-[#8e8ea6] hover:text-white hover:bg-white/[0.05] transition-colors shrink-0"
          aria-label="Toggle navigation"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-white font-semibold text-sm sm:text-base tracking-tight truncate">{title}</h1>
          </div>
          {subtitle && (
            <p className="text-[#65657d] text-[11px] sm:text-xs mt-0.5 truncate max-w-[180px] sm:max-w-md lg:max-w-none">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {actions}

        {/* Live System Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-[#8e8ea6]">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono text-[11px] text-[#b3b3cb]">{user?.role || 'USER'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
      </div>
    </header>
  );
};
