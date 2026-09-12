'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

export default function TiltCard({ children, maxTilt = 8, className = '' }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 130, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 130, damping: 20 });

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    rotateY.set((px - 0.5) * 2 * maxTilt);
    rotateX.set((0.5 - py) * 2 * maxTilt);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div
      ref={ref}
      style={{ perspective: 900 }}
      className={className}
      onMouseMove={reduced ? undefined : handleMove}
      onMouseLeave={reduced ? undefined : reset}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="h-full will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}