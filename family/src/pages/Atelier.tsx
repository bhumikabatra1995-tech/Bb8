import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  DEFAULT_LOOK,
  FABRICS,
  Figure,
  GARMENTS,
  H,
  HAIR_COLORS,
  SKINS,
  W,
  clipPathFor,
  type AccessoryId,
  type GarmentId,
  type HairId,
  type Look,
  type PatternId,
} from '../components/Figure'
import { Empty, Page, TopBar, timeAgo } from '../components/UI'
import { memberById } from '../data/family'
import { actions, itemsOf, nameOf, useStore } from '../state/store'

export type Design = { name: string; look: Look }
export type Love = { designId: string }
export const DESIGN_POINTS = { save: 3, love: 1 }

const PATTERNS: { id: PatternId; name: string }[] = [
  { id: 'solid', name: 'Silk' },
  { id: 'stars', name: 'Stars' },
  { id: 'florals', name: 'Florals' },
  { id: 'paisley', name: 'Paisley' },
  { id: 'polka', name: 'Polka' },
  { id: 'stripes', name: 'Stripes' },
  { id: 'sparkle', name: 'Sparkle' },
  { id: 'ombre', name: 'Ombré' },
]
const ACCESSORIES: { id: AccessoryId; name: string }[] = [
  { id: 'tiara', name: 'Tiara' },
  { id: 'jhumkas', name: 'Jhumkas' },
  { id: 'necklace', name: 'Necklace' },
  { id: 'dupatta', name: 'Dupatta' },
  { id: 'wand', name: 'Wand' },
  { id: 'clutch', name: 'Clutch' },
  { id: 'hat', name: 'Witch hat' },
  { id: 'wings', name: 'Fairy wings' },
]
const HAIRS: { id: HairId; name: string }[] = [
  { id: 'long', name: 'Long' },
  { id: 'braid', name: 'Braid' },
  { id: 'bun', name: 'Bun' },
  { id: 'bob', name: 'Bob' },
]

type Tab = 'dress' | 'fabric' | 'paint' | 'model' | 'extras'
const TABS: { id: Tab; name: string }[] = [
  { id: 'dress', name: 'Dress' },
  { id: 'fabric', name: 'Fabric' },
  { id: 'paint', name: 'Paint' },
  { id: 'model', name: 'Model' },
  { id: 'extras', name: 'Sparkle' },
]

function Swatches({ colors, value, onPick, label }: { colors: string[]; value: string; onPick: (c: string) => void; label: string }) {
  return (
    <div className="row" style={{ flexWrap: 'wrap', gap: 8 }} role="radiogroup" aria-label={label}>
      {colors.map((c) => (
        <button
          key={c}
          role="radio"
          aria-checked={value === c}
          aria-label={c}
          onClick={() => onPick(c)}
          style={{ width: 36, height: 36, borderRadius: '50%', background: c, cursor: 'pointer', border: value === c ? '3px solid #fff' : '1px solid rgba(255,255,255,.25)', boxShadow: value === c ? `0 0 14px ${c}` : 'inset 0 -3px 6px rgba(0,0,0,.25)' }}
        />
      ))}
      <label style={{ width: 36, height: 36, borderRadius: '50%', border: '1px dashed var(--gold)', display: 'grid', placeItems: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden' }} aria-label={`Any ${label}`}>
        <span style={{ color: 'var(--gold)', fontSize: 20, lineHeight: 1 }}>+</span>
        <input type="color" value={value} onChange={(e) => onPick(e.target.value)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
      </label>
    </div>
  )
}

function Choices<T extends string>({ items, value, onPick, multi }: { items: { id: T; name: string }[]; value: T | T[]; onPick: (id: T) => void; multi?: boolean }) {
  return (
    <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
      {items.map((it) => {
        const on = multi ? (value as T[]).includes(it.id) : value === it.id
        return (
          <button key={it.id} className="chip" aria-pressed={on} onClick={() => onPick(it.id)}>
            {it.name}
          </button>
        )
      })}
    </div>
  )
}

const Label = ({ children }: { children: ReactNode }) => (
  <div className="lbl" style={{ marginTop: 14 }}>
    {children}
  </div>
)

/** The painting canvas sits exactly over the garment and is clipped to its shape. */
function PaintLayer({ look, scale, ink, size, onChange }: { look: Look; scale: number; ink: string; size: number; onChange: (dataUrl: string) => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const down = useRef(false)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, W, H)
    if (look.painting) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, W, H)
      img.src = look.painting
    }
    // Only reload when the painting is replaced from outside (clear / new design).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [look.garment, look.painting === undefined])

  const at = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale }
  }
  const start = (e: React.PointerEvent) => {
    down.current = true
    ref.current!.setPointerCapture(e.pointerId)
    const ctx = ref.current!.getContext('2d')!
    const p = at(e)
    ctx.globalCompositeOperation = ink === 'erase' ? 'destination-out' : 'source-over'
    ctx.strokeStyle = ink
    ctx.fillStyle = ink
    ctx.lineWidth = size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
  }
  const move = (e: React.PointerEvent) => {
    if (!down.current) return
    const ctx = ref.current!.getContext('2d')!
    const p = at(e)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }
  const end = () => {
    if (!down.current) return
    down.current = false
    onChange(ref.current!.toDataURL('image/png'))
  }

  return (
    <canvas
      ref={ref}
      width={W}
      height={H}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      aria-label="Paint on the dress"
      style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, clipPath: `path('${clipPathFor(look)}')`, touchAction: 'none', cursor: 'crosshair', outline: '1px dashed rgba(240,199,126,.0)' }}
    />
  )
}

