import { PageTransition } from '../components/common/PageTransition';
import { GlassCard } from '../components/common/GlassCard';
import { GaugeChart } from '../components/charts/GaugeChart';
import { HardDrive, CheckCircle2, AlertCircle, Database } from 'lucide-react';

export function Storage() {
  return (
    <PageTransition>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Synology Storage Systems</h1>
        <p className="text-xs text-gray-400 mt-1">Visual capacity and drive health diagnostic monitor.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex flex-col items-center">
          <h3 className="font-semibold text-gray-400 text-sm mb-2">Volume 1 Utilization</h3>
          <GaugeChart value={35} title="Used Space" color="#4F8CFF" />
          <div className="text-xs text-gray-500 mt-2">180 GB Used / 512 GB Total</div>
        </GlassCard>

        <GlassCard className="flex flex-col items-center">
          <h3 className="font-semibold text-gray-400 text-sm mb-2">Volume 2 Utilization</h3>
          <GaugeChart value={84} title="Used Space" color="#F59E0B" />
          <div className="text-xs text-gray-500 mt-2">1.8 TB Used / 2.2 TB Total</div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-semibold text-gray-400">Disk Array Status</h3>
              <p className="text-2xl font-extrabold text-white mt-1">Healthy</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-2.5 mt-4">
            <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
              <span className="text-gray-400">Drive 1 (SSD)</span>
              <span className="text-emerald-400 font-semibold">OK (32°C)</span>
            </div>
            <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
              <span className="text-gray-400">Drive 2 (SSD)</span>
              <span className="text-emerald-400 font-semibold">OK (31°C)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Drive 3 (HDD)</span>
              <span className="text-emerald-400 font-semibold">OK (36°C)</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
