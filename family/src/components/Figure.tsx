import { useId } from 'react'

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
export type HairId = 'long' | 'bun' | 'bob' | 'braid'
export type AccessoryId = 'tiara' | 'jhumkas' | 'necklace' | 'wand' | 'clutch' | 'hat' | 'wings' | 'dupatta'

export const W = 300
export const H = 520

export const GARMENTS: Record<GarmentId, { name: string; d: string }> = {
  aline: { name: 'A-line', d: 'M112 122 Q150 112 188 122 L178 214 Q181 220 182 226 L224 404 Q150 422 76 404 L118 226 Q119 220 122 214 Z' },
  ballgown: { name: 'Ball gown', d: 'M113 122 Q150 112 187 122 L176 212 Q178 220 180 224 Q262 330 272 474 Q150 506 28 474 Q38 330 120 224 Q122 220 124 212 Z' },
  mermaid: { name: 'Mermaid', d: 'M113 122 Q150 112 187 122 L176 214 Q190 280 172 384 Q206 452 234 498 Q150 514 66 498 Q94 452 128 384 Q110 280 124 214 Z' },
  party: { name: 'Party', d: 'M113 122 Q150 112 187 122 L176 214 Q180 222 182 228 L206 306 Q150 320 94 306 L118 228 Q120 222 124 214 Z' },
  lehenga: { name: 'Lehenga', d: 'M114 124 Q150 114 186 124 L179 188 Q150 196 121 188 Z M124 214 Q150 206 176 214 L248 482 Q150 508 52 482 Z' },
  robe: { name: 'Wizard robe', d: 'M104 120 Q150 106 196 120 L212 200 L242 492 Q150 508 58 492 L88 200 Z' },
}

export const SKINS = ['#F6D7C3', '#E8B898', '#D19A73', '#B47A52', '#8C5A3A', '#5E3A24']
export const HAIR_COLORS = ['#1B1210', '#3B2416', '#6B3E22', '#A8662E', '#D9B25E', '#8E3B5E', '#E9E2F2']
export const FABRICS = ['#F4ECDB', '#F0C77E', '#E8A0B4', '#D2486A', '#9A2640', '#F08A5D', '#F2D35E', '#7FD6A0', '#2F7A5C', '#7FC4E8', '#3B5BDB', '#1F2A6B', '#8E6FD8', '#4B2A6E', '#1B1530', '#C0C0C8']

const ARM_L = 'M113 124 Q100 128 98 150 L88 290 Q90 300 97 298 L112 162 Z'
const ARM_R = 'M187 124 Q200 128 202 150 L212 290 Q210 300 203 298 L188 162 Z'
const SLEEVE_LONG_L = 'M113 122 Q99 126 96 152 L84 292 Q92 302 100 296 L114 164 Z'
const SLEEVE_LONG_R = 'M187 122 Q201 126 204 152 L216 292 Q208 302 200 296 L186 164 Z'

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
          <path d="M22 18 q4 -4 8 0" stroke={b} strokeWidth="1" fill="none" opacity=".6" />
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

function Hair({ look, part }: { look: Look; part: 'back' | 'front' }) {
  const c = look.hairColor
  if (part === 'back') {
    if (look.hair === 'long') return <path d="M124 58 Q124 26 150 26 Q177 26 177 58 L186 168 Q168 178 150 172 Q132 178 114 168 Z" fill={c} />
    if (look.hair === 'bob') return <path d="M122 62 Q122 26 150 26 Q178 26 178 62 L181 96 Q150 104 119 96 Z" fill={c} />
    if (look.hair === 'braid')
      return (
        <g fill={c}>
          <path d="M124 60 Q124 26 150 26 Q177 26 177 60 L174 92 Q150 98 126 92 Z" />
          {[100, 118, 136, 154, 172, 190].map((y, i) => (
            <ellipse key={y} cx={176 + (i % 2 ? 2 : -2)} cy={y} rx="8" ry="10" />
          ))}
        </g>
      )
    return (
      <g fill={c}>
        <circle cx="150" cy="30" r="16" />
        <path d="M126 62 Q126 32 150 32 Q174 32 174 62 L172 78 Q150 70 128 78 Z" />
      </g>
    )
  }
  return <path d="M127 62 Q130 36 150 36 Q171 36 173 62 Q163 48 150 50 Q136 47 127 62 Z" fill={c} />
}

