import { GlassCard } from '../common/GlassCard';
import { ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AlertItem {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO' | string;
  title: string;
  message: string;
  createdAt: string;
}

interface AlertsWidgetProps {
  alerts: AlertItem[];
  onAcknowledge?: (id: string) => void;
}

export function AlertsWidget({ alerts, onAcknowledge }: AlertsWidgetProps) {
  return (
    <GlassCard className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-500" />
          <h3 className="font-bold text-white text-md tracking-wide font-sans">Active Incidents & Alerts</h3>
        </div>
        <span className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">
          {alerts.length} Active
        </span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            className={cn(
              "p-3 rounded-xl border flex items-start gap-3 transition-all duration-200",
              alert.severity === 'CRITICAL' 
                ? "bg-red-500/5 border-red-500/15" 
                : alert.severity === 'WARNING'
                ? "bg-amber-500/5 border-amber-500/15"
                : "bg-blue-500/5 border-blue-500/15"
            )}
          >
            <div className="mt-0.5 shrink-0">
              {alert.severity === 'CRITICAL' ? (
                <ShieldAlert className="h-4.5 w-4.5 text-red-400" />
              ) : alert.severity === 'WARNING' ? (
                <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
              ) : (
                <AlertTriangle className="h-4.5 w-4.5 text-blue-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <h4 className="text-sm font-semibold text-white truncate leading-snug">{alert.title}</h4>
                <span className="text-[10px] text-gray-500 font-semibold shrink-0">
                  {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 leading-normal">{alert.message}</p>
            </div>

            {onAcknowledge && (
              <button 
                onClick={() => onAcknowledge(alert.id)}
                className="p-1 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                title="Acknowledge"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-sm">
            <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
            No active incidents.
          </div>
        )}
      </div>
    </GlassCard>
  );
}
