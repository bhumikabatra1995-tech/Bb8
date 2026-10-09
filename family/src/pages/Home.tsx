import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Hourglass, OwlTileArt, SnitchArt } from '../components/Art'
import { CastleScene } from '../components/Castle'
import { Glyph, type GlyphName } from '../components/Glyphs'
import { FlyingOwl } from '../components/Atmosphere'
import { DEFAULT_LOOK, Figure } from '../components/Figure'
import { SceneArt } from '../components/SceneArt'
import { NotifyCard } from '../components/NotifyCard'
import { Page } from '../components/UI'
import { memberById } from '../data/family'
import { housePoints, itemsOf, nameOf, personalPoints, unreadFor, useStore } from '../state/store'
import type { Design } from './Atelier'

const greeting = () => {
  const h = new Date().getHours()
  return h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

function IconTile({ to, label, glyph, delay }: { to: string; label: string; glyph: GlyphName; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
      <Link to={to} className="glyph-tile">
        <Glyph name={glyph} size={42} />
        <span>{label}</span>
      </Link>
    </motion.div>
  )
}

function FeatureCard({ to, title, line, art, tint, delay }: { to: string; title: string; line: string; art: ReactNode; tint: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.6 }}>
      <Link to={to} className="art-card" style={{ height: 210, background: `radial-gradient(ellipse 70% 60% at 50% 35%, ${tint}, transparent 72%), var(--card)` }}>
        <div style={{ position: 'absolute', inset: '8px 0 64px', display: 'grid', placeItems: 'center' }}>{art}</div>
        <div className="art-shade" />
        <div style={{ position: 'absolute', left: 14, right: 14, bottom: 12 }}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 21 }}>{title}</div>
          <div className="faint" style={{ fontSize: 14 }}>
            {line}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function Home() {
  const s = useStore()
  const me = memberById(s.me)
  if (!me) return <Navigate to="/" replace />
  const unread = unreadFor(s, me.id)
  const mine = personalPoints(s, me.id)
  const p33 = housePoints(s, '33C')
  const p34 = housePoints(s, '34C')
  const lead = Math.max(p33, p34, 1)
  const myHouse = me.house === '33C' ? p33 : p34
  const latestDesign = itemsOf<Design>(s, 'design')[0]
  const drawingsToGuess = itemsOf<{ word: string }>(s, 'drawing').filter(
    (d) => d.by !== me.id && !s.items.some((g) => g.kind === 'guess' && g.by === me.id && (g.data as { drawingId?: string }).drawingId === d.id),
  ).length

  return (
    <Page candles={false}>
      {/* hero */}
      <section
        style={{
          position: 'relative',
          margin: 'calc(-14px - var(--safe-top)) -18px 0',
          height: 'calc(380px + var(--safe-top))',
          overflow: 'hidden',
          borderRadius: '0 0 28px 28px',
          background: '#0b0f26',
        }}
      >
        <div style={{ position: 'absolute', inset: 0 }}>
          <CastleScene height="100%" />
        </div>
        <SceneArt name="castle" fade={false} />
        <FlyingOwl top={130} duration={19} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 140, background: 'linear-gradient(180deg, transparent, #0b0f26)' }} />
        <div className="row between" style={{ position: 'absolute', left: 18, right: 18, top: 'calc(var(--safe-top) + 14px)' }}>
          <span className={`sync-pill ${s.sync}`}>
            <i />
            {s.pending ? `Saving ${s.pending}…` : s.sync === 'cloud' ? 'Connected' : s.sync === 'connecting' ? 'Connecting…' : s.sync === 'offline' ? 'Offline' : 'On this phone'}
          </span>
          <Link to="/" className="icon-btn" aria-label="Switch person">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 21V10a8 8 0 0 1 16 0v11M9 21v-6a3 3 0 0 1 6 0v6" />
            </svg>
          </Link>
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={{ position: 'absolute', left: 22, right: 22, bottom: 26 }}>
          <div className="row" style={{ gap: 8 }}>
            <Glyph name="star" size={14} />
            <span className="wordmark" style={{ fontSize: 15 }}>33C · 34C</span>
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 36, lineHeight: 1.08, marginTop: 6 }}>
            {greeting()},
            <br />
            <span className="shimmer">{me.name}</span>
          </h1>
          <Link to={unread.length ? `/owls/${unread[0].id}` : '/games'} className="btn small" style={{ marginTop: 14 }}>
            {unread.length ? `Open your owl from ${nameOf(unread[0].from)}` : 'Play a game'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </motion.div>
      </section>

      {s.syncError && (
        <p className="faint" style={{ fontSize: 13, marginTop: 10, textAlign: 'center' }}>
          Not saved yet, will keep trying · {s.syncError}
        </p>
      )}

      <NotifyCard member={me.id} />

      {/* points strip */}
      <Link to="/me" className="panel" style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18, textDecoration: 'none', color: 'var(--text)', padding: '12px 16px' }}>
        <Hourglass house={me.house} fill={myHouse / lead} size={28} />
        <div style={{ flex: 1 }}>
          <div className="display" style={{ fontSize: 22, color: 'var(--gold)' }}>
            {mine} <span style={{ fontSize: 12, letterSpacing: '.18em', color: 'var(--text-3)' }}>MY POINTS</span>
          </div>
          <div className="muted" style={{ fontSize: 15 }}>
            {me.house} has {myHouse} this month
          </div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" aria-hidden="true">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </Link>

      {/* owl hopping in with news */}
      {unread.length > 0 && (
        <Link to="/owls" className="panel" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, textDecoration: 'none', color: 'var(--text)', padding: '8px 14px', borderColor: 'rgba(240,199,126,.5)' }}>
          <div style={{ transform: 'scale(.62)', margin: '-14px -18px -10px' }}>
            <OwlTileArt hopping />
          </div>
          <div style={{ flex: 1 }}>
            <strong>
              {unread.length} new {unread.length === 1 ? 'owl' : 'owls'}
            </strong>
            <div className="faint" style={{ fontSize: 14 }}>
              from {[...new Set(unread.map((l) => nameOf(l.from)))].join(', ')}
            </div>
          </div>
        </Link>
      )}

      <div className="section-h">
        <h2>Tonight’s magic</h2>
      </div>
      <div className="grid-2">
        <FeatureCard
          to="/atelier"
          title="The Atelier"
          line={latestDesign ? `New: “${latestDesign.data.name}” by ${nameOf(latestDesign.by)}` : 'Design a gown, lehenga or robe'}
          tint="rgba(232,160,180,.28)"
          art={<Figure look={latestDesign?.data.look ?? DEFAULT_LOOK} width={92} />}
          delay={0.1}
        />
        <FeatureCard
          to="/games"
          title="Games Room"
          line={drawingsToGuess ? `${drawingsToGuess} drawing${drawingsToGuess > 1 ? 's' : ''} to guess` : 'Duels, Snitch Chase, Pictionary'}
          tint="rgba(255,210,120,.24)"
          art={<SnitchArt size={120} />}
          delay={0.18}
        />
      </div>

      <div className="section-h">
        <h2>Explore</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
        <IconTile to="/pensieve" label="Pensieve" glyph="pensieve" delay={0.2} />
        <IconTile to="/cup" label="House Cup" glyph="hourglass" delay={0.26} />
        <IconTile to="/calendar" label="Calendar" glyph="timeturner" delay={0.32} />
        <IconTile to="/map" label="Map" glyph="map" delay={0.38} />
      </div>
    </Page>
  )
}
