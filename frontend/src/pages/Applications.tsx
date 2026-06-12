import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageTransition } from '../components/common/PageTransition';
import { servicesApi } from '../services/services.api';
import { ServiceCard } from '../components/integrations/ServiceCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { GlassCard } from '../components/common/GlassCard';
import { Plus, X, Server } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Applications() {
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((state) => state.user?.role) === 'ADMIN';
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('APPLICATION');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [color, setColor] = useState('#4F8CFF');

  const { data: servicesRes, isLoading } = useQuery({
    queryKey: ['servicesList'],
    queryFn: () => servicesApi.findAll(1, 100),
  });

  const createMutation = useMutation({
    mutationFn: servicesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicesList'] });
      setShowAddForm(false);
      setName('');
      setDescription('');
      setUrl('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: servicesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicesList'] });
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, type, description, url, color });
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
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] text-xs font-semibold text-white shadow-lg hover:shadow-[#4F8CFF]/20 transition-all select-none"
          >
            <Plus className="h-4 w-4" /> Add Application
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <GlassCard className="w-full max-w-md">
            <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-3">
              <h3 className="font-bold text-white text-md">Register New Application</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase">App Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/2 border border-white/5 rounded-xl text-sm outline-none focus:border-[#4F8CFF]/50"
                  placeholder="Portainer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase">Service Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0D10] border border-white/5 rounded-xl text-sm outline-none focus:border-[#4F8CFF]/50"
                >
                  <option value="APPLICATION">Application</option>
                  <option value="ROUTER">Router</option>
                  <option value="NAS">NAS Storage</option>
                  <option value="MONITORING">Monitoring Daemon</option>
                  <option value="PROXY">Proxy</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase">Launch URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/2 border border-white/5 rounded-xl text-sm outline-none focus:border-[#4F8CFF]/50"
                  placeholder="https://portainer.local"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/2 border border-white/5 rounded-xl text-sm outline-none focus:border-[#4F8CFF]/50 h-20 resize-none"
                  placeholder="Docker cluster manager"
                />
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-3 bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-white text-xs font-bold rounded-xl transition-all"
              >
                Register
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Grid of registered items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((svc: any) => (
          <ServiceCard 
            key={svc.id} 
            service={svc} 
            onDelete={(id) => deleteMutation.mutate(id)} 
          />
        ))}
      </div>
    </PageTransition>
  );
}
