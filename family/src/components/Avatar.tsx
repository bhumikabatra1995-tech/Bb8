import { useId } from 'react'
import type { HouseId, Member } from '../data/family'
import { itemsOf, useStore } from '../state/store'

export type HairStyle = 'long' | 'braid' | 'bun' | 'bob' | 'short'

export type Appearance = { photo?: string; skin: string; hair: HairStyle; hairColor: string }

export const SKIN_TONES = ['#FAD9C6', '#F4C1A4', '#E8A888', '#CF8C66', '#AE6E4A', '#7E4C32']
export const HAIR_SHADES = ['#1B1210', '#3B2416', '#5E3820', '#8A5530', '#C69A5A', '#B9B3B0', '#7A3550']

/** Shift a hex colour lighter (amt > 0) or darker (amt < 0). */
export const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16)
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v + (amt > 0 ? (255 - v) * amt : v * amt))))
  const r = ch((n >> 16) & 255)
  const g = ch((n >> 8) & 255)
  const b = ch(n & 255)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

export const mix = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ch = (sh: number) => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t)
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`
}

const MASC = new Set(['dad', 'bhaiya', 'uncle'])
const HAIR_DEFAULT: Record<string, string> = {
  avika: '#3B2416', avya: '#2E1C12', bhumika: '#3B2416', rachita: '#2E1C12', mom: '#1B1210',
  auntie: '#1B1210', bhabhi: '#24160F', dad: '#221A16', bhaiya: '#1B1210', uncle: '#2A2220',
}

export const defaultAppearance = (m: Member): Appearance => ({
  skin: SKIN_TONES[2],
  hair: MASC.has(m.id) ? 'short' : m.id === 'avya' ? 'bob' : m.kid ? 'braid' : m.id === 'mom' || m.id === 'auntie' ? 'bun' : 'long',
  hairColor: HAIR_DEFAULT[m.id] ?? HAIR_SHADES[0],
})

export const isMasc = (m: Member) => MASC.has(m.id)

/** The latest appearance someone saved for themselves, or their default. */
export const useAppearance = (m: Member): Appearance => {
  const s = useStore()
  const saved = itemsOf<Appearance>(s, 'profile').find((p) => p.by === m.id)
  return { ...defaultAppearance(m), ...(saved?.data ?? {}) }
}

// ---------------------------------------------------------------------------
// Hair and face, drawn around a head centred at (0,0) with radii 22 × 27.

export function HairBack({ style, color, id }: { style: HairStyle; color: string; id: string }) {
  const fill = `url(#${id}-hair)`
  const strands = shade(color, -0.4)
  const body = (() => {
  switch (style) {
    case 'long':
      return <path d="M-29 -6 C-35 -42 35 -42 29 -6 C35 8 31 18 36 30 C40 42 33 52 37 62 C38 72 30 78 21 75 C11 80 -11 80 -21 75 C-30 78 -38 72 -37 62 C-33 52 -40 42 -36 30 C-31 18 -35 8 -29 -6 Z" fill={fill} />
    case 'bob':
      return <path d="M-29 -4 C-34 -42 34 -42 29 -4 C34 8 31 20 34 31 C25 39 12 37 0 37 C-12 37 -25 39 -34 31 C-31 20 -34 8 -29 -4 Z" fill={fill} />
    case 'braid':
      return (
        <g fill={fill}>
          <path d="M-26 -4 Q-27 -40 0 -40 Q27 -40 26 -4 L24 26 Q0 34 -24 26 Z" />
          {[34, 50, 66, 82, 98, 114].map((y, i) => (
            <ellipse key={y} cx={24 + (i % 2 ? 2.5 : -2.5)} cy={y} rx={7.5 - i * 0.4} ry="9.5" stroke={shade(color, -0.35)} strokeWidth=".6" />
          ))}
        </g>
      )
    case 'bun':
      return (
        <g fill={fill}>
          <circle cx="0" cy="-36" r="15" />
          <path d="M-25 -2 Q-25 -36 0 -36 Q25 -36 25 -2 L23 14 Q0 8 -23 14 Z" />
        </g>
      )
    default:
      return null
  }
  })()
  if (!body) return null
  return (
    <g filter={`url(#${id}-brush)`}>
      {body}
      {(style === 'long' || style === 'bob') && (
        <g stroke={strands} strokeWidth=".7" fill="none" opacity=".55" strokeLinecap="round">
          <path d={style === 'long' ? 'M-25 10 Q-31 40 -27 70 M-19 20 Q-23 48 -17 74 M25 10 Q31 40 27 70 M19 20 Q23 48 17 74' : 'M-25 6 Q-28 20 -24 30 M25 6 Q28 20 24 30'} />
        </g>
      )}
    </g>
  )
}

