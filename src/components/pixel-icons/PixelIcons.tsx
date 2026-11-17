export interface PixelIconProps {
  size?: number;
  class?: string;
  className?: string;
  style?: Record<string, string | number>;
  color?: string;
}

export function PixelHome({
  size = 16,
  class: className,
  style,
  color,
}: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color || 'currentColor'}
      shape-rendering="crispEdges"
      class={className}
      style={style}
      aria-hidden="true"
    >
      {/* Chimney */}
      <rect x="11" y="2" width="2" height="3" />
      {/* Stepped roof */}
      <rect x="7" y="2" width="2" height="1" />
      <rect x="5" y="3" width="6" height="1" />
      <rect x="4" y="4" width="8" height="1" />
      <rect x="3" y="5" width="10" height="1" />
      <rect x="2" y="6" width="12" height="1" />
      <rect x="1" y="7" width="14" height="1" />
      {/* Left wall */}
      <rect x="2" y="8" width="4" height="6" />
      {/* Right wall */}
      <rect x="10" y="8" width="4" height="6" />
      {/* Lintel above door */}
      <rect x="6" y="8" width="4" height="2" />
      {/* Floor threshold */}
      <rect x="6" y="13" width="4" height="1" />
    </svg>
  );
}

export function PixelBook({
  size = 16,
  class: className,
  style,
  color,
}: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color || 'currentColor'}
      shape-rendering="crispEdges"
      class={className}
      style={style}
      aria-hidden="true"
    >
      {/* Left page outline & fill */}
      <rect x="1" y="3" width="6" height="11" />
      {/* Right page outline & fill */}
      <rect x="9" y="3" width="6" height="11" />
      {/* Spine top/bottom caps */}
      <rect x="7" y="12" width="2" height="2" />
      {/* Bookmark ribbon hanging in center */}
      <rect x="7" y="1" width="2" height="7" fill="var(--forge, #e76f36)" />
      <rect x="7" y="8" width="1" height="1" fill="var(--forge, #e76f36)" />
    </svg>
  );
}

export function PixelGamepad({
  size = 16,
  class: className,
  style,
  color,
}: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shape-rendering="crispEdges"
      class={className}
      style={style}
      aria-hidden="true"
    >
      {/* Controller body shell */}
      <rect x="2" y="4" width="12" height="2" fill={color || 'currentColor'} />
      <rect x="1" y="6" width="5" height="7" fill={color || 'currentColor'} />
      <rect x="10" y="6" width="5" height="7" fill={color || 'currentColor'} />
      <rect x="6" y="6" width="4" height="3" fill={color || 'currentColor'} />
      {/* Action buttons on right grip */}
      <rect x="12" y="7" width="2" height="2" fill="var(--forge, #e76f36)" />
      <rect x="11" y="9" width="2" height="2" fill="var(--gold, #f2be58)" />
      {/* D-Pad cross highlight on left grip */}
      <rect x="2" y="8" width="3" height="1" fill="var(--bg, #0b1423)" />
      <rect x="3" y="7" width="1" height="3" fill="var(--bg, #0b1423)" />
    </svg>
  );
}

export function PixelLayers({
  size = 16,
  class: className,
  style,
  color,
}: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color || 'currentColor'}
      shape-rendering="crispEdges"
      class={className}
      style={style}
      aria-hidden="true"
    >
      {/* Top tier plate */}
      <rect x="4" y="2" width="8" height="2" />
      <rect x="3" y="3" width="10" height="1" />
      {/* Middle tier plate */}
      <rect x="2" y="6" width="12" height="2" />
      <rect x="1" y="7" width="14" height="1" />
      {/* Bottom tier plate */}
      <rect x="1" y="10" width="14" height="2" />
      <rect x="0" y="11" width="16" height="2" />
    </svg>
  );
}

export function PixelCrown({
  size = 16,
  class: className,
  style,
}: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shape-rendering="crispEdges"
      class={className}
      style={style}
      aria-hidden="true"
    >
      {/* Crown base band - Gold */}
      <rect x="1" y="12" width="14" height="2" fill="var(--gold, #f2be58)" />
      {/* Crown body connector */}
      <rect x="2" y="10" width="12" height="2" fill="var(--gold, #f2be58)" />
      {/* Left peak */}
      <rect x="2" y="5" width="2" height="5" fill="var(--gold, #f2be58)" />
      <rect x="1" y="4" width="4" height="1" fill="var(--gold, #f2be58)" />
      {/* Center peak */}
      <rect x="7" y="3" width="2" height="7" fill="var(--gold, #f2be58)" />
      <rect x="6" y="2" width="4" height="1" fill="var(--gold, #f2be58)" />
      {/* Right peak */}
      <rect x="12" y="5" width="2" height="5" fill="var(--gold, #f2be58)" />
      <rect x="11" y="4" width="4" height="1" fill="var(--gold, #f2be58)" />
      {/* Jewels: Ruby Red center, Sapphire Blue sides */}
      <rect x="7" y="6" width="2" height="2" fill="#ef4444" />
      <rect x="3" y="7" width="1" height="1" fill="#38bdf8" />
      <rect x="12" y="7" width="1" height="1" fill="#38bdf8" />
    </svg>
  );
}

