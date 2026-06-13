import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageTransition } from '../components/common/PageTransition';
import { integrationsApi, settingsApi } from '../services/settings.api';
import { notificationChannelsApi, NotificationChannelItem } from '../services/notifications.api';
import { automationApi, AutomationRuleItem } from '../services/automation.api';
import { servicesApi } from '../services/services.api';
import { useAppearance } from '../store/AppearanceContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { GlassCard } from '../components/common/GlassCard';
import {
  Play, ShieldAlert, RefreshCw, Trash2, Settings2, Eye, EyeOff,
  Plug, Bell, Palette, Zap, ChevronRight, Check, X, Save, Loader2, Plus, Upload, Terminal, Shield, MessageSquare
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
      {activeTab === 'notifications' && <NotificationsTab />}
      {activeTab === 'appearance' && <AppearanceTab />}
      {activeTab === 'automation' && <AutomationTab />}
    </PageTransition>
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
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors bg-white/10 ${
                          item.isEnabled ? 'bg-[#4F8CFF]' : ''
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
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors bg-white/10 ${
                            credentials[field.key] === 'true' ? 'bg-[#4F8CFF]' : ''
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

// ─── Notifications Tab ─────────────────────────────────────
function NotificationsTab() {
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((state) => state.user?.role) === 'ADMIN';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('TELEGRAM');
  const [config, setConfig] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [testResult, setTestResult] = useState<Record<string, { success: boolean; message?: string }>>({});

  const { data: channels, isLoading } = useQuery({
    queryKey: ['notificationChannels'],
    queryFn: notificationChannelsApi.getChannels,
  });

  const createMutation = useMutation({
    mutationFn: notificationChannelsApi.createChannel,
    onSuccess: () => {
      setIsAdding(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['notificationChannels'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NotificationChannelItem> }) =>
      notificationChannelsApi.updateChannel(id, data),
    onSuccess: () => {
      setEditingId(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['notificationChannels'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: notificationChannelsApi.deleteChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationChannels'] });
    },
  });

  const testMutation = useMutation({
    mutationFn: notificationChannelsApi.testChannel,
    onSuccess: (data, variables) => {
      setTestResult(prev => ({ ...prev, [variables]: { success: true, message: 'Test notification sent successfully!' } }));
    },
    onError: (err: any, variables) => {
      setTestResult(prev => ({ ...prev, [variables]: { success: false, message: err.response?.data?.message || 'Failed to dispatch test notification' } }));
    },
  });

  const resetForm = () => {
    setName('');
    setType('TELEGRAM');
    setConfig({});
    setShowPasswords({});
  };

  const handleEdit = async (channel: NotificationChannelItem) => {
    if (editingId === channel.id) {
      setEditingId(null);
      resetForm();
      return;
    }
    // Fetch full decrytped item for edit
    try {
      const full = await notificationChannelsApi.getChannelById(channel.id);
      setName(full.name);
      setType(full.type);
      setConfig(full.config || {});
      setEditingId(channel.id);
      setIsAdding(false);
    } catch {
      setName(channel.name);
      setType(channel.type);
      setConfig({});
      setEditingId(channel.id);
      setIsAdding(false);
    }
  };

  const handleSave = () => {
    const payload = { name, type, config, isEnabled: true };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const formFields = {
    TELEGRAM: [
      { key: 'botToken', label: 'Bot Token', type: 'password', placeholder: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ' },
      { key: 'chatId', label: 'Chat ID', type: 'text', placeholder: '-100123456789' },
    ],
    DISCORD: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://discord.com/api/webhooks/...' },
    ],
    SLACK: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.slack.com/services/...' },
    ],
    WEBHOOK: [
      { key: 'url', label: 'Webhook Endpoint URL', type: 'text', placeholder: 'https://your-api.com/alert' },
    ],
    EMAIL: [
      { key: 'to', label: 'Recipient Email Address', type: 'text', placeholder: 'admin@domain.com' },
      { key: 'from', label: 'Sender Address (Optional)', type: 'text', placeholder: 'noreply@homelabos.local' },
    ],
  }[type] || [];

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
          <div>
            <h3 className="font-bold text-white text-md">Alert Notification Channels</h3>
            <p className="text-xs text-gray-500 mt-0.5">Route system alerts to Telegram, Discord, Slack, Email, or custom HTTP webhooks.</p>
          </div>
          {isAdmin && !isAdding && !editingId && (
            <button
              onClick={() => { setIsAdding(true); resetForm(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add Channel
            </button>
          )}
        </div>

        {/* Create / Edit Form panel */}
        {(isAdding || editingId) && (
          <div className="mb-6 p-4 rounded-xl border border-[#4F8CFF]/20 bg-white/2 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h4 className="font-bold text-white text-xs">{editingId ? 'Modify Notification Channel' : 'Register Alert Channel'}</h4>
              <button onClick={() => { setIsAdding(false); setEditingId(null); resetForm(); }} className="text-gray-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Channel Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Administrator Telegram Bot"
                  className="w-full px-3.5 py-2 bg-white/3 border border-white/5 rounded-xl text-sm text-white outline-none focus:border-[#4F8CFF]/50 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Channel Type</label>
                <select
                  value={type}
                  disabled={!!editingId}
                  onChange={(e) => { setType(e.target.value); setConfig({}); }}
                  className="w-full px-3.5 py-2.5 bg-[#0B0D10] border border-white/5 rounded-xl text-sm text-white outline-none focus:border-[#4F8CFF]/50"
                >
                  <option value="TELEGRAM">Telegram Bot</option>
                  <option value="DISCORD">Discord Webhook</option>
                  <option value="SLACK">Slack Webhook</option>
                  <option value="WEBHOOK">Generic Webhook (POST)</option>
                  <option value="EMAIL">SMTP Email (Simulated)</option>
                </select>
              </div>
            </div>

            {/* Dynamic fields */}
            <div className="space-y-3 pt-2">
              {formFields.map(field => (
                <div key={field.key} className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{field.label}</label>
                  <div className="relative">
                    <input
                      type={field.type === 'password' && !showPasswords[field.key] ? 'password' : 'text'}
                      value={config[field.key] || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-3.5 py-2 bg-white/3 border border-white/5 rounded-xl text-sm text-white outline-none focus:border-[#4F8CFF]/50 transition-colors pr-10"
                    />
                    {field.type === 'password' && (
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        {showPasswords[field.key] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 rounded-lg text-xs font-semibold text-white transition-colors"
              >
                <Save className="h-3.5 w-3.5" /> Save Channel
              </button>
              <button
                onClick={() => { setIsAdding(false); setEditingId(null); resetForm(); }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold text-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Channels List */}
        <div className="space-y-3">
          {channels?.map((item: NotificationChannelItem) => (
            <div key={item.id} className="rounded-xl border border-white/5 overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/2 hover:bg-white/4 transition-all gap-4">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${item.isEnabled ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{item.type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Enable toggler */}
                  <button
                    onClick={() => updateMutation.mutate({ id: item.id, data: { isEnabled: !item.isEnabled } })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors bg-white/10 ${
                      item.isEnabled ? 'bg-[#4F8CFF]' : ''
                    }`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      item.isEnabled ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </button>

                  <button
                    onClick={() => handleEdit(item)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white"
                  >
                    <Settings2 className="h-3.5 w-3.5" /> Configure
                  </button>

                  <button
                    onClick={() => testMutation.mutate(item.id)}
                    disabled={testMutation.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white"
                  >
                    <Play className="h-3.5 w-3.5 text-emerald-400" /> Test
                  </button>

                  <button
                    onClick={() => { if (confirm('Are you sure you want to delete this channel?')) deleteMutation.mutate(item.id); }}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {testResult[item.id] && (
                <div className={`px-4 py-2 text-xs border-t border-white/5 ${
                  testResult[item.id].success ? 'bg-emerald-500/5 text-emerald-400' : 'bg-red-500/5 text-red-400'
                }`}>
                  {testResult[item.id].success ? <Check className="h-3.5 w-3.5 inline mr-1" /> : <X className="h-3.5 w-3.5 inline mr-1" />}
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

// ─── Appearance Tab ────────────────────────────────────────
function AppearanceTab() {
  const { brandName, logo, favicon, primaryColor, accentColor, sidebarStyle, cardStyle, updateLocalSettings, refreshAppearance } = useAppearance();
  const isAdmin = useAuthStore((state) => state.user?.role) === 'ADMIN';

  const [localBrandName, setLocalBrandName] = useState(brandName);
  const [localPrimaryColor, setLocalPrimaryColor] = useState(primaryColor);
  const [localAccentColor, setLocalAccentColor] = useState(accentColor);
  const [localSidebarStyle, setLocalSidebarStyle] = useState(sidebarStyle);
  const [localCardStyle, setLocalCardStyle] = useState(cardStyle);
  const [localLogo, setLocalLogo] = useState(logo);
  const [localFavicon, setLocalFavicon] = useState(favicon);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalBrandName(brandName);
    setLocalPrimaryColor(primaryColor);
    setLocalAccentColor(accentColor);
    setLocalSidebarStyle(sidebarStyle);
    setLocalCardStyle(cardStyle);
    setLocalLogo(logo);
    setLocalFavicon(favicon);
  }, [brandName, logo, favicon, primaryColor, accentColor, sidebarStyle, cardStyle]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalLogo(reader.result as string);
        updateLocalSettings({ logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalFavicon(reader.result as string);
        updateLocalSettings({ favicon: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAppearance = async () => {
    if (!isAdmin) return;
    setIsSaving(true);
    try {
      await settingsApi.updateAppearance({
        brandName: localBrandName,
        primaryColor: localPrimaryColor,
        accentColor: localAccentColor,
        sidebarStyle: localSidebarStyle,
        cardStyle: localCardStyle,
        logo: localLogo,
        favicon: localFavicon,
      });
      await refreshAppearance();
      alert('Appearance branding saved and loaded!');
    } catch (err: any) {
      alert('Failed to save appearance settings: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Preview styling helpers
  const previewSidebarClass = 
    localSidebarStyle === 'solid'
      ? 'bg-[#0B0D10] border-r border-white/5'
      : localSidebarStyle === 'transparent'
      ? 'bg-transparent border-none'
      : 'glass-panel';

  const previewCardClass = 
    localCardStyle === 'flat'
      ? 'bg-[#0D1014] border border-white/5 rounded-xl'
      : 'glass-panel rounded-xl';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Form settings */}
      <div className="lg:col-span-7">
        <GlassCard>
          <div className="mb-5 border-b border-white/5 pb-3">
            <h3 className="font-bold text-white text-md">Appearance & Branding Customizer</h3>
            <p className="text-xs text-gray-500 mt-0.5">Customize default portal style, color variables, logos, and UI layouts.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Portal Brand Name</label>
                <input
                  type="text"
                  value={localBrandName}
                  onChange={(e) => {
                    setLocalBrandName(e.target.value);
                    updateLocalSettings({ brandName: e.target.value });
                  }}
                  className="w-full px-3.5 py-2.5 bg-white/3 border border-white/5 rounded-xl text-sm text-white outline-none focus:border-[#4F8CFF]/50 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-sans">Theme / Presets</label>
                <select
                  value={localSidebarStyle + '-' + localCardStyle}
                  onChange={(e) => {
                    const [side, card] = e.target.value.split('-');
                    setLocalSidebarStyle(side);
                    setLocalCardStyle(card);
                    updateLocalSettings({ sidebarStyle: side, cardStyle: card });
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#0B0D10] border border-white/5 rounded-xl text-sm text-white outline-none focus:border-[#4F8CFF]/50"
                >
                  <option value="glass-glass">Glassmorphism Default (Premium)</option>
                  <option value="solid-flat">Flat Minimal Dark</option>
                  <option value="transparent-glass">Transparent Sidebar & Glass Cards</option>
                </select>
              </div>
            </div>

            {/* Colors picker */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Primary Color Accent</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={localPrimaryColor}
                    onChange={(e) => {
                      setLocalPrimaryColor(e.target.value);
                      updateLocalSettings({ primaryColor: e.target.value });
                    }}
                    className="h-10 w-10 shrink-0 bg-transparent border border-white/10 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localPrimaryColor}
                    onChange={(e) => {
                      setLocalPrimaryColor(e.target.value);
                      updateLocalSettings({ primaryColor: e.target.value });
                    }}
                    className="w-full px-3 py-2 bg-white/3 border border-white/5 rounded-xl text-sm text-white text-center font-mono outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Secondary Accent Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={localAccentColor}
                    onChange={(e) => {
                      setLocalAccentColor(e.target.value);
                      updateLocalSettings({ accentColor: e.target.value });
                    }}
                    className="h-10 w-10 shrink-0 bg-transparent border border-white/10 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localAccentColor}
                    onChange={(e) => {
                      setLocalAccentColor(e.target.value);
                      updateLocalSettings({ accentColor: e.target.value });
                    }}
                    className="w-full px-3 py-2 bg-white/3 border border-white/5 rounded-xl text-sm text-white text-center font-mono outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Image assets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Logo Image</label>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                    {localLogo ? <img src={localLogo} className="h-full w-full object-cover" /> : <Terminal className="h-6 w-6 text-gray-500" />}
                  </div>
                  <label className="flex-1 flex flex-col items-center px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 cursor-pointer text-center select-none text-xs font-semibold text-white">
                    <span className="flex items-center gap-1"><Upload className="h-3.5 w-3.5" /> Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Favicon Icon</label>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                    {localFavicon ? <img src={localFavicon} className="h-6 w-6 object-cover" /> : <Palette className="h-6 w-6 text-gray-500" />}
                  </div>
                  <label className="flex-1 flex flex-col items-center px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 cursor-pointer text-center select-none text-xs font-semibold text-white">
                    <span className="flex items-center gap-1"><Upload className="h-3.5 w-3.5" /> Upload Icon</span>
                    <input type="file" accept="image/x-icon,image/png" onChange={handleFaviconUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="pt-4 flex gap-3 border-t border-white/5">
                <button
                  onClick={handleSaveAppearance}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 rounded-xl text-xs font-semibold text-white transition-colors"
                  style={{ backgroundColor: localPrimaryColor }}
                >
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Mini preview mockup (Wow aesthetics) */}
      <div className="lg:col-span-5 flex flex-col">
        <div className="mb-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Real-time Layout Preview</label>
        </div>
        <div className="flex-1 bg-[#090B0D] border border-white/5 rounded-2xl p-4 overflow-hidden relative min-h-[350px] flex gap-3">
          {/* Backdrop mesh */}
          <div className="absolute inset-0 bg-radial-glow pointer-events-none opacity-30" />
          
          {/* Mini Sidebar */}
          <div className={`w-28 rounded-xl p-2 flex flex-col gap-3 relative z-10 shrink-0 transition-all ${previewSidebarClass}`}>
            <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
              <div 
                className="h-6 w-6 rounded-md flex items-center justify-center text-[10px] text-white shrink-0 overflow-hidden"
                style={{ 
                  backgroundImage: localLogo ? 'none' : `linear-gradient(to top right, ${localPrimaryColor}, ${localAccentColor})` 
                }}
              >
                {localLogo ? <img src={localLogo} className="h-full w-full object-cover" /> : <Terminal className="h-3 w-3" />}
              </div>
              <span className="font-bold text-[10px] text-white truncate">{localBrandName || 'HomelabOS'}</span>
            </div>
            <div className="space-y-1">
              <div 
                className="rounded-md px-2 py-1 text-[9px] font-medium border-l-2 bg-white/5"
                style={{ borderLeftColor: localPrimaryColor, color: localPrimaryColor }}
              >
                Dashboard
              </div>
              <div className="rounded-md px-2 py-1 text-[9px] font-medium text-gray-500">
                Applications
              </div>
              <div className="rounded-md px-2 py-1 text-[9px] font-medium text-gray-500">
                Monitoring
              </div>
            </div>
          </div>

          {/* Mini Dashboard Page */}
          <div className="flex-1 flex flex-col gap-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white">System Status</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
            </div>

            {/* Simulated Card widgets */}
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-2.5 ${previewCardClass} space-y-1`}>
                <span className="text-[8px] text-gray-500">CPU Usage</span>
                <div className="text-xs font-bold text-white">12%</div>
                <div className="w-full bg-white/5 h-1 rounded overflow-hidden">
                  <div className="h-full rounded" style={{ width: '12%', backgroundColor: localPrimaryColor }} />
                </div>
              </div>
              <div className={`p-2.5 ${previewCardClass} space-y-1`}>
                <span className="text-[8px] text-gray-500">Memory</span>
                <div className="text-xs font-bold text-white">48%</div>
                <div className="w-full bg-white/5 h-1 rounded overflow-hidden">
                  <div className="h-full rounded" style={{ width: '48%', backgroundColor: localAccentColor }} />
                </div>
              </div>
            </div>

            {/* Customizer Button preview */}
            <div className={`p-3 ${previewCardClass} flex flex-col gap-1 items-center text-center justify-center flex-1`}>
              <span className="text-[9px] text-gray-400 font-medium">Interactive Elements</span>
              <button 
                className="mt-1 px-3 py-1 rounded text-[8px] font-bold text-white shadow-md"
                style={{ backgroundImage: `linear-gradient(to right, ${localPrimaryColor}, ${localAccentColor})` }}
              >
                Primary Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Automation Tab ────────────────────────────────────────
function AutomationTab() {
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((state) => state.user?.role) === 'ADMIN';
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<'METRIC_THRESHOLD' | 'SERVICE_STATUS'>('METRIC_THRESHOLD');
  const [triggerConfig, setTriggerConfig] = useState<any>({ metric: 'CPU', operator: '>', value: 90 });
  const [actionType, setActionType] = useState<'SEND_NOTIFICATION' | 'CREATE_ALERT'>('SEND_NOTIFICATION');
  const [actionConfig, setActionConfig] = useState<any>({ channelId: '', template: '' });

  // Fetch data
  const { data: rules, isLoading } = useQuery({
    queryKey: ['automationRules'],
    queryFn: automationApi.getRules,
  });

  const { data: channels = [] } = useQuery({
    queryKey: ['notificationChannels'],
    queryFn: notificationChannelsApi.getChannels,
  });

  const { data: servicesData } = useQuery({
    queryKey: ['servicesList'],
    queryFn: () => servicesApi.getStatuses(),
  });

  const activeChannels = channels?.filter((c: any) => c.isEnabled) || [];

  const createMutation = useMutation({
    mutationFn: automationApi.createRule,
    onSuccess: () => {
      setIsAdding(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['automationRules'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AutomationRuleItem> }) =>
      automationApi.updateRule(id, data),
    onSuccess: () => {
      setEditingId(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['automationRules'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: automationApi.deleteRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules'] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isEnabled }: { id: string; isEnabled: boolean }) =>
      automationApi.updateRule(id, { isEnabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules'] });
    },
  });

  const resetForm = () => {
    setName('');
    setDescription('');
    setTriggerType('METRIC_THRESHOLD');
    setTriggerConfig({ metric: 'CPU', operator: '>', value: 90 });
    setActionType('SEND_NOTIFICATION');
    setActionConfig({ channelId: activeChannels[0]?.id || '', template: '' });
  };

  const handleEdit = (rule: AutomationRuleItem) => {
    setName(rule.name);
    setDescription(rule.description || '');
    setTriggerType(rule.triggerType);
    setTriggerConfig(rule.triggerConfig || {});
    setActionType(rule.actionType);
    setActionConfig(rule.actionConfig || {});
    setEditingId(rule.id);
    setIsAdding(false);
  };

  const handleSave = () => {
    // Fill default channel if needed for SEND_NOTIFICATION
    const cleanActionConfig = { ...actionConfig };
    if (actionType === 'SEND_NOTIFICATION' && !cleanActionConfig.channelId) {
      cleanActionConfig.channelId = activeChannels[0]?.id || '';
    }

    const payload = {
      name,
      description,
      triggerType,
      triggerConfig,
      actionType,
      actionConfig: cleanActionConfig,
      isEnabled: true,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
          <div>
            <h3 className="font-bold text-white text-md">Infrastructure Automation Rules</h3>
            <p className="text-xs text-gray-500 mt-0.5 font-sans">Establish evaluation rules that trigger notifications or system warning alerts based on system telemetry threshold breaches or status downtime.</p>
          </div>
          {isAdmin && !isAdding && !editingId && (
            <button
              onClick={() => { setIsAdding(true); resetForm(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Create Rule
            </button>
          )}
        </div>

        {/* Add/Edit Rule panel */}
        {(isAdding || editingId) && (
          <div className="mb-6 p-4 rounded-xl border border-[#4F8CFF]/20 bg-white/2 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h4 className="font-bold text-white text-xs">{editingId ? 'Modify Automation Rule' : 'Add New Automation Rule'}</h4>
              <button onClick={() => { setIsAdding(false); setEditingId(null); resetForm(); }} className="text-gray-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Rule Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Critical CPU Load Alert"
                  className="w-full px-3.5 py-2 bg-white/3 border border-white/5 rounded-xl text-sm text-white outline-none focus:border-[#4F8CFF]/50 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Trigger notification when CPU breaches threshold"
                  className="w-full px-3.5 py-2 bg-white/3 border border-white/5 rounded-xl text-sm text-white outline-none focus:border-[#4F8CFF]/50 transition-colors"
                />
              </div>
            </div>

            {/* Split Trigger vs Action */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Left Side: Trigger Configuration */}
              <div className="space-y-3 p-3.5 rounded-xl bg-white/2 border border-white/5">
                <div className="flex items-center gap-1.5 pb-1 border-b border-white/5">
                  <Shield className="h-4 w-4 text-[#4F8CFF]" />
                  <span className="text-xs font-bold text-white">1. Trigger Condition</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Trigger Type</label>
                  <select
                    value={triggerType}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setTriggerType(t);
                      if (t === 'METRIC_THRESHOLD') {
                        setTriggerConfig({ metric: 'CPU', operator: '>', value: 90 });
                      } else {
                        setTriggerConfig({ serviceId: servicesData?.[0]?.id || '', status: 'OFFLINE' });
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#0B0D10] border border-white/5 rounded-xl text-xs text-white outline-none"
                  >
                    <option value="METRIC_THRESHOLD">Metric Threshold (CPU / Memory / Disk)</option>
                    <option value="SERVICE_STATUS">Service Status Update (Online / Offline)</option>
                  </select>
                </div>

                {triggerType === 'METRIC_THRESHOLD' ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-500 uppercase">Metric</label>
                      <select
                        value={triggerConfig.metric}
                        onChange={(e) => setTriggerConfig((p: any) => ({ ...p, metric: e.target.value }))}
                        className="w-full px-2 py-2 bg-[#0B0D10] border border-white/5 rounded-lg text-xs text-white outline-none"
                      >
                        <option value="CPU">CPU (%)</option>
                        <option value="MEMORY">RAM (%)</option>
                        <option value="DISK">Disk (%)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-500 uppercase">Operator</label>
                      <select
                        value={triggerConfig.operator}
                        onChange={(e) => setTriggerConfig((p: any) => ({ ...p, operator: e.target.value }))}
                        className="w-full px-2 py-2 bg-[#0B0D10] border border-white/5 rounded-lg text-xs text-white outline-none"
                      >
                        <option value=">">&gt; (Greater Than)</option>
                        <option value="<">&lt; (Less Than)</option>
                        <option value="==">== (Equals)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-500 uppercase">Threshold (%)</label>
                      <input
                        type="number"
                        value={triggerConfig.value || ''}
                        onChange={(e) => setTriggerConfig((p: any) => ({ ...p, value: e.target.value }))}
                        className="w-full px-3.5 py-1.5 bg-white/3 border border-white/5 rounded-lg text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-500 uppercase">Target Service</label>
                      <select
                        value={triggerConfig.serviceId}
                        onChange={(e) => setTriggerConfig((p: any) => ({ ...p, serviceId: e.target.value }))}
                        className="w-full px-2 py-2 bg-[#0B0D10] border border-white/5 rounded-lg text-xs text-white outline-none"
                      >
                        {servicesData?.map((s: any) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-500 uppercase">Expected Status</label>
                      <select
                        value={triggerConfig.status}
                        onChange={(e) => setTriggerConfig((p: any) => ({ ...p, status: e.target.value }))}
                        className="w-full px-2 py-2 bg-[#0B0D10] border border-white/5 rounded-lg text-xs text-white outline-none"
                      >
                        <option value="OFFLINE">OFFLINE</option>
                        <option value="DEGRADED">DEGRADED</option>
                        <option value="ONLINE">ONLINE</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Action Configuration */}
              <div className="space-y-3 p-3.5 rounded-xl bg-white/2 border border-white/5">
                <div className="flex items-center gap-1.5 pb-1 border-b border-white/5">
                  <MessageSquare className="h-4 w-4 text-[#7A5CFF]" />
                  <span className="text-xs font-bold text-white">2. Execution Action</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Action Type</label>
                  <select
                    value={actionType}
                    onChange={(e) => {
                      const at = e.target.value as any;
                      setActionType(at);
                      if (at === 'SEND_NOTIFICATION') {
                        setActionConfig({ channelId: activeChannels[0]?.id || '', template: '' });
                      } else {
                        setActionConfig({ severity: 'CRITICAL', title: 'Automation Alert: {rule_name}', message: 'Criteria met: {details}' });
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#0B0D10] border border-white/5 rounded-xl text-xs text-white outline-none"
                  >
                    <option value="SEND_NOTIFICATION">Send Notification (Channel Route)</option>
                    <option value="CREATE_ALERT">Create Core System Alert</option>
                  </select>
                </div>

                {actionType === 'SEND_NOTIFICATION' ? (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-500 uppercase">Target Channel</label>
                      <select
                        value={actionConfig.channelId || ''}
                        onChange={(e) => setActionConfig((p: any) => ({ ...p, channelId: e.target.value }))}
                        className="w-full px-2 py-2 bg-[#0B0D10] border border-white/5 rounded-lg text-xs text-white outline-none"
                      >
                        {activeChannels.length === 0 ? (
                          <option value="">No active notification channels found</option>
                        ) : (
                          activeChannels.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-500 uppercase">Message Template (HTML)</label>
                      <textarea
                        value={actionConfig.template || ''}
                        onChange={(e) => setActionConfig((p: any) => ({ ...p, template: e.target.value }))}
                        placeholder="🔔 <b>Rule {rule_name}</b> triggered! details: {details}"
                        className="w-full px-3 py-2 bg-white/3 border border-white/5 rounded-lg text-xs text-white h-16 resize-none outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1 col-span-2">
                      <label className="text-[9px] text-gray-500 uppercase">Alert Severity</label>
                      <select
                        value={actionConfig.severity || 'CRITICAL'}
                        onChange={(e) => setActionConfig((p: any) => ({ ...p, severity: e.target.value }))}
                        className="w-full px-2 py-2 bg-[#0B0D10] border border-white/5 rounded-lg text-xs text-white outline-none"
                      >
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="WARNING">WARNING</option>
                        <option value="INFO">INFO</option>
                      </select>
                    </div>

                    <div className="space-y-1 col-span-2">
                      <label className="text-[9px] text-gray-500 uppercase">Alert Title</label>
                      <input
                        type="text"
                        value={actionConfig.title || ''}
                        onChange={(e) => setActionConfig((p: any) => ({ ...p, title: e.target.value }))}
                        placeholder="Automation warning alert triggered"
                        className="w-full px-3.5 py-1.5 bg-white/3 border border-white/5 rounded-lg text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 rounded-lg text-xs font-semibold text-white transition-colors"
              >
                <Save className="h-3.5 w-3.5" /> Save Rule
              </button>
              <button
                onClick={() => { setIsAdding(false); setEditingId(null); resetForm(); }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold text-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Rules List */}
        <div className="space-y-3">
          {rules?.map((rule: AutomationRuleItem) => {
            const triggerInfo =
              rule.triggerType === 'METRIC_THRESHOLD'
                ? `If ${rule.triggerConfig.metric} ${rule.triggerConfig.operator} ${rule.triggerConfig.value}%`
                : `If service status matches offline criteria`;

            const actionInfo =
              rule.actionType === 'SEND_NOTIFICATION'
                ? `Notify Channel (${rule.actionConfig.channelId ? channels.find((c: any) => c.id === rule.actionConfig.channelId)?.name || 'Specified Bot' : 'Unknown Channel'})`
                : `Create System ${rule.actionConfig.severity || 'CRITICAL'} Alert`;

            return (
              <div key={rule.id} className="rounded-xl border border-white/5 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/2 hover:bg-white/4 transition-all gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${rule.isEnabled ? 'bg-[#4F8CFF]' : 'bg-gray-600'}`} />
                    <div>
                      <h4 className="font-bold text-white text-sm">{rule.name}</h4>
                      <p className="text-xs text-gray-500">{rule.description || 'No description provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-right">
                      <div className="text-[10px] text-emerald-400 font-semibold">{triggerInfo}</div>
                      <div className="text-[10px] text-gray-400">{actionInfo}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status toggle */}
                      <button
                        onClick={() => toggleMutation.mutate({ id: rule.id, isEnabled: !rule.isEnabled })}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors bg-white/10 ${
                          rule.isEnabled ? 'bg-[#4F8CFF]' : ''
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          rule.isEnabled ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </button>

                      <button
                        onClick={() => handleEdit(rule)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white"
                      >
                        <Settings2 className="h-3.5 w-3.5" /> Edit
                      </button>

                      <button
                        onClick={() => { if (confirm('Delete this automation rule?')) deleteMutation.mutate(rule.id); }}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {rule.lastTriggeredAt && (
                  <div className="px-4 py-1.5 bg-[#4F8CFF]/5 border-t border-white/5 text-[9px] text-gray-400 text-right">
                    Last triggered: {new Date(rule.lastTriggeredAt).toLocaleString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
