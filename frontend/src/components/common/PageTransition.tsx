import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

const variants = {
  hidden: { opacity: 0, y: 15 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2, ease: 'easeIn' } },
};

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="enter"
      exit="exit"
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
