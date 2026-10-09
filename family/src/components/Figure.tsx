import { useId } from 'react'
import { Face, HairBack, HairFront, HeadDefs, shade } from './Avatar'

/** Everything about a look. Saved as-is in the Lookbook. */
export type Look = {
  garment: GarmentId
  sleeves: 'none' | 'puff' | 'long'
  color: string
  color2: string
  pattern: PatternId
  trim: boolean
  painting?: string // a data URL of fabric painted by hand
  skin: string
  hair: HairId
  hairColor: string
  accessories: AccessoryId[]
}

export type GarmentId = 'aline' | 'ballgown' | 'mermaid' | 'party' | 'lehenga' | 'robe'
export type PatternId = 'solid' | 'stars' | 'florals' | 'paisley' | 'polka' | 'stripes' | 'sparkle' | 'ombre'
export type HairId = 'long' | 'bun' | 'bob' | 'braid' | 'short'
export type AccessoryId = 'tiara' | 'jhumkas' | 'necklace' | 'wand' | 'clutch' | 'hat' | 'wings' | 'dupatta'

export const W = 300
export const H = 520

// A storybook doll: big round head (centre 150,150), soft little body below.
const HEAD = { x: 150, y: 150, k: 2.7 }

export const GARMENTS: Record<GarmentId, { name: string; d: string }> = {
  aline: { name: 'A-line', d: 'M108 228 Q150 214 192 228 L182 300 Q184 306 186 312 L232 444 Q150 468 68 444 L114 312 Q116 306 118 300 Z' },
  ballgown: { name: 'Ball gown', d: 'M110 228 Q150 214 190 228 L180 298 Q262 356 270 470 Q150 502 30 470 Q38 356 120 298 Z' },
  mermaid: { name: 'Mermaid', d: 'M110 228 Q150 214 190 228 L180 300 Q192 360 172 408 Q206 452 226 490 Q150 506 74 490 Q94 452 128 408 Q108 360 120 300 Z' },
  party: { name: 'Party', d: 'M110 228 Q150 214 190 228 L180 300 Q182 306 184 310 L214 384 Q150 400 86 384 L116 310 Q118 306 120 300 Z' },
  lehenga: { name: 'Lehenga', d: 'M112 228 Q150 216 188 228 L182 272 Q150 280 118 272 Z M122 298 Q150 290 178 298 L250 476 Q150 504 50 476 Z' },
  robe: { name: 'Wizard robe', d: 'M100 226 Q150 208 200 226 L214 300 L242 482 Q150 500 58 482 L86 300 Z' },
}

export const SKINS = ['#FAD9C6', '#F4C1A4', '#E8A888', '#CF8C66', '#AE6E4A', '#7E4C32']
export const HAIR_COLORS = ['#1B1210', '#3B2416', '#6B3E22', '#A8662E', '#D9B25E', '#8E3B5E', '#E9E2F2']
export const FABRICS = ['#F4ECDB', '#F0C77E', '#F2A8BE', '#D2486A', '#9A2640', '#F08A5D', '#F2D35E', '#7FD6A0', '#2F7A5C', '#8CCBEB', '#4A6BE0', '#22307A', '#9A7BE0', '#4B2A6E', '#1B1530', '#C8CBD6']

const ARM_L = 'M112 230 Q97 234 95 254 L90 322 Q96 334 106 328 L115 262 Z'
const ARM_R = 'M188 230 Q203 234 205 254 L210 322 Q204 334 194 328 L185 262 Z'
const SLEEVE_LONG_L = 'M112 228 Q95 230 92 252 L86 324 Q97 338 110 330 L117 262 Z'
const SLEEVE_LONG_R = 'M188 228 Q205 230 208 252 L214 324 Q203 338 190 330 L183 262 Z'

