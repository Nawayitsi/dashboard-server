import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageTransition } from '../components/common/PageTransition';
import { dashboardApi } from '../services/dashboard.api';
import { CpuWidget } from '../components/dashboard/CpuWidget';
import { RamWidget } from '../components/dashboard/RamWidget';
import { DiskWidget } from '../components/dashboard/DiskWidget';
import { NetworkWidget } from '../components/dashboard/NetworkWidget';
import { ServicesWidget } from '../components/dashboard/ServicesWidget';
import { AlertsWidget } from '../components/dashboard/AlertsWidget';
import { MetricWidget } from '../components/dashboard/MetricWidget';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { GlassCard } from '../components/common/GlassCard';
import { useSocket } from '../hooks/useSocket';
import { useAuthStore } from '../store/authStore';
import {
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Info,
} from 'lucide-react';

export function Dashboard() {
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((state) => state.user?.role) === 'ADMIN';

  const { onEvent, subscribeToMetrics, unsubscribeFromMetrics } = useSocket();
  const [cpuVal, setCpuVal] = useState(12);
  const [ramVal, setRamVal] = useState(48);
  const [txVal, setTxVal] = useState(5.4);
  const [rxVal, setRxVal] = useState(25.1);

  const [history, setHistory] = useState<Array<{ time: string; cpu: number; ram: number; rx: number; tx: number }>>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);

  // Fetch Dashboard Layout
  const { data: layoutData, isLoading: isLayoutLoading } = useQuery({
    queryKey: ['dashboardLayout'],
    queryFn: dashboardApi.getLayout,
  });

  // Fetch Available Widgets
  const { data: availableWidgets = [] } = useQuery({
    queryKey: ['availableWidgets'],
    queryFn: dashboardApi.getAvailableWidgets,
    enabled: isEditing,
  });

  // Local state for layout ordering & editing
  const [localWidgets, setLocalWidgets] = useState<any[]>([]);

  useEffect(() => {
    if (layoutData?.widgets) {
      setLocalWidgets(layoutData.widgets);
    }
  }, [layoutData]);

  // Mutations
  const saveLayoutMutation = useMutation({
    mutationFn: (layoutItems: any[]) =>
      dashboardApi.saveLayout(layoutData.dashboardId, layoutItems),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardLayout'] });
      setIsEditing(false);
    },
  });

  const addWidgetMutation = useMutation({
    mutationFn: (widgetId: string) =>
      dashboardApi.addWidget({
        dashboardId: layoutData.dashboardId,
        widgetId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardLayout'] });
      setShowAddWidget(false);
    },
  });

  const removeWidgetMutation = useMutation({
    mutationFn: dashboardApi.removeWidget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardLayout'] });
    },
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

  if (isLayoutLoading) return <LoadingSpinner />;

  // Overview metric queries
  const activeWidgets = isEditing ? localWidgets : layoutData?.widgets || [];

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const nextWidgets = [...localWidgets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= nextWidgets.length) return;

    // Swap
    const temp = nextWidgets[index];
    nextWidgets[index] = nextWidgets[targetIndex];
    nextWidgets[targetIndex] = temp;
    setLocalWidgets(nextWidgets);
  };

  const handleResize = (index: number, newW: number) => {
    const nextWidgets = [...localWidgets];
    nextWidgets[index] = {
      ...nextWidgets[index],
      layout: { ...nextWidgets[index].layout, w: newW },
    };
    setLocalWidgets(nextWidgets);
  };

  const handleSaveLayout = () => {
    const layoutPayload = localWidgets.map((lw, idx) => ({
      dashboardWidgetId: lw.id,
      x: (idx * 4) % 12,
      y: Math.floor(idx / 3) * 4,
      w: lw.layout?.w || 4,
      h: lw.layout?.h || 4,
    }));
    saveLayoutMutation.mutate(layoutPayload);
  };

  // Mappers for rendering widget components
  const renderWidgetComponent = (w: any) => {
    switch (w.renderer) {
      case 'CpuWidget':
        return (
          <CpuWidget
            currentUsage={cpuVal}
            history={history.map((h) => ({ time: h.time, cpu: h.cpu }))}
          />
        );
      case 'RamWidget':
        return (
          <RamWidget
            currentUsage={ramVal}
            history={history.map((h) => ({ time: h.time, ram: h.ram }))}
          />
        );
      case 'DiskWidget':
        return <DiskWidget used={180} total={512} />;
      case 'NetworkWidget':
        return (
          <NetworkWidget
            txRate={txVal}
            rxRate={rxVal}
            history={history.map((h) => ({ time: h.time, rx: h.rx, tx: h.tx }))}
          />
        );
      case 'ServicesWidget':
        return (
          <ServicesWidget
            services={[
              { id: '1', name: 'MikroTik Router', type: 'RouterOS', status: 'ONLINE', responseTime: 2 },
              { id: '2', name: 'Synology NAS', type: 'DSM Storage', status: 'ONLINE', responseTime: 8 },
              { id: '3', name: 'Nextcloud Cloud', type: 'Web App', status: 'ONLINE', responseTime: 42 },
              { id: '4', name: 'SIEM Core', type: 'ELK Log', status: 'DEGRADED', responseTime: 324 },
            ]}
          />
        );
      case 'AlertsWidget':
        return (
          <AlertsWidget
            alerts={[
              {
                id: '1',
                severity: 'CRITICAL',
                title: 'High RAM Alert',
                message: 'Memory consumption exceeded threshold 90% on Nextcloud host VM.',
                createdAt: new Date().toISOString(),
              },
              {
                id: '2',
                severity: 'WARNING',
                title: 'SIEM High Output Load',
                message: 'Aggregated incoming event stream queue bottleneck detected.',
                createdAt: new Date().toISOString(),
              },
            ]}
          />
        );
      default:
        // Generic MetricWidget for custom/integration-driven widgets
        return (
          <MetricWidget
            title={w.name}
            value={w.renderer === 'UptimeWidget' ? '14d 6h' : Math.floor(Math.random() * 100)}
            unit={w.renderer === 'CpuWidget' ? '%' : ''}
            description={w.description}
            category={w.category}
            dataSource={w.dataSource}
          />
        );
    }
  };

  const getColSpanClass = (w: number) => {
    switch (w) {
      case 3:
        return 'col-span-12 md:col-span-6 lg:col-span-3';
      case 6:
        return 'col-span-12 lg:col-span-6';
      case 12:
        return 'col-span-12';
      case 4:
      default:
        return 'col-span-12 md:col-span-6 lg:col-span-4';
    }
  };

  return (
    <PageTransition>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Main Dashboard</h1>
          <p className="text-xs text-gray-400 mt-1">Real-time status overview of homelab services and resource loads.</p>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setShowAddWidget(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-white transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Widget
                </button>
                <button
                  onClick={handleSaveLayout}
                  disabled={saveLayoutMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 rounded-xl text-xs font-semibold text-white transition-colors"
                >
                  <Save className="h-4 w-4" /> Save Layout
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setLocalWidgets(layoutData?.widgets || []);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-gray-400 transition-colors"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-white transition-colors"
              >
                <Edit className="h-4 w-4" /> Customize Dashboard
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid containing the widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {activeWidgets.map((w: any, index: number) => (
          <div
            key={w.id}
            className={`${getColSpanClass(w.layout?.w || 4)} transition-all duration-300 relative ${
              isEditing ? 'border border-[#4F8CFF]/30 rounded-2xl bg-[#4F8CFF]/2 overflow-hidden' : ''
            }`}
          >
            {/* Overlay editing panel */}
            {isEditing && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 backdrop-blur-md px-2 py-1.5 rounded-xl border border-white/10 z-10">
                {/* Sizing button */}
                <select
                  value={w.layout?.w || 4}
                  onChange={(e) => handleResize(index, parseInt(e.target.value))}
                  className="bg-transparent text-white text-[10px] outline-none border-none mr-2 font-semibold uppercase cursor-pointer"
                >
                  <option value={3} className="bg-[#0B0D10]">Quarter (25%)</option>
                  <option value={4} className="bg-[#0B0D10]">Third (33%)</option>
                  <option value={6} className="bg-[#0B0D10]">Half (50%)</option>
                  <option value={12} className="bg-[#0B0D10]">Full (100%)</option>
                </select>

                {/* Move Left */}
                <button
                  disabled={index === 0}
                  onClick={() => handleMove(index, 'up')}
                  className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>

                {/* Move Right */}
                <button
                  disabled={index === activeWidgets.length - 1}
                  onClick={() => handleMove(index, 'down')}
                  className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-30"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>

                {/* Delete widget from dashboard */}
                <button
                  onClick={() => {
                    if (confirm(`Remove "${w.name}" from dashboard?`)) {
                      removeWidgetMutation.mutate(w.id);
                    }
                  }}
                  className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors ml-1 border-l border-white/5 pl-1.5"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Widget element */}
            <div className={isEditing ? 'opacity-80 pointer-events-none' : ''}>
              {renderWidgetComponent(w)}
            </div>
          </div>
        ))}
      </div>

      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <GlassCard className="w-full max-w-md">
            <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-3">
              <h3 className="font-bold text-white text-md">Add Widget to Dashboard</h3>
              <button
                onClick={() => setShowAddWidget(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {availableWidgets.map((widget: any) => (
                <button
                  key={widget.id}
                  onClick={() => addWidgetMutation.mutate(widget.id)}
                  className="w-full flex items-start gap-3 p-3.5 bg-white/2 hover:bg-white/5 border border-white/5 rounded-xl text-left transition-all hover:scale-[1.01]"
                >
                  <div className="p-2 bg-white/5 rounded-lg text-[#4F8CFF]">
                    <LayoutGrid className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-xs">{widget.name}</span>
                      <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400 uppercase tracking-wider">{widget.category}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 leading-normal">{widget.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </PageTransition>
  );
}
