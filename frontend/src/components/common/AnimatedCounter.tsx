import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
}

export function AnimatedCounter({ value, duration = 1.2, decimals = 0 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration,
      onUpdate(value) {
        setCount(value);
      },
      ease: 'easeOut',
    });
    return () => controls.stop();
  }, [value, duration]);

  return <>{count.toFixed(decimals)}</>;
}
