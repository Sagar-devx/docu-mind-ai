import { Bell, Settings } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props { title: string; subtitle?: string; actions?: ReactNode; }

export const Navbar = ({ title, subtitle, actions }: Props) => (
  <header className="h-16 bg-[#13131a] border-b border-[#2a2a3a] flex items-center justify-between px-6 shrink-0">
    <div>
      <h1 className="text-[#f1f1f5] font-semibold text-lg leading-tight">{title}</h1>
      {subtitle && <p className="text-[#6b6b84] text-xs">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-2">
      {actions}
      <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#1a1a24] text-[#6b6b84] hover:text-[#f1f1f5] transition-colors">
        <Bell className="w-4 h-4" />
      </button>
      <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#1a1a24] text-[#6b6b84] hover:text-[#f1f1f5] transition-colors">
        <Settings className="w-4 h-4" />
      </button>
    </div>
  </header>
);
