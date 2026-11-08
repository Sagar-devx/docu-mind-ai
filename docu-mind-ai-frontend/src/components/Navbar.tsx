import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export const Navbar = ({ title, subtitle, actions }: Props) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-[#0c0c13]/70 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6 shrink-0 relative z-10">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-white font-semibold text-base tracking-tight">{title}</h1>
          </div>
          {subtitle && <p className="text-[#65657d] text-xs mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actions}

        {/* Live System Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-[#8e8ea6]">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono text-[11px] text-[#b3b3cb]">{user?.role || 'USER'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
      </div>
    </header>
  );
};
