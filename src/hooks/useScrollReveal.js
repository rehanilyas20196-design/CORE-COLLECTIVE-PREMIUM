'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export function useScrollReveal({ threshold = 0.1, triggerOnce = true } = {}) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          if (triggerOnce) observer.disconnect();
        } else if (!triggerOnce) {
          setRevealed(false);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, triggerOnce]);

  return { ref, revealed };
}

export function useCounter(target, { duration = 2000, enabled = false } = {}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, enabled]);

  return count;
}

export function parseStatValue(str) {
  const num = parseInt(str.replace(/[^0-9]/g, ''));
  const suffix = str.replace(/[0-9,]/g, '');
  return { num: isNaN(num) ? 0 : num, suffix };
}

export function AnimatedSection({ children, className = '', animation = 'fade-up', delay = 0, threshold = 0.1 }) {
  const { ref, revealed } = useScrollReveal({ threshold });

  const animations = {
    'fade-up': { opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(40px)' },
    'fade-down': { opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(-40px)' },
    'fade-left': { opacity: revealed ? 1 : 0, transform: revealed ? 'translateX(0)' : 'translateX(40px)' },
    'fade-right': { opacity: revealed ? 1 : 0, transform: revealed ? 'translateX(0)' : 'translateX(-40px)' },
    'scale-in': { opacity: revealed ? 1 : 0, transform: revealed ? 'scale(1)' : 'scale(0.85)' },
    'scale-up': { opacity: revealed ? 1 : 0, transform: revealed ? 'scale(1)' : 'scale(1.1)' },
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...(animations[animation] || animations['fade-up']),
        transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