function Accessory({ a, look }: { a: AccessoryId; look: Look }) {
  switch (a) {
    case 'tiara':
      return (
        <g>
          <path d="M131 44 L136 32 L142 41 L150 26 L158 41 L164 32 L169 44 Q150 38 131 44 Z" fill="#F0C77E" stroke="#B8862F" strokeWidth=".8" />
          <circle cx="150" cy="31" r="2.6" fill="#7FC4E8" />
          <circle cx="136" cy="35" r="1.6" fill="#E8A0B4" />
          <circle cx="164" cy="35" r="1.6" fill="#E8A0B4" />
        </g>
      )
    case 'hat':
      return (
        <g>
          <path d="M104 46 Q150 60 196 46 Q178 40 166 40 L158 8 Q150 -12 128 -4 Q146 0 142 14 L134 40 Q122 40 104 46 Z" fill={look.color2 === look.color ? '#1B1530' : look.color2} stroke="#F0C77E" strokeWidth="1" />
          <path d="M136 36 Q150 40 164 36" stroke="#F0C77E" strokeWidth="3" fill="none" />
        </g>
      )
    case 'jhumkas':
      return (
        <g fill="#F0C77E">
          {[127, 173].map((x) => (
            <g key={x}>
              <circle cx={x} cy="74" r="1.6" />
              <path d={`M${x - 4} 82 Q${x} 74 ${x + 4} 82 Z`} />
              <circle cx={x - 3} cy="84" r=".9" />
              <circle cx={x} cy="85" r=".9" />
              <circle cx={x + 3} cy="84" r=".9" />
            </g>
          ))}
        </g>
      )
    case 'necklace':
      return (
        <g>
          <path d="M136 112 Q150 132 164 112" stroke="#F0C77E" strokeWidth="1.6" fill="none" />
          <path d="M146 124 L150 132 L154 124 Z" fill="#D2486A" stroke="#F0C77E" strokeWidth=".8" />
        </g>
      )
    case 'wand':
      return (
        <g>
          <path d="M206 300 L236 246" stroke="#5A3A22" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="237" cy="244" r="4" fill="#FFF4CC" style={{ filter: 'drop-shadow(0 0 6px #FFD27A)', animation: 'glowp 1.4s ease-in-out infinite' }} />
        </g>
      )
    case 'clutch':
      return (
        <g>
          <rect x="74" y="296" width="30" height="18" rx="4" fill={look.color2} stroke="#F0C77E" strokeWidth="1.2" />
          <path d="M74 302 H104" stroke="#F0C77E" strokeWidth=".8" />
          <circle cx="89" cy="302" r="2" fill="#F0C77E" />
        </g>
      )
    case 'dupatta':
      return <path d="M186 124 Q230 200 214 320 Q200 420 236 470 Q206 470 196 430 Q176 330 190 230 Q194 170 176 130 Z" fill={look.color2} opacity=".55" stroke="#F0C77E" strokeWidth="1" strokeDasharray="2 2" />
    default:
      return null
  }
}

