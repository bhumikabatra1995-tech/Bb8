import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { memberById } from '../data/family'
import { itemsOf, unreadFor, useStore } from '../state/store'
import { Candles, Grain, HALL_CANDLES, Stars } from './Atmosphere'
import { SceneArt } from './SceneArt'

export function Page({ children, candles = true, className = '', art }: { children: ReactNode; candles?: boolean; className?: string; art?: string }) {
  const s = useStore()
  const me = memberById(s.me)
  const tabs = useShowTabs()
  return (
    <motion.div
      className={`screen ${me ? `house-${me.house}` : ''} ${tabs ? 'with-tabs' : ''} ${className}`}
      initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
      transition={{ duration: 0.45, ease: [0.22, 0.8, 0.3, 1] }}
    >
      <div className="backdrop hall">
        <Stars count={22} height={260} />
        {art && <SceneArt name={art} height="62vh" />}
        {candles && <Candles items={HALL_CANDLES} />}
      </div>
      <Grain />
      {children}
    </motion.div>
  )
}

export function TopBar({ title, back = '/home', right }: { title: string; back?: string | null; right?: ReactNode }) {
  const nav = useNavigate()
  return (
    <header className="topbar">
      {back !== null ? (
        <button className="icon-btn" aria-label="Back" onClick={() => (window.history.length > 2 ? nav(-1) : nav(back))}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
      ) : (
        <span className="spacer-44" />
      )}
      <h1 className="title">{title}</h1>
      {right ?? <span className="spacer-44" />}
    </header>
  )
}

export function MeButton() {
  const s = useStore()
  const me = memberById(s.me)
  if (!me) return <span className="spacer-44" />
  return (
    <Link
      to="/me"
      className="icon-btn"
      aria-label={`${me.name}'s profile`}
      style={{
        background: me.house === '33C' ? 'radial-gradient(circle at 50% 35%, #2f4aa0, #0e1640)' : 'radial-gradient(circle at 50% 35%, #9a2640, #3a0a16)',
        borderColor: 'var(--gold)',
        fontFamily: 'var(--display)',
        fontWeight: 700,
        fontSize: 17,
      }}
    >
      {me.name[0]}
    </Link>
  )
}

export function Empty({ art, text, children }: { art?: ReactNode; text: string; children?: ReactNode }) {
  return (
    <div className="empty">
      {art}
      <p>{text}</p>
      {children}
    </div>
  )
}

export const timeAgo = (t: number) => {
  const s = Math.round((Date.now() - t) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  const d = Math.floor(s / 86400)
  return d === 1 ? 'yesterday' : d < 7 ? `${d} days ago` : new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

const TABBED = /^\/(home|games|games\/pictionary|atelier|owls|me|pensieve|cup|calendar|map)\/?$/

export const useShowTabs = () => {
  const { pathname } = useLocation()
  const s = useStore()
  return !!s.me && TABBED.test(pathname)
}

const Icon = ({ d }: { d: string }) => (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
)

export function TabBar() {
  const s = useStore()
  const show = useShowTabs()
  if (!show || !s.me) return null
  const unread = unreadFor(s, s.me).length
  const toGuess = itemsOf<{ word: string }>(s, 'drawing').filter(
    (d) => d.by !== s.me && !s.items.some((g) => g.kind === 'guess' && g.by === s.me && (g.data as { drawingId?: string }).drawingId === d.id),
  ).length
  const tabs = [
    { to: '/home', label: 'Home', d: 'M3 21h18M5 21V10a7 7 0 0 1 14 0v11M9 21v-6a3 3 0 0 1 6 0v6', dot: false },
    { to: '/games', label: 'Games', d: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM8.5 11C6 8 3 8 2 9c2 1 3 2 3 3M15.5 11c2.5-3 5.5-3 6.5-2-2 1-3 2-3 3', dot: toGuess > 0 },
    { to: '/atelier', label: 'Atelier', d: 'M9 3l3 3 3-3M9 3c-1 3-3 4-3 7l2 1-3 10h14l-3-10 2-1c0-3-2-4-3-7', dot: false },
    { to: '/owls', label: 'Owl Post', d: 'M3 6h18v13H3zM3 7.5l9 6 9-6', dot: unread > 0 },
    { to: '/me', label: 'Me', d: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0', dot: false },
  ]
  return (
    <nav className="tabbar" aria-label="Main">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} className={({ isActive }) => (isActive ? 'active' : '')}>
          <Icon d={t.d} />
          {t.label}
          {t.dot && <span className="dot" aria-label="new" />}
        </NavLink>
      ))}
    </nav>
  )
}
