import type { DocumentStatus } from '../types';

const configs: Record<DocumentStatus, { label: string; cls: string }> = {
  INDEXED:    { label: 'Indexed',    cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  PROCESSING: { label: 'Processing', cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' },
  PENDING:    { label: 'Pending',    cls: 'bg-blue-500/15 text-blue-400 border border-blue-500/30' },
  FAILED:     { label: 'Failed',     cls: 'bg-red-500/15 text-red-400 border border-red-500/30' },
};

export const StatusBadge = ({ status }: { status: DocumentStatus }) => {
  const { label, cls } = configs[status] ?? { label: status, cls: 'bg-gray-500/15 text-gray-400' };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>;
};
