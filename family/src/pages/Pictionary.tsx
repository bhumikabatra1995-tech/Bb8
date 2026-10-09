import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Empty, Page, TopBar, timeAgo } from '../components/UI'
import { memberById } from '../data/family'
import { actions, itemsOf, nameOf, useStore } from '../state/store'

export type Drawing = { word: string; image: string }
export type Guess = { drawingId: string; guess: string; correct: boolean }

const WORDS = [
  'owl', 'broomstick', 'wand', 'castle', 'dragon', 'cauldron', 'sorting hat', 'golden snitch', 'train', 'phoenix',
  'spider', 'moon', 'candle', 'potion', 'unicorn', 'ghost', 'chessboard', 'kite', 'mango', 'samosa', 'elephant',
  'rickshaw', 'statue of liberty', 'snowman', 'rainbow', 'birthday cake', 'diya', 'rangoli', 'aeroplane', 'umbrella',
  'cup of chai', 'jalebi', 'cricket bat', 'mountain', 'treasure chest', 'mermaid', 'pyramid', 'rocket', 'lighthouse',
]

const normal = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, '')
const MAX_TRIES = 3
export const GUESS_POINTS = { guesser: 3, artist: 2 }

const INKS = ['#f4ecdb', '#f0c77e', '#ff6b7f', '#7fa8ff', '#7fd6a0', '#1b1530']

