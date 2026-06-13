import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageTransition } from '../components/common/PageTransition';
import { integrationsApi } from '../services/settings.api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { GlassCard } from '../components/common/GlassCard';
import {
  Play, ShieldAlert, RefreshCw, Trash2, Settings2, Eye, EyeOff,
  Plug, Bell, Palette, Zap, ChevronRight, Check, X, Save, Loader2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// ─── Tab definitions ──────────────────────────────────────
const TABS = [
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'automation', label: 'Automation', icon: Zap },
] as const;

type TabId = typeof TABS[number]['id'];

export function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>('integrations');

  return (
    <PageTransition>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">System Settings</h1>
        <p className="text-xs text-gray-400 mt-1">Configure integrations, notifications, appearance, and automation.</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 mb-6 p-1 bg-white/3 rounded-xl border border-white/5 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white/10 text-white shadow-inner border border-white/10'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'integrations' && <IntegrationsTab />}
      {activeTab === 'notifications' && <ComingSoonTab title="Notification Channels" description="Configure Telegram, Discord, Slack, Email, and Webhook notifications." />}
      {activeTab === 'appearance' && <ComingSoonTab title="Appearance" description="Customize logo, brand name, colors, and theme settings." />}
      {activeTab === 'automation' && <ComingSoonTab title="Automation Rules" description="Create IF/THEN rules for alerts, notifications, and automated actions." />}
    </PageTransition>
  );
}

// ─── Placeholder for upcoming tabs ────────────────────────
function ComingSoonTab({ title, description }: { title: string; description: string }) {
  return (
    <GlassCard>
      <div className="text-center py-12">
        <Settings2 className="h-10 w-10 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400 max-w-md mx-auto">{description}</p>
        <span className="inline-block mt-4 px-3 py-1 bg-[#4F8CFF]/10 text-[#4F8CFF] text-xs font-semibold rounded-full">
          Coming Soon
        </span>
      </div>
    </GlassCard>
  );
}

