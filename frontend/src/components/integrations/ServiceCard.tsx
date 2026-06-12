import { GlassCard } from '../common/GlassCard';
import { StatusBadge } from '../common/StatusBadge';
import { ExternalLink, Trash2, ArrowUpRight, Cpu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface ServiceItem {
  id: string;
  name: string;
  type: string;
  description: string | null;
  url: string | null;
  icon: string | null;
  color: string | null;
  statuses?: Array<{ status: string }>;
}

interface ServiceCardProps {
  service: ServiceItem;
  onDelete?: (id: string) => void;
}

export function ServiceCard({ service, onDelete }: ServiceCardProps) {
  const userRole = useAuthStore((state) => state.user?.role);
  const isAdmin = userRole === 'ADMIN';
  const status = service.statuses?.[0]?.status || 'UNKNOWN';

  return (
    <GlassCard className="flex flex-col justify-between h-full group hover:shadow-2xl">
      <div>
        <div className="flex justify-between items-start mb-3">
          {/* App Status & Color Tag */}
          <span 
            className="h-1.5 w-6 rounded-full" 
            style={{ backgroundColor: service.color || '#4F8CFF' }}
          />
          <StatusBadge status={status} />
        </div>

        <h3 className="font-bold text-white text-md tracking-wide mb-1 flex items-center gap-1.5">
          {service.name}
          {service.url && (
            <a 
              href={service.url} 
              target="_blank" 
              rel="noreferrer" 
              className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </h3>
        <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">{service.type}</p>
        <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">{service.description || 'No description provided.'}</p>
      </div>

      <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/5">
        {service.url ? (
          <a
            href={service.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#4F8CFF] hover:underline font-semibold"
          >
            Launch Service <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span className="text-xs text-gray-500">Local Daemon</span>
        )}

        {isAdmin && onDelete && (
          <button
            onClick={() => onDelete(service.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
            title="Remove Service"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </GlassCard>
  );
}
