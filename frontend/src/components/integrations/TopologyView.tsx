import { GlassCard } from '../common/GlassCard';
import { Globe, ArrowRight, Server, HardDrive, ShieldAlert, Cpu, Network } from 'lucide-react';
import { motion } from 'framer-motion';

const nodes = [
  { id: 'internet', label: 'WAN / Internet', icon: Globe, color: 'text-blue-400' },
  { id: 'router', label: 'MikroTik Router', icon: Network, color: 'text-[#1B9BD7]' },
  { id: 'switch', label: 'Core Switch', icon: Cpu, color: 'text-purple-400' },
  { id: 'servers', label: 'Storage / Synology', icon: HardDrive, color: 'text-amber-400' },
  { id: 'apps', label: 'Apps / Services', icon: Server, color: 'text-emerald-400' },
];

export function TopologyView() {
  return (
    <GlassCard className="p-6">
      <div className="mb-6">
        <h3 className="font-bold text-white text-md">Homelab Network Topology</h3>
        <p className="text-xs text-gray-400 mt-1">Real-time trace path and logical packet flow diagram.</p>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 py-6 overflow-x-auto">
        {nodes.map((node, index) => {
          const NodeIcon = node.icon;
          return (
            <div key={node.id} className="flex flex-col lg:flex-row items-center gap-4 shrink-0 w-full lg:w-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="flex flex-col items-center p-4 rounded-2xl bg-white/3 border border-white/5 hover:bg-white/5 transition-colors duration-300 w-44 shadow-lg text-center"
              >
                <div className={`p-3 rounded-xl bg-white/5 border border-white/5 mb-3 ${node.color}`}>
                  <NodeIcon className="h-6 w-6" />
                </div>
                <span className="text-xs font-semibold text-white tracking-wide">{node.label}</span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active
                </span>
              </motion.div>

              {index < nodes.length - 1 && (
                <div className="flex items-center justify-center rotate-90 lg:rotate-0 text-gray-500 my-2 lg:my-0">
                  <ArrowRight className="h-5 w-5 animate-pulse text-[#4F8CFF]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
