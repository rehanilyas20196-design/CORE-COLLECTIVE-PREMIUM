export default function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
      <span className="inline-flex items-center rounded-full border border-[rgba(192,138,46,0.4)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#9C6A26]">
        {eyebrow}
      </span>
      <h2 className="mt-5 font-fraunces text-[28px] font-semibold tracking-[-0.01em] text-[#1D1911] sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-[#5C5344]">{subtitle}</p>}
    </div>
  );
}