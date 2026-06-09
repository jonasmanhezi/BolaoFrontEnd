import { DEFAULT_TEAM_LOGO } from '@/lib/partidas';

interface TeamBadgeProps {
  logo: string;
  sigla: string;
  nome: string;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center' | 'right';
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-16 h-16',
};

export function TeamBadge({
  logo,
  sigla,
  nome,
  size = 'md',
  align = 'center',
}: TeamBadgeProps) {
  const alignClass =
    align === 'left' ? 'items-start' : align === 'right' ? 'items-end' : 'items-center';

  return (
    <div className={`flex flex-col gap-1.5 ${alignClass}`}>
      <img
        src={logo}
        alt={nome}
        title={nome}
        className={`${sizeClasses[size]} object-contain drop-shadow-sm`}
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          img.onerror = null;
          img.src = DEFAULT_TEAM_LOGO;
        }}
      />
      <span className="text-[11px] font-bold tracking-[0.2em] text-white/90">{sigla}</span>
    </div>
  );
}