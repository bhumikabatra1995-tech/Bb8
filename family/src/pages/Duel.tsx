import type { RealtimeChannel } from '@supabase/supabase-js'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Portrait } from '../components/Avatar'
import { Page, TopBar } from '../components/UI'
import { memberById, type Member } from '../data/family'
import { remote } from '../state/backend'
import { actions, nameOf, useStore } from '../state/store'

type Spell = 'expelliarmus' | 'stupefy' | 'protego'

const SPELLS: Record<Spell, { name: string; color: string; glow: string; beats: Spell; hint: string }> = {
  expelliarmus: { name: 'Expelliarmus', color: '#ff5a5a', glow: 'rgba(255,90,90,.8)', beats: 'protego', hint: 'Knocks the wand out — breaks through Protego' },
  stupefy: { name: 'Stupefy', color: '#6aa0ff', glow: 'rgba(106,160,255,.8)', beats: 'expelliarmus', hint: 'Stuns the caster — faster than Expelliarmus' },
  protego: { name: 'Protego', color: '#f2d28c', glow: 'rgba(242,210,140,.85)', beats: 'stupefy', hint: 'A shield — Stupefy bounces right off' },
}
const ORDER: Spell[] = ['expelliarmus', 'stupefy', 'protego']
const WIN_AT = 3

type Opponent = { id: string; name: string; live: boolean }
type Invite = { from: string; duelId: string }

const resolve = (a: Spell, b: Spell): 1 | 0 | -1 => (a === b ? 0 : SPELLS[a].beats === b ? 1 : -1)

const PEEVES: Member = { id: 'peeves', name: 'Peeves', house: '34C', city: 'Hogwarts' }

function SpellGlyph({ spell, size = 40 }: { spell: Spell; size?: number }) {
  const c = SPELLS[spell].color
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      {spell === 'protego' && <path d="M20 4 L34 10 V20 Q34 31 20 37 Q6 31 6 20 V10 Z" fill="none" stroke={c} strokeWidth="2.5" />}
      {spell === 'expelliarmus' && <path d="M6 34 L20 20 M20 20 L16 6 M20 20 L34 16 M20 20 L30 30" stroke={c} strokeWidth="2.5" strokeLinecap="round" />}
      {spell === 'stupefy' && <path d="M22 3 L10 22 H19 L16 37 L30 16 H21 Z" fill="none" stroke={c} strokeWidth="2.3" strokeLinejoin="round" />}
    </svg>
  )
}

// ---------------------------------------------------------------------------

