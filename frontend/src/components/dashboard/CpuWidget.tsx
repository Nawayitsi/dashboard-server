import { GlassCard } from '../common/GlassCard';
import { AreaChart } from '../charts/AreaChart';
import { Cpu } from 'lucide-react';
import { AnimatedCounter } from '../common/AnimatedCounter';

interface CpuWidgetProps {
  currentUsage: number;
  history: Array<{ time: string; cpu: number }>;
}

export function CpuWidget({ currentUsage, history }: CpuWidgetProps) {
  return (
    <GlassCard className="flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-400">Processor Utilization</h3>
          <p className="text-2xl font-bold text-white mt-1">
            <AnimatedCounter value={currentUsage} />%
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[#4F8CFF]">
          <Cpu className="h-5 w-5" />
        </div>
      </div>
      
      {/* Visual Chart */}
      <div className="mt-2 flex-1">
        <AreaChart 
          data={history} 
          dataKey="cpu" 
          strokeColor="#4F8CFF"
          height={140}
        />
      </div>
    </GlassCard>
  );
}
