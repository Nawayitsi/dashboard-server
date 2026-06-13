import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageTransition } from '../components/common/PageTransition';
import { servicesApi } from '../services/services.api';
import { ServiceCard } from '../components/integrations/ServiceCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { GlassCard } from '../components/common/GlassCard';
import {
  Plus,
  X,
  Server,
  ArrowLeft,
  ArrowRight,
  Save,
  Check,
  Info,
  Shield,
  Activity,
  HardDrive,
  Cpu,
  Cloud,
  Globe,
  Settings2,
  Play,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { integrationsApi } from '../services/settings.api';
import { applicationsApi } from '../services/applications.api';
import { dashboardApi } from '../services/dashboard.api';

const INTEGRATION_TYPES = [
  { type: 'CUSTOM', name: 'Custom Application', desc: 'Any web application or standalone dashboard launcher.', icon: Globe, color: '#4F8CFF' },
  { type: 'MIKROTIK', name: 'MikroTik RouterOS', desc: 'Network router integration for cpu/ram/traffic monitoring.', icon: Server, color: '#1B9BD7' },
  { type: 'NEXTCLOUD', name: 'Nextcloud', desc: 'Private cloud storage stats and active users.', icon: Cloud, color: '#0082C9' },
  { type: 'SYNOLOGY', name: 'Synology DSM', desc: 'NAS hardware storage, volume details and CPU load.', icon: HardDrive, color: '#4B9ED6' },
  { type: 'LIBRENMS', name: 'LibreNMS', desc: 'Network monitoring tool and device alert streaming.', icon: Activity, color: '#67B74D' },
  { type: 'SAFELINE', name: 'SafeLine WAF', desc: 'Web Application Firewall blocked threat graphs.', icon: Shield, color: '#FF6B35' },
  { type: 'SIEM', name: 'SIEM Platform', desc: 'Security intelligence log events and alert metrics.', icon: Activity, color: '#9333EA' },
  { type: 'NGINX_PROXY_MANAGER', name: 'Nginx Proxy Manager', desc: 'Reverse proxy hosts and certificate statistics.', icon: Globe, color: '#009639' },
];

export function Applications() {
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((state) => state.user?.role) === 'ADMIN';

  // State for Wizard
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState('CUSTOM');

  // Step 2 Custom Fields
  const [customApp, setCustomApp] = useState<{
    name: string;
    url: string;
    description: string;
    category: string;
    openIn: 'SAME_TAB' | 'NEW_TAB' | 'EMBEDDED';
    color: string;
  }>({
    name: '',
    url: '',
    description: '',
    category: 'APPLICATION',
    openIn: 'NEW_TAB',
    color: '#4F8CFF',
  });

  // Step 2 Integration Fields
  const [integrationName, setIntegrationName] = useState('');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Step 3 Widgets
  const [selectedWidgets, setSelectedWidgets] = useState<Record<string, boolean>>({});

  // Fetch all schemas & integrations list
  const { data: schemas = [] } = useQuery({
    queryKey: ['integrationSchemas'],
    queryFn: integrationsApi.getAllSchemas,
    enabled: showWizard,
  });

  const { data: integrations = [] } = useQuery({
    queryKey: ['integrationsList'],
    queryFn: integrationsApi.findAll,
    enabled: showWizard,
  });

  // Fetch Services (Launcher list)
  const { data: servicesRes, isLoading } = useQuery({
    queryKey: ['servicesList'],
    queryFn: () => servicesApi.findAll(1, 100),
  });

  // Create Application Mutation
  const createApplicationMutation = useMutation({
    mutationFn: applicationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicesList'] });
    },
  });

  // Delete Application Mutation
  const deleteApplicationMutation = useMutation({
    mutationFn: applicationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicesList'] });
    },
  });

  const currentSchemaObj = schemas.find((s: any) => s.type === selectedType);
  const currentSchema = currentSchemaObj?.schema;

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setCredentials({});
    setSelectedWidgets({});
    setIntegrationName(INTEGRATION_TYPES.find(i => i.type === type)?.name || '');
    setStep(2);
  };

  const handleWizardClose = () => {
    setShowWizard(false);
    setStep(1);
    setSelectedType('CUSTOM');
    setCustomApp({
      name: '',
      url: '',
      description: '',
      category: 'APPLICATION',
      openIn: 'NEW_TAB',
      color: '#4F8CFF',
    });
    setCredentials({});
    setSelectedWidgets({});
    setIntegrationName('');
  };

  const handleSave = async () => {
    try {
      if (selectedType === 'CUSTOM') {
        // Save Custom application launcher
        await createApplicationMutation.mutateAsync({
          name: customApp.name,
          url: customApp.url,
          description: customApp.description,
          category: customApp.category,
          openIn: customApp.openIn,
          color: customApp.color,
        });
      } else {
        // Save integration credentials
        const matchingIntegration = integrations.find((i: any) => i.type === selectedType);
        if (!matchingIntegration) {
          alert('Integration mapping error. Ensure DB seeding is complete.');
          return;
        }

        const integrationId = matchingIntegration.id;

        // Save Credentials
        await integrationsApi.saveCredentials(integrationId, credentials);

        // Enable and set integration name
        await integrationsApi.update(integrationId, {
          name: integrationName,
          isEnabled: true,
        });

        // Determine URL (use url field or host field)
        const appUrl = credentials.url || credentials.host || '';

        // Create launcher application entry associated with the integration
        await createApplicationMutation.mutateAsync({
          name: integrationName,
          description: `Integration launcher for ${matchingIntegration.name}`,
          url: appUrl,
          category: selectedType,
          openIn: 'NEW_TAB',
          integrationId,
          color: INTEGRATION_TYPES.find(i => i.type === selectedType)?.color || '#4F8CFF',
        });

        // Add selected widgets to dashboard
        const activeWidgets = currentSchema?.widgets?.filter((w: any) => selectedWidgets[w.id]) || [];
        for (const w of activeWidgets) {
          await dashboardApi.addWidget({
            dashboardId: 'default-dashboard',
            widgetId: w.id,
            title: w.name,
          });
        }
      }
      handleWizardClose();
    } catch (err: any) {
      alert('Error creating application: ' + err.message);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const services = servicesRes?.data || [];

  return (
    <PageTransition>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Application Launcher</h1>
          <p className="text-xs text-gray-400 mt-1">Easily launch web portals and check connectivity status.</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] text-xs font-semibold text-white shadow-lg hover:shadow-[#4F8CFF]/20 transition-all select-none"
          >
            <Plus className="h-4 w-4" /> Add Application
          </button>
        )}
      </div>

      {showWizard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <GlassCard className="w-full max-w-2xl my-8">
            <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-3">
              <div>
                <h3 className="font-bold text-white text-md">Add New App / Integration</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Step {step} of {selectedType === 'CUSTOM' ? 2 : 4}</p>
              </div>
              <button onClick={handleWizardClose} className="text-gray-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step 1: Choose Integration/App Type */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400">Select whether to configure a dynamic, metrics-driven infrastructure integration or register a standard launcher shortcut.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                  {INTEGRATION_TYPES.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.type}
                        onClick={() => handleTypeSelect(item.type)}
                        className="flex items-start gap-3 p-3.5 bg-white/2 hover:bg-white/5 border border-white/5 rounded-xl text-left transition-all hover:scale-[1.01]"
                      >
                        <div
                          className="p-2.5 rounded-xl text-white"
                          style={{ backgroundColor: `${item.color}20`, color: item.color }}
                        >
                          <IconComp className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-sm">{item.name}</h4>
                          <p className="text-[10px] text-gray-400 mt-1 leading-normal">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Input Settings */}
            {step === 2 && (
              <div className="space-y-4">
                {selectedType === 'CUSTOM' ? (
                  // Custom Application Fields
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase">App Name</label>
                      <input
                        type="text"
                        required
                        value={customApp.name}
                        onChange={(e) => setCustomApp(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-white/2 border border-white/5 rounded-xl text-sm outline-none focus:border-[#4F8CFF]/50"
                        placeholder="Portainer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase">Launch URL</label>
                      <input
                        type="url"
                        value={customApp.url}
                        onChange={(e) => setCustomApp(prev => ({ ...prev, url: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-white/2 border border-white/5 rounded-xl text-sm outline-none focus:border-[#4F8CFF]/50"
                        placeholder="https://portainer.local"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase">Category</label>
                      <select
                        value={customApp.category}
                        onChange={(e) => setCustomApp(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[#0B0D10] border border-white/5 rounded-xl text-sm outline-none focus:border-[#4F8CFF]/50"
                      >
                        <option value="APPLICATION">Application</option>
                        <option value="ROUTER">Router</option>
                        <option value="NAS">NAS Storage</option>
                        <option value="MONITORING">Monitoring Daemon</option>
                        <option value="PROXY">Proxy</option>
                        <option value="SECURITY">Security / WAF</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase">Open Target</label>
                      <select
                        value={customApp.openIn}
                        onChange={(e) => setCustomApp(prev => ({ ...prev, openIn: e.target.value as 'SAME_TAB' | 'NEW_TAB' | 'EMBEDDED' }))}
                        className="w-full px-3.5 py-2.5 bg-[#0B0D10] border border-white/5 rounded-xl text-sm outline-none focus:border-[#4F8CFF]/50"
                      >
                        <option value="NEW_TAB">Open in New Tab</option>
                        <option value="SAME_TAB">Open in Same Tab</option>
                        <option value="EMBEDDED">Embed in iframe</option>
                      </select>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase">Description</label>
                      <textarea
                        value={customApp.description}
                        onChange={(e) => setCustomApp(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-white/2 border border-white/5 rounded-xl text-sm outline-none focus:border-[#4F8CFF]/50 h-20 resize-none"
                        placeholder="Docker cluster manager"
                      />
                    </div>
                  </div>
                ) : (
                  // Integration Credential Fields
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase">Integration Custom Name</label>
                      <input
                        type="text"
                        required
                        value={integrationName}
                        onChange={(e) => setIntegrationName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white/2 border border-white/5 rounded-xl text-sm outline-none focus:border-[#4F8CFF]/50"
                        placeholder={selectedType + ' Instance'}
                      />
                    </div>

                    {currentSchema?.fields?.map((field: any) => (
                      <div key={field.key} className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase flex items-center justify-between">
                          <span>{field.label} {field.required && <span className="text-red-400">*</span>}</span>
                          {field.description && <span className="text-[10px] text-gray-500 normal-case">{field.description}</span>}
                        </label>
                        {field.type === 'toggle' ? (
                          <button
                            type="button"
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
                              className="w-full px-3.5 py-2.5 bg-white/2 border border-white/5 rounded-xl text-sm outline-none focus:border-[#4F8CFF]/50 text-white pr-10"
                            />
                            {field.type === 'password' && (
                              <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                              >
                                {showPasswords[field.key] ? <Play className="h-3.5 w-3.5 text-gray-400" /> : <Settings2 className="h-3.5 w-3.5 text-gray-400" />}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4 border-t border-white/5">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to Type
                  </button>
                  {selectedType === 'CUSTOM' ? (
                    <button
                      onClick={handleSave}
                      disabled={createApplicationMutation.isPending}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-xs font-semibold text-white transition-colors"
                    >
                      <Save className="h-4 w-4" /> Save Application
                    </button>
                  ) : (
                    <button
                      onClick={() => setStep(3)}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] text-xs font-semibold text-white transition-colors animate-pulse"
                    >
                      Next Step <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Choose Dashboard Widgets */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400">Select which hardware monitoring and event logs widgets to embed directly on your Main Dashboard page.</p>

                {(!currentSchema?.widgets || currentSchema.widgets.length === 0) ? (
                  <div className="p-8 text-center bg-white/2 rounded-2xl border border-dashed border-white/5 text-gray-500 text-xs">
                    No dashboard widgets available for this integration.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {currentSchema.widgets.map((widget: any) => (
                      <button
                        key={widget.id}
                        onClick={() => setSelectedWidgets(prev => ({ ...prev, [widget.id]: !prev[widget.id] }))}
                        className={`w-full flex items-start gap-3 p-3.5 border rounded-xl text-left transition-all ${
                          selectedWidgets[widget.id]
                            ? 'bg-[#4F8CFF]/5 border-[#4F8CFF]/30'
                            : 'bg-white/2 hover:bg-white/5 border-white/5'
                        }`}
                      >
                        <div className="pt-0.5">
                          <input
                            type="checkbox"
                            checked={selectedWidgets[widget.id] || false}
                            onChange={() => {}}
                            className="rounded border-white/10 bg-[#0B0D10] text-[#4F8CFF] focus:ring-0 focus:ring-offset-0 h-4 w-4 pointer-events-none"
                          />
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
                )}

                <div className="flex justify-between pt-4 border-t border-white/5">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to Config
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] text-xs font-semibold text-white transition-colors"
                  >
                    Preview Setup <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Summary & Confirm */}
            {step === 4 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400">Please review the configuration details before finalizing the setup. Click Save to execute configuration updates.</p>

                <div className="bg-white/2 border border-white/5 rounded-2xl p-4 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Integration Type</span>
                    <span className="text-white font-semibold uppercase">{selectedType}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Instance Name</span>
                    <span className="text-white font-semibold">{integrationName}</span>
                  </div>
                  {credentials.host && (
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-400">Connection Host</span>
                      <span className="text-white font-mono">{credentials.host}</span>
                    </div>
                  )}
                  {credentials.url && (
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-400">Connection URL</span>
                      <span className="text-white font-mono">{credentials.url}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Enabled Dashboard Widgets</span>
                    <span className="text-white font-semibold">
                      {Object.values(selectedWidgets).filter(Boolean).length} Active
                    </span>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-white/5">
                  <button
                    onClick={() => setStep(3)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to Widgets
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={createApplicationMutation.isPending}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-xs font-semibold text-white transition-colors"
                  >
                    <Save className="h-4 w-4" /> Save & Connect
                  </button>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* Grid of registered items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((svc: any) => (
          <ServiceCard
            key={svc.id}
            service={svc}
            onDelete={(id) => deleteApplicationMutation.mutate(id)}
          />
        ))}
      </div>
    </PageTransition>
  );
}
