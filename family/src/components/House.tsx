import type { HouseId } from '../data/family'

const PAL = {
  '33C': { wall: '#4A495E', trim: '#8E8AA2', dark: '#2A2840', banner: '#1C2B66', door: '#3A2414', seed: 4, bulbs: ['#FFE3A0', '#BFD0FF'] },
  '34C': { wall: '#5E4A4C', trim: '#A48A8A', dark: '#3A2228', banner: '#6B1A2C', door: '#4A1A1C', seed: 9, bulbs: ['#FFE3A0', '#FFB3C0'] },
} as const

const W = 185
const H = 490

type Props = { id: HouseId; open: boolean; dim?: boolean; width?: number; onOpen?: () => void }

/** A Delhi house drawn like a storybook painting, with a door that swings open. */
export function House({ id, open, dim, width = 150, onOpen }: Props) {
  const p = PAL[id]
  const k = width / W
  const f = `h${id}`
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open the door of ${id}`}
      style={{
        position: 'relative',
        width,
        height: H * k,
        padding: 0,
        border: 0,
        background: 'none',
        cursor: 'pointer',
        opacity: dim ? 0.45 : 1,
        filter: dim ? 'saturate(.6)' : undefined,
        transition: 'opacity 1s ease, filter 1s ease',
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${k})`, transformOrigin: '0 0' }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }} aria-hidden="true">
          <defs>
            <filter id={`${f}-tex`} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.85 0.6" numOctaves="3" seed={p.seed} result="n" />
              <feDiffuseLighting in="n" lightingColor="#E6D8C0" surfaceScale="1.8" result="l">
                <feDistantLight azimuth="240" elevation="50" />
              </feDiffuseLighting>
              <feComposite in="l" in2="SourceGraphic" operator="in" />
            </filter>
            <pattern id={`${f}-blk`} width="46" height="24" patternUnits="userSpaceOnUse">
              <path d="M0 12 H46 M0 24 H46 M23 0 V12 M0 12 V24" stroke="rgba(10,8,20,.42)" strokeWidth="1.1" fill="none" />
            </pattern>
            <radialGradient id={`${f}-win`} cx="50%" cy="65%" r="70%">
              <stop offset="0" stopColor="#FFF2C4" />
              <stop offset=".45" stopColor="#F7B95A" />
              <stop offset="1" stopColor="#8A4318" />
            </radialGradient>
            <radialGradient id={`${f}-wall`} cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#FFB45A" stopOpacity=".55" />
              <stop offset="1" stopColor="#FFB45A" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${f}-night`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#050818" stopOpacity=".72" />
              <stop offset=".55" stopColor="#050818" stopOpacity=".12" />
              <stop offset="1" stopColor="#050818" stopOpacity=".35" />
            </linearGradient>
            <filter id={`${f}-bloom`} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>

          {/* rooftop chhatri */}
          <g transform={id === '33C' ? 'translate(0 0)' : 'translate(-95 0)'}>
            <path d="M120 40 V24 M160 40 V24" stroke={p.trim} strokeWidth="3" />
            <path d="M116 25 Q140 -6 164 25 Z" fill={p.dark} stroke={p.trim} strokeWidth="2" />
            <path d="M140 -1 V-10" stroke="#C9A456" strokeWidth="2" />
            <circle cx="140" cy="-11" r="2.2" fill="#E9C27A" />
          </g>

          {/* parapet + cornice with dentils */}
          <rect x="-4" y="36" width={W + 8} height="6" fill={p.trim} opacity=".7" />
          <rect x="0" y="42" width={W} height="12" fill={p.dark} />
          {Array.from({ length: 23 }, (_, i) => (
            <rect key={i} x={2 + i * 8} y="46" width="4" height="6" fill={p.trim} opacity=".55" />
          ))}
          <rect x="0" y="54" width={W} height="2.5" fill="#C9A456" opacity=".6" />

          {/* fairy lights along the parapet */}
          <path d={`M0 36 ${Array.from({ length: 8 }, (_, i) => `Q${i * 23 + 11.5} 46 ${(i + 1) * 23.1} 36`).join(' ')}`} stroke="#3a3428" strokeWidth=".8" fill="none" />
          {Array.from({ length: 16 }, (_, i) => (
            <circle
              key={i}
              className="tw"
              cx={i * 11.55 + 6}
              cy={i % 2 ? 40.5 : 39}
              r="1.7"
              fill={p.bulbs[i % 2]}
              style={{ animationDelay: `${(i % 5) * 0.5}s`, filter: 'drop-shadow(0 0 3px rgba(255,220,150,.9))' }}
            />
          ))}

          {/* facade */}
          <rect x="0" y="56" width={W} height="434" fill={p.wall} />
          <rect x="0" y="56" width={W} height="434" filter={`url(#${f}-tex)`} opacity=".55" style={{ mixBlendMode: 'multiply' }} />
          <rect x="0" y="56" width={W} height="434" fill={`url(#${f}-blk)`} />
          <rect x="0" y="56" width="5" height="434" fill={p.trim} opacity=".35" />
          <rect x={W - 5} y="56" width="5" height="434" fill={p.trim} opacity=".35" />

          {/* lantern warmth on the wall */}
          <ellipse className="lamp" cx="36" cy="380" rx="72" ry="96" fill={`url(#${f}-wall)`} />
          <ellipse className="lamp" cx="149" cy="380" rx="72" ry="96" fill={`url(#${f}-wall)`} style={{ animationDelay: '.6s' }} />

          {/* upper arched windows */}
          {[28, 115].map((x) => (
            <g key={x}>
              <path d={`M${x} 180 V128 Q${x} 108 ${x + 21} 98 Q${x + 42} 108 ${x + 42} 128 V180 Z`} fill="#FFC870" filter={`url(#${f}-bloom)`} opacity=".5" />
              <path d={`M${x} 180 V128 Q${x} 108 ${x + 21} 98 Q${x + 42} 108 ${x + 42} 128 V180 Z`} fill={`url(#${f}-win)`} stroke={p.trim} strokeWidth="5" />
              <path d={`M${x + 21} 101 V180 M${x} 142 H${x + 42} M${x + 8} 112 Q${x + 21} 104 ${x + 34} 112`} stroke={p.dark} strokeWidth="2" fill="none" />
              <path d={`M${x - 6} 96 Q${x + 21} 80 ${x + 48} 96`} stroke={p.trim} strokeWidth="2" fill="none" opacity=".7" />
            </g>
          ))}

          {/* jharokha balcony */}
          <rect x="16" y="180" width="153" height="8" fill={p.trim} />
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d={`M${24 + i * 12.5} 188 V203`} stroke={p.trim} strokeWidth="3" strokeLinecap="round" />
          ))}
          <rect x="16" y="203" width="153" height="5" fill={p.trim} opacity=".8" />
          <path d="M22 208 Q30 216 38 208 M147 208 Q155 216 163 208" stroke={p.trim} strokeWidth="2" fill="none" />
          {id === '34C' && (
            <>
              <circle cx="26" cy="175" r="7" fill="#2F5A36" />
              <circle cx="33" cy="171" r="3" fill="#E8833A" />
              <circle cx="160" cy="175" r="7" fill="#2F5A36" />
              <circle cx="155" cy="171" r="3" fill="#F2C14E" />
            </>
          )}
          {id === '33C' && (
            <>
              <path d="M30 176 q4 -10 8 0 q4 -10 8 0" fill="#3B6B45" />
              <path d="M140 176 q4 -10 8 0 q4 -10 8 0" fill="#3B6B45" />
            </>
          )}

          {/* middle windows */}
          <path d="M34 280 V236 Q34 222 49 216 Q64 222 64 236 V280 Z" fill={id === '33C' ? '#1C1A2C' : `url(#${f}-win)`} stroke={p.trim} strokeWidth="4" />
          <path d="M121 280 V236 Q121 222 136 216 Q151 222 151 236 V280 Z" fill={`url(#${f}-win)`} stroke={p.trim} strokeWidth="4" />
          <path d={id === '33C' ? 'M124 280 Q128 250 136 240 Q130 262 133 280 Z' : 'M40 280 Q44 258 52 246 Q46 266 49 280 Z'} fill={id === '33C' ? '#7A2030' : '#1C2B66'} opacity=".75" />

          {/* crest */}
          <path d="M74 288 H111 V308 Q111 324 92.5 332 Q74 324 74 308 Z" fill={p.banner} stroke="#D9B45A" strokeWidth="2" />
          <path d="M78 292 H107 V307 Q107 320 92.5 327 Q78 320 78 307 Z" fill="none" stroke="#D9B45A" strokeWidth=".7" opacity=".7" />
          <text x="92.5" y="314" textAnchor="middle" fontFamily="Cinzel, serif" fontWeight="700" fontSize="12" fill="#F2C46B">
            {id}
          </text>

          {/* doorway: carved stone arch with fanlight */}
          <path d="M50 470 V386 Q50 352 92.5 338 Q135 352 135 386 V470" stroke={p.trim} strokeWidth="8" fill="none" />
          <path d="M44 470 V384 Q44 346 92.5 330" stroke={p.dark} strokeWidth="1" fill="none" opacity=".6" />
          <path d="M57 470 V388 Q57 360 92.5 346 Q128 360 128 388 V470 Z" fill="#160E08" />

          {/* lanterns on chains */}
          {[36, 149].map((x, i) => (
            <g key={x}>
              <circle className="lamp" cx={x} cy="374" r="17" fill="#FFC870" filter={`url(#${f}-bloom)`} style={{ animationDelay: `${i * 0.5}s` }} />
              <path d={`M${x} 344 V360`} stroke="#1A1814" strokeWidth="1.2" strokeDasharray="2 1.5" />
              <path d={`M${x - 10} 344 H${x + 10}`} stroke="#1A1814" strokeWidth="2.5" />
              <path d={`M${x - 7} 364 L${x} 358 L${x + 7} 364 Z`} fill="#1A1814" />
              <path d={`M${x - 6} 364 H${x + 6} L${x + 4} 384 H${x - 4} Z`} fill="#FFD98A" stroke="#1A1814" strokeWidth="1.5" />
              <path d={`M${x} 364 V384`} stroke="#1A1814" strokeWidth=".8" />
              <path d={`M${x - 4} 384 L${x} 389 L${x + 4} 384`} fill="#1A1814" />
            </g>
          ))}

          {/* steps */}
          <rect x="44" y="470" width="97" height="10" fill={p.trim} />
          <rect x="36" y="480" width="113" height="10" fill={p.trim} opacity=".8" />
          <rect x="0" y="56" width={W} height="434" fill={`url(#${f}-night)`} />
        </svg>

        {/* the door itself, so it can swing in 3D */}
        <div
          style={{
            position: 'absolute',
            left: 57,
            top: 346,
            width: 71,
            height: 124,
            perspective: 340,
            clipPath: "path('M0 124 V42 Q0 14 35.5 0 Q71 14 71 42 V124 Z')",
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 82%, #FFF7D8 0%, #FFCF7A 40%, #C7742A 100%)' }} />
          {[14, 34, 52].map((x, i) => (
            <div
              key={x}
              style={{ position: 'absolute', left: x, top: 30 + (i % 2) * 12, width: 3, height: 5, borderRadius: '50%', background: '#fff', boxShadow: '0 0 6px 2px #FFE09A', animation: `bob ${3 + i}s ease-in-out infinite` }}
            />
          ))}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transformOrigin: 'left center',
              transform: open ? 'rotateY(-112deg)' : 'rotateY(0deg)',
              transition: 'transform 1.8s cubic-bezier(.25,.8,.25,1)',
            }}
          >
            <svg width="71" height="124" viewBox="0 0 71 124" style={{ display: 'block' }} aria-hidden="true">
              <defs>
                <filter id={`${f}-wood`}>
                  <feTurbulence type="fractalNoise" baseFrequency="0.02 0.45" numOctaves="3" seed={p.seed} />
                  <feColorMatrix values="0 0 0 0 .22  0 0 0 0 .1  0 0 0 0 .05  0 0 0 1.1 -.2" />
                </filter>
                <linearGradient id={`${f}-dshade`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#FFB45A" stopOpacity=".3" />
                  <stop offset=".5" stopColor="#000" stopOpacity="0" />
                  <stop offset="1" stopColor="#FFB45A" stopOpacity=".28" />
                </linearGradient>
              </defs>
              <rect width="71" height="124" fill={p.door} />
              <rect width="71" height="124" filter={`url(#${f}-wood)`} opacity=".9" />
              <path d="M12 0 V124 M24 0 V124 M36 0 V124 M48 0 V124 M60 0 V124" stroke="rgba(15,6,2,.55)" strokeWidth="1.2" />
              {[40, 92].map((y) => (
                <g key={y}>
                  <rect x="0" y={y} width="71" height="5" fill="#2A2522" />
                  {[6, 20, 34, 48, 62].map((x) => (
                    <circle key={x} cx={x} cy={y + 2.5} r="1.4" fill="#8E8270" />
                  ))}
                </g>
              ))}
              <circle cx="56" cy="70" r="6" fill="none" stroke="#C9A456" strokeWidth="2" />
              <circle cx="56" cy="64" r="2.2" fill="#C9A456" />
              <rect width="71" height="124" fill={`url(#${f}-dshade)`} opacity=".5" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  )
}