export default function Duel() {
  const s = useStore()
  const me = memberById(s.me)
  const [opponent, setOpponent] = useState<Opponent | null>(null)
  const [duelId, setDuelId] = useState<string | null>(null)
  const [online, setOnline] = useState<string[]>([])
  const [invite, setInvite] = useState<Invite | null>(null)
  const [pending, setPending] = useState<string | null>(null)
  const lobby = useRef<RealtimeChannel | null>(null)

  // Lobby: who's here, challenges, accepts.
  useEffect(() => {
    if (!remote || !me) return
    const ch = remote.channel('duel-lobby', { config: { presence: { key: me.id } } })
    ch.on('presence', { event: 'sync' }, () => setOnline(Object.keys(ch.presenceState()).filter((id) => id !== me.id)))
      .on('broadcast', { event: 'challenge' }, ({ payload }) => {
        if (payload.to === me.id) setInvite({ from: payload.from, duelId: payload.duelId })
      })
      .on('broadcast', { event: 'answer' }, ({ payload }) => {
        if (payload.to !== me.id) return
        setPending(null)
        if (payload.accept) {
          setDuelId(payload.duelId)
          setOpponent({ id: payload.from, name: nameOf(payload.from), live: true })
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') ch.track({ at: Date.now() })
      })
    lobby.current = ch
    return () => {
      ch.unsubscribe()
      lobby.current = null
    }
  }, [me])

  if (!me) return <Navigate to="/" replace />

  const challenge = (to: string) => {
    const id = `${me.id}-${to}-${Date.now()}`
    setPending(to)
    lobby.current?.send({ type: 'broadcast', event: 'challenge', payload: { from: me.id, to, duelId: id } })
    actions.challengeNotice(me.id, to)
  }

  const answer = (accept: boolean) => {
    if (!invite) return
    lobby.current?.send({ type: 'broadcast', event: 'answer', payload: { from: me.id, to: invite.from, duelId: invite.duelId, accept } })
    if (accept) {
      setDuelId(invite.duelId)
      setOpponent({ id: invite.from, name: nameOf(invite.from), live: true })
    }
    setInvite(null)
  }

  if (opponent) {
    return (
      <Arena
        me={me}
        opponent={opponent}
        duelId={duelId}
        onLeave={() => {
          setOpponent(null)
          setDuelId(null)
        }}
      />
    )
  }

  return (
    <Page art="duelling-hall">
      <TopBar title="Wizard Duel" back="/games" />

      <section className="panel ornate" style={{ marginTop: 6 }}>
        <h2 className="display" style={{ fontSize: 14, letterSpacing: '.2em', color: 'var(--gold)' }}>
          THE RULES
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0' }} className="stack">
          {ORDER.map((sp) => (
            <li key={sp} className="row" style={{ gap: 12 }}>
              <SpellGlyph spell={sp} size={32} />
              <span>
                <strong style={{ color: SPELLS[sp].color }}>{SPELLS[sp].name}</strong> beats {SPELLS[SPELLS[sp].beats].name}
              </span>
            </li>
          ))}
        </ul>
        <p className="faint italic" style={{ marginTop: 10, fontSize: 16 }}>
          Both wizards cast in secret. First to {WIN_AT} wins.
        </p>
      </section>

      <section className="panel" style={{ marginTop: 18 }}>
        <h2 className="display" style={{ fontSize: 14, letterSpacing: '.2em', color: 'var(--gold)' }}>
          CHALLENGE THE FAMILY
        </h2>
        {!remote ? (
          <p className="muted italic" style={{ marginTop: 8 }}>
            Live duels across phones switch on once the family database is connected. Practise with Peeves until then!
          </p>
        ) : online.length === 0 ? (
          <p className="muted italic" style={{ marginTop: 8 }}>
            Nobody else is in the duelling hall right now. Send an owl and tell them to come in!
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0' }} className="stack">
            {online.map((id) => (
              <li key={id} className="row between">
                <span className="row" style={{ gap: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#7fd6a0', boxShadow: '0 0 8px #7fd6a0' }} />
                  {nameOf(id)}
                </span>
                <button className="btn small" disabled={!!pending} onClick={() => challenge(id)}>
                  {pending === id ? 'Waiting…' : 'Challenge'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div style={{ textAlign: 'center', marginTop: 22 }}>
        <button className="btn ghost" onClick={() => setOpponent({ id: 'peeves', name: 'Peeves', live: false })}>
          Practise against Peeves
        </button>
        <p className="faint" style={{ fontSize: 14, marginTop: 8 }}>
          Practice duels don’t earn points.
        </p>
      </div>

      <AnimatePresence>
        {invite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'grid', placeItems: 'center', background: 'rgba(4,4,10,.75)', backdropFilter: 'blur(6px)', padding: 20 }}
          >
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="panel ornate stack" style={{ maxWidth: 340, textAlign: 'center', alignItems: 'center' }}>
              {memberById(invite.from) && <Portrait member={memberById(invite.from)!} size={110} glow />}
              <h2 className="display shimmer" style={{ fontSize: 24 }}>
                {nameOf(invite.from)} challenges you!
              </h2>
              <p className="muted">A wizard duel, best of five spells.</p>
              <div className="row">
                <button className="btn ghost small" onClick={() => answer(false)}>
                  Not now
                </button>
                <button className="btn" onClick={() => answer(true)}>
                  Accept
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  )
}

// ---------------------------------------------------------------------------

function Arena({ me, opponent, duelId, onLeave }: { me: Member; opponent: Opponent; duelId: string | null; onLeave: () => void }) {
  const [round, setRound] = useState(1)
  const [mine, setMine] = useState<Spell | null>(null)
  const [theirs, setTheirs] = useState<Record<number, Spell>>({})
  const [score, setScore] = useState({ me: 0, them: 0 })
  const [reveal, setReveal] = useState<{ a: Spell; b: Spell; r: 1 | 0 | -1 } | null>(null)
  const [ready, setReady] = useState(!opponent.live)
  const [gone, setGone] = useState(false)
  const channel = useRef<RealtimeChannel | null>(null)
  const recorded = useRef(false)
  const lastMine = useRef<Spell | null>(null)
  const over = score.me >= WIN_AT || score.them >= WIN_AT
  const oppMember = memberById(opponent.id) ?? PEEVES

  // Live channel for this duel.
  useEffect(() => {
    if (!opponent.live || !remote || !duelId) return
    const ch = remote.channel(`duel-${duelId}`, { config: { presence: { key: me.id } } })
    ch.on('broadcast', { event: 'cast' }, ({ payload }) => {
      if (payload.who !== me.id) setTheirs((t) => ({ ...t, [payload.round]: payload.spell }))
    })
      .on('presence', { event: 'sync' }, () => {
        const here = Object.keys(ch.presenceState())
        if (here.includes(opponent.id)) setReady(true)
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key === opponent.id) setGone(true)
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') ch.track({ at: Date.now() })
      })
    channel.current = ch
    return () => {
      ch.unsubscribe()
    }
  }, [opponent, duelId, me.id])

  const cast = useCallback(
    (sp: Spell) => {
      if (mine || over || reveal) return
      setMine(sp)
      if (opponent.live) {
        channel.current?.send({ type: 'broadcast', event: 'cast', payload: { who: me.id, round, spell: sp } })
      } else {
        // Peeves is mischievous: sometimes he counters your last spell.
        const counter = lastMine.current ? ORDER.find((x) => SPELLS[x].beats === lastMine.current) : null
        const pick = counter && Math.random() < 0.4 ? counter : ORDER[Math.floor(Math.random() * 3)]
        setTimeout(() => setTheirs((t) => ({ ...t, [round]: pick })), 500 + Math.random() * 700)
      }
      lastMine.current = sp
    },
    [mine, over, reveal, opponent.live, me.id, round],
  )

  // Both spells in: reveal, score, next round.
  useEffect(() => {
    const t = theirs[round]
    if (!mine || !t || reveal) return
    const r = resolve(mine, t)
    setReveal({ a: mine, b: t, r })
    navigator.vibrate?.(r === 1 ? 40 : r === -1 ? [60, 40, 60] : 20)
    const timer = setTimeout(() => {
      setScore((sc) => ({ me: sc.me + (r === 1 ? 1 : 0), them: sc.them + (r === -1 ? 1 : 0) }))
      setReveal(null)
      setMine(null)
      setRound((n) => n + 1)
    }, 2400)
    return () => clearTimeout(timer)
  }, [mine, theirs, round, reveal])

  useEffect(() => {
    if (!over || recorded.current || !opponent.live) return
    recorded.current = true
    actions.duelResult(me.id, opponent.name, score.me >= WIN_AT)
  }, [over, opponent, me.id, score.me])

  const rematch = () => {
    recorded.current = false
    setRound((n) => n + 1)
    setScore({ me: 0, them: 0 })
    setMine(null)
    setReveal(null)
  }

  const beamCenter = reveal ? (reveal.r === 1 ? 72 : reveal.r === -1 ? 28 : 50) : 50

  return (
    <Page art="duelling-hall" candles={false}>
      <TopBar
        title="Wizard Duel"
        back={null}
        right={
          <button className="icon-btn" aria-label="Leave the duel" onClick={onLeave}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        }
      />

      {/* duellists */}
      <div className="row between" style={{ alignItems: 'flex-end' }}>
        {[
          { m: me, sc: score.me, label: 'You' },
          { m: oppMember, sc: score.them, label: opponent.name },
        ].map(({ m, sc, label }, i) => (
          <div key={label} style={{ textAlign: 'center', width: 140 }}>
            <motion.div animate={reveal && ((i === 0 && reveal.r === -1) || (i === 1 && reveal.r === 1)) ? { x: [0, -8, 8, -5, 5, 0], filter: ['brightness(1)', 'brightness(2)', 'brightness(1)'] } : {}} transition={{ duration: 0.5, delay: 0.9 }}>
              <Portrait member={m} size={96} glow={!!reveal && ((i === 0 && reveal.r === 1) || (i === 1 && reveal.r === -1))} />
            </motion.div>
            <div className="row" style={{ justifyContent: 'center', gap: 6, marginTop: 6 }}>
              {Array.from({ length: WIN_AT }, (_, k) => (
                <span key={k} style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid var(--gold)', background: k < sc ? 'radial-gradient(circle at 40% 35%, #fff1c6, #e9c27a)' : 'transparent', boxShadow: k < sc ? '0 0 10px rgba(233,194,122,.8)' : undefined }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* the spell beams */}
      <div style={{ position: 'relative', height: 120, margin: '10px 0' }}>
        <AnimatePresence>
          {reveal && (
            <>
              <motion.div
                key="a"
                initial={{ width: 0 }}
                animate={{ width: `${beamCenter}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                style={{ position: 'absolute', left: 0, top: 54, height: 8, borderRadius: 4, background: `linear-gradient(90deg, transparent, ${SPELLS[reveal.a].color})`, boxShadow: `0 0 18px 4px ${SPELLS[reveal.a].glow}` }}
              />
              <motion.div
                key="b"
                initial={{ width: 0 }}
                animate={{ width: `${100 - beamCenter}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                style={{ position: 'absolute', right: 0, top: 54, height: 8, borderRadius: 4, background: `linear-gradient(270deg, transparent, ${SPELLS[reveal.b].color})`, boxShadow: `0 0 18px 4px ${SPELLS[reveal.b].glow}` }}
              />
              <motion.div
                key="c"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.6, 1], opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                style={{ position: 'absolute', left: `${beamCenter}%`, top: 58, width: 46, height: 46, margin: '-23px 0 0 -23px', borderRadius: '50%', background: 'radial-gradient(circle, #fff, rgba(255,240,200,.6) 40%, transparent 70%)' }}
              />
              <motion.p
                key="t"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="display"
                style={{ position: 'absolute', left: 0, right: 0, bottom: 0, textAlign: 'center', fontSize: 15, letterSpacing: '.12em', color: reveal.r === 1 ? 'var(--gold)' : reveal.r === -1 ? '#ff9aae' : 'var(--text-2)' }}
              >
                {reveal.r === 0 ? `Both cast ${SPELLS[reveal.a].name}! The spells cancel.` : reveal.r === 1 ? `${SPELLS[reveal.a].name} beats ${SPELLS[reveal.b].name}!` : `${opponent.name}’s ${SPELLS[reveal.b].name} wins this one.`}
              </motion.p>
            </>
          )}
        </AnimatePresence>
        {!reveal && !over && (
          <p className="display" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 14, letterSpacing: '.24em', color: 'var(--text-3)' }}>
            {gone ? `${opponent.name.toUpperCase()} LEFT THE HALL` : !ready ? `WAITING FOR ${opponent.name.toUpperCase()}…` : mine ? `${opponent.name.toUpperCase()} IS CASTING…` : `ROUND ${round} · CAST YOUR SPELL`}
          </p>
        )}
      </div>

      {over ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="stack" style={{ alignItems: 'center', textAlign: 'center' }}>
          <h2 className="display shimmer" style={{ fontSize: 30 }}>
            {score.me >= WIN_AT ? 'Victory!' : `${opponent.name} wins!`}
          </h2>
          <p className="muted">{opponent.live ? (score.me >= WIN_AT ? '+10 points for your house' : '+2 points for a brave duel') : 'Practice duel — no points this time.'}</p>
          <div className="row">
            {!opponent.live && (
              <button className="btn" onClick={rematch}>
                Rematch
              </button>
            )}
            <Link to="/games" className="btn ghost">
              Games Room
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="stack" style={{ gap: 10 }}>
          {ORDER.map((sp) => (
            <motion.button
              key={sp}
              whileTap={{ scale: 0.97 }}
              disabled={!!mine || !ready || gone}
              onClick={() => cast(sp)}
              className="panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                width: '100%',
                textAlign: 'left',
                cursor: mine ? 'default' : 'pointer',
                padding: '12px 16px',
                opacity: mine && mine !== sp ? 0.35 : 1,
                borderColor: mine === sp ? SPELLS[sp].color : 'rgba(233,194,122,.22)',
                boxShadow: mine === sp ? `0 0 24px ${SPELLS[sp].glow}` : undefined,
              }}
            >
              <SpellGlyph spell={sp} />
              <span style={{ flex: 1 }}>
                <span className="display" style={{ fontSize: 18, color: SPELLS[sp].color }}>
                  {SPELLS[sp].name}
                </span>
                <span className="faint" style={{ display: 'block', fontSize: 15 }}>
                  {SPELLS[sp].hint}
                </span>
              </span>
            </motion.button>
          ))}
        </div>
      )}
    </Page>
  )
}
