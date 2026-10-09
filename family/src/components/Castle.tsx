import { useId } from 'react'

/** Deterministic pseudo-random so the scene is identical on every render. */
const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

type Tower = { x: number; w: number; top: number; roof: number }

// A castle on a crag above a lake (x across 400, y down 320; waterline 236).
const TOWERS: Tower[] = [
  { x: 214, w: 14, top: 150, roof: 26 },
  { x: 230, w: 22, top: 118, roof: 40 },
  { x: 254, w: 12, top: 140, roof: 24 },
  { x: 268, w: 30, top: 102, roof: 52 },
  { x: 300, w: 14, top: 132, roof: 30 },
  { x: 316, w: 20, top: 120, roof: 36 },
  { x: 338, w: 12, top: 150, roof: 22 },
  { x: 352, w: 18, top: 138, roof: 30 },
]

function CastleShape({ lit = true, gid }: { lit?: boolean; gid: string }) {
  return (
    <g>
      {/* crag */}
      <path d="M180 236 C196 214 204 200 214 196 L376 190 C386 204 396 222 404 236 Z" fill="#0d1030" />
      {/* curtain wall */}
      <rect x="206" y="170" width="176" height="30" fill="#141a44" />
      {Array.from({ length: 22 }, (_, i) => (
        <rect key={i} x={206 + i * 8} y="166" width="4" height="5" fill="#141a44" />
      ))}
      {TOWERS.map((t, i) => (
        <g key={i}>
          <rect x={t.x} y={t.top} width={t.w} height={200 - t.top} fill={i % 2 ? '#161d4c' : '#121842'} />
          <path d={`M${t.x - 2} ${t.top} L${t.x + t.w / 2} ${t.top - t.roof} L${t.x + t.w + 2} ${t.top} Z`} fill="#0e1236" />
          <path d={`M${t.x + t.w / 2} ${t.top - t.roof} L${t.x + t.w + 2} ${t.top}`} stroke={`url(#${gid}-rim)`} strokeWidth="1" opacity=".7" />
          <path d={`M${t.x + t.w / 2} ${t.top - t.roof} V${t.top - t.roof - 6}`} stroke="#3a3f7a" strokeWidth="1" />
          {lit &&
            Array.from({ length: Math.floor((200 - t.top) / 13) }, (_, k) =>
              Array.from({ length: Math.max(1, Math.floor(t.w / 9)) }, (_, j) => {
                const seed = i * 100 + k * 10 + j
                if (rnd(seed) < 0.35) return null
                return (
                  <rect
                    key={`${k}-${j}`}
                    x={t.x + 3 + j * 8}
                    y={t.top + 7 + k * 13}
                    width="3"
                    height="5"
                    rx="1.5"
                    fill={rnd(seed + 7) > 0.3 ? '#ffd48a' : '#ffb35c'}
                    style={{ animation: rnd(seed + 3) > 0.8 ? `glowp ${2 + rnd(seed) * 3}s ease-in-out infinite` : undefined }}
                  />
                )
              }),
            )}
        </g>
      ))}
      {/* viaduct to the left shore */}
      <path d="M40 214 H214 V226 H40 Z" fill="#121842" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M${46 + i * 19} 236 V226 Q${55.5 + i * 19} 216 ${65 + i * 19} 226 V236 Z`} fill="#0b0e2a" />
      ))}
      {lit &&
        Array.from({ length: 6 }, (_, i) => (
          <g key={i}>
            <rect x={60 + i * 28} y="204" width="1.4" height="10" fill="#0b0e2a" />
            <circle cx={60.7 + i * 28} cy="203" r="2.2" fill="#ffcf7a" />
          </g>
        ))}
    </g>
  )
}

/**
 * A painterly night scene: moonlit castle, glowing windows, a lake that
 * mirrors it all, mist and drifting lanterns. Used as the hero art.
 */
export function CastleScene({ height = 320 }: { height?: number | string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width="100%" height={height} viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#060a24" />
          <stop offset=".45" stopColor="#141c52" />
          <stop offset=".72" stopColor="#3a3070" />
          <stop offset=".9" stopColor="#7a4a78" />
        </linearGradient>
        <radialGradient id={`${id}-moon`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fffbea" />
          <stop offset=".6" stopColor="#f3e6be" />
          <stop offset="1" stopColor="#d9c793" />
        </radialGradient>
        <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#dfe6ff" stopOpacity=".45" />
          <stop offset="1" stopColor="#dfe6ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c8d4ff" />
          <stop offset="1" stopColor="#c8d4ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-lake`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c1e52" />
          <stop offset="1" stopColor="#070920" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffb85c" stopOpacity=".5" />
          <stop offset="1" stopColor="#ffb85c" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-cloud`} x="-20%" y="-50%" width="140%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="4" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="40" />
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id={`${id}-soft`}>
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <filter id={`${id}-reflect`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.35" numOctaves="2" seed="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="8" />
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <filter id={`${id}-bloom`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="400" height="320" fill={`url(#${id}-sky)`} />
      {Array.from({ length: 70 }, (_, i) => (
        <circle
          key={i}
          cx={rnd(i) * 400}
          cy={rnd(i + 99) * 150}
          r={0.3 + rnd(i + 7) * 0.9}
          fill="#fff6dc"
          opacity={0.4 + rnd(i + 3) * 0.6}
          style={{ animation: rnd(i + 5) > 0.7 ? `twinkle ${2 + rnd(i) * 3}s ease-in-out ${rnd(i + 1) * 3}s infinite` : undefined }}
        />
      ))}
      <circle cx="96" cy="66" r="70" fill={`url(#${id}-halo)`} />
      <circle cx="96" cy="66" r="24" fill={`url(#${id}-moon)`} />
      <circle cx="88" cy="60" r="4" fill="#cdb984" opacity=".35" />
      <circle cx="104" cy="74" r="3" fill="#cdb984" opacity=".3" />

      {/* clouds */}
      <g filter={`url(#${id}-cloud)`} opacity=".55">
        <ellipse cx="150" cy="104" rx="150" ry="10" fill="#5a5a9a" />
        <ellipse cx="320" cy="78" rx="110" ry="8" fill="#4a4a8a" />
        <ellipse cx="60" cy="130" rx="120" ry="7" fill="#7a5a8a" />
      </g>

      {/* far mountains */}
      <path d="M0 210 L40 176 L78 196 L122 160 L170 200 L200 186 L240 204 L290 168 L340 196 L400 170 V236 H0 Z" fill="#232668" opacity=".85" filter={`url(#${id}-soft)`} />
      <path d="M0 222 L50 200 L96 216 L150 192 L190 214 L400 210 V236 H0 Z" fill="#181b4e" />

      <ellipse cx="290" cy="170" rx="120" ry="60" fill={`url(#${id}-glow)`} />
      <g filter={`url(#${id}-bloom)`}>
        <CastleShape gid={id} />
      </g>

      {/* lake + reflection */}
      <rect y="236" width="400" height="84" fill={`url(#${id}-lake)`} />
      <g transform="translate(0 472) scale(1 -1)" opacity=".42" filter={`url(#${id}-reflect)`}>
        <CastleShape gid={id} />
      </g>
      <path d="M70 236 Q96 300 120 236" fill="#fff6dc" opacity=".06" />
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={70 + rnd(i + 40) * 300} y={244 + i * 5} width={10 + rnd(i) * 40} height=".8" fill="#ffe2a8" opacity={0.18 + rnd(i + 8) * 0.25} />
      ))}

      {/* mist */}
      <g filter={`url(#${id}-cloud)`} opacity=".35">
        <ellipse cx="200" cy="236" rx="220" ry="8" fill="#b8c0ff" />
      </g>

      {/* shore pines */}
      <path d="M0 320 V250 L8 236 L14 252 L20 228 L28 254 L34 240 L42 262 L50 246 L58 270 L64 320 Z" fill="#05061a" />
      <path d="M400 320 V262 L392 248 L384 266 L376 252 L368 280 L360 320 Z" fill="#05061a" />

      {/* floating lanterns */}
      {[
        [150, 150, 2.6, 0],
        [176, 128, 1.8, 1.2],
        [128, 176, 2.2, 2.4],
        [196, 160, 1.4, 0.6],
        [112, 140, 1.6, 1.8],
      ].map(([x, y, r, d]) => (
        <g key={`${x}-${y}`} style={{ animation: `bob ${5 + d}s ease-in-out ${d}s infinite` }}>
          <circle cx={x} cy={y} r={r * 4} fill={`url(#${id}-glow)`} />
          <rect x={x - r / 2} y={y - r * 0.8} width={r} height={r * 1.4} rx={r / 3} fill="#ffd48a" />
        </g>
      ))}
    </svg>
  )
}