/** A fashion-illustration model wearing a Look. Renders at any size. */
export function Figure({ look, width = 300, runway = false }: { look: Look; width?: number; runway?: boolean }) {
  const uid = useId().replace(/:/g, '')
  const pat = `pat-${uid}`
  const clip = `clip-${uid}`
  const shade = `shade-${uid}`
  const paint = `paint-${uid}`
  const g = GARMENTS[look.garment]
  const showMidriff = look.garment === 'lehenga'
  const longSleeves = look.sleeves === 'long'

  return (
    <svg width={width} height={(width * H) / W} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`A ${g.name.toLowerCase()} design`} style={{ overflow: 'visible' }}>
      <defs>
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
        <linearGradient id={shade} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".35" />
          <stop offset=".3" stopColor="#000" stopOpacity="0" />
          <stop offset=".45" stopColor="#fff" stopOpacity=".16" />
          <stop offset=".6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".38" />
        </linearGradient>
        {look.painting && (
          <pattern id={paint} patternUnits="userSpaceOnUse" width={W} height={H}>
            <image href={look.painting} width={W} height={H} />
          </pattern>
        )}
      </defs>

      {/* shadow on the runway */}
      <ellipse cx="150" cy="500" rx="80" ry="10" fill="#000" opacity=".35" />

      {look.accessories.includes('wings') && (
        <g opacity=".7" style={{ transformOrigin: '150px 170px', animation: runway ? 'breathe 2s ease-in-out infinite' : undefined }}>
          <path d="M150 160 Q60 60 40 150 Q60 200 150 190 Z" fill="#DCE6FF" stroke="#fff" strokeWidth="1" />
          <path d="M150 160 Q240 60 260 150 Q240 200 150 190 Z" fill="#DCE6FF" stroke="#fff" strokeWidth="1" />
          <path d="M150 190 Q80 220 70 270 Q110 260 150 200 Z M150 190 Q220 220 230 270 Q190 260 150 200 Z" fill="#E8D8FF" />
        </g>
      )}

      <Hair look={look} part="back" />

      {/* body */}
      <g fill={look.skin}>
        <path d="M141 86 L159 86 L161 114 L139 114 Z" />
        <path d={ARM_L} />
        <path d={ARM_R} />
        <circle cx="93" cy="300" r="7" />
        <circle cx="207" cy="300" r="7" />
        <path d="M112 122 Q150 108 188 122 L178 218 Q182 250 186 272 L114 272 Q118 250 122 218 Z" />
        <path d="M121 266 L147 266 L143 488 L133 488 Z" />
        <path d="M153 266 L179 266 L167 488 L157 488 Z" />
        <ellipse cx="150" cy="64" rx="22" ry="27" />
      </g>
      <g fill="#000" opacity=".12">
        <path d="M141 92 L159 92 L159 100 Q150 104 141 100 Z" />
      </g>
      {showMidriff && <path d="M122 190 Q150 198 178 190 L176 214 Q150 208 124 214 Z" fill="#000" opacity=".06" />}

      {/* shoes */}
      <g fill={look.color2}>
        <path d="M128 486 L146 486 L148 496 Q138 500 126 496 Z" />
        <path d="M156 486 L172 486 L174 496 Q164 500 152 496 Z" />
      </g>

      {/* the garment */}
      <g clipPath={`url(#${clip})`}>
        <rect width={W} height={H} fill={`url(#${pat})`} />
        {look.painting && <rect width={W} height={H} fill={`url(#${paint})`} />}
        <rect width={W} height={H} fill={`url(#${shade})`} />
        {(look.garment === 'ballgown' || look.garment === 'lehenga' || look.garment === 'aline') && (
          <g stroke="#000" strokeOpacity=".12" strokeWidth="2" fill="none">
            <path d="M150 230 Q140 360 110 490 M150 230 Q160 360 190 490 M150 230 Q120 340 70 480 M150 230 Q180 340 230 480" />
          </g>
        )}
      </g>
      {look.trim && (
        <g stroke="#F0C77E" strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M113 122 Q150 134 187 122" />
          {look.garment !== 'lehenga' && look.garment !== 'robe' && <path d="M123 214 Q150 222 177 214" strokeWidth="4" />}
          {look.garment === 'lehenga' && <path d="M56 480 Q150 506 244 480" strokeWidth="5" strokeDasharray="1 6" />}
          {look.garment === 'robe' && <path d="M150 118 L150 500" strokeWidth="1.6" />}
        </g>
      )}
      <path d={g.d} fill="none" stroke="#000" strokeOpacity=".25" strokeWidth="1" />

      {look.sleeves === 'puff' && (
        <g fill={`url(#${pat})`} stroke="#000" strokeOpacity=".2">
          <ellipse cx="108" cy="134" rx="15" ry="13" />
          <ellipse cx="192" cy="134" rx="15" ry="13" />
        </g>
      )}

      {/* face */}
      <g stroke="#3B2416" strokeWidth="1.3" fill="none" strokeLinecap="round">
        <path d="M137 66 Q142 70 147 66" />
        <path d="M153 66 Q158 70 163 66" />
      </g>
      <circle cx="138" cy="76" r="4" fill="#E8789A" opacity=".25" />
      <circle cx="162" cy="76" r="4" fill="#E8789A" opacity=".25" />
      <path d="M145 81 Q150 85 155 81 Q150 83 145 81 Z" fill="#B8475E" />
      <Hair look={look} part="front" />

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
  sleeves: 'none',
  color: '#1F2A6B',
  color2: '#F0C77E',
  pattern: 'stars',
  trim: true,
  skin: SKINS[2],
  hair: 'long',
  hairColor: HAIR_COLORS[0],
  accessories: ['tiara'],
}

export const clipPathFor = (look: Look) =>
  look.sleeves === 'long' ? `${GARMENTS[look.garment].d} ${SLEEVE_LONG_L} ${SLEEVE_LONG_R}` : GARMENTS[look.garment].d
