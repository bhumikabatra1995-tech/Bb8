import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { SnitchArt } from '../components/Art'
import { Page, TopBar } from '../components/UI'
import { memberById } from '../data/family'
import { actions, bestScores, useStore } from '../state/store'

const GAME_SECONDS = 30

type Body = { x: number; y: number; tx: number; ty: number; speed: number }
type Burst = { id: number; x: number; y: number; good: boolean }

const randomTarget = (w: number, h: number, pad = 40) => ({ tx: pad + Math.random() * (w - pad * 2), ty: pad + Math.random() * (h - pad * 2) })

export default function Snitch() {
  const s = useStore()
  const me = memberById(s.me)
  const arena = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready')
  const [caught, setCaught] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS)
  const [, force] = useState(0)
  const [bursts, setBursts] = useState<Burst[]>([])
  const [shake, setShake] = useState(false)
  const snitch = useRef<Body>({ x: 160, y: 200, tx: 160, ty: 200, speed: 3 })
  const bludger = useRef<Body>({ x: 60, y: 60, tx: 300, ty: 300, speed: 1.6 })
  const caughtRef = useRef(0)
  const best = me ? (bestScores(s, 'snitch').find((x) => x.member === me.id)?.score ?? 0) : 0

  const step = useCallback((b: Body, w: number, h: number, jitter: number) => {
    const dx = b.tx - b.x
    const dy = b.ty - b.y
    const d = Math.hypot(dx, dy)
    if (d < b.speed * 2) {
      Object.assign(b, randomTarget(w, h))
      if (jitter && Math.random() < 0.3) b.speed *= 1.8 // a sudden dart
    } else {
      b.x += (dx / d) * b.speed
      b.y += (dy / d) * b.speed
    }
    b.x += (Math.random() - 0.5) * jitter
    b.y += (Math.random() - 0.5) * jitter
  }, [])

  useEffect(() => {
    if (phase !== 'playing') return
    let raf = 0
    const started = performance.now()
    const tick = (now: number) => {
      const el = arena.current
      if (el) {
        const { width: w, height: h } = el.getBoundingClientRect()
        const base = 3 + caughtRef.current * 0.35
        snitch.current.speed += (base - snitch.current.speed) * 0.04
        step(snitch.current, w, h, 1.4)
        step(bludger.current, w, h, 0)
      }
      const left = Math.max(0, GAME_SECONDS - (now - started) / 1000)
      setTimeLeft(left)
      force((n) => n + 1)
      if (left <= 0) {
        setPhase('done')
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, step])

  useEffect(() => {
    if (phase === 'done' && me) actions.snitchGame(me.id, caughtRef.current)
  }, [phase, me])

  if (!me) return <Navigate to="/" replace />

  const start = () => {
    const el = arena.current
    const w = el?.clientWidth ?? 340
    const h = el?.clientHeight ?? 460
    snitch.current = { x: w / 2, y: h / 2, ...randomTarget(w, h), speed: 3 }
    bludger.current = { x: 30, y: 30, ...randomTarget(w, h), speed: 1.6 }
    caughtRef.current = 0
    setCaught(0)
    setBursts([])
    setPhase('playing')
  }

  const pop = (x: number, y: number, good: boolean) => {
    const id = Date.now() + Math.random()
    setBursts((b) => [...b, { id, x, y, good }])
    setTimeout(() => setBursts((b) => b.filter((z) => z.id !== id)), 700)
  }

  const catchSnitch = () => {
    if (phase !== 'playing') return
    caughtRef.current += 1
    setCaught(caughtRef.current)
    pop(snitch.current.x, snitch.current.y, true)
    navigator.vibrate?.(30)
    const el = arena.current
    if (el) Object.assign(snitch.current, randomTarget(el.clientWidth, el.clientHeight), { speed: snitch.current.speed * 2.2 })
  }

  const hitBludger = () => {
    if (phase !== 'playing') return
    caughtRef.current = Math.max(0, caughtRef.current - 1)
    setCaught(caughtRef.current)
    pop(bludger.current.x, bludger.current.y, false)
    setShake(true)
    navigator.vibrate?.([60, 40, 60])
    setTimeout(() => setShake(false), 400)
  }

  const sn = snitch.current
  const bl = bludger.current

  return (
    <Page art="quidditch" candles={false}>
      <TopBar title="Snitch Chase" back="/games" />
      <div className="row between" style={{ marginBottom: 10 }}>
        <div className="display" style={{ fontSize: 26, color: 'var(--gold)' }}>
          {caught} <span className="faint" style={{ fontSize: 12, letterSpacing: '.2em' }}>CAUGHT</span>
        </div>
        <div className="display" style={{ fontSize: 26, color: timeLeft < 6 && phase === 'playing' ? '#ff9aae' : 'var(--text)' }}>
          {Math.ceil(timeLeft)}s
        </div>
      </div>

      <motion.div
        ref={arena}
        animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'relative',
          height: 'min(60vh, 520px)',
          borderRadius: 22,
          overflow: 'hidden',
          border: '1px solid rgba(233,194,122,.35)',
          background:
            'radial-gradient(ellipse at 50% 120%, rgba(60,110,70,.55), transparent 60%), radial-gradient(ellipse at 50% -20%, rgba(120,140,220,.35), transparent 60%), linear-gradient(180deg, #0d1430, #1b2346 55%, #213a2a)',
          boxShadow: 'inset 0 0 60px rgba(0,0,0,.6)',
          touchAction: 'manipulation',
          userSelect: 'none',
        }}
      >
        {/* stadium hoops */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.35 }} aria-hidden="true">
          {[18, 50, 82].map((x, i) => (
            <g key={x}>
              <line x1={`${x}%`} y1="100%" x2={`${x}%`} y2={`${i === 1 ? 52 : 62}%`} stroke="#e9c27a" strokeWidth="2" />
              <circle cx={`${x}%`} cy={`${i === 1 ? 46 : 56}%`} r="16" stroke="#e9c27a" strokeWidth="2.5" fill="none" />
            </g>
          ))}
        </svg>

        {phase === 'playing' && (
          <>
            <button
              type="button"
              aria-label="Bludger — avoid it"
              onPointerDown={hitBludger}
              style={{ position: 'absolute', left: bl.x - 22, top: bl.y - 22, width: 44, height: 44, borderRadius: '50%', border: 0, padding: 0, cursor: 'pointer', background: 'radial-gradient(circle at 35% 30%, #6a6a6a, #1c1c1c 70%)', boxShadow: '0 6px 14px rgba(0,0,0,.6)' }}
            />
            <button
              type="button"
              aria-label="The Golden Snitch — catch it!"
              onPointerDown={catchSnitch}
              style={{ position: 'absolute', left: sn.x - 40, top: sn.y - 32, width: 80, height: 64, border: 0, padding: 0, background: 'none', cursor: 'pointer', filter: 'drop-shadow(0 0 12px rgba(255,210,110,.75))' }}
            >
              <SnitchArt size={80} />
            </button>
          </>
        )}

        <AnimatePresence>
          {bursts.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 1, scale: 0.4 }}
              animate={{ opacity: 0, scale: 2.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              style={{ position: 'absolute', left: b.x - 30, top: b.y - 30, width: 60, height: 60, borderRadius: '50%', border: `3px solid ${b.good ? '#ffe39a' : '#ff6b6b'}`, boxShadow: `0 0 24px ${b.good ? '#ffd27a' : '#ff6b6b'}`, pointerEvents: 'none' }}
            >
              <span className="display" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: b.good ? '#fff1c6' : '#ffb3b3', fontSize: 18 }}>
                {b.good ? '+1' : '−1'}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {phase !== 'playing' && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(5,6,14,.55)', backdropFilter: 'blur(2px)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="stack" style={{ alignItems: 'center', textAlign: 'center', padding: 20 }}>
              <SnitchArt size={130} />
              {phase === 'ready' ? (
                <>
                  <h2 className="display shimmer" style={{ fontSize: 26 }}>
                    Ready, Seeker?
                  </h2>
                  <p className="muted">Tap the Snitch as many times as you can. Hit the Bludger and you lose one.</p>
                  <p className="faint">Your best: {best}</p>
                </>
              ) : (
                <>
                  <h2 className="display shimmer" style={{ fontSize: 30 }}>
                    {caught} caught!
                  </h2>
                  <p className="muted">{caught > best ? 'A new personal best!' : `Your best is ${Math.max(best, caught)}.`}</p>
                  <p className="faint">+{Math.min(caught, 15)} points for {me.house} (up to 15 a day)</p>
                </>
              )}
              <button className="btn" onClick={start}>
                {phase === 'ready' ? 'Release the Snitch' : 'Play again'}
              </button>
              {phase === 'done' && (
                <Link to="/games" className="btn ghost small">
                  Games Room
                </Link>
              )}
            </motion.div>
          </div>
        )}
      </motion.div>
    </Page>
  )
}
