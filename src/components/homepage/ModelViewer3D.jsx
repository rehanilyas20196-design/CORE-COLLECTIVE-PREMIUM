'use client';

import dynamic from 'next/dynamic';

const ModelViewerInner = dynamic(
  () => import('./ModelViewerInner'),
  { ssr: false }
);

export default function ModelViewer3D({ src }) {
  return (
    <div className="relative w-full h-full">
      <ModelViewerInner src={src} />
    </div>
  );
}
