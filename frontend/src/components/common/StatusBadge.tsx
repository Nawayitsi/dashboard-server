import { cn } from '../../utils/cn';

interface StatusBadgeProps {
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'MAINTENANCE' | 'UNKNOWN' | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const norm = status.toUpperCase();

  const configs: Record<string, { bg: string; text: string; dot: string }> = {
    ONLINE: {
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      text: 'text-emerald-400',
      dot: 'bg-emerald-400',
    },
    OFFLINE: {
      bg: 'bg-red-500/10 border-red-500/20',
      text: 'text-red-400',
      dot: 'bg-red-400',
    },
    DEGRADED: {
      bg: 'bg-amber-500/10 border-amber-500/20',
      text: 'text-amber-400',
      dot: 'bg-amber-400',
    },
    MAINTENANCE: {
      bg: 'bg-blue-500/10 border-blue-500/20',
      text: 'text-blue-400',
      dot: 'bg-blue-400',
    },
    UNKNOWN: {
      bg: 'bg-gray-500/10 border-gray-500/20',
      text: 'text-gray-400',
      dot: 'bg-gray-400',
    },
  };

  const cfg = configs[norm] || configs.UNKNOWN;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold select-none",
        cfg.bg,
        cfg.text,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", cfg.dot)}></span>
      {status}
    </span>
  );
}
