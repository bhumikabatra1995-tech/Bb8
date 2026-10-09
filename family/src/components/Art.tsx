import type { HouseId } from '../data/family'
import { OwlFigure } from './Atmosphere'

const HOUSE_FILL: Record<HouseId, [string, string]> = {
  '33C': ['#2C4A9E', '#0E1640'],
  '34C': ['#9A2640', '#3A0A16'],
}

export function Crest({ house, size = 64 }: { house: HouseId; size?: number }) {
  const [c1, c2] = HOUSE_FILL[house]
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 80 92" aria-hidden="true">
      <defs>
        <linearGradient id={`crest-${house}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
      </defs>
      <path d="M6 6 H74 V40 Q74 72 40 88 Q6 72 6 40 Z" fill={`url(#crest-${house})`} stroke="#E9C27A" strokeWidth="3" />
      <path d="M12 12 H68 V40 Q68 66 40 80 Q12 66 12 40 Z" fill="none" stroke="#E9C27A" strokeWidth="1" opacity=".6" />
      {house === '33C' ? (
        <g fill="#E9C27A">
          <ellipse cx="40" cy="46" rx="10" ry="13" />
          <circle cx="40" cy="30" r="9" />
          <path d="M32 24 L33 17 L36 22 M48 24 L47 17 L44 22" />
          <circle cx="36.5" cy="30" r="2.6" fill={c2} />
          <circle cx="43.5" cy="30" r="2.6" fill={c2} />
          <path d="M22 44 Q28 36 32 44 Q28 52 22 58 Z M58 44 Q52 36 48 44 Q52 52 58 58 Z" />
        </g>
      ) : (
        <g fill="#E9C27A">
          <path d="M40 18 Q44 30 40 40 Q36 30 40 18 Z" />
          <path d="M40 40 Q22 30 12 36 Q24 40 28 46 Q18 48 14 56 Q30 52 40 48 Q50 52 66 56 Q62 48 52 46 Q56 40 68 36 Q58 30 40 40 Z" />
          <path d="M40 48 L34 66 L40 60 L46 66 Z" />
        </g>
      )}
    </svg>
  )
}

export function Hourglass({ house, fill, size = 80 }: { house: HouseId; fill: number; size?: number }) {
  const gem = house === '33C' ? ['#8FB0FF', '#2F55D8', '#14286E'] : ['#FF9AAE', '#D0213F', '#6A0A1C']
  const f = Math.max(0, Math.min(1, fill))
  const bottomH = 6 + f * 40
  const topH = 34 * (1 - f)
  const id = `hg-${house}`
  return (
    <svg width={size} height={size * 1.68} viewBox="0 0 74 124" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={gem[0]} />
          <stop offset=".5" stopColor={gem[1]} />
          <stop offset="1" stopColor={gem[2]} />
        </linearGradient>
        <clipPath id={`${id}-c`}>
          <path d="M14 10 H60 Q60 44 40 60 Q60 76 60 112 H14 Q14 76 34 60 Q14 44 14 10 Z" />
        </clipPath>
        <linearGradient id={`${id}-brass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8E6F38" />
          <stop offset=".5" stopColor="#F2D28C" />
          <stop offset="1" stopColor="#8E6F38" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="70" height="8" rx="2" fill={`url(#${id}-brass)`} />
      <rect x="2" y="112" width="70" height="8" rx="2" fill={`url(#${id}-brass)`} />
      <rect x="5" y="10" width="4" height="102" fill={`url(#${id}-brass)`} />
      <rect x="65" y="10" width="4" height="102" fill={`url(#${id}-brass)`} />
      <g clipPath={`url(#${id}-c)`}>
        <rect x="10" y={48 - topH} width="54" height={topH} fill={`url(#${id}-g)`} />
        <rect x="10" y={112 - bottomH} width="54" height={bottomH} fill={`url(#${id}-g)`} />
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={16 + ((i * 7) % 44)} cy={112 - bottomH + 3 + ((i * 5) % 9)} r="1.4" fill="#fff" opacity=".35" />
        ))}
      </g>
      <path d="M14 10 H60 Q60 44 40 60 Q60 76 60 112 H14 Q14 76 34 60 Q14 44 14 10 Z" fill="rgba(220,230,255,.07)" stroke="rgba(230,240,255,.55)" strokeWidth="1.2" />
      {f < 1 && (
        <>
          <circle cx="37" cy="62" r="1.6" fill={gem[0]} style={{ animation: 'fall .9s linear infinite' }} />
          <circle cx="37" cy="62" r="1.2" fill="#fff" style={{ animation: 'fall .9s linear .45s infinite' }} />
        </>
      )}
      <path d="M20 16 Q22 34 30 46" stroke="rgba(255,255,255,.35)" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

// ---------- tile artwork ----------

export function OwlTileArt({ hopping }: { hopping: boolean }) {
  return (
    <div style={{ position: 'relative', width: 96, height: 84 }}>
      <svg width="96" height="60" viewBox="0 0 96 60" style={{ position: 'absolute', bottom: 0 }} aria-hidden="true">
        <rect x="10" y="18" width="76" height="42" rx="3" fill="#EBD9B0" />
        <path d="M10 20 L48 44 L86 20" stroke="#B89A62" strokeWidth="1.5" fill="none" />
        <circle cx="48" cy="44" r="7" fill="#9B1E2E" />
        <circle cx="48" cy="44" r="4" fill="none" stroke="#C2324A" strokeWidth="1" />
      </svg>
      <div style={{ position: 'absolute', left: 22, top: hopping ? -14 : -4, animation: hopping ? 'hop 1.6s ease-in-out infinite' : undefined }}>
        <svg width="52" height="50" viewBox="0 0 58 56" aria-hidden="true">
          <ellipse cx="29" cy="34" rx="15" ry="19" fill="#7A6450" />
          <ellipse cx="29" cy="38" rx="9" ry="12" fill="#D2BFA2" />
          <circle cx="29" cy="18" r="12" fill="#8C7560" />
          <path d="M19 10 L20 2 L24 8 M39 10 L38 2 L34 8" fill="#8C7560" stroke="#8C7560" strokeWidth="1.5" />
          <circle cx="24.5" cy="17" r="4" fill="#F6C451" />
          <circle cx="33.5" cy="17" r="4" fill="#F6C451" />
          <circle className="blink" cx="24.5" cy="17" r="1.8" fill="#1A120A" />
          <circle className="blink" cx="33.5" cy="17" r="1.8" fill="#1A120A" />
          <path d="M27.6 21 L29 24 L30.4 21 Z" fill="#E0A94A" />
        </svg>
      </div>
    </div>
  )
}

export function PensieveArt({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true">
      <defs>
        <radialGradient id="pv-mist" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#F2F6FF" />
          <stop offset=".5" stopColor="#9FB4E8" stopOpacity=".8" />
          <stop offset="1" stopColor="#3A4A7A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="48" cy="40" rx="42" ry="20" fill="url(#pv-mist)" style={{ animation: 'mist 4s ease-in-out infinite' }} />
      <g style={{ transformOrigin: '48px 40px', animation: 'spin 14s linear infinite' }}>
        <path d="M48 32 Q62 34 60 42 Q56 48 46 46 Q38 44 42 38" stroke="#fff" strokeWidth="1.4" fill="none" opacity=".85" />
      </g>
      <g style={{ transformOrigin: '48px 40px', animation: 'spin 22s linear infinite reverse' }}>
        <path d="M30 40 Q36 32 50 34 Q64 36 66 42" stroke="#DCE6FF" strokeWidth="1" fill="none" opacity=".6" />
      </g>
      <path d="M12 42 Q48 58 84 42 L76 62 Q48 74 20 62 Z" fill="#6E6A66" />
      <path d="M18 50 Q48 62 78 50" stroke="#8E8880" strokeWidth="1" fill="none" />
      <ellipse cx="48" cy="42" rx="36" ry="9" fill="none" stroke="#A39C92" strokeWidth="3" />
      <path d="M38 70 H58 L62 90 H34 Z" fill="#5A5652" />
      <path d="M28 90 H68" stroke="#7A766F" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export function SnitchArt({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.52} viewBox="0 0 96 50" aria-hidden="true" style={{ overflow: 'visible' }}>
      <path style={{ transformBox: 'fill-box', transformOrigin: '100% 50%', animation: 'wing .12s linear infinite alternate' }} d="M38 22 Q20 4 2 10 Q14 16 16 20 Q8 22 4 28 Q20 30 38 26 Z" fill="#F4ECD8" opacity=".92" stroke="#C9B996" strokeWidth=".8" />
      <path style={{ transformBox: 'fill-box', transformOrigin: '0% 50%', animation: 'wing .12s linear infinite alternate-reverse' }} d="M58 22 Q76 4 94 10 Q82 16 80 20 Q88 22 92 28 Q76 30 58 26 Z" fill="#F4ECD8" opacity=".92" stroke="#C9B996" strokeWidth=".8" />
      <circle cx="48" cy="25" r="11" fill="#E2B95B" />
      <circle cx="48" cy="25" r="11" fill="none" stroke="#9C7A30" strokeWidth=".8" />
      <circle cx="44" cy="21" r="3.5" fill="#FFF1C6" opacity=".85" />
      <path d="M38 25 Q48 31 58 25 M48 14 V36" stroke="#9C7A30" strokeWidth=".9" fill="none" />
    </svg>
  )
}

export function TimeTurnerArt({ size = 96, label }: { size?: number; label?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true">
      <circle cx="48" cy="48" r="42" fill="none" stroke="#C9A456" strokeWidth="2.5" strokeDasharray="3 5" style={{ transformOrigin: '48px 48px', animation: 'spin 12s linear infinite' }} />
      <g style={{ transformOrigin: '48px 48px', animation: 'spin 18s linear infinite reverse' }}>
        <circle cx="48" cy="48" r="34" fill="none" stroke="#E2B95B" strokeWidth="3" />
        <circle cx="48" cy="14" r="3" fill="#F2C46B" />
        <circle cx="48" cy="82" r="3" fill="#F2C46B" />
      </g>
      <circle cx="48" cy="48" r="24" fill="#1A140F" stroke="#8E6F38" strokeWidth="1.5" />
      {label ? (
        <text x="48" y="56" textAnchor="middle" fontFamily="Cinzel, serif" fontWeight="700" fontSize={label.length > 2 ? 17 : 24} fill="#F2C46B">
          {label}
        </text>
      ) : (
        <path d="M40 36 H56 L48 48 L56 60 H40 L48 48 Z" fill="none" stroke="#F2C46B" strokeWidth="2" />
      )}
    </svg>
  )
}

export function MapArt({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 96 76" aria-hidden="true">
      <path d="M6 10 L34 4 L62 10 L90 4 V66 L62 72 L34 66 L6 72 Z" fill="#E7D3A6" />
      <path d="M34 4 V66 M62 10 V72" stroke="#B89A62" strokeWidth="1" />
      <path d="M6 10 L34 4 L62 10 L90 4 V66 L62 72 L34 66 L6 72 Z" fill="none" stroke="#8A6A42" strokeWidth="1.5" />
      <path d="M14 50 Q24 30 40 40 T70 26" stroke="#3B2A1A" strokeWidth="1.2" strokeDasharray="2 3" fill="none" />
      {[
        [18, 48, 0],
        [30, 40, 0.4],
        [46, 40, 0.8],
        [60, 30, 1.2],
      ].map(([x, y, d]) => (
        <ellipse key={x} cx={x} cy={y} rx="2.4" ry="1.4" fill="#3B2A1A" style={{ animation: `step 3s ease-out ${d}s infinite` }} />
      ))}
      <circle cx="72" cy="25" r="4" fill="none" stroke="#7A2418" strokeWidth="1.5" />
    </svg>
  )
}

export function CrystalBallArt({ size = 70 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 70 78" aria-hidden="true">
      <defs>
        <radialGradient id="cb" cx="40%" cy="35%" r="65%">
          <stop offset="0" stopColor="#F4F0FF" />
          <stop offset=".35" stopColor="#B9A8F0" />
          <stop offset="1" stopColor="#2E2252" />
        </radialGradient>
      </defs>
      <circle cx="35" cy="32" r="28" fill="url(#cb)" />
      <circle cx="40" cy="38" r="12" fill="#fff" opacity=".25" style={{ animation: 'mist 4s ease-in-out infinite' }} />
      <path d="M14 62 H56 L50 74 H20 Z" fill="#8E6F38" />
    </svg>
  )
}

export function FlyingLetter() {
  return <OwlFigure size={70} />
}
