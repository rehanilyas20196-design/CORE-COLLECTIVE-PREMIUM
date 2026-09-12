'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function GoldSweep({ className = '' }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[180%] opacity-40 blur-3xl ${className}`}
      style={{
        background:
          'conic-gradient(from 0deg, rgba(192,138,46,0) 0deg, rgba(225,184,94,0.5) 55deg, rgba(192,138,46,0) 120deg, rgba(192,138,46,0) 190deg, rgba(225,184,94,0.35) 245deg, rgba(192,138,46,0) 300deg)',
      }}
      initial={{ x: '-50%', y: '-50%', rotate: 0 }}
      animate={reduced ? { x: '-50%', y: '-50%', rotate: 0 } : { x: '-50%', y: '-50%', rotate: 360 }}
      transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
    />
  );
}