// ─── Integrations Tab ─────────────────────────────────────
function IntegrationsTab() {
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((state) => state.user?.role) === 'ADMIN';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [testResult, setTestResult] = useState<Record<string, { status: string; message?: string }>>({});

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrationsList'],
    queryFn: integrationsApi.findAll,
  });

  const testMutation = useMutation({
    mutationFn: integrationsApi.test,
    onSuccess: (data, variables) => {
      setTestResult(prev => ({ ...prev, [variables]: { status: data.success ? 'CONNECTED' : 'ERROR', message: data.message } }));
      queryClient.invalidateQueries({ queryKey: ['integrationsList'] });
    },
    onError: (_err, variables) => {
      setTestResult(prev => ({ ...prev, [variables]: { status: 'ERROR', message: 'Connection test failed' } }));
    },
  });

  const syncMutation = useMutation({
    mutationFn: integrationsApi.sync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrationsList'] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isEnabled }: { id: string; isEnabled: boolean }) =>
      integrationsApi.update(id, { isEnabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrationsList'] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, creds }: { id: string; creds: Record<string, string> }) =>
      integrationsApi.saveCredentials(id, creds),
    onSuccess: () => {
      setEditingId(null);
      setCredentials({});
      queryClient.invalidateQueries({ queryKey: ['integrationsList'] });
    },
  });

  const handleEdit = async (id: string) => {
    if (editingId === id) {
      setEditingId(null);
      setCredentials({});
      return;
    }
    try {
      const creds = await integrationsApi.getCredentials(id);
      setCredentials(creds || {});
      setEditingId(id);
    } catch {
      setCredentials({});
      setEditingId(id);
    }
  };

  const handleSave = (id: string) => {
    saveMutation.mutate({ id, creds: credentials });
  };

  // Fetch schema when editing
  const { data: schema } = useQuery({
    queryKey: ['integrationSchema', editingId],
    queryFn: () => integrationsApi.getSchema(editingId!),
    enabled: !!editingId,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="mb-5 border-b border-white/5 pb-3">
          <h3 className="font-bold text-white text-md">Infrastructure Connector Registry</h3>
          <p className="text-xs text-gray-500 mt-0.5">Configure API credentials, test connections, and manage sync status.</p>
        </div>

        <div className="space-y-3">
          {integrations?.map((item: any) => (
            <div key={item.id} className="rounded-xl border border-white/5 overflow-hidden transition-all">
              {/* Integration Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/2 hover:bg-white/4 transition-all gap-4">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${
                    item.status === 'CONNECTED' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' :
                    item.status === 'ERROR' ? 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]' :
                    'bg-gray-500'
                  }`} />
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{item.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Badge */}
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    (testResult[item.id]?.status || item.status) === 'CONNECTED'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : (testResult[item.id]?.status || item.status) === 'ERROR'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-gray-500/10 text-gray-400'
                  }`}>
                    {testResult[item.id]?.status || item.status}
                  </span>

                  {isAdmin && (
                    <>
                      {/* Toggle Enable/Disable */}
                      <button
                        onClick={() => toggleMutation.mutate({ id: item.id, isEnabled: !item.isEnabled })}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          item.isEnabled ? 'bg-[#4F8CFF]' : 'bg-white/10'
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          item.isEnabled ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </button>

                      {/* Configure */}
                      <button
                        onClick={() => handleEdit(item.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          editingId === item.id
                            ? 'bg-[#4F8CFF]/20 text-[#4F8CFF]'
                            : 'bg-white/5 hover:bg-white/10 text-white'
                        }`}
                      >
                        <Settings2 className="h-3.5 w-3.5" /> Configure
                      </button>

                      {/* Test */}
                      <button
                        onClick={() => testMutation.mutate(item.id)}
                        disabled={testMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold text-white transition-colors"
                      >
                        <Play className="h-3.5 w-3.5 text-emerald-400" /> Test
                      </button>

                      {/* Sync */}
                      <button
                        onClick={() => syncMutation.mutate(item.id)}
                        disabled={syncMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold text-white transition-colors"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 text-[#4F8CFF] ${syncMutation.isPending ? 'animate-spin' : ''}`} /> Sync
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Expandable Credential Form */}
              {editingId === item.id && schema && (
                <div className="border-t border-white/5 p-4 bg-white/2 space-y-3">
                  <p className="text-xs text-gray-400 mb-3">
                    Configure connection parameters. Sensitive fields are encrypted before storage.
                  </p>
                  {schema.fields?.map((field: any) => (
                    <div key={field.key} className="space-y-1">
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        {field.label} {field.required && <span className="text-red-400">*</span>}
                      </label>
                      {field.description && (
                        <p className="text-[10px] text-gray-500">{field.description}</p>
                      )}
                      {field.type === 'toggle' ? (
                        <button
                          onClick={() => setCredentials(prev => ({ ...prev, [field.key]: prev[field.key] === 'true' ? 'false' : 'true' }))}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            credentials[field.key] === 'true' ? 'bg-[#4F8CFF]' : 'bg-white/10'
                          }`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            credentials[field.key] === 'true' ? 'translate-x-5' : 'translate-x-1'
                          }`} />
                        </button>
                      ) : (
                        <div className="relative">
                          <input
                            type={field.type === 'password' && !showPasswords[field.key] ? 'password' : field.type === 'number' ? 'number' : 'text'}
                            value={credentials[field.key] || ''}
                            onChange={(e) => setCredentials(prev => ({ ...prev, [field.key]: e.target.value }))}
                            placeholder={field.placeholder}
                            className="w-full px-3.5 py-2.5 bg-white/3 border border-white/5 rounded-xl text-sm text-white outline-none focus:border-[#4F8CFF]/50 transition-colors pr-10"
                          />
                          {field.type === 'password' && (
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                              {showPasswords[field.key] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleSave(item.id)}
                      disabled={saveMutation.isPending}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 rounded-lg text-xs font-semibold text-white transition-colors"
                    >
                      {saveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      Save Credentials
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setCredentials({}); }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold text-gray-400 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Test result message */}
              {testResult[item.id]?.message && (
                <div className={`px-4 py-2 border-t border-white/5 text-xs ${
                  testResult[item.id].status === 'CONNECTED' ? 'text-emerald-400 bg-emerald-500/5' : 'text-red-400 bg-red-500/5'
                }`}>
                  {testResult[item.id].status === 'CONNECTED' ? <Check className="h-3 w-3 inline mr-1" /> : <X className="h-3 w-3 inline mr-1" />}
                  {testResult[item.id].message}
                </div>
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
