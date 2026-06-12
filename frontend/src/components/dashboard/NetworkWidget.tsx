import { GlassCard } from '../common/GlassCard';
import { Activity } from 'lucide-react';
import { AreaChart } from '../charts/AreaChart';

interface NetworkWidgetProps {
  txRate: number; // Mbps
  rxRate: number; // Mbps
  history: Array<{ time: string; rx: number; tx: number }>;
}

export function NetworkWidget({ txRate, rxRate, history }: NetworkWidgetProps) {
  return (
    <GlassCard className="flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-400">Network IO</h3>
          <div className="flex items-center gap-4 mt-1">
            <div>
              <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide mr-1.5">IN:</span>
              <span className="text-md font-bold text-white">{rxRate.toFixed(1)} Mbps</span>
            </div>
            <div>
              <span className="text-xs font-medium text-[#4F8CFF] uppercase tracking-wide mr-1.5">OUT:</span>
              <span className="text-md font-bold text-white">{txRate.toFixed(1)} Mbps</span>
            </div>
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-emerald-400">
          <Activity className="h-5 w-5" />
        </div>
      </div>

      {/* Visual Chart */}
      <div className="mt-2 flex-1">
        <AreaChart 
          data={history} 
          dataKey="rx" 
          strokeColor="#10B981"
          height={140}
        />
      </div>
    </GlassCard>
  );
}
