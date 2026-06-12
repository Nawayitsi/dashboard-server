import { useQuery } from '@tanstack/react-query';
import { PageTransition } from '../components/common/PageTransition';
import { metricsApi } from '../services/metrics.api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AreaChart } from '../components/charts/AreaChart';
import { GlassCard } from '../components/common/GlassCard';
import { Activity, ShieldCheck, Database, Server } from 'lucide-react';

export function Monitoring() {
  const { data: cpuData, isLoading: cpuLoading } = useQuery({
    queryKey: ['metricsCpuAggregated'],
    queryFn: () => metricsApi.getAggregated('CPU', 24, 15),
  });

  const { data: memData, isLoading: memLoading } = useQuery({
    queryKey: ['metricsMemAggregated'],
    queryFn: () => metricsApi.getAggregated('MEMORY', 24, 15),
  });

  if (cpuLoading || memLoading) return <LoadingSpinner />;

  // Fill in default values if API returns empty during initial setup
  const finalCpu = cpuData?.length ? cpuData : Array.from({ length: 10 }, (_, i) => ({ time: `${i}:00`, avg: 10 + i * 2 }));
  const finalMem = memData?.length ? memData : Array.from({ length: 10 }, (_, i) => ({ time: `${i}:00`, avg: 40 + i }));

  return (
    <PageTransition>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">System Monitoring</h1>
        <p className="text-xs text-gray-400 mt-1">Detailed telemetry history and metric logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white text-sm">Processor (CPU) Load History</h3>
            <span className="text-[10px] text-gray-500 font-semibold uppercase">Last 24 Hours</span>
          </div>
          <AreaChart data={finalCpu} dataKey="avg" strokeColor="#4F8CFF" height={220} />
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white text-sm">Memory (RAM) Load History</h3>
            <span className="text-[10px] text-gray-500 font-semibold uppercase">Last 24 Hours</span>
          </div>
          <AreaChart data={finalMem} dataKey="avg" strokeColor="#7A5CFF" height={220} />
        </GlassCard>
      </div>
    </PageTransition>
  );
}
