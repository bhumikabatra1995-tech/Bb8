import type { CSSProperties } from 'react'

/** Deterministic pseudo-random so the sky looks the same on every render. */
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

export function Stars({ count = 34, height = 420 }: { count?: number; height?: number }) {
  return (
    <svg className="stars" width="100%" height={height} style={{ position: 'absolute', left: 0, top: 0 }} aria-hidden="true" preserveAspectRatio="none" viewBox={`0 0 400 ${height}`}>
      {Array.from({ length: count }, (_, i) => (
        <circle
          key={i}
          className="tw"
          cx={rand(i + 1) * 400}
          cy={rand(i + 101) * height * 0.85}
          r={0.5 + rand(i + 201) * 1.1}
          fill="#FFF6DA"
          style={{ animationDelay: `${rand(i + 301) * 4}s`, animationDuration: `${2.6 + rand(i + 401) * 3}s` }}
        />
      ))}
    </svg>
  )
}

export function Moon({ style }: { style?: CSSProperties }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', width: 58, height: 58, ...style }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 36% 34%, #FFFCEE 0%, #F2E5BE 48%, #D2BF8C 100%)',
          boxShadow: '0 0 26px 6px rgba(243,230,190,.35), 0 0 120px 50px rgba(150,170,255,.10)',
        }}
      />
      <div style={{ position: 'absolute', left: 30, top: 14, width: 11, height: 8, borderRadius: '50%', background: 'rgba(160,140,90,.32)' }} />
      <div style={{ position: 'absolute', left: 16, top: 32, width: 8, height: 6, borderRadius: '50%', background: 'rgba(160,140,90,.26)' }} />
      <div style={{ position: 'absolute', left: 36, top: 36, width: 5, height: 5, borderRadius: '50%', background: 'rgba(160,140,90,.22)' }} />
    </div>
  )
}

export function MoonRays({ right = 30, top = 70 }: { right?: number; top?: number }) {
  const ray = (w: number, h: number, deg: number, delay: number): CSSProperties => ({
    position: 'absolute',
    right,
    top,
    width: w,
    height: h,
    transformOrigin: '50% 0',
    transform: `rotate(${deg}deg)`,
    background: 'linear-gradient(180deg, rgba(200,215,255,.42), rgba(200,215,255,0))',
    filter: 'blur(10px)',
    opacity: 0.16,
    animation: `glowp 7s ease-in-out ${delay}s infinite`,
    pointerEvents: 'none',
  })
  return (
    <>
      <div aria-hidden="true" style={ray(70, 640, 30, 0)} />
      <div aria-hidden="true" style={ray(34, 560, 42, 2.4)} />
    </>
  )
}

type CandleSpec = { x: string; y: number; s: number; d: number }

export function Candles({ items }: { items: CandleSpec[] }) {
  return (
    <>
      {items.map((c, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: c.x,
            top: c.y,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: 0.55 + c.s * 0.45,
            filter: c.s < 0.7 ? `blur(${(0.7 - c.s) * 1.6}px)` : undefined,
            animation: `bob ${4.2 + i * 0.7}s ease-in-out ${c.d}s infinite`,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: -18 * c.s,
              width: 46 * c.s,
              height: 46 * c.s,
              marginLeft: -23 * c.s,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,200,110,.45), rgba(255,200,110,0) 70%)',
            }}
          />
          <div
            className="flame"
            style={{
              width: 7 * c.s,
              height: 13 * c.s,
              borderRadius: '50% 50% 50% 50% / 62% 62% 38% 38%',
              background: 'radial-gradient(circle at 50% 75%, #FFFFFF 0%, #FFE59A 35%, #F59B2F 100%)',
              animationDelay: `${i * 0.13}s`,
            }}
          />
          <div style={{ width: 9 * c.s, height: 30 * c.s, borderRadius: 2, background: 'linear-gradient(90deg, #C9BCA2, #F6EEDB 45%, #B3A588)' }} />
        </div>
      ))}
    </>
  )
}

