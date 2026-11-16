/**
 * Original vector artwork for the kit. All brand hues come from --game-* variables so the art re-skins
 * with the customer theme; only neutral highlights and shadows use fixed values.
 */
import { useId, type CSSProperties } from 'react';

type ArtProps = { size?: number; style?: CSSProperties; className?: string };

export type FlameState = 'active' | 'at_risk' | 'frozen' | 'lost' | 'repaired' | 'unlit';

export function FlameArt({ size = 64, state = 'active', style, className }: ArtProps & { state?: FlameState }) {
  const id = useId().replace(/:/g, '');
  const frozen = state === 'frozen';
  const grey = state === 'lost' || state === 'unlit';
  const outerA = frozen ? '#E8F0F4' : grey ? '#C9C3BF' : 'var(--game-gradient-from)';
  const outerB = frozen ? '#A9BCC6' : grey ? '#9A938E' : 'var(--game-gradient-to)';
  const core = frozen ? '#FFFFFF' : grey ? '#E4E0DD' : 'var(--game-accent)';
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 64 77" style={style} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`fo${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={outerA} />
          <stop offset="1" stopColor={outerB} />
        </linearGradient>
        <radialGradient id={`fc${id}`} cx="0.5" cy="0.7" r="0.6">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.45" stopColor={core} />
          <stop offset="1" stopColor={core} stopOpacity="0.2" />
        </radialGradient>
      </defs>
      <path
        d="M32 2c4 10 16 16 20 30 5 17-4 33-20 35C14 69 6 55 9 41c2-9 8-13 10-21 6 6 6 12 6 12S26 14 32 2z"
        fill={`url(#fo${id})`}
      />
      <path d="M32 30c3 7 11 11 11 22 0 9-6 15-11 15s-12-5-12-14c0-6 4-9 6-13 2 3 3 6 3 6s0-10 3-16z" fill={`url(#fc${id})`} />
      <ellipse cx="25" cy="22" rx="3" ry="6" fill="#FFFFFF" opacity={grey ? 0.25 : 0.45} transform="rotate(-20 25 22)" />
      {frozen && (
        <g stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.9">
          <path d="M14 60l6-6M20 60l-6-6M17 52v10" />
          <path d="M46 20l5-5M51 20l-5-5M48.5 13v9" />
        </g>
      )}
    </svg>
  );
}