export function HairFront({ style, color, id }: { style: HairStyle; color: string; id: string }) {
  const hi = shade(color, 0.35)
  if (style === 'short')
    return (
      <g filter={`url(#${id}-brush)`}>
        <path d="M-24.5 0 C-28 -30 -17 -41 0 -40 C17 -41 28 -30 24.5 0 L22.5 3 C21.5 -11 17 -17 11 -20 C5 -15 -5 -16 -11 -20 C-17 -16 -21.5 -10 -22.5 3 Z" fill={`url(#${id}-hair)`} />
        <path d="M-12 -30 Q0 -34 12 -30" stroke={hi} strokeWidth="1.2" fill="none" opacity=".55" strokeLinecap="round" />
      </g>
    )
  if (style === 'bun')
    return (
      <g filter={`url(#${id}-brush)`}>
        <path d="M-23 -3 Q-21 -31 0 -31 Q21 -31 23 -3 Q12 -19 1 -20 Q-11 -19 -23 -3 Z" fill={`url(#${id}-hair)`} />
        <path d="M-10 -26 Q0 -29 10 -26" stroke={hi} strokeWidth="1.1" fill="none" opacity=".5" strokeLinecap="round" />
      </g>
    )
  return (
    <g filter={`url(#${id}-brush)`}>
      <path
        d="M-26 8 C-30 -36 30 -36 26 8 C24 0 22 -6 19 -11 L15.5 -13.5 L12 -18 L8 -14 L4 -19 L0 -14.5 L-4 -19 L-8 -14 L-12 -18 L-15.5 -13.5 L-19 -11 C-22 -6 -24 0 -26 8 Z"
        fill={`url(#${id}-hair)`}
      />
      <path d="M-12 -27 Q-2 -31 8 -29" stroke={hi} strokeWidth="2.2" fill="none" opacity=".28" strokeLinecap="round" />
      <path d="M-9 -26 L-8 -16 M2 -28 L2 -17 M11 -25 L10.5 -16" stroke={shade(color, -0.4)} strokeWidth=".6" opacity=".5" />
    </g>
  )
}

export function HeadDefs({ id, skin, hairColor }: { id: string; skin: string; hairColor: string }) {
  return (
    <>
      <radialGradient id={`${id}-skin`} cx="38%" cy="32%" r="80%">
        <stop offset="0" stopColor={shade(skin, 0.16)} />
        <stop offset=".55" stopColor={skin} />
        <stop offset="1" stopColor={shade('#e89a8a', -0.05)} stopOpacity=".9" />
      </radialGradient>
      <linearGradient id={`${id}-hair`} x1="0" y1="0" x2=".4" y2="1">
        <stop offset="0" stopColor={mix(hairColor, '#c98a52', 0.42)} />
        <stop offset=".35" stopColor={mix(hairColor, '#a8683c', 0.18)} />
        <stop offset="1" stopColor={shade(hairColor, -0.3)} />
      </linearGradient>
      <radialGradient id={`${id}-iris`} cx="40%" cy="35%" r="70%">
        <stop offset="0" stopColor="#3a3566" />
        <stop offset=".55" stopColor="#1c1838" />
        <stop offset="1" stopColor="#0c0a1c" />
      </radialGradient>
      <filter id={`${id}-brush`} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.45" numOctaves="2" seed="3" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="1" />
      </filter>
      <filter id={`${id}-soft`} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="8" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="0.9" />
      </filter>
      <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="5" />
        <feColorMatrix values="0 0 0 0 .55  0 0 0 0 .5  0 0 0 0 .6  0 0 0 .9 0" />
      </filter>
      <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.6" />
      </filter>
    </>
  )
}