export function PictionaryList() {
  const s = useStore()
  const me = memberById(s.me)
  if (!me) return <Navigate to="/" replace />
  const drawings = itemsOf<Drawing>(s, 'drawing')
  const guesses = itemsOf<Guess>(s, 'guess')

  return (
    <Page>
      <TopBar title="Owl Pictionary" back="/games" />
      <p className="italic muted" style={{ textAlign: 'center' }}>
        Draw a secret word. The family guesses whenever they’re free.
      </p>
      <div style={{ textAlign: 'center', margin: '16px 0 6px' }}>
        <Link to="/games/pictionary/draw" className="btn">
          Draw something
        </Link>
      </div>

      {drawings.length === 0 ? (
        <Empty text="No drawings yet. Be the first artist!" />
      ) : (
        <div className="grid-2" style={{ marginTop: 16 }}>
          {drawings.map((d) => {
            const mine = d.by === me.id
            const gs = guesses.filter((g) => g.data.drawingId === d.id)
            const solvedBy = gs.filter((g) => g.data.correct)
            const iSolved = solvedBy.some((g) => g.by === me.id)
            const myTries = gs.filter((g) => g.by === me.id).length
            const status = mine ? `${solvedBy.length} guessed it` : iSolved ? 'You got it!' : myTries >= MAX_TRIES ? 'Out of tries' : 'Your turn to guess'
            return (
              <Link key={d.id} to={`/games/pictionary/${d.id}`} className="art-card" style={{ aspectRatio: '1 / 1.2' }}>
                <div className="art-img" style={{ backgroundImage: `url(${d.data.image})`, backgroundColor: '#0e1130', backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }} />
                <div className="art-shade" />
                {!mine && !iSolved && myTries < MAX_TRIES && <span className="badge">!</span>}
                <div style={{ position: 'absolute', left: 12, right: 12, bottom: 10 }}>
                  <div style={{ fontWeight: 600 }}>{mine ? `Your “${d.data.word}”` : `By ${nameOf(d.by)}`}</div>
                  <div className="faint" style={{ fontSize: 14 }}>
                    {status} · {timeAgo(d.at)}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </Page>
  )
}

export function PictionaryDraw() {
  const s = useStore()
  const nav = useNavigate()
  const me = memberById(s.me)
  const canvas = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const history = useRef<ImageData[]>([])
  const [word, setWord] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)])
  const [custom, setCustom] = useState(false)
  const [ink, setInk] = useState(INKS[1])
  const [size, setSize] = useState(6)
  const [blank, setBlank] = useState(true)

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const ratio = window.devicePixelRatio || 1
    c.width = c.clientWidth * ratio
    c.height = c.clientHeight * ratio
    const ctx = c.getContext('2d')!
    ctx.scale(ratio, ratio)
    ctx.fillStyle = '#0e1130'
    ctx.fillRect(0, 0, c.clientWidth, c.clientHeight)
  }, [])

  if (!me) return <Navigate to="/" replace />

  const pos = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const start = (e: React.PointerEvent) => {
    const c = canvas.current!
    const ctx = c.getContext('2d')!
    history.current.push(ctx.getImageData(0, 0, c.width, c.height))
    if (history.current.length > 30) history.current.shift()
    drawing.current = true
    c.setPointerCapture(e.pointerId)
    const p = pos(e)
    ctx.strokeStyle = ink
    ctx.fillStyle = ink
    ctx.lineWidth = size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowColor = ink === '#1b1530' ? 'transparent' : ink
    ctx.shadowBlur = 6
    ctx.beginPath()
    ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    setBlank(false)
  }
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return
    const ctx = canvas.current!.getContext('2d')!
    const p = pos(e)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }
  const end = () => {
    drawing.current = false
  }
  const undo = () => {
    const prev = history.current.pop()
    if (prev) canvas.current!.getContext('2d')!.putImageData(prev, 0, 0)
  }
  const clear = () => {
    const c = canvas.current!
    const ctx = c.getContext('2d')!
    history.current.push(ctx.getImageData(0, 0, c.width, c.height))
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillStyle = '#0e1130'
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.restore()
    setBlank(true)
  }
  const send = () => {
    const src = canvas.current!
    const out = document.createElement('canvas')
    out.width = 360
    out.height = 360
    out.getContext('2d')!.drawImage(src, 0, 0, 360, 360)
    const image = out.toDataURL('image/webp', 0.75)
    actions.addItem<Drawing>('drawing', me.id, { word: word.trim(), image })
    nav('/games/pictionary')
  }

  return (
    <Page candles={false}>
      <TopBar title="Draw" back="/games/pictionary" />
      <div className="panel row between" style={{ padding: '10px 14px' }}>
        {custom ? (
          <input className="field" style={{ padding: '8px 12px' }} value={word} onChange={(e) => setWord(e.target.value)} aria-label="Your secret word" autoFocus />
        ) : (
          <div>
            <div className="faint" style={{ fontSize: 13 }}>
              Your secret word
            </div>
            <div className="display" style={{ fontSize: 20, color: 'var(--gold)' }}>
              {word}
            </div>
          </div>
        )}
        <div className="row" style={{ gap: 6 }}>
          <button className="icon-btn" aria-label="Another word" onClick={() => { setCustom(false); setWord(WORDS[Math.floor(Math.random() * WORDS.length)]) }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" /></svg>
          </button>
          <button className="icon-btn" aria-label="Choose my own word" onClick={() => { setCustom(true); setWord('') }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4" /></svg>
          </button>
        </div>
      </div>

      <canvas
        ref={canvas}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        style={{ width: '100%', aspectRatio: '1 / 1', marginTop: 14, borderRadius: 18, border: '1px solid var(--card-border)', touchAction: 'none', display: 'block', boxShadow: 'inset 0 0 40px rgba(0,0,0,.5)' }}
        aria-label="Drawing canvas"
      />

      <div className="row between" style={{ marginTop: 12, flexWrap: 'wrap', gap: 10 }}>
        <div className="row" style={{ gap: 8 }}>
          {INKS.map((c) => (
            <button key={c} aria-label={c === '#1b1530' ? 'Eraser' : `Ink ${c}`} aria-pressed={ink === c} onClick={() => setInk(c)} style={{ width: 32, height: 32, borderRadius: '50%', border: ink === c ? '3px solid #fff' : '1px solid rgba(255,255,255,.3)', background: c === '#1b1530' ? 'repeating-linear-gradient(45deg,#1b1530 0 4px,#2b2550 4px 8px)' : c, cursor: 'pointer', boxShadow: ink === c ? `0 0 12px ${c}` : undefined }} />
          ))}
        </div>
        <div className="row" style={{ gap: 6 }}>
          {[3, 6, 12].map((w) => (
            <button key={w} className="icon-btn" aria-label={`Brush ${w}`} aria-pressed={size === w} onClick={() => setSize(w)} style={{ borderColor: size === w ? 'var(--gold)' : undefined }}>
              <span style={{ width: w + 2, height: w + 2, borderRadius: '50%', background: 'currentColor' }} />
            </button>
          ))}
        </div>
      </div>
      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn ghost small" onClick={undo}>
          Undo
        </button>
        <button className="btn ghost small" onClick={clear}>
          Clear
        </button>
        <button className="btn" style={{ flex: 1 }} disabled={blank || !word.trim()} onClick={send}>
          Send by owl
        </button>
      </div>
    </Page>
  )
}

export function PictionaryGuess() {
  const { id } = useParams()
  const s = useStore()
  const me = memberById(s.me)
  const [guess, setGuess] = useState('')
  const [wrong, setWrong] = useState(false)
  if (!me) return <Navigate to="/" replace />
  const d = itemsOf<Drawing>(s, 'drawing').find((x) => x.id === id)
  if (!d) return <Navigate to="/games/pictionary" replace />
  const gs = itemsOf<Guess>(s, 'guess').filter((g) => g.data.drawingId === d.id)
  const mine = d.by === me.id
  const myGuesses = gs.filter((g) => g.by === me.id)
  const solved = myGuesses.some((g) => g.data.correct)
  const out = !solved && myGuesses.length >= MAX_TRIES
  const reveal = mine || solved || out

  const submit = () => {
    const correct = normal(guess) === normal(d.data.word)
    actions.addItem<Guess>('guess', me.id, { drawingId: d.id, guess: guess.trim(), correct })
    if (correct) {
      actions.award(me.id, GUESS_POINTS.guesser, `Guessed ${nameOf(d.by)}’s drawing`)
      actions.award(d.by, GUESS_POINTS.artist, `${me.name} guessed your drawing`)
    } else {
      setWrong(true)
      setTimeout(() => setWrong(false), 600)
    }
    setGuess('')
  }

  return (
    <Page candles={false}>
      <TopBar title={mine ? 'Your drawing' : `${nameOf(d.by)} drew…`} back="/games/pictionary" />
      <motion.img
        src={d.data.image}
        alt={reveal ? `A drawing of ${d.data.word}` : 'A mystery drawing'}
        animate={wrong ? { x: [0, -10, 10, -6, 6, 0] } : {}}
        style={{ width: '100%', borderRadius: 18, border: '1px solid var(--card-border)', display: 'block', background: '#0e1130' }}
      />

      {reveal ? (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <div className="faint">The word was</div>
          <div className="display shimmer" style={{ fontSize: 30 }}>
            {d.data.word}
          </div>
          {solved && <p className="muted">+{GUESS_POINTS.guesser} points for you!</p>}
        </div>
      ) : (
        <div className="panel stack" style={{ marginTop: 16 }}>
          <label className="lbl" htmlFor="g">
            Your guess · {MAX_TRIES - myGuesses.length} {MAX_TRIES - myGuesses.length === 1 ? 'try' : 'tries'} left
          </label>
          <input id="g" className="field" value={guess} onChange={(e) => setGuess(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && guess.trim() && submit()} placeholder="Is it a…" autoComplete="off" />
          <button className="btn" disabled={!guess.trim()} onClick={submit}>
            Guess
          </button>
        </div>
      )}

      {gs.length > 0 && (mine || reveal) && (
        <section className="panel" style={{ marginTop: 16 }}>
          <h3 className="display" style={{ fontSize: 13, letterSpacing: '.2em', color: 'var(--gold)', marginBottom: 6 }}>
            GUESSES
          </h3>
          {gs.map((g) => (
            <div key={g.id} className="row between" style={{ padding: '6px 0' }}>
              <span>
                <strong>{nameOf(g.by)}</strong> · {g.data.guess}
              </span>
              <span style={{ color: g.data.correct ? '#7fd6a0' : 'var(--text-3)' }}>{g.data.correct ? 'Correct!' : '✗'}</span>
            </div>
          ))}
        </section>
      )}
    </Page>
  )
}
