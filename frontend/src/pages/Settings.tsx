import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PageTransition } from '../components/common/PageTransition';
import { settingsApi, integrationsApi } from '../services/settings.api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { GlassCard } from '../components/common/GlassCard';
import { RefreshCw, Play, ShieldAlert, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Settings() {
  const isAdmin = useAuthStore((state) => state.user?.role) === 'ADMIN';
  const [testResult, setTestResult] = useState<Record<string, string>>({});

  const { data: integrations, isLoading, refetch } = useQuery({
    queryKey: ['integrationsList'],
    queryFn: integrationsApi.findAll,
  });

  const testMutation = useMutation({
    mutationFn: integrationsApi.test,
    onSuccess: (data, variables) => {
      setTestResult(prev => ({ ...prev, [variables]: data.success ? 'CONNECTED' : 'ERROR' }));
      refetch();
    },
    onError: (err, variables) => {
      setTestResult(prev => ({ ...prev, [variables]: 'ERROR' }));
    }
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <PageTransition>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">System Settings & Integrations</h1>
        <p className="text-xs text-gray-400 mt-1">Configure active plugins and connector options.</p>
      </div>

      <div className="space-y-6">
        <GlassCard>
          <div className="mb-5 border-b border-white/5 pb-3">
            <h3 className="font-bold text-white text-md">Infrastructure Connector Registry</h3>
            <p className="text-xs text-gray-500 mt-0.5">Test API status and configuration properties.</p>
          </div>

          <div className="space-y-4">
            {integrations?.map((item: any) => (
              <div 
                key={item.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-white/2 border border-white/5 hover:bg-white/5 transition-all gap-4"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">{item.name}</h4>
                  <p className="text-xs text-gray-500 uppercase mt-0.5 tracking-wider">{item.type}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    item.status === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {testResult[item.id] || item.status}
                  </span>

                  {isAdmin && (
                    <button
                      onClick={() => testMutation.mutate(item.id)}
                      disabled={testMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold text-white transition-colors"
                    >
                      <Play className="h-3.5 w-3.5 text-[#4F8CFF]" /> Test Link
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