export function Face({ id, skin, masc = false }: { id: string; skin: string; masc?: boolean }) {
  const eye = (x: number) => (
    <g key={x}>
      <circle cx={x} cy="2" r="6.6" fill="#f4efe9" />
      <circle cx={x} cy="2.5" r="5.5" fill={`url(#${id}-iris)`} />
      <circle cx={x + 1.9} cy=".2" r="1.7" fill="#fff" />
      <circle cx={x - 1.6} cy="4.8" r=".7" fill="#fff" opacity=".8" />
      {!masc && <path d={`M${x - 7} -1.8 Q${x} -7.6 ${x + 7.2} -1.6`} stroke="#1a1226" strokeWidth="1.1" fill="none" strokeLinecap="round" />}
    </g>
  )
  return (
    <g>
      <circle cx="-23" cy="3" r="4.6" fill={shade(skin, -0.06)} />
      <circle cx="-23" cy="3" r="2.2" fill="#e07a7a" opacity=".35" />
      <circle cx="23" cy="3" r="4.6" fill={shade(skin, -0.06)} />
      <circle cx="23" cy="3" r="2.2" fill="#e07a7a" opacity=".35" />
      <path d="M0 -26 C17 -26 24 -13 24 1 C24 16 13 25.5 0 25.5 C-13 25.5 -24 16 -24 1 C-24 -13 -17 -26 0 -26 Z" fill={`url(#${id}-skin)`} filter={`url(#${id}-soft)`} />
      <path d="M-18 12 Q0 30 18 12 Q10 22 0 23 Q-10 22 -18 12 Z" fill="#7a2a2a" opacity=".07" />
      <path d={masc ? 'M-14.5 -9 Q-9.5 -12.5 -4.5 -10' : 'M-13.5 -9.6 Q-9.5 -12.4 -5 -10.6'} stroke={shade(skin, -0.62)} strokeWidth={masc ? 2.4 : 1.8} fill="none" strokeLinecap="round" />
      <path d={masc ? 'M14.5 -9 Q9.5 -12.5 4.5 -10' : 'M13.5 -9.6 Q9.5 -12.4 5 -10.6'} stroke={shade(skin, -0.62)} strokeWidth={masc ? 2.4 : 1.8} fill="none" strokeLinecap="round" />
      {eye(-10)}
      {eye(10)}
      <circle cx="-15" cy="12" r="5.6" fill="#e86a78" opacity=".34" filter={`url(#${id}-blur)`} />
      <circle cx="15" cy="12" r="5.6" fill="#e86a78" opacity=".34" filter={`url(#${id}-blur)`} />
      <path d="M-1.9 8.6 Q0 6 2 8.6 Q2.5 11.2 0 11.4 Q-2.4 11.2 -1.9 8.6 Z" fill="#d8705e" opacity=".75" />
      <path d="M-3.2 15.6 Q0 19.8 3.2 15.6 Q0 16.7 -3.2 15.6 Z" fill="#9c3346" />
      <path d="M-1.6 17.4 Q0 18.8 1.6 17.4 Q0 17.2 -1.6 17.4 Z" fill="#e2788a" />
    </g>
  )
}

// ---------------------------------------------------------------------------

const HOUSE_BG: Record<HouseId, [string, string]> = {
  '33C': ['#3657b8', '#0c1338'],
  '34C': ['#b23a5a', '#2c0716'],
}

