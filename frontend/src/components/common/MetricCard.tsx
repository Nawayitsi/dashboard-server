import { ElementType } from 'react';
import { GlassCard } from './GlassCard';
import { AnimatedCounter } from './AnimatedCounter';
import { cn } from '../../utils/cn';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  icon: ElementType;
  color?: string;
  decimals?: number;
  description?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  color = 'text-[#4F8CFF]',
  decimals = 0,
  description,
}: MetricCardProps) {
  return (
    <GlassCard className="relative overflow-hidden group">
      {/* Icon visual container */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-400 tracking-wide">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              <AnimatedCounter value={value} decimals={decimals} />
            </span>
            <span className="text-sm font-semibold text-gray-500">{unit}</span>
          </div>
        </div>

        <div className={cn("p-3 rounded-xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform duration-300", color)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {description && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-xs text-gray-400 truncate">{description}</p>
        </div>
      )}
    </GlassCard>
  );
}
