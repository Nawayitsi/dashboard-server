import { GlassCard } from '../common/GlassCard';
import { HardDrive } from 'lucide-react';

interface DiskWidgetProps {
  used: number; // GB
  total: number; // GB
}

export function DiskWidget({ used, total }: DiskWidgetProps) {
  const percentage = total > 0 ? (used / total) * 100 : 0;

  return (
    <GlassCard className="flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-400">Disk Capacity</h3>
          <p className="text-2xl font-bold text-white mt-1">
            {used.toFixed(1)} <span className="text-xs font-semibold text-gray-500">/ {total.toFixed(1)} GB</span>
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-amber-400">
          <HardDrive className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400 font-medium">
          <span>Storage Pool 1</span>
          <span>{percentage.toFixed(0)}% Used</span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-white/5 border border-white/5 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </GlassCard>
  );
}