/** A round, gold-framed portrait: a photo if the person added one, else a painted likeness. */
export function Portrait({ member, size = 120, glow = false, named = false }: { member: Member; size?: number; glow?: boolean; named?: boolean }) {
  const look = useAppearance(member)
  const uid = useId().replace(/:/g, '')
  const id = `pt-${uid}`
  const [c1, c2] = HOUSE_BG[member.house]
  const masc = isMasc(member)
  const k = member.kid ? 1.16 : 1.12

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        aria-hidden="true"
        style={{ overflow: 'visible', filter: glow ? 'drop-shadow(0 0 22px rgba(240,199,126,.5))' : 'drop-shadow(0 16px 22px rgba(0,0,10,.65))' }}
      >
        <defs>
          <HeadDefs id={id} skin={look.skin} hairColor={look.hairColor} />
          <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff3cf" />
            <stop offset=".25" stopColor="#e9c27a" />
            <stop offset=".5" stopColor="#9a6f2e" />
            <stop offset=".75" stopColor="#f5d590" />
            <stop offset="1" stopColor="#a87a34" />
          </linearGradient>
          <radialGradient id={`${id}-bg`} cx="50%" cy="30%" r="80%">
            <stop offset="0" stopColor={c1} />
            <stop offset="1" stopColor={c2} />
          </radialGradient>
          <radialGradient id={`${id}-vig`} cx="50%" cy="45%" r="60%">
            <stop offset=".6" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity=".55" />
          </radialGradient>
          <linearGradient id={`${id}-warm`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffcf8a" stopOpacity=".22" />
            <stop offset="1" stopColor="#2a1a6a" stopOpacity=".28" />
          </linearGradient>
          <clipPath id={`${id}-c`}>
            <circle cx="60" cy="60" r="52" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${id}-c)`}>
          <rect width="120" height="120" fill={`url(#${id}-bg)`} />
          {[[22, 30, 3], [96, 24, 2.2], [88, 52, 1.6], [26, 70, 1.8], [102, 84, 2.6]].map(([x, y, r]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#ffe7b0" opacity=".35" style={{ filter: 'blur(.6px)' }} />
          ))}
          {look.photo ? (
            <>
              <image href={look.photo} x="8" y="8" width="104" height="104" preserveAspectRatio="xMidYMid slice" />
              <rect width="120" height="120" fill={`url(#${id}-warm)`} style={{ mixBlendMode: 'soft-light' }} />
            </>
          ) : (
            <g style={{ transformOrigin: '60px 120px', animation: 'breathe 6s ease-in-out infinite' }}>
              <g transform={`translate(60 ${member.kid ? 52 : 50}) scale(${k})`}>
                <HairBack style={look.hair} color={look.hairColor} id={id} />
                {/* shoulders and robe */}
                <path d="M-42 70 Q-40 34 -11 30 L11 30 Q40 34 42 70 Z" fill="#1d1630" filter={`url(#${id}-brush)`} />
                <path d="M-11 30 L0 46 L11 30 Z" fill="#efe9df" />
                <path d="M-11 30 L-1 41 L-13 41 Z M11 30 L1 41 L13 41 Z" fill="#f7f2ea" stroke="#cfc6b8" strokeWidth=".5" />
                <path d="M-2.6 40 L2.6 40 L3.6 58 L0 63 L-3.6 58 Z" fill={c1} />
                <path d="M-3 46 L3 43 M-3.4 51 L3.4 48 M-3.6 56 L3.6 53" stroke="#f0c77e" strokeWidth="1.4" />
                <path d="M-26 40 Q-20 50 -15 70 M26 40 Q20 50 15 70" stroke="#000" strokeOpacity=".25" strokeWidth="1" fill="none" />
                <path d="M-6 20 L6 20 L7 33 Q0 37 -7 33 Z" fill={shade(look.skin, -0.12)} />
                <Face id={id} skin={look.skin} masc={masc} />
                <HairFront style={look.hair} color={look.hairColor} id={id} />
              </g>
            </g>
          )}
          <rect width="120" height="120" filter={`url(#${id}-grain)`} opacity=".22" style={{ mixBlendMode: 'overlay' }} />
          <rect width="120" height="120" fill={`url(#${id}-vig)`} />
          <ellipse cx="40" cy="26" rx="34" ry="12" fill="#fff" opacity=".07" transform="rotate(-20 40 26)" />
        </g>

        <circle cx="60" cy="60" r="54" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="4.5" />
        <circle cx="60" cy="60" r="58.5" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="1" opacity=".8" />
        <circle cx="60" cy="60" r="50.5" fill="none" stroke="#000" strokeOpacity=".35" strokeWidth="1" />
        <path d="M60 -1 L62.4 4 L60 8.5 L57.6 4 Z M60 112 L62 116 L60 120.5 L58 116 Z" fill={`url(#${id}-gold)`} />
        <circle cx="5" cy="60" r="1.6" fill="#f0c77e" />
        <circle cx="115" cy="60" r="1.6" fill="#f0c77e" />
      </svg>
      {named && (
        <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: Math.max(16, size * 0.15), color: 'var(--text)', letterSpacing: '.01em' }}>{member.name}</span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

/** Center-crops and shrinks a picked photo so it stays light to sync. */
export const photoToDataUrl = (file: File, px = 360): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const side = Math.min(img.width, img.height)
      const c = document.createElement('canvas')
      c.width = px
      c.height = px
      c.getContext('2d')!.drawImage(img, (img.width - side) / 2, (img.height - side) / 3, side, side, 0, 0, px, px)
      URL.revokeObjectURL(img.src)
      resolve(c.toDataURL('image/webp', 0.8))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
