interface Props { size?: 'sm' | 'md' | 'lg'; }

export const LoadingSpinner = ({ size = 'md' }: Props) => {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size];
  return <div className={`${s} border-2 border-[#2a2a3a] border-t-[#6366f1] rounded-full animate-spin`} />;
};
