'use client';

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-[#1C1C2E] via-[#2A2A40] to-[#1C1C2E] bg-[length:200%_100%] animate-shimmer" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-3 w-20 bg-gradient-to-r from-[#1C1C2E] via-[#2A2A40] to-[#1C1C2E] bg-[length:200%_100%] animate-shimmer rounded" />
        <div className="h-4 w-full bg-gradient-to-r from-[#1C1C2E] via-[#2A2A40] to-[#1C1C2E] bg-[length:200%_100%] animate-shimmer rounded" />
        <div className="h-4 w-3/4 bg-gradient-to-r from-[#1C1C2E] via-[#2A2A40] to-[#1C1C2E] bg-[length:200%_100%] animate-shimmer rounded" />
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-3.5 h-3.5 bg-gradient-to-r from-[#1C1C2E] via-[#2A2A40] to-[#1C1C2E] bg-[length:200%_100%] animate-shimmer rounded" />
          ))}
        </div>
        <div className="h-5 w-28 bg-gradient-to-r from-[#1C1C2E] via-[#2A2A40] to-[#1C1C2E] bg-[length:200%_100%] animate-shimmer rounded" />
        <div className="h-10 w-full bg-gradient-to-r from-[#1C1C2E] via-[#2A2A40] to-[#1C1C2E] bg-[length:200%_100%] animate-shimmer rounded-xl" />
      </div>
    </div>
  );
}
