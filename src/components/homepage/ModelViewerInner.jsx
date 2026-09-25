'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

function loadScript() {
  return new Promise((resolve, reject) => {
    if (!customElements || customElements.get('model-viewer')) return resolve();
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.1.0/model-viewer.min.js';
    script.onload = () => customElements.whenDefined('model-viewer').then(resolve);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function ModelViewerInner({ src, alt = '3D Product Model' }) {
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let viewer = null;
    let cancelled = false;
    const host = containerRef.current;
    if (!host) return;

    const buildViewer = () => {
      loadScript().then(() => {
        if (cancelled || !containerRef.current) return;

        viewer = document.createElement('model-viewer');
        viewer.setAttribute('src', src);
        viewer.setAttribute('alt', alt);
        viewer.setAttribute('auto-rotate', '');
        viewer.setAttribute('auto-rotate-delay', '500');
        viewer.setAttribute('rotation-per-second', '24deg');
        viewer.setAttribute('camera-controls', '');
        viewer.setAttribute('ar', '');
        viewer.setAttribute('camera-orbit', 'auto auto auto ');
        viewer.setAttribute('camera-target', 'auto');
        viewer.setAttribute('field-of-view', '45deg')
        viewer.setAttribute('interaction-prompt', 'none');
        viewer.setAttribute('loading', 'eager');
        viewer.setAttribute('framing', 'center');

        viewer.setAttribute('reveal', 'auto');
        viewer.setAttribute('poster', '/placeholder.png');
        viewer.setAttribute('shadow-intensity', '0.4');
        viewer.setAttribute('shadow-softness', '0.6');
        viewer.setAttribute('exposure', '1');
        viewer.setAttribute('environment-image', 'neutral');
        viewer.style.width = '100%';
        viewer.style.height = '100%';
        viewer.style.setProperty('--poster-color', 'transparent');

        viewer.addEventListener('load', () => { if (!cancelled) setLoaded(true); });
        viewer.addEventListener('error', (e) => console.error('Model load error:', e));

        containerRef.current.appendChild(viewer);
      }).catch((err) => console.error('Failed to load model-viewer:', err));
    };

    // Load model-viewer only once the container is near the viewport, so the
    // ~2.2s of script evaluation no longer blocks the main thread on page load.
    if (typeof IntersectionObserver === 'undefined') {
      buildViewer();
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer.disconnect();
            buildViewer();
          }
        },
        { rootMargin: '400px 0px' }
      );
      observer.observe(host);
      return () => {
        cancelled = true;
        observer.disconnect();
        if (viewer && containerRef.current?.contains(viewer)) {
          containerRef.current.removeChild(viewer);
        }
      };
    }
  }, [src, alt]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 via-transparent to-amber-50/20 rounded-3xl pointer-events-none z-10" />
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 via-white to-amber-50/30 border border-gray-100 shadow-2xl shadow-amber-200/30">
        <div ref={containerRef} className="w-full h-full" />

        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
              <span className="text-sm text-amber-700 font-medium">Loading 3D Model...</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-gray-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

        </div>
      </div>
    </motion.div>
  );
}
