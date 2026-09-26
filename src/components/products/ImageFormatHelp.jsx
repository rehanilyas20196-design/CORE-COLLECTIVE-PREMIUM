import { ALLOWED_EXTENSIONS, PROPER_HOST, PROPER_LINK_EXAMPLE } from '../../lib/imageUrl';

export default function ImageFormatHelp({ note }) {
  return (
    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2.5">
      <p className="text-[11px] font-semibold text-amber-900">Use our own storage link</p>
      <code className="mt-1 block text-[10px] leading-relaxed bg-white px-2 py-1.5 rounded border border-amber-200 text-amber-900 break-all">
        {PROPER_LINK_EXAMPLE}
      </code>
      <p className="mt-1.5 text-[11px] leading-relaxed text-amber-900">
        The link must start with <span className="font-semibold">https://</span>, use the host
        <span className="font-semibold"> {PROPER_HOST.replace('https://', '')}</span>, and end in
        <span className="font-semibold"> {ALLOWED_EXTENSIONS.join(' ')}</span>.
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-amber-800/80">
        Not allowed: Google Drive / Dropbox / Google Photos page links, <span className="font-semibold">.heic / .heif</span> (iPhone Photos),
        <span className="font-semibold"> .bmp</span>, <span className="font-semibold">.tif</span>, or any link that asks for a login.
        Write spaces as <span className="font-semibold">%20</span>.
      </p>
      {note && <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">{note}</p>}
    </div>
  );
}
