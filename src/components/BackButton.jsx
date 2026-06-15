'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="fixed top-24 left-4 z-50 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary/30 hover:shadow-md transition-all duration-200"
      aria-label="Go back"
    >
      <ArrowLeft className="w-4 h-4" />
    </button>
  );
}
