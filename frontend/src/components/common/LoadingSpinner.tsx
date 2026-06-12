import { motion } from 'framer-motion';

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <motion.div
        className="h-10 w-10 border-4 border-[#4F8CFF]/30 border-t-[#4F8CFF] rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <p className="text-xs text-gray-500 tracking-wider uppercase font-medium">Fetching System State...</p>
    </div>
  );
}
