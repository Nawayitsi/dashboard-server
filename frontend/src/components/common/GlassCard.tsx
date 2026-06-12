import { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverGlow?: boolean;
}

export function GlassCard({ children, className, hoverGlow = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-panel rounded-2xl p-5 relative overflow-hidden",
        hoverGlow && "glass-panel-hover",
        className
      )}
    >
      {/* Dynamic top gradient flare line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {children}
    </div>
  );
}
