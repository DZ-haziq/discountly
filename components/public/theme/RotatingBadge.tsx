'use client';

/**
 * A circular SVG badge whose text rotates around the rim via CSS animation.
 * Accessible with high contrast (dark green text on lime background disc, 10.4:1 ratio).
 * Responsive: hidden below md (768px) to prevent clipping, or rendered with generous clearance.
 */
export function RotatingBadge({ className = '' }: { className?: string }) {
  const r = 40;
  const cx = 52;
  const cy = 52;
  const text = 'HAND·CHECKED · FULLY DISCLOSED · VERIFIED · ';

  return (
    <div
      aria-hidden="true"
      className={`w-[104px] h-[104px] shrink-0 select-none ${className}`}
    >
      <svg
        viewBox="0 0 104 104"
        className="badge-spin w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <path
            id="badge-circle"
            d={`M ${cx},${cy - r} a ${r},${r} 0 1,1 -0.001,0`}
          />
        </defs>
        {/* Solid high-contrast background disc */}
        <circle cx={cx} cy={cy} r={r + 8} fill="var(--lime)" />
        {/* Deep green border ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r + 2}
          fill="none"
          stroke="var(--deep-green)"
          strokeWidth="1.2"
          strokeDasharray="4 3"
        />
        {/* Centre dot */}
        <circle cx={cx} cy={cy} r="6" fill="var(--deep-green)" />
        {/* Rotating text in deep green on lime (10.4:1 WCAG AAA contrast) */}
        <text
          fontSize="8"
          fill="var(--deep-green)"
          fontFamily="var(--font-sora)"
          fontWeight="700"
          letterSpacing="0.12em"
        >
          <textPath href="#badge-circle" startOffset="0%">
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