function Stage({ look, painting, ink, size, onPaint, runway }: { look: Look; painting: boolean; ink: string; size: number; onPaint: (d: string) => void; runway?: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.8)
  useEffect(() => {
    const fit = () => {
      const el = box.current
      if (!el) return
      setScale(Math.min(el.clientWidth / W, 400 / H))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  return (
    <div
      ref={box}
      style={{
        position: 'relative',
        height: H * scale + 24,
        borderRadius: 24,
        overflow: 'hidden',
        background:
          'radial-gradient(ellipse 50% 60% at 50% 30%, rgba(255,236,200,.22), transparent 70%), radial-gradient(ellipse 80% 20% at 50% 98%, rgba(240,199,126,.25), transparent 70%), linear-gradient(180deg, #1a1440 0%, #120f30 60%, #0b0a22 100%)',
        border: '1px solid var(--card-border)',
      }}
    >
      {/* curtains */}
      <div aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 34, background: 'repeating-linear-gradient(90deg, #4e0f2d 0 8px, #6b1a3c 8px 16px)', opacity: 0.8, borderRight: '2px solid rgba(240,199,126,.4)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 34, background: 'repeating-linear-gradient(90deg, #6b1a3c 0 8px, #4e0f2d 8px 16px)', opacity: 0.8, borderLeft: '2px solid rgba(240,199,126,.4)' }} />
      <div style={{ position: 'absolute', left: '50%', top: 12, width: W, height: H, marginLeft: -W / 2, transform: `scale(${scale})`, transformOrigin: '50% 0' }}>
        <motion.div animate={runway ? { y: [0, -6, 0, -6, 0], rotate: [0, -1, 0, 1, 0] } : {}} transition={{ duration: 2.4, repeat: runway ? Infinity : 0 }}>
          <Figure look={look} width={W} runway={runway} />
        </motion.div>
        {painting && <PaintLayer look={look} scale={scale} ink={ink} size={size} onChange={onPaint} />}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export function Studio() {
  const s = useStore()
  const nav = useNavigate()
  const loc = useLocation() as { state?: { look?: Look } }
  const me = memberById(s.me)
  const [look, setLook] = useState<Look>(loc.state?.look ?? DEFAULT_LOOK)
  const [tab, setTab] = useState<Tab>('dress')
  const [ink, setInk] = useState('#F0C77E')
  const [size, setSize] = useState(8)
  const [naming, setNaming] = useState(false)
  const [name, setName] = useState('')
  if (!me) return <Navigate to="/" replace />

  const up = (patch: Partial<Look>) => setLook((l) => ({ ...l, ...patch }))
  const toggle = (a: AccessoryId) => up({ accessories: look.accessories.includes(a) ? look.accessories.filter((x) => x !== a) : [...look.accessories, a] })
  const surprise = () => {
    const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)]
    up({
      garment: pick(Object.keys(GARMENTS) as GarmentId[]),
      pattern: pick(PATTERNS).id,
      color: pick(FABRICS),
      color2: pick(FABRICS),
      sleeves: pick(['none', 'puff', 'long'] as const),
      accessories: ACCESSORIES.filter(() => Math.random() < 0.3).map((a) => a.id),
      painting: undefined,
    })
  }

  const save = () => {
    const it = actions.addItem<Design>('design', me.id, { name: name.trim() || 'Untitled look', look })
    actions.award(me.id, DESIGN_POINTS.save, 'Designed a new look')
    nav(`/atelier/${it.id}`, { replace: true })
  }

  return (
    <Page candles={false}>
      <TopBar
        title="The Atelier"
        back="/atelier"
        right={
          <button className="icon-btn" aria-label="Surprise me" onClick={surprise}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
            </svg>
          </button>
        }
      />

      <Stage look={look} painting={tab === 'paint'} ink={ink} size={size} onPaint={(d) => up({ painting: d })} />

      <div className="row" style={{ gap: 6, marginTop: 14, overflowX: 'auto' }} role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className="chip" aria-pressed={tab === t.id} onClick={() => setTab(t.id)} style={{ flex: 'none' }}>
            {t.name}
          </button>
        ))}
      </div>

      <div className="panel" style={{ marginTop: 12, paddingTop: 4 }}>
        {tab === 'dress' && (
          <>
            <Label>Silhouette</Label>
            <Choices items={(Object.keys(GARMENTS) as GarmentId[]).map((id) => ({ id, name: GARMENTS[id].name }))} value={look.garment} onPick={(garment) => up({ garment })} />
            <Label>Sleeves</Label>
            <Choices items={[{ id: 'none', name: 'None' }, { id: 'puff', name: 'Puff' }, { id: 'long', name: 'Long' }] as const} value={look.sleeves} onPick={(sleeves) => up({ sleeves })} />
            <Label>Gold trim</Label>
            <Choices items={[{ id: 'on', name: 'Gold trim' }, { id: 'off', name: 'No trim' }] as const} value={look.trim ? 'on' : 'off'} onPick={(v) => up({ trim: v === 'on' })} />
          </>
        )}
        {tab === 'fabric' && (
          <>
            <Label>Pattern</Label>
            <Choices items={PATTERNS} value={look.pattern} onPick={(pattern) => up({ pattern })} />
            <Label>Main colour</Label>
            <Swatches label="main colour" colors={FABRICS} value={look.color} onPick={(color) => up({ color })} />
            <Label>Second colour · pattern, shoes &amp; dupatta</Label>
            <Swatches label="second colour" colors={FABRICS} value={look.color2} onPick={(color2) => up({ color2 })} />
          </>
        )}
        {tab === 'paint' && (
          <>
            <p className="italic muted" style={{ marginTop: 12 }}>
              Paint straight onto the dress with your finger. Whatever you draw becomes the fabric.
            </p>
            <Label>Paint colour</Label>
            <Swatches label="paint colour" colors={FABRICS} value={ink} onPick={setInk} />
            <Label>Brush</Label>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              {[3, 8, 16, 28].map((w) => (
                <button key={w} className="icon-btn" aria-label={`Brush size ${w}`} aria-pressed={size === w && ink !== 'erase'} onClick={() => setSize(w)} style={{ borderColor: size === w ? 'var(--gold)' : undefined }}>
                  <span style={{ width: Math.min(28, w / 1.3 + 3), height: Math.min(28, w / 1.3 + 3), borderRadius: '50%', background: ink === 'erase' ? 'var(--text-3)' : ink }} />
                </button>
              ))}
              <button className="chip" aria-pressed={ink === 'erase'} onClick={() => setInk('erase')}>
                Eraser
              </button>
              <button className="chip" onClick={() => up({ painting: undefined })}>
                Wipe painting
              </button>
            </div>
          </>
        )}
        {tab === 'model' && (
          <>
            <Label>Skin</Label>
            <Swatches label="skin tone" colors={SKINS} value={look.skin} onPick={(skin) => up({ skin })} />
            <Label>Hair</Label>
            <Choices items={HAIRS} value={look.hair} onPick={(hair) => up({ hair })} />
            <Label>Hair colour</Label>
            <Swatches label="hair colour" colors={HAIR_COLORS} value={look.hairColor} onPick={(hairColor) => up({ hairColor })} />
          </>
        )}
        {tab === 'extras' && (
          <>
            <Label>Accessories</Label>
            <Choices items={ACCESSORIES} value={look.accessories} onPick={toggle} multi />
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {naming ? (
          <motion.div key="n" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="panel stack" style={{ marginTop: 14 }}>
            <label className="lbl" htmlFor="dn">
              Name your design
            </label>
            <input id="dn" className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Midnight in Delhi" autoFocus />
            <div className="row">
              <button className="btn ghost small" onClick={() => setNaming(false)}>
                Back
              </button>
              <button className="btn" style={{ flex: 1 }} onClick={save}>
                Send to the runway
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="b" style={{ marginTop: 14 }}>
            <button className="btn block" onClick={() => setNaming(true)}>
              Finish my design
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  )
}

// ---------------------------------------------------------------------------

export function Lookbook() {
  const s = useStore()
  const me = memberById(s.me)
  if (!me) return <Navigate to="/" replace />
  const designs = itemsOf<Design>(s, 'design')
  const loves = itemsOf<Love>(s, 'love')

  return (
    <Page className="with-tabs">
      <TopBar title="The Atelier" />
      <div style={{ textAlign: 'center' }}>
        <h2 className="display shimmer" style={{ fontSize: 26 }}>
          Madam Malkin’s Atelier
        </h2>
        <p className="italic muted">Robes, gowns and lehengas for every occasion.</p>
        <Link to="/atelier/new" className="btn" style={{ marginTop: 16 }}>
          Design a new look
        </Link>
      </div>

      <div className="section-h">
        <h2>The Lookbook</h2>
        <span className="faint" style={{ fontSize: 15 }}>
          {designs.length} {designs.length === 1 ? 'design' : 'designs'}
        </span>
      </div>
      {designs.length === 0 ? (
        <Empty text="The Lookbook is empty. The first design is waiting for you." />
      ) : (
        <div className="grid-2">
          {designs.map((d, i) => {
            const n = loves.filter((l) => l.data.designId === d.id).length
            return (
              <motion.div key={d.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/atelier/${d.id}`} className="art-card" style={{ padding: '14px 8px 12px', textAlign: 'center' }}>
                  <div style={{ display: 'grid', placeItems: 'center', background: 'radial-gradient(ellipse 60% 50% at 50% 35%, rgba(255,236,200,.18), transparent 70%)' }}>
                    <Figure look={d.data.look} width={120} />
                  </div>
                  <div style={{ fontWeight: 600, marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.data.name}</div>
                  <div className="faint" style={{ fontSize: 14 }}>
                    by {nameOf(d.by)} · {n} ♥
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </Page>
  )
}

export function DesignView() {
  const { id } = useParams()
  const s = useStore()
  const nav = useNavigate()
  const me = memberById(s.me)
  const [flash, setFlash] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setFlash((f) => f + 1), 1300)
    return () => clearInterval(t)
  }, [])
  if (!me) return <Navigate to="/" replace />
  const d = itemsOf<Design>(s, 'design').find((x) => x.id === id)
  if (!d) return <Navigate to="/atelier" replace />
  const loves = itemsOf<Love>(s, 'love').filter((l) => l.data.designId === d.id)
  const iLoved = loves.some((l) => l.by === me.id)
  const mine = d.by === me.id

  const love = () => {
    if (iLoved || mine) return
    actions.addItem<Love>('love', me.id, { designId: d.id })
    actions.award(d.by, DESIGN_POINTS.love, `${me.name} loved “${d.data.name}”`)
  }

  return (
    <Page candles={false}>
      <TopBar title="The Runway" back="/atelier" />
      <div style={{ position: 'relative' }}>
        <Stage look={d.data.look} painting={false} ink="" size={0} onPaint={() => undefined} runway />
        {/* camera flashes */}
        <AnimatePresence>
          <motion.div
            key={flash}
            initial={{ opacity: 0.0 }}
            animate={{ opacity: [0, 0.7, 0] }}
            transition={{ duration: 0.35 }}
            style={{ position: 'absolute', left: `${15 + ((flash * 37) % 70)}%`, top: `${10 + ((flash * 23) % 40)}%`, width: 70, height: 70, marginLeft: -35, borderRadius: '50%', background: 'radial-gradient(circle, #fff, transparent 65%)', pointerEvents: 'none' }}
          />
        </AnimatePresence>
      </div>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <h2 className="display shimmer" style={{ fontSize: 28 }}>
          {d.data.name}
        </h2>
        <p className="muted italic">
          designed by {nameOf(d.by)} · {timeAgo(d.at)}
        </p>
        <div className="row" style={{ justifyContent: 'center', marginTop: 14, gap: 10 }}>
          <motion.button whileTap={{ scale: 1.3 }} className="btn" disabled={iLoved || mine} onClick={love} aria-label="Love this design">
            ♥ {loves.length}
          </motion.button>
          <button className="btn ghost" onClick={() => nav('/atelier/new', { state: { look: d.data.look } })}>
            Remix
          </button>
        </div>
        {loves.length > 0 && <p className="faint" style={{ marginTop: 10 }}>Loved by {loves.map((l) => nameOf(l.by)).join(', ')}</p>}
        {!mine && !iLoved && <p className="faint" style={{ marginTop: 6, fontSize: 15 }}>Every heart gives {nameOf(d.by)} a house point.</p>}
      </div>
    </Page>
  )
}
