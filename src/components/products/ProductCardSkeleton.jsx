'use client';

export default function ProductCardSkeleton() {
  return (
    <div className="bg-[#FBF8F0] border border-[rgba(185,138,60,0.16)] rounded-[4px] overflow-hidden">
      <div className="aspect-[3/4] bg-[#eee4d0] skeleton-shimmer" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 bg-[#eee4d0] rounded skeleton-shimmer" />
        <div className="h-3 w-1/3 bg-[#eee4d0] rounded skeleton-shimmer" />
        <div className="h-9 w-full bg-[#3B2A1C]/15 rounded-[4px] skeleton-shimmer" />
      </div>
    </div>
  );
}