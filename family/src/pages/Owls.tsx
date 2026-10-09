import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { OwlFigure } from '../components/Atmosphere'
import { OwlTileArt } from '../components/Art'
import { Empty, Page, TopBar, timeAgo } from '../components/UI'
import { MEMBERS, memberById } from '../data/family'
import { actions, isForMe, nameOf, recipientName, useStore } from '../state/store'

const whatsappShare = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`

export function OwlInbox() {
  const s = useStore()
  const me = memberById(s.me)
  if (!me) return <Navigate to="/" replace />
  const letters = s.letters.filter((l) => isForMe(l, me.id))

  return (
    <Page art="owlery">
      <TopBar title="Owl Post" right={<Link to="/owls/new" className="icon-btn" aria-label="Send an owl"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></Link>} />

      {letters.length === 0 ? (
        <Empty art={<OwlTileArt hopping />} text="The owlery is quiet. Be the first to send an owl.">
          <Link to="/owls/new" className={`btn h${me.house.slice(0, 2)}`}>
            Send an owl
          </Link>
        </Empty>
      ) : (
        <ul className="stack" style={{ listStyle: 'none', margin: '10px 0 0', padding: 0 }}>
          {letters.map((l, i) => {
            const unread = l.from !== me.id && !l.readBy.includes(me.id)
            const outgoing = l.from === me.id
            return (
              <motion.li key={l.id} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to={`/owls/${l.id}`} className="parchment" style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 16px', textDecoration: 'none', transform: `rotate(${i % 2 ? 0.5 : -0.5}deg)` }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      flex: 'none',
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      background: unread ? 'radial-gradient(circle at 40% 35%, #c2324a, #7a1124)' : 'rgba(43,31,20,.12)',
                      color: unread ? '#f6d7a0' : 'var(--ink)',
                      fontFamily: 'var(--display)',
                      fontWeight: 700,
                    }}
                  >
                    {(outgoing ? recipientName(l.to) : nameOf(l.from))[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row between">
                      <strong className="display" style={{ fontSize: 15 }}>
                        {outgoing ? `To ${recipientName(l.to)}` : nameOf(l.from)}
                        {l.howler && <span style={{ color: '#9b1e2e' }}> · Howler!</span>}
                      </strong>
                      <span style={{ fontSize: 14, opacity: 0.7 }}>{timeAgo(l.sentAt)}</span>
                    </div>
                    <div className="italic" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: unread ? 1 : 0.75 }}>
                      {l.body}
                    </div>
                  </div>
                </Link>
              </motion.li>
            )
          })}
        </ul>
      )}
    </Page>
  )
}

export function OwlCompose() {
  const s = useStore()
  const nav = useNavigate()
  const me = memberById(s.me)
  const params = new URLSearchParams(window.location.search)
  const [to, setTo] = useState<string>(params.get('to') ?? '')
  const [body, setBody] = useState('')
  const [howler, setHowler] = useState(false)
  const [sent, setSent] = useState(false)
  if (!me) return <Navigate to="/" replace />

  const targets = [
    { id: 'all', label: 'Everyone' },
    { id: '33C', label: 'All of 33C' },
    { id: '34C', label: 'All of 34C' },
    ...MEMBERS.filter((m) => m.id !== me.id).map((m) => ({ id: m.id, label: m.name })),
  ]

  const send = () => {
    actions.sendOwl(me.id, to, body.trim(), howler)
    setSent(true)
  }

  return (
    <Page art="owlery" candles={false}>
      <TopBar title="Send an owl" />
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.div key="form" exit={{ opacity: 0, y: -30 }} className="stack">
            <div>
              <span className="lbl">To</span>
              <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
                {targets.map((t) => (
                  <button key={t.id} className="chip" aria-pressed={to === t.id} onClick={() => setTo(t.id)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="parchment" style={{ padding: 18 }}>
              <label className="lbl" htmlFor="letter" style={{ color: '#6a4e2e' }}>
                Your letter
              </label>
              <textarea id="letter" className="field" value={body} onChange={(e) => setBody(e.target.value)} placeholder="My dearest…" />
            </div>
            <label className="row" style={{ cursor: 'pointer', minHeight: 44 }}>
              <input type="checkbox" checked={howler} onChange={(e) => setHowler(e.target.checked)} style={{ width: 22, height: 22, accentColor: '#9b1e2e' }} />
              <span>
                Send as a <strong style={{ color: '#ff8fa3' }}>Howler</strong> <span className="faint">(it shouts when opened)</span>
              </span>
            </label>
            <button className="btn block" disabled={!to || !body.trim()} onClick={send}>
              Send the owl
            </button>
          </motion.div>
        ) : (
          <motion.div key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty" style={{ position: 'relative', minHeight: 420 }}>
            <motion.div initial={{ x: 0, y: 0, scale: 1 }} animate={{ x: 260, y: -260, scale: 0.4 }} transition={{ duration: 2.2, ease: 'easeIn' }}>
              <OwlFigure size={120} />
            </motion.div>
            <h2 className="display shimmer" style={{ fontSize: 26 }}>
              Your owl is on its way
            </h2>
            <p>+2 points for {me.house}</p>
            <a className="btn ghost small" href={whatsappShare(`🦉 ${me.name} sent you an owl in our family app! Open it to read.`)} target="_blank" rel="noreferrer">
              Tell them on WhatsApp
            </a>
            <button className="btn small" onClick={() => nav('/owls')}>
              Back to the owlery
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  )
}

export function OwlLetter() {
  const { id } = useParams()
  const s = useStore()
  const me = memberById(s.me)
  const letter = s.letters.find((l) => l.id === id)
  const [opened, setOpened] = useState(false)

  useEffect(() => {
    if (opened && letter && me) actions.markRead(letter.id, me.id)
  }, [opened, letter, me])

  useEffect(() => {
    if (opened && letter?.howler && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(letter.body)
      u.rate = 1.15
      u.pitch = 0.8
      u.volume = 1
      window.speechSynthesis.speak(u)
      return () => window.speechSynthesis.cancel()
    }
  }, [opened, letter])

  if (!me) return <Navigate to="/" replace />
  if (!letter) return <Navigate to="/owls" replace />
  const outgoing = letter.from === me.id

  return (
    <Page art="owlery" candles={false}>
      <TopBar title={letter.howler ? 'A Howler!' : 'A letter'} />
      <AnimatePresence mode="wait">
        {!opened && !outgoing ? (
          <motion.button
            key="sealed"
            onClick={() => setOpened(true)}
            exit={{ scale: 1.1, opacity: 0 }}
            whileTap={{ scale: 0.96 }}
            style={{ display: 'block', margin: '60px auto 0', background: 'none', border: 0, cursor: 'pointer' }}
            aria-label="Break the seal"
          >
            <div className="parchment" style={{ width: 300, height: 200, position: 'relative', display: 'grid', placeItems: 'center', background: letter.howler ? 'linear-gradient(180deg,#c2324a,#7a1124)' : undefined, animation: letter.howler ? 'hop 1s ease-in-out infinite' : undefined }}>
              <svg width="300" height="200" style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
                <path d="M0 0 L150 110 L300 0" stroke="rgba(43,31,20,.35)" strokeWidth="1.5" fill="none" />
              </svg>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #c2324a, #7a1124)', boxShadow: '0 4px 10px rgba(0,0,0,.4)', display: 'grid', placeItems: 'center', color: '#f6d7a0', fontFamily: 'var(--display)', fontWeight: 700, fontSize: 22, position: 'relative', top: 10 }}>
                {nameOf(letter.from)[0]}
              </div>
            </div>
            <p className="display" style={{ marginTop: 22, color: 'var(--gold)', letterSpacing: '.24em', fontSize: 13 }}>
              TAP TO BREAK THE SEAL
            </p>
          </motion.button>
        ) : (
          <motion.article
            key="open"
            initial={{ scaleY: 0.2, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 0.8, 0.3, 1] }}
            className="parchment"
            style={{ padding: '28px 22px', marginTop: 12, transformOrigin: '50% 0' }}
          >
            <div className="display" style={{ fontSize: 13, letterSpacing: '.2em', color: '#6a4e2e' }}>
              {outgoing ? `TO ${recipientName(letter.to).toUpperCase()}` : `FROM ${nameOf(letter.from).toUpperCase()}`} · {timeAgo(letter.sentAt).toUpperCase()}
            </div>
            <p className="italic" style={{ fontSize: letter.howler ? 26 : 21, lineHeight: 1.55, marginTop: 14, whiteSpace: 'pre-wrap', color: letter.howler ? '#7a1124' : 'var(--ink)', fontWeight: letter.howler ? 600 : 500 }}>
              {letter.body}
            </p>
            {!outgoing && letter.from !== 'owlery' && (
              <div style={{ marginTop: 24 }}>
                <Link to={`/owls/new?to=${letter.from}`} className="btn small">
                  Reply by owl
                </Link>
              </div>
            )}
          </motion.article>
        )}
      </AnimatePresence>
    </Page>
  )
}