export function PixelTrophy({
  size = 16,
  class: className,
  style,
  color,
}: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color || 'currentColor'}
      shape-rendering="crispEdges"
      class={className}
      style={style}
      aria-hidden="true"
    >
      {/* Cup top rim */}
      <rect x="4" y="2" width="8" height="1" />
      {/* Cup bowl */}
      <rect x="3" y="3" width="10" height="4" />
      <rect x="4" y="7" width="8" height="2" />
      <rect x="5" y="9" width="6" height="1" />
      <rect x="6" y="10" width="4" height="1" />
      {/* Stem */}
      <rect x="7" y="11" width="2" height="2" />
      {/* Base */}
      <rect x="4" y="13" width="8" height="2" />
      {/* Left handle */}
      <rect x="1" y="4" width="2" height="1" />
      <rect x="1" y="5" width="1" height="2" />
      <rect x="2" y="7" width="1" height="1" />
      {/* Right handle */}
      <rect x="13" y="4" width="2" height="1" />
      <rect x="14" y="5" width="1" height="2" />
      <rect x="13" y="7" width="1" height="1" />
    </svg>
  );
}

export function PixelSun({
  size = 16,
  class: className,
  style,
  color,
}: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color || 'currentColor'}
      shape-rendering="crispEdges"
      class={className}
      style={style}
      aria-hidden="true"
    >
      {/* Center 6x6 core */}
      <rect x="5" y="5" width="6" height="6" />
      {/* Cardinal rays */}
      <rect x="7" y="1" width="2" height="3" />
      <rect x="7" y="12" width="2" height="3" />
      <rect x="1" y="7" width="3" height="2" />
      <rect x="12" y="7" width="3" height="2" />
      {/* Diagonal corner rays */}
      <rect x="3" y="3" width="2" height="2" />
      <rect x="11" y="3" width="2" height="2" />
      <rect x="3" y="11" width="2" height="2" />
      <rect x="11" y="11" width="2" height="2" />
    </svg>
  );
}

export function PixelMoon({
  size = 16,
  class: className,
  style,
  color,
}: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color || 'currentColor'}
      shape-rendering="crispEdges"
      class={className}
      style={style}
      aria-hidden="true"
    >
      {/* Crescent moon pixel body */}
      <rect x="8" y="2" width="4" height="2" />
      <rect x="10" y="4" width="3" height="2" />
      <rect x="11" y="6" width="3" height="4" />
      <rect x="10" y="10" width="3" height="2" />
      <rect x="8" y="12" width="4" height="2" />
      {/* Inner spine */}
      <rect x="6" y="4" width="3" height="2" />
      <rect x="5" y="6" width="3" height="4" />
      <rect x="6" y="10" width="3" height="2" />
      <rect x="4" y="7" width="2" height="2" />
    </svg>
  );
}

export function PixelGear({
  size = 16,
  class: className,
  style,
  color,
}: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color || 'currentColor'}
      shape-rendering="crispEdges"
      class={className}
      style={style}
      aria-hidden="true"
    >
      {/* Cardinal teeth */}
      <rect x="6" y="1" width="4" height="3" />
      <rect x="6" y="12" width="4" height="3" />
      <rect x="1" y="6" width="3" height="4" />
      <rect x="12" y="6" width="3" height="4" />
      {/* Corner diagonal teeth */}
      <rect x="3" y="3" width="2" height="2" />
      <rect x="11" y="3" width="2" height="2" />
      <rect x="3" y="11" width="2" height="2" />
      <rect x="11" y="11" width="2" height="2" />
      {/* Outer ring walls (leaving hollow 4x4 center at x=6..9, y=6..9) */}
      <rect x="4" y="4" width="8" height="2" />
      <rect x="4" y="10" width="8" height="2" />
      <rect x="4" y="6" width="2" height="4" />
      <rect x="10" y="6" width="2" height="4" />
    </svg>
  );
}
