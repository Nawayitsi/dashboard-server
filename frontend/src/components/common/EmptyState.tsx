import { FolderOpen } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ 
  title = "No Data Found", 
  description = "There are no entries available matching the current search parameters." 
}: EmptyStateProps) {
  return (
    <GlassCard className="flex flex-col items-center justify-center text-center p-12 max-w-md mx-auto my-6 border-dashed border-white/10 bg-white/2">
      <div className="p-4 rounded-full bg-white/5 text-gray-400 border border-white/5 mb-4">
        <FolderOpen className="h-8 w-8" />
      </div>
      <h3 className="text-md font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-gray-400 max-w-xs leading-normal">{description}</p>
    </GlassCard>
  );
}
