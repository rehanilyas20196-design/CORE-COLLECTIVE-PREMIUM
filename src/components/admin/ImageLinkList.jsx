'use client';

import { useState } from 'react';
import { ExternalLink, Copy, Check, AlertTriangle } from 'lucide-react';

const STORAGE_HOST = 'izqxsfuyibbzwdxdcmev.supabase.co';

function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return 'invalid link';
  }
}

function CopyableUrl({ url }) {
  const [copied, setCopied] = useState(false);
  const host = hostOf(url);
  const offHost = host !== STORAGE_HOST;

  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-1.5">
        {offHost && (
          <span title={`Not on ${STORAGE_HOST} — the image will not be optimized`}
            className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-semibold uppercase tracking-wide">
            <AlertTriangle className="w-2.5 h-2.5" />
            Other host
          </span>
        )}
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-gray-500 hover:text-black underline break-all transition-colors">
          {url}
        </a>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-[9px] text-gray-400">{host}</span>
        <button type="button" onClick={() => {
          navigator.clipboard?.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }} className="inline-flex items-center gap-1 text-[9px] font-medium text-gray-500 hover:text-black transition-colors">
          {copied ? <Check className="w-2.5 h-2.5 text-green-600" /> : <Copy className="w-2.5 h-2.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[9px] font-medium text-gray-500 hover:text-black transition-colors">
          <ExternalLink className="w-2.5 h-2.5" />
          Open
        </a>
      </div>
    </div>
  );
}

export default function ImageLinkList({ imageUrl, images, emptyText = 'No images' }) {
  const all = [...new Set([imageUrl, ...(Array.isArray(images) ? images : [])].filter(Boolean))];

  if (all.length === 0) {
    return <span className="text-xs text-gray-400 font-normal">{emptyText}</span>;
  }

  return (
    <div className="space-y-2">
      {all.map((url, i) => (
        <div key={`${url}-${i}`} className="flex items-start gap-2.5">
          <img src={url} alt={`product image ${i + 1}`}
            className="w-12 h-12 shrink-0 object-cover rounded-lg border border-gray-200 bg-gray-50"
            onError={e => { e.target.style.visibility = 'hidden'; }} />
          <CopyableUrl url={url} />
        </div>
      ))}
    </div>
  );
}
