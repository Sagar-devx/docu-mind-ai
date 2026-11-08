import type { DocumentStatus } from '../types';

const configs: Record<DocumentStatus, { label: string; cls: string; dotCls: string }> = {
  INDEXED:    { label: 'Indexed',    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dotCls: 'bg-emerald-400' },
  PROCESSING: { label: 'Processing', cls: 'bg-amber-500/10 text-amber-300 border-amber-500/20',   dotCls: 'bg-amber-400 animate-pulse' },
  UPLOADING:  { label: 'Uploading',  cls: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20', dotCls: 'bg-indigo-400 animate-ping' },
  PENDING:    { label: 'Pending',    cls: 'bg-blue-500/10 text-blue-300 border-blue-500/20',       dotCls: 'bg-blue-400' },
  FAILED:     { label: 'Failed',     cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20',       dotCls: 'bg-rose-400' },
};

export const StatusBadge = ({ status }: { status: DocumentStatus }) => {
  const cfg = configs[status] ?? { label: status, cls: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', dotCls: 'bg-zinc-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium border backdrop-blur-sm ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dotCls}`} />
      {cfg.label}
    </span>
  );
};
