import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageTransition } from '../components/common/PageTransition';
import { dashboardApi } from '../services/dashboard.api';
import { CpuWidget } from '../components/dashboard/CpuWidget';
import { RamWidget } from '../components/dashboard/RamWidget';
import { DiskWidget } from '../components/dashboard/DiskWidget';
import { NetworkWidget } from '../components/dashboard/NetworkWidget';
import { ServicesWidget } from '../components/dashboard/ServicesWidget';
import { AlertsWidget } from '../components/dashboard/AlertsWidget';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useSocket } from '../hooks/useSocket';

export function Dashboard() {
  const { onEvent, subscribeToMetrics, unsubscribeFromMetrics } = useSocket();
  const [cpuVal, setCpuVal] = useState(12);
  const [ramVal, setRamVal] = useState(48);
  const [txVal, setTxVal] = useState(5.4);
  const [rxVal, setRxVal] = useState(25.1);

  const [history, setHistory] = useState<Array<{ time: string; cpu: number; ram: number; rx: number; tx: number }>>([]);

  const { data: overview, isLoading } = useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: dashboardApi.getOverview,
    refetchInterval: 5000,
  });

  useEffect(() => {
    subscribeToMetrics();

    const cleanup = onEvent<{ cpu: number; ram: number; rx: number; tx: number }>('metrics:update', (data) => {
      setCpuVal(data.cpu);
      setRamVal(data.ram);
      setTxVal(data.tx);
      setRxVal(data.rx);

      setHistory((prev) => {
        const next = [...prev, { time: new Date().toISOString(), ...data }];
        if (next.length > 20) next.shift();
        return next;
      });
    });

    // Generate basic simulated history lines for smooth charting immediately
    const mockHist = Array.from({ length: 15 }, (_, i) => {
      const d = new Date();
      d.setSeconds(d.getSeconds() - (15 - i) * 5);
      return {
        time: d.toISOString(),
        cpu: 10 + Math.random() * 20,
        ram: 45 + Math.random() * 5,
        rx: 15 + Math.random() * 10,
        tx: 2 + Math.random() * 4,
      };
    });
    setHistory(mockHist);

    return () => {
      unsubscribeFromMetrics();
      cleanup();
    };
  }, []);

  if (isLoading) return <LoadingSpinner />;

  return (
    <PageTransition>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <CpuWidget currentUsage={cpuVal} history={history.map(h => ({ time: h.time, cpu: h.cpu }))} />
        <RamWidget currentUsage={ramVal} history={history.map(h => ({ time: h.time, ram: h.ram }))} />
        <DiskWidget used={180} total={512} />
        <NetworkWidget txRate={txVal} rxRate={rxVal} history={history.map(h => ({ time: h.time, rx: h.rx, tx: h.tx }))} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ServicesWidget services={overview?.servicesList || [
            { id: '1', name: 'MikroTik Router', type: 'RouterOS', status: 'ONLINE', responseTime: 2 },
            { id: '2', name: 'Synology NAS', type: 'DSM Storage', status: 'ONLINE', responseTime: 8 },
            { id: '3', name: 'Nextcloud Cloud', type: 'Web App', status: 'ONLINE', responseTime: 42 },
            { id: '4', name: 'SIEM Core', type: 'ELK Log', status: 'DEGRADED', responseTime: 324 },
          ]} />
        </div>
        <div>
          <AlertsWidget alerts={overview?.alertsList || [
            { id: '1', severity: 'CRITICAL', title: 'High RAM Alert', message: 'Memory consumption exceeded threshold 90% on Nextcloud host VM.', createdAt: new Date().toISOString() },
            { id: '2', severity: 'WARNING', title: 'SIEM High Output Load', message: 'Aggregated incoming event stream queue bottleneck detected.', createdAt: new Date().toISOString() },
          ]} />
        </div>
      </div>
    </PageTransition>
  );
}
