import { GlassCard } from '../common/GlassCard';
import { Activity, Shield, HardDrive, Cpu, Cloud, Globe } from 'lucide-react';

interface MetricWidgetProps {
  title: string;
  value: number | string;
  unit?: string;
  description?: string;
  category?: string;
  dataSource?: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  SYSTEM: Cpu,
  NETWORK: Globe,
  STORAGE: HardDrive,
  SECURITY: Shield,
};

export function MetricWidget({
  title,
  value,
  unit = '',
  description = '',
  category = 'SYSTEM',
  dataSource = '',
}: MetricWidgetProps) {
  const IconComp = CATEGORY_ICONS[category.toUpperCase()] || Activity;

  return (
    <GlassCard className="flex flex-col justify-between h-full group hover:shadow-2xl">
      <div>
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
            {dataSource || 'Metric'}
          </span>
          <div className="p-1.5 rounded-lg bg-white/5 text-gray-400 group-hover:text-[#4F8CFF] transition-colors">
            <IconComp className="h-4 w-4" />
          </div>
        </div>

        <h3 className="font-bold text-white text-md tracking-wide mb-1">
          {title}
        </h3>
        
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
            {value}
          </span>
          {unit && (
            <span className="text-xs text-gray-400 font-medium lowercase">
              {unit}
            </span>
          )}
        </div>

        {description && (
          <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </GlassCard>
  );
}
