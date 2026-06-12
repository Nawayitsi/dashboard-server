import { GlassCard } from '../common/GlassCard';
import { StatusBadge } from '../common/StatusBadge';
import { ChevronRight, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ServiceItem {
  id: string;
  name: string;
  type: string;
  status: string;
  responseTime: number | null;
}

interface ServicesWidgetProps {
  services: ServiceItem[];
}

export function ServicesWidget({ services }: ServicesWidgetProps) {
  return (
    <GlassCard className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
        <h3 className="font-bold text-white text-md tracking-wide">Active Infrastructure Services</h3>
        <Link 
          to="/apps"
          className="text-xs text-[#4F8CFF] hover:underline flex items-center gap-1 font-semibold"
        >
          Manage <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
        {services.map((svc) => (
          <div 
            key={svc.id}
            className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5 hover:bg-white/5 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 text-gray-400">
                <Settings className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{svc.name}</h4>
                <p className="text-[10px] text-gray-500 uppercase mt-0.5 tracking-wider">{svc.type}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {svc.responseTime !== null && (
                <span className="text-xs text-gray-500 font-semibold">{svc.responseTime}ms</span>
              )}
              <StatusBadge status={svc.status} />
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
            No registered services.
          </div>
        )}
      </div>
    </GlassCard>
  );
}
