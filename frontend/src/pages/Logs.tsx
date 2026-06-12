import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageTransition } from '../components/common/PageTransition';
import { logsApi } from '../services/logs.api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { GlassCard } from '../components/common/GlassCard';
import { Terminal, Search, Trash2, ShieldAlert } from 'lucide-react';

export function Logs() {
  const [level, setLevel] = useState('');
  const [source, setSource] = useState('');
  const [search, setSearch] = useState('');

  const { data: logsRes, isLoading } = useQuery({
    queryKey: ['systemLogsList', level, source, search],
    queryFn: () => logsApi.findAll({ level, source, search }),
    refetchInterval: 3000,
  });

  if (isLoading) return <LoadingSpinner />;

  const logs = logsRes?.data || [];

  return (
    <PageTransition>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Central System Log Stream</h1>
        <p className="text-xs text-gray-400 mt-1">Aggregated terminal stdout/stderr stream from docker services.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/2 border border-white/5 focus:border-[#4F8CFF]/50 outline-none rounded-xl text-sm transition-all"
            />
          </div>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="px-4 py-2 bg-[#0B0D10] border border-white/5 rounded-xl text-sm outline-none"
          >
            <option value="">All Levels</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="ERROR">Error</option>
          </select>

          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="px-4 py-2 bg-[#0B0D10] border border-white/5 rounded-xl text-sm outline-none"
          >
            <option value="">All Sources</option>
            <option value="DOCKER">Docker</option>
            <option value="SYSTEM">System</option>
            <option value="MIKROTIK">MikroTik</option>
            <option value="SYNOLOGY">Synology</option>
          </select>
        </div>

        {/* Terminal screen panel */}
        <div className="rounded-2xl border border-white/5 bg-black/90 p-5 font-mono text-xs text-gray-300 min-h-[400px] max-h-[600px] overflow-y-auto shadow-2xl relative">
          <div className="absolute top-3 right-4 flex items-center gap-2 text-[10px] text-gray-500 uppercase select-none">
            <Terminal className="h-3.5 w-3.5" /> STDOUT Streaming
          </div>

          <div className="space-y-2.5 pt-4">
            {logs.map((log: any) => (
              <div key={log.id} className="flex items-start gap-4">
                <span className="text-gray-600 shrink-0 select-none">
                  [{new Date(log.createdAt).toLocaleTimeString()}]
                </span>
                <span className={`font-bold shrink-0 select-none ${
                  log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARNING' ? 'text-amber-400' : 'text-[#4F8CFF]'
                }`}>
                  [{log.level}]
                </span>
                <span className="text-purple-400 font-bold shrink-0 select-none">
                  [{log.source}]
                </span>
                <span className="break-all">{log.message}</span>
              </div>
            ))}

            {logs.length === 0 && (
              <div className="text-center py-24 text-gray-500">
                No logs recorded matching queries.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
