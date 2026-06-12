import { GlassCard } from '../common/GlassCard';
import { AreaChart } from '../charts/AreaChart';
import { Cpu } from 'lucide-react';
import { AnimatedCounter } from '../common/AnimatedCounter';

interface RamWidgetProps {
  currentUsage: number;
  history: Array<{ time: string; ram: number }>;
}

export function RamWidget({ currentUsage, history }: RamWidgetProps) {
  return (
    <GlassCard className="flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-400">Memory Utilization</h3>
          <p className="text-2xl font-bold text-white mt-1">
            <AnimatedCounter value={currentUsage} />%
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[#7A5CFF]">
          <Cpu className="h-5 w-5" />
        </div>
      </div>
      
      {/* Visual Chart */}
      <div className="mt-2 flex-1">
        <AreaChart 
          data={history} 
          dataKey="ram" 
          strokeColor="#7A5CFF"
          height={140}
        />
      </div>
    </GlassCard>
  );
}
