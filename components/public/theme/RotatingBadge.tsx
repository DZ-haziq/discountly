'use client';

/**
 * A circular SVG badge whose text rotates around the rim via CSS animation.
 * Pure presentational — no data or logic.
 */
export function RotatingBadge() {
  const r = 42;
  const cx = 52;
  const cy = 52;
  const circumference = 2 * Math.PI * r;
  const text = 'HAND·CHECKED · FULLY DISCLOSED · VERIFIED · ';

  return (
    <div
      aria-hidden="true"
      className="w-[104px] h-[104px] shrink-0 select-none"
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
        {/* Lime ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--lime)"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
        {/* Centre dot */}
        <circle cx={cx} cy={cy} r="6" fill="var(--orange)" />
        {/* Rotating text */}
        <text
          fontSize="8.5"
          fill="var(--lime)"
          fontFamily="var(--font-sora)"
          fontWeight="500"
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