function PatternDef({ id, look }: { id: string; look: Look }) {
  const { color: a, color2: b, pattern } = look
  switch (pattern) {
    case 'stars':
      return (
        <pattern id={id} width="34" height="34" patternUnits="userSpaceOnUse">
          <rect width="34" height="34" fill={a} />
          <path d="M9 4 L10.6 8 L15 8.3 L11.6 11 L12.7 15.3 L9 12.9 L5.3 15.3 L6.4 11 L3 8.3 L7.4 8 Z" fill={b} />
          <circle cx="26" cy="25" r="1.6" fill={b} />
          <circle cx="22" cy="9" r="0.9" fill={b} />
        </pattern>
      )
    case 'florals':
      return (
        <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill={a} />
          {[[12, 12], [32, 30]].map(([x, y]) => (
            <g key={x} fill={b}>
              {[0, 72, 144, 216, 288].map((r) => (
                <ellipse key={r} cx={x} cy={y - 4.5} rx="2.8" ry="4.5" transform={`rotate(${r} ${x} ${y})`} />
              ))}
              <circle cx={x} cy={y} r="2.2" fill={a} />
            </g>
          ))}
        </pattern>
      )
    case 'paisley':
      return (
        <pattern id={id} width="44" height="44" patternUnits="userSpaceOnUse">
          <rect width="44" height="44" fill={a} />
          <path d="M14 30 C4 30 4 14 14 12 C22 10 26 20 20 26 C24 18 16 14 14 18 C12 22 18 24 18 20" fill="none" stroke={b} strokeWidth="1.6" />
          <circle cx="13" cy="21" r="1.6" fill={b} />
          <path d="M36 10 C30 10 30 2 36 1 C40 0 42 6 39 9" fill="none" stroke={b} strokeWidth="1.2" />
          <circle cx="33" cy="36" r="1.2" fill={b} />
        </pattern>
      )
    case 'polka':
      return (
        <pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse">
          <rect width="22" height="22" fill={a} />
          <circle cx="5.5" cy="5.5" r="3.4" fill={b} />
          <circle cx="16.5" cy="16.5" r="3.4" fill={b} />
        </pattern>
      )
    case 'stripes':
      return (
        <pattern id={id} width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          <rect width="18" height="18" fill={a} />
          <rect width="6" height="18" fill={b} />
        </pattern>
      )
    case 'sparkle':
      return (
        <pattern id={id} width="26" height="26" patternUnits="userSpaceOnUse">
          <rect width="26" height="26" fill={a} />
          {[[4, 6, 1.1, 0], [17, 3, 0.8, 0.7], [11, 15, 1.3, 1.4], [22, 20, 0.9, 0.3], [3, 22, 0.7, 1.1]].map(([x, y, r, d]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={b} style={{ animation: `twinkle 2.2s ease-in-out ${d}s infinite` }} />
          ))}
        </pattern>
      )
    case 'ombre':
      return (
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.2" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      )
    default:
      return (
        <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill={a} />
        </pattern>
      )
  }
}

function Accessory({ a, look }: { a: AccessoryId; look: Look }) {
  switch (a) {
    case 'tiara':
      return (
        <g style={{ filter: 'drop-shadow(0 0 6px rgba(255,220,150,.7))' }}>
          <path d="M112 70 L122 46 L134 62 L150 32 L166 62 L178 46 L188 70 Q150 58 112 70 Z" fill="#F4CF86" stroke="#B8862F" strokeWidth="1.4" />
          <circle cx="150" cy="42" r="5" fill="#8CCBEB" stroke="#fff" strokeWidth="1" />
          <circle cx="124" cy="54" r="3" fill="#F2A8BE" />
          <circle cx="176" cy="54" r="3" fill="#F2A8BE" />
        </g>
      )
    case 'hat':
      return (
        <g>
          <path d="M60 92 Q150 122 240 92 Q214 78 192 76 L176 18 Q164 -16 122 -2 Q154 6 146 30 L110 76 Q86 78 60 92 Z" fill={look.color2 === look.color ? '#2A2340' : look.color2} stroke="#F0C77E" strokeWidth="1.6" />
          <path d="M112 72 Q150 82 190 72" stroke="#E2A04A" strokeWidth="9" fill="none" />
          <rect x="140" y="66" width="20" height="16" rx="3" fill="none" stroke="#F4CF86" strokeWidth="3" />
        </g>
      )
    case 'jhumkas':
      return (
        <g fill="#F0C77E">
          {[88, 212].map((x) => (
            <g key={x}>
              <circle cx={x} cy="170" r="3" />
              <path d={`M${x - 8} 190 Q${x} 174 ${x + 8} 190 Z`} />
              <circle cx={x - 6} cy="193" r="1.8" />
              <circle cx={x} cy="195" r="1.8" />
              <circle cx={x + 6} cy="193" r="1.8" />
            </g>
          ))}
        </g>
      )
    case 'necklace':
      return (
        <g>
          <path d="M128 226 Q150 250 172 226" stroke="#F0C77E" strokeWidth="2.4" fill="none" />
          <path d="M144 242 L150 254 L156 242 Z" fill="#D2486A" stroke="#F0C77E" strokeWidth="1" />
        </g>
      )
    case 'wand':
      return (
        <g>
          <path d="M200 330 L240 268" stroke="#6A4428" strokeWidth="5" strokeLinecap="round" />
          <circle cx="242" cy="264" r="6" fill="#FFF4CC" style={{ filter: 'drop-shadow(0 0 10px #FFD27A)', animation: 'glowp 1.4s ease-in-out infinite' }} />
          <path d="M256 250 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill="#FFF4CC" style={{ animation: 'twinkle 1.8s ease-in-out infinite' }} />
        </g>
      )
    case 'clutch':
      return (
        <g>
          <rect x="70" y="326" width="40" height="26" rx="8" fill={look.color2} stroke="#F0C77E" strokeWidth="1.6" />
          <path d="M70 336 H110" stroke="#F0C77E" strokeWidth="1" />
          <circle cx="90" cy="336" r="3" fill="#F0C77E" />
        </g>
      )
    case 'dupatta':
      return <path d="M186 226 Q238 300 220 380 Q206 450 244 480 Q210 482 198 446 Q178 360 192 290 Q196 252 176 232 Z" fill={look.color2} opacity=".55" stroke="#F0C77E" strokeWidth="1.2" strokeDasharray="3 3" />
    default:
      return null
  }
}

/** A storybook doll wearing a Look. Renders at any size. */
export function Figure({ look, width = 300, runway = false }: { look: Look; width?: number; runway?: boolean }) {
  const uid = useId().replace(/:/g, '')
  const hid = `h-${uid}`
  const pat = `pat-${uid}`
  const clip = `clip-${uid}`
  const sheen = `sheen-${uid}`
  const paint = `paint-${uid}`
  const brush = `brush-${uid}`
  const skinG = `skin-${uid}`
  const g = GARMENTS[look.garment]
  const longSleeves = look.sleeves === 'long'
  const wide = look.garment === 'ballgown' || look.garment === 'lehenga' || look.garment === 'aline'

  return (
    <svg width={width} height={(width * H) / W} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`A ${g.name.toLowerCase()} design`} style={{ overflow: 'visible' }}>
      <defs>
        <HeadDefs id={hid} skin={look.skin} hairColor={look.hairColor} />
        <PatternDef id={pat} look={look} />
        <clipPath id={clip}>
          <path d={g.d} />
          {longSleeves && (
            <>
              <path d={SLEEVE_LONG_L} />
              <path d={SLEEVE_LONG_R} />
            </>
          )}
        </clipPath>
        <linearGradient id={sheen} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1a1030" stopOpacity=".45" />
          <stop offset=".28" stopColor="#1a1030" stopOpacity="0" />
          <stop offset=".42" stopColor="#fff" stopOpacity=".2" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#1a1030" stopOpacity=".5" />
        </linearGradient>
        <linearGradient id={skinG} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={shade(look.skin, -0.14)} />
          <stop offset=".5" stopColor={look.skin} />
          <stop offset="1" stopColor={shade(look.skin, -0.18)} />
        </linearGradient>
        <filter id={brush} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="6" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
        </filter>
        {look.painting && (
          <pattern id={paint} patternUnits="userSpaceOnUse" width={W} height={H}>
            <image href={look.painting} width={W} height={H} />
          </pattern>
        )}
      </defs>

      {look.accessories.includes('wings') && (
        <g opacity=".75" style={{ transformOrigin: '150px 260px', animation: runway ? 'breathe 2s ease-in-out infinite' : undefined, filter: 'drop-shadow(0 0 10px rgba(220,230,255,.6))' }}>
          <path d="M150 250 Q60 150 36 240 Q56 296 150 284 Z" fill="#E6ECFF" />
          <path d="M150 250 Q240 150 264 240 Q244 296 150 284 Z" fill="#E6ECFF" />
          <path d="M150 284 Q86 306 76 352 Q114 346 150 294 Z M150 284 Q214 306 224 352 Q186 346 150 294 Z" fill="#EADCFF" />
        </g>
      )}

      <g transform={`translate(${HEAD.x} ${HEAD.y}) scale(${HEAD.k})`}>
        <HairBack style={look.hair} color={look.hairColor} id={hid} />
      </g>

      {/* body */}
      <g fill={`url(#${skinG})`}>
        <path d="M140 200 L160 200 L162 230 L138 230 Z" />
        <path d={ARM_L} />
        <path d={ARM_R} />
        <path d="M110 228 Q150 214 190 228 L180 300 Q184 330 186 360 L114 360 Q116 330 120 300 Z" />
        <path d="M127 356 L147 356 L146 468 L131 468 Z" />
        <path d="M153 356 L173 356 L169 468 L154 468 Z" />
      </g>
      <circle cx="98" cy="332" r="11" fill={look.skin} />
      <circle cx="202" cy="332" r="11" fill={look.skin} />
      <path d="M140 214 Q150 222 160 214 L160 222 Q150 228 140 222 Z" fill="#7a2a2a" opacity=".1" />

      {/* shoes */}
      <g fill={look.color2}>
        <path d="M124 464 Q138 456 150 464 L150 476 Q137 486 122 478 Z" />
        <path d="M150 464 Q162 456 176 464 L178 478 Q163 486 150 476 Z" />
      </g>

      {/* the garment */}
      <g filter={`url(#${brush})`}>
        <g clipPath={`url(#${clip})`}>
          <rect width={W} height={H} fill={`url(#${pat})`} />
          {look.painting && <rect width={W} height={H} fill={`url(#${paint})`} />}
          <rect width={W} height={H} fill={`url(#${sheen})`} />
          {wide && (
            <g stroke="#1a1030" strokeOpacity=".16" strokeWidth="3" fill="none">
              <path d="M150 300 Q138 400 112 490 M150 300 Q162 400 188 490 M150 300 Q118 390 66 476 M150 300 Q182 390 234 476" />
            </g>
          )}
          <path d="M100 300 Q150 316 200 300 L200 320 Q150 334 100 320 Z" fill="#1a1030" opacity=".14" />
        </g>
      </g>
      {look.trim && (
        <g stroke="#F4CF86" strokeWidth="3" fill="none" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 3px rgba(255,210,130,.6))' }}>
          <path d="M110 229 Q150 242 190 229" />
          {look.garment !== 'lehenga' && look.garment !== 'robe' && <path d="M120 300 Q150 310 180 300" strokeWidth="5" />}
          {look.garment === 'lehenga' && <path d="M54 474 Q150 504 246 474" strokeWidth="6" strokeDasharray="1 8" />}
          {look.garment === 'robe' && <path d="M150 220 L150 496" strokeWidth="2" />}
        </g>
      )}

      {look.sleeves === 'puff' && (
        <g fill={`url(#${pat})`} filter={`url(#${brush})`}>
          <ellipse cx="108" cy="240" rx="20" ry="16" />
          <ellipse cx="192" cy="240" rx="20" ry="16" />
        </g>
      )}

      <g transform={`translate(${HEAD.x} ${HEAD.y}) scale(${HEAD.k})`}>
        <Face id={hid} skin={look.skin} />
        <HairFront style={look.hair} color={look.hairColor} id={hid} />
      </g>

      {look.accessories
        .filter((a) => a !== 'wings')
        .map((a) => (
          <Accessory key={a} a={a} look={look} />
        ))}
    </svg>
  )
}

export const DEFAULT_LOOK: Look = {
  garment: 'ballgown',
  sleeves: 'puff',
  color: '#22307A',
  color2: '#F0C77E',
  pattern: 'stars',
  trim: true,
  skin: SKINS[1],
  hair: 'long',
  hairColor: '#4A2A18',
  accessories: ['tiara'],
}

export const clipPathFor = (look: Look) =>
  look.sleeves === 'long' ? `${GARMENTS[look.garment].d} ${SLEEVE_LONG_L} ${SLEEVE_LONG_R}` : GARMENTS[look.garment].d