export function CoinArt({ size = 48, style, className, label }: ArtProps & { label?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={style} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`c${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="color-mix(in srgb, var(--game-accent) 60%, #fff)" />
          <stop offset="0.55" stopColor="var(--game-accent)" />
          <stop offset="1" stopColor="color-mix(in srgb, var(--game-accent) 70%, var(--game-gradient-to))" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="34" r="28" fill="color-mix(in srgb, var(--game-accent) 55%, #7a4a00)" />
      <circle cx="32" cy="31" r="28" fill={`url(#c${id})`} />
      <circle cx="32" cy="31" r="21" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="3" />
      {label ? (
        <text x="32" y="40" textAnchor="middle" fontSize="24" fontWeight="800" fill="rgba(120,70,0,0.75)" fontFamily="Arial, Helvetica Neue, sans-serif">
          {label}
        </text>
      ) : (
        <path d="M32 18l3.8 8 8.7 1.1-6.4 6 1.7 8.6L32 37.4l-7.8 4.3 1.7-8.6-6.4-6 8.7-1.1z" fill="rgba(255,255,255,0.85)" />
      )}
      <path d="M14 22c4-8 12-12 20-12" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

export function GemArt({ size = 32, style, className }: ArtProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={style} className={className} aria-hidden="true">
      <path d="M8 4h16l6 8-14 17L2 12z" fill="var(--game-secondary)" />
      <path d="M8 4h16l6 8H2z" fill="color-mix(in srgb, var(--game-secondary) 60%, #fff)" />
      <path d="M16 29L9 12h14z" fill="color-mix(in srgb, var(--game-secondary) 80%, #000)" opacity="0.35" />
      <path d="M11 7l-2 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function StarArt({ size = 24, style, className, color = 'var(--game-accent)' }: ArtProps & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} className={className} aria-hidden="true">
      <path d="M12 1.8l3.1 6.5 7.1.9-5.2 4.9 1.3 7-6.3-3.4-6.3 3.4 1.3-7L1.8 9.2l7.1-.9z" fill={color} stroke="color-mix(in srgb, var(--game-accent) 60%, #8a4b00)" strokeWidth="1" strokeLinejoin="round" />
      <path d="M8 8.5l2-.3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export function BoltArt({ size = 20, style, color = 'var(--game-accent)' }: ArtProps & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={style} aria-hidden="true">
      <path d="M11.5 1L3 11.5h5.5L7.5 19 17 7.5h-5.6z" fill={color} />
    </svg>
  );
}

export function CheckArt({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10.5l4 4 8-9" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GiftArt({ size = 28, style, open = false }: ArtProps & { open?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={style} aria-hidden="true">
      <rect x="5" y="14" width="22" height="15" rx="2" fill="var(--game-primary)" />
      <rect x="14" y="14" width="4" height="15" fill="var(--game-accent)" />
      <g style={{ transform: open ? 'translate(0,-5px) rotate(-12deg)' : 'none', transformOrigin: '6px 14px', transition: 'transform 300ms' }}>
        <rect x="3" y="9" width="26" height="6" rx="2" fill="color-mix(in srgb, var(--game-primary) 80%, #fff)" />
        <rect x="14" y="9" width="4" height="6" fill="var(--game-accent)" />
        <path d="M16 9c-3-6-9-5-8-2 1 2 5 2 8 2zm0 0c3-6 9-5 8-2-1 2-5 2-8 2z" fill="var(--game-accent)" />
      </g>
    </svg>
  );
}

export function ChestArt({ size = 120, open = false, rarity = 'rare', style }: ArtProps & { open?: boolean; rarity?: string }) {
  const id = useId().replace(/:/g, '');
  const body = rarity === 'legendary' ? 'var(--game-accent)' : rarity === 'epic' ? 'var(--game-secondary)' : 'var(--game-primary)';
  return (
    <svg width={size} height={size} viewBox="0 0 120 110" style={{ overflow: 'visible', ...style }} aria-hidden="true">
      <defs>
        <linearGradient id={`cb${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={`color-mix(in srgb, ${body} 85%, #fff)`} />
          <stop offset="1" stopColor={`color-mix(in srgb, ${body} 80%, #000)`} />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="104" rx="44" ry="5" fill="rgba(0,0,0,0.12)" />
      <rect x="14" y="52" width="92" height="50" rx="8" fill={`url(#cb${id})`} />
      <rect x="14" y="52" width="92" height="8" fill="rgba(0,0,0,0.12)" />
      <rect x="20" y="52" width="8" height="50" fill="var(--game-accent)" />
      <rect x="92" y="52" width="8" height="50" fill="var(--game-accent)" />
      <g
        style={{
          transformBox: 'fill-box',
          transformOrigin: '50% 100%',
          transform: open ? 'translateY(-26px) rotate(-18deg)' : 'none',
          transition: 'transform 420ms cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <path d="M14 54V40c0-14 12-24 26-24h40c14 0 26 10 26 24v14z" fill={`url(#cb${id})`} />
        <rect x="20" y="20" width="8" height="34" fill="var(--game-accent)" />
        <rect x="92" y="20" width="8" height="34" fill="var(--game-accent)" />
        <path d="M30 26h40" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
      </g>
      <path d="M50 50h20v16c0 6-4 10-10 10s-10-4-10-10z" fill="var(--game-accent)" stroke="color-mix(in srgb, var(--game-accent) 60%, #000)" strokeWidth="2" />
      <circle cx="60" cy="62" r="4" fill="color-mix(in srgb, var(--game-accent) 50%, #000)" />
    </svg>
  );
}

export function PotionArt({ size = 96, style }: ArtProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" style={style} aria-hidden="true">
      <rect x="38" y="6" width="20" height="14" rx="3" fill="#fff" opacity="0.9" />
      <circle cx="48" cy="56" r="34" fill="rgba(255,255,255,0.25)" stroke="#fff" strokeWidth="4" />
      <path d="M18 60a30 30 0 0 0 60 0c-10 5-20-3-30 0s-20 5-30 0z" fill="var(--game-accent)" />
      <circle cx="36" cy="44" r="5" fill="#fff" opacity="0.8" />
      <circle cx="58" cy="70" r="3" fill="#fff" opacity="0.6" />
    </svg>
  );
}

export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export const rarityColor: Record<Rarity, string> = {
  COMMON: 'var(--game-muted)',
  RARE: 'var(--game-success)',
  EPIC: 'var(--game-secondary)',
  LEGENDARY: 'var(--game-accent)',
};

export function BadgeArt({
  size = 72,
  rarity = 'COMMON',
  locked = false,
  icon,
  style,
}: ArtProps & { rarity?: Rarity; locked?: boolean; icon?: string | null }) {
  const id = useId().replace(/:/g, '');
  const c = locked ? '#BDB6B1' : rarityColor[rarity];
  if (icon) {
    // Uploaded badge art is a complete design: show it whole, never clipped into our shield.
    return (
      <span aria-hidden="true" style={{ position: 'relative', display: 'inline-grid', placeItems: 'center', width: size, height: size, ...style }}>
        <img
          src={icon}
          alt=""
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'contain', filter: locked ? 'grayscale(1) brightness(0.9)' : 'drop-shadow(0 6px 14px rgba(0,0,0,0.25))', opacity: locked ? 0.55 : 1 }}
        />
        {locked && (
          <svg width={size * 0.32} height={size * 0.32} viewBox="0 0 24 24" style={{ position: 'absolute' }}>
            <circle cx="12" cy="12" r="12" fill="rgba(0,0,0,0.55)" />
            <rect x="7.5" y="11" width="9" height="7" rx="1.5" fill="#fff" />
            <path d="M9.5 11V9a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="#fff" strokeWidth="1.8" />
          </svg>
        )}
      </span>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={`color-mix(in srgb, ${c} 55%, #fff)`} />
          <stop offset="1" stopColor={c} />
        </linearGradient>
        <clipPath id={`bc${id}`}>
          <path d="M40 8l26 12v20c0 16-11 28-26 33C25 68 14 56 14 40V20z" />
        </clipPath>
      </defs>
      <path d="M40 4l30 14v22c0 19-13 33-30 38C23 73 10 59 10 40V18z" fill={`color-mix(in srgb, ${c} 70%, #000)`} opacity="0.35" />
      <path d="M40 8l26 12v20c0 16-11 28-26 33C25 68 14 56 14 40V20z" fill={`url(#b${id})`} />
      {icon && !locked ? (
        <image href={icon} x="20" y="20" width="40" height="40" clipPath={`url(#bc${id})`} preserveAspectRatio="xMidYMid slice" />
      ) : locked ? (
        <g fill="#fff" opacity="0.9">
          <rect x="30" y="38" width="20" height="16" rx="3" />
          <path d="M34 38v-5a6 6 0 0 1 12 0v5" fill="none" stroke="#fff" strokeWidth="3" />
        </g>
      ) : (
        <path d="M40 24l4.4 9 9.9 1.3-7.2 6.8 1.8 9.8L40 46.2l-8.9 4.7 1.8-9.8-7.2-6.8 9.9-1.3z" fill="#fff" opacity="0.92" />
      )}
      <path d="M24 22l16-8" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

/** Rotating sunburst rays behind hero rewards (reference video A coin modal). */
export function Sunburst({ size = 260, rays = 16, color = 'var(--game-accent)', spin = true }: { size?: number; rays?: number; color?: string; spin?: boolean }) {
  const paths = [];
  for (let i = 0; i < rays; i++) {
    const a0 = (i / rays) * Math.PI * 2;
    const a1 = a0 + Math.PI / rays;
    const r = 50;
    paths.push(`M50 50L${50 + r * Math.cos(a0)} ${50 + r * Math.sin(a0)}L${50 + r * Math.cos(a1)} ${50 + r * Math.sin(a1)}z`);
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className={spin ? 'gmf-rotate-slow' : undefined} style={{ position: 'absolute', pointerEvents: 'none' }}>
      <defs>
        <radialGradient id="gmf-sb-fade">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="gmf-sb-mask">
          <circle cx="50" cy="50" r="50" fill="url(#gmf-sb-fade)" />
        </mask>
      </defs>
      <g mask="url(#gmf-sb-mask)" fill={color} opacity="0.55">
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}
