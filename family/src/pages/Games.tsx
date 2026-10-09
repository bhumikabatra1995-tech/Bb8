import { motion } from 'framer-motion'
import { Link, Navigate } from 'react-router-dom'
import { SnitchArt } from '../components/Art'
import { Page, TopBar } from '../components/UI'
import { MEMBERS, memberById } from '../data/family'
import { bestScores, duelRecord, nameOf, useStore } from '../state/store'

export function WandsArt() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="beamR" x1="0" x2="1">
          <stop offset="0" stopColor="#ff5a5a" stopOpacity="0" />
          <stop offset="1" stopColor="#ffd0d0" />
        </linearGradient>
        <linearGradient id="beamB" x1="1" x2="0">
          <stop offset="0" stopColor="#5a8cff" stopOpacity="0" />
          <stop offset="1" stopColor="#d6e4ff" />
        </linearGradient>
      </defs>
      <path d="M6 70 L40 44" stroke="#5a3a22" strokeWidth="4" strokeLinecap="round" />
      <path d="M114 70 L80 44" stroke="#3a2a1e" strokeWidth="4" strokeLinecap="round" />
      <path d="M40 44 L60 36" stroke="url(#beamR)" strokeWidth="4" strokeLinecap="round" style={{ animation: 'glowp .5s ease-in-out infinite' }} />
      <path d="M80 44 L60 36" stroke="url(#beamB)" strokeWidth="4" strokeLinecap="round" style={{ animation: 'glowp .6s ease-in-out infinite' }} />
      <circle cx="60" cy="36" r="9" fill="#fff4e0" style={{ filter: 'drop-shadow(0 0 10px #ffd38a)', animation: 'glowp .3s ease-in-out infinite' }} />
    </svg>
  )
}

function PaletteArt() {
  return (
    <svg width="110" height="90" viewBox="0 0 110 90" aria-hidden="true">
      <path d="M55 8 C90 8 104 30 100 48 C96 64 80 58 74 66 C68 74 78 84 62 84 C30 86 8 66 10 44 C12 22 30 8 55 8 Z" fill="#E7D3A6" stroke="#8A6A42" strokeWidth="1.5" />
      <circle cx="34" cy="34" r="7" fill="#f0c77e" />
      <circle cx="56" cy="24" r="7" fill="#ff6b7f" />
      <circle cx="78" cy="32" r="7" fill="#7fa8ff" />
      <circle cx="30" cy="56" r="7" fill="#7fd6a0" />
      <circle cx="52" cy="66" r="6" fill="#8E6FD8" />
      <path d="M70 70 L100 20" stroke="#5a3a22" strokeWidth="4" strokeLinecap="round" />
      <path d="M100 20 L104 12" stroke="#f0c77e" strokeWidth="4" strokeLinecap="round" style={{ animation: 'glowp 1.4s ease-in-out infinite' }} />
    </svg>
  )
}

function GameCard({ to, title, line, art, tint, delay }: { to: string; title: string; line: string; art: React.ReactNode; tint: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.6 }}>
      <Link
        to={to}
        className="panel ornate"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          minHeight: 150,
          textDecoration: 'none',
          color: 'var(--text)',
          background: `radial-gradient(ellipse 60% 80% at 20% 50%, ${tint}, transparent 70%), linear-gradient(180deg, rgba(43,35,29,.85), rgba(14,11,9,.94))`,
        }}
      >
        <div style={{ width: 120, display: 'grid', placeItems: 'center', flex: 'none' }}>{art}</div>
        <div style={{ flex: 1 }}>
          <h2 className="display" style={{ fontSize: 20, color: 'var(--gold)' }}>
            {title}
          </h2>
          <p className="muted" style={{ fontSize: 17, marginTop: 4 }}>
            {line}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

export default function Games() {
  const s = useStore()
  const me = memberById(s.me)
  if (!me) return <Navigate to="/" replace />
  const snitch = bestScores(s, 'snitch').slice(0, 5)
  const duelists = MEMBERS.map((m) => ({ m, ...duelRecord(s, m.id) }))
    .filter((d) => d.played > 0)
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 5)

  return (
    <Page art="quidditch">
      <TopBar title="Games Room" back="/home" />
      <div className="section-h" style={{ marginTop: 8 }}>
        <h2>Play live</h2>
      </div>
      <div className="stack">
        <GameCard to="/games/duel" title="Wizard Duel" line="Challenge anyone, live from anywhere. Best of five spells." art={<WandsArt />} tint="rgba(255,90,90,.2)" delay={0.05} />
        <GameCard to="/games/snitch" title="Snitch Chase" line="30 seconds. Catch the Golden Snitch. Dodge the Bludger." art={<SnitchArt size={110} />} tint="rgba(255,210,110,.22)" delay={0.15} />
      </div>

      <div className="section-h">
        <h2>Play anytime</h2>
      </div>
      <GameCard to="/games/pictionary" title="Owl Pictionary" line="Draw a secret word. Everyone guesses when they’re free." art={<PaletteArt />} tint="rgba(127,168,255,.22)" delay={0.25} />

      <div className="grid-2" style={{ marginTop: 22, alignItems: 'start' }}>
        <section className="panel" style={{ padding: 14 }}>
          <h3 className="display" style={{ fontSize: 12, letterSpacing: '.2em', color: 'var(--gold)' }}>
            BEST SEEKERS
          </h3>
          {snitch.length === 0 ? (
            <p className="faint italic" style={{ fontSize: 15, marginTop: 6 }}>
              No catches yet
            </p>
          ) : (
            snitch.map((x, i) => (
              <div key={x.member} className="row between" style={{ fontSize: 16, padding: '5px 0' }}>
                <span>
                  {i + 1}. {nameOf(x.member)}
                </span>
                <span className="display" style={{ color: 'var(--gold)' }}>
                  {x.score}
                </span>
              </div>
            ))
          )}
        </section>
        <section className="panel" style={{ padding: 14 }}>
          <h3 className="display" style={{ fontSize: 12, letterSpacing: '.2em', color: 'var(--gold)' }}>
            DUEL CHAMPIONS
          </h3>
          {duelists.length === 0 ? (
            <p className="faint italic" style={{ fontSize: 15, marginTop: 6 }}>
              No duels yet
            </p>
          ) : (
            duelists.map((d, i) => (
              <div key={d.m.id} className="row between" style={{ fontSize: 16, padding: '5px 0' }}>
                <span>
                  {i + 1}. {d.m.name}
                </span>
                <span className="display" style={{ color: 'var(--gold)' }}>
                  {d.wins}
                </span>
              </div>
            ))
          )}
        </section>
      </div>
    </Page>
  )
}
