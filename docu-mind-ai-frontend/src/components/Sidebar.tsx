import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, MessageSquare, Search, ChevronRight, Brain } from 'lucide-react';

const navItems = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/documents', icon: FileText,        label: 'Documents' },
  { to: '/chat',      icon: MessageSquare,   label: 'AI Chat' },
  { to: '/search',    icon: Search,          label: 'Semantic Search' },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  return (
    <aside className="w-64 h-screen bg-[#13131a] border-r border-[#2a2a3a] flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-[#2a2a3a] cursor-pointer" onClick={() => navigate('/')}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#6366f1] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[#f1f1f5] font-bold text-lg leading-none">DocuMind</div>
            <div className="text-[#6b6b84] text-xs mt-0.5">AI Document Intelligence</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-[rgba(99,102,241,0.15)] text-[#6366f1]'
                  : 'text-[#a0a0b8] hover:bg-[#1a1a24] hover:text-[#f1f1f5]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#6366f1]' : 'text-[#6b6b84] group-hover:text-[#f1f1f5]'}`} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3 h-3" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#2a2a3a]">
        <div className="bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.2)] rounded-xl p-3">
          <div className="text-xs font-semibold text-[#6366f1] mb-1">RAG Powered</div>
          <div className="text-xs text-[#6b6b84]">Responses grounded in your indexed documents</div>
        </div>
      </div>
    </aside>
  );
};
