import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageTransition } from '../components/common/PageTransition';
import { alertsApi } from '../services/alerts.api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { GlassCard } from '../components/common/GlassCard';
import { Shield, ShieldAlert, Check, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Security() {
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((state) => state.user?.role) === 'ADMIN';

  const { data: alertsRes, isLoading, refetch } = useQuery({
    queryKey: ['securityAlertsList'],
    queryFn: () => alertsApi.findAll({ isResolved: false }),
  });

  const ackMutation = useMutation({
    mutationFn: alertsApi.acknowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['securityAlertsList'] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: alertsApi.resolve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['securityAlertsList'] });
    },
  });

  if (isLoading) return <LoadingSpinner />;

  const alerts = alertsRes?.data || [];

  return (
    <PageTransition>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Threat & Incident Operations</h1>
          <p className="text-xs text-gray-400 mt-1">Realtime intrusion alerts and SIEM analytics dashboard.</p>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core summary card */}
        <GlassCard className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xs text-gray-400 font-semibold uppercase">SIEM Core Status</h3>
            <p className="text-lg font-bold text-white mt-0.5">Online & Scanning</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/10">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xs text-gray-400 font-semibold uppercase">Active Threats</h3>
            <p className="text-lg font-bold text-white mt-0.5">{alerts.length} Incidents</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/10">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xs text-gray-400 font-semibold uppercase">SafeLine WAF Status</h3>
            <p className="text-lg font-bold text-white mt-0.5">Protecting (0 blocks)</p>
          </div>
        </GlassCard>
      </div>

      <div className="mt-8">
        <GlassCard>
          <div className="mb-4">
            <h3 className="font-bold text-white text-md">Incident Logs</h3>
          </div>

          <div className="space-y-3">
            {alerts.map((alert: any) => (
              <div 
                key={alert.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-white/2 border border-white/5 hover:bg-white/5 transition-all duration-200 gap-4"
              >
                <div className="flex gap-3">
                  <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 h-10 w-10 flex items-center justify-center shrink-0">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                        {alert.severity}
                      </span>
                      <h4 className="text-sm font-semibold text-white">{alert.title}</h4>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">{alert.message}</p>
                    <span className="text-[10px] text-gray-500 mt-2 block">
                      Detected: {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => ackMutation.mutate(alert.id)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => resolveMutation.mutate(alert.id)}
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                      title="Resolve Threat"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-sm">
                No active threats detected. All systems are secure.
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
