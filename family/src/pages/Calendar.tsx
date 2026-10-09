import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { CrystalBallArt, TimeTurnerArt } from '../components/Art'
import { Empty, Page, TopBar } from '../components/UI'
import { CITIES, memberById } from '../data/family'
import { actions, nameOf, useStore } from '../state/store'

type Item = { key: string; title: string; date: string; source: 'family' | 'google'; by?: string }

const daysUntil = (date: string) => {
  const [y, m, d] = date.split('-').map(Number)
  const t = new Date(y, m - 1, d).getTime()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((t - today.getTime()) / 864e5)
}

const pretty = (date: string) => {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long' })
}

const googleLink = (title: string, date: string) => {
  const start = date.replaceAll('-', '')
  const [y, m, d] = date.split('-').map(Number)
  const end = new Date(y, m - 1, d + 1)
  const endStr = `${end.getFullYear()}${String(end.getMonth() + 1).padStart(2, '0')}${String(end.getDate()).padStart(2, '0')}`
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${endStr}`
}

// ---- Divination: live weather from Open-Meteo (free, no key) ----

type Forecast = { city: string; now: number; hi: number; lo: number; code: number }

const prophecy = (code: number, city: string) => {
  if (code >= 95) return `Thunder rolls over ${city}. Stay by the fire.`
  if (code >= 71 && code <= 86) return `Snow will fall on ${city}, soft as owl feathers.`
  if (code >= 51 && code <= 82) return `I see… an umbrella in ${city}’s future.`
  if (code >= 45 && code <= 48) return `Mists gather over ${city}. Very mysterious.`
  if (code >= 1 && code <= 3) return `Clouds drift over ${city}, but the sun will peek through.`
  return `Clear skies over ${city}. A fine day for flying.`
}

function Divination() {
  const [data, setData] = useState<Forecast[] | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const lat = CITIES.map((c) => c.lat).join(',')
    const lon = CITIES.map((c) => c.lon).join(',')
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=2`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => {
        const list = Array.isArray(json) ? json : [json]
        setData(
          list.map((w, i) => ({
            city: CITIES[i].name,
            now: Math.round(w.current.temperature_2m),
            hi: Math.round(w.daily.temperature_2m_max[1]),
            lo: Math.round(w.daily.temperature_2m_min[1]),
            code: w.daily.weather_code[1],
          })),
        )
      })
      .catch(() => setFailed(true))
  }, [])

  const omen = data ? data.reduce((a, b) => (b.code > a.code ? b : a)) : null

  return (
    <section className="panel" style={{ marginTop: 22, background: 'linear-gradient(180deg, rgba(36,26,40,.85), rgba(18,13,22,.94))', borderColor: 'rgba(200,170,255,.28)' }}>
      <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
        <CrystalBallArt size={64} />
        <div style={{ flex: 1 }}>
          <h2 className="display" style={{ fontSize: 14, letterSpacing: '.2em', color: '#cdbdf2' }}>
            DIVINATION
          </h2>
          <p className="italic" style={{ color: '#d8ccee', marginTop: 4 }}>
            {failed ? 'The mists are too thick to see today.' : omen ? `“${prophecy(omen.code, omen.city)}”` : 'Gazing into the crystal ball…'}
          </p>
        </div>
      </div>
      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', textAlign: 'center', marginTop: 14 }}>
          {data.map((f) => (
            <div key={f.city}>
              <div className="display" style={{ fontSize: 26 }}>
                {f.now}°
              </div>
              <div style={{ fontSize: 15, color: '#b8aacb' }}>{f.city}</div>
              <div className="faint" style={{ fontSize: 13 }}>
                tomorrow {f.lo}–{f.hi}°
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default function Calendar() {
  const s = useStore()
  const me = memberById(s.me)
  const [google, setGoogle] = useState<Item[]>([])
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    fetch('/api/calendar')
      .then((r) => (r.ok ? r.json() : []))
      .then((list: { title: string; date: string; id: string }[]) =>
        setGoogle(Array.isArray(list) ? list.map((e) => ({ key: `g-${e.id}`, title: e.title, date: e.date, source: 'google' as const })) : []),
      )
      .catch(() => setGoogle([]))
  }, [])

  const items = useMemo(() => {
    const family: Item[] = s.events.map((e) => ({ key: e.id, title: e.title, date: e.date, source: 'family', by: e.addedBy }))
    return [...family, ...google].filter((e) => daysUntil(e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date))
  }, [s.events, google])

  if (!me) return <Navigate to="/" replace />
  const next = items[0]

  return (
    <Page art="clocktower">
      <TopBar title="Time-Turner" />

      {next ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
          <div style={{ display: 'grid', placeItems: 'center' }}>
            <TimeTurnerArt size={180} label={String(daysUntil(next.date))} />
          </div>
          <div className="eyebrow" style={{ marginTop: 6 }}>
            {daysUntil(next.date) === 0 ? 'Today!' : daysUntil(next.date) === 1 ? 'day until' : 'days until'}
          </div>
          <h2 className="display shimmer" style={{ fontSize: 28, marginTop: 4 }}>
            {next.title}
          </h2>
          <p className="muted italic">{pretty(next.date)}</p>
        </motion.div>
      ) : (
        <Empty art={<TimeTurnerArt size={150} />} text="Nothing on the Time-Turner yet. Add a birthday, a visit or a festival." />
      )}

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        {!adding && (
          <button className="btn" onClick={() => setAdding(true)}>
            Add a date
          </button>
        )}
      </div>

      {adding && (
        <div className="panel stack" style={{ marginTop: 16 }}>
          <div>
            <label className="lbl" htmlFor="et">
              What’s happening
            </label>
            <input id="et" className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Avika & Avya’s birthday" />
          </div>
          <div>
            <label className="lbl" htmlFor="ed">
              When
            </label>
            <input id="ed" className="field" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="row">
            <button className="btn ghost small" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button
              className="btn small"
              style={{ flex: 1 }}
              disabled={!title.trim() || !date}
              onClick={() => {
                actions.addEvent(title.trim(), date, me.id)
                setTitle('')
                setDate('')
                setAdding(false)
              }}
            >
              Add to the Time-Turner
            </button>
          </div>
        </div>
      )}

      {items.length > 1 && (
        <ul className="panel" style={{ listStyle: 'none', marginTop: 20, padding: '6px 16px' }}>
          {items.slice(1, 12).map((e) => (
            <li key={e.key} className="row between" style={{ padding: '12px 0', borderBottom: '1px solid rgba(233,194,122,.1)' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{e.title}</div>
                <div className="faint" style={{ fontSize: 15 }}>
                  {pretty(e.date)} · {e.source === 'google' ? 'Google Calendar' : `added by ${nameOf(e.by ?? '')}`}
                </div>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <span className="display" style={{ color: 'var(--gold)', fontSize: 20 }}>
                  {daysUntil(e.date)}
                  <span className="faint" style={{ fontSize: 12 }}>d</span>
                </span>
                {e.source === 'family' && (
                  <a className="icon-btn" href={googleLink(e.title, e.date)} target="_blank" rel="noreferrer" aria-label={`Add ${e.title} to Google Calendar`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5" />
                    </svg>
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Divination />
    </Page>
  )
}