export function Motes({ count = 10, area = { top: 380, height: 360 } }: { count?: number; area?: { top: number; height: number } }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const warm = rand(i + 7) > 0.35
        return (
          <div
            key={i}
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: `${rand(i + 17) * 100}%`,
              top: area.top + rand(i + 27) * area.height,
              width: 2 + rand(i + 37) * 2,
              height: 2 + rand(i + 37) * 2,
              borderRadius: '50%',
              background: warm ? '#FFE8B0' : '#DDE6FF',
              boxShadow: warm ? '0 0 7px 2px rgba(255,210,130,.7)' : '0 0 7px 2px rgba(190,210,255,.6)',
              ['--dx' as string]: `${(rand(i + 47) - 0.5) * 40}px`,
              animation: `mote ${6 + rand(i + 57) * 4}s ease-out ${rand(i + 67) * 6}s infinite`,
              opacity: 0,
              pointerEvents: 'none',
            }}
          />
        )
      })}
    </>
  )
}

export function Fog({ top }: { top: number }) {
  const layer = (left: string, t: number, w: number, dur: number, a: number): CSSProperties => ({
    position: 'absolute',
    left,
    top: t,
    width: w,
    height: 70,
    borderRadius: '50%',
    background: `rgba(190,200,235,${a})`,
    filter: 'blur(18px)',
    animation: `fogx ${dur}s ease-in-out infinite`,
    pointerEvents: 'none',
  })
  return (
    <>
      <div aria-hidden="true" style={layer('-20%', top, 360, 24, 0.12)} />
      <div aria-hidden="true" style={layer('40%', top + 34, 330, 32, 0.1)} />
    </>
  )
}

export function OwlFigure({ size = 62, letter = true }: { size?: number; letter?: boolean }) {
  return (
    <svg width={size} height={size * 0.84} viewBox="0 0 62 52" aria-hidden="true">
      <path style={{ transformBox: 'fill-box', transformOrigin: '100% 60%', animation: 'flapL .42s ease-in-out infinite alternate' }} d="M28 22 Q14 8 1 14 Q8 18 10 22 Q4 24 2 28 Q14 30 28 28 Z" fill="#7A6450" />
      <path style={{ transformBox: 'fill-box', transformOrigin: '0% 60%', animation: 'flapR .42s ease-in-out infinite alternate' }} d="M34 22 Q48 8 61 14 Q54 18 52 22 Q58 24 60 28 Q48 30 34 28 Z" fill="#6E5A47" />
      <ellipse cx="31" cy="27" rx="8" ry="11" fill="#8C7560" />
      <ellipse cx="31" cy="30" rx="5" ry="7" fill="#C9B396" />
      <circle cx="31" cy="16" r="7" fill="#8C7560" />
      <path d="M25 11 L26 6 L28.5 10 M37 11 L36 6 L33.5 10" fill="#8C7560" stroke="#8C7560" strokeWidth="1.2" />
      <circle cx="28.3" cy="15.5" r="2.1" fill="#F6C451" />
      <circle cx="33.7" cy="15.5" r="2.1" fill="#F6C451" />
      <circle cx="28.3" cy="15.5" r=".9" fill="#1A120A" />
      <circle cx="33.7" cy="15.5" r=".9" fill="#1A120A" />
      <path d="M30.2 18 L31 20 L31.8 18 Z" fill="#E0A94A" />
      {letter && (
        <>
          <rect x="25" y="38" width="13" height="9" rx="1" fill="#F4E9CF" />
          <path d="M25 38 L31.5 43 L38 38" stroke="#B8862F" strokeWidth=".8" fill="none" />
          <circle cx="31.5" cy="43.5" r="1.8" fill="#9B1E2E" />
        </>
      )}
    </svg>
  )
}

export function FlyingOwl({ top = 130, duration = 17, delay = 0 }: { top?: number; duration?: number; delay?: number }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: 0, top, animation: `fly ${duration}s linear ${delay}s infinite`, pointerEvents: 'none' }}>
      <OwlFigure />
    </div>
  )
}

/** Fine film grain that makes flat gradients feel painted. */
export function Grain() {
  return (
    <svg className="grain" width="100%" height="100%" aria-hidden="true">
      <filter id="grain-f">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix values="0 0 0 0 .5  0 0 0 0 .45  0 0 0 0 .4  0 0 0 .55 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-f)" />
    </svg>
  )
}

export const HALL_CANDLES: CandleSpec[] = [
  { x: '8%', y: 40, s: 0.8, d: 0 },
  { x: '28%', y: 92, s: 0.55, d: 1.1 },
  { x: '52%', y: 30, s: 0.6, d: 0.5 },
  { x: '70%', y: 104, s: 0.75, d: 1.8 },
  { x: '88%', y: 52, s: 0.5, d: 0.9 },
]
