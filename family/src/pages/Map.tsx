import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Page, TopBar, timeAgo } from '../components/UI'
import { CITIES, memberById } from '../data/family'
import { actions, nameOf, useStore, type CheckIn } from '../state/store'

/** Latest check-in per person; people who never checked in sit at home. */
const whereabouts = (checkins: CheckIn[]) => {
  const latest = new Map<string, CheckIn>()
  checkins.forEach((c) => {
    const cur = latest.get(c.member)
    if (!cur || c.at > cur.at) latest.set(c.member, c)
  })
  return [...latest.values()]
}

export default function MapPage() {
  const s = useStore()
  const me = memberById(s.me)
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const layer = useRef<L.LayerGroup | null>(null)
  const [place, setPlace] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!el.current || map.current) return
    map.current = L.map(el.current, { zoomControl: false, attributionControl: true, worldCopyJump: true }).setView([38, -20], 1.6)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      subdomains: 'abcd',
      maxZoom: 12,
    }).addTo(map.current)
    layer.current = L.layerGroup().addTo(map.current)
    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  useEffect(() => {
    if (!layer.current) return
    layer.current.clearLayers()
    CITIES.forEach((c) =>
      L.marker([c.lat, c.lon], {
        icon: L.divIcon({ className: 'mm-home', html: `<span>${c.name}</span>`, iconSize: [0, 0] }),
      }).addTo(layer.current!),
    )
    whereabouts(s.checkins).forEach((c) =>
      L.marker([c.lat, c.lon], {
        icon: L.divIcon({ className: 'mm-person', html: `<i></i><i></i><i></i><b>${nameOf(c.member)}</b>`, iconSize: [0, 0] }),
      })
        .bindPopup(`<strong>${nameOf(c.member)}</strong> · ${c.place}<br/>${c.note ? `“${c.note.replace(/</g, '&lt;')}”<br/>` : ''}<small>${timeAgo(c.at)}</small>`)
        .addTo(layer.current!),
    )
  }, [s.checkins])

  if (!me) return <Navigate to="/" replace />

  const checkIn = async () => {
    setBusy(true)
    setError('')
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?count=1&name=${encodeURIComponent(place.trim())}`)
      const json = await r.json()
      const hit = json.results?.[0]
      if (!hit) throw new Error('not found')
      const label = [hit.name, hit.country].filter(Boolean).join(', ')
      actions.checkIn(me.id, label, hit.latitude, hit.longitude, note.trim())
      map.current?.flyTo([hit.latitude, hit.longitude], 5, { duration: 2 })
      setPlace('')
      setNote('')
    } catch {
      setError('The map couldn’t find that place. Try a city name.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page candles={false}>
      <TopBar title="The Marauder’s Map" />
      <p className="italic muted" style={{ textAlign: 'center' }}>
        I solemnly swear that I am up to no good.
      </p>
      <div className="mm-frame" style={{ marginTop: 14 }}>
        <div ref={el} style={{ height: 380 }} />
      </div>

      <div className="panel stack" style={{ marginTop: 18 }}>
        <label className="lbl" htmlFor="pl">
          Where are you?
        </label>
        <input id="pl" className="field" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Central Park, New York" />
        <input className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What are you up to? (optional)" aria-label="What are you up to?" />
        {error && <p style={{ color: '#ff9aae' }}>{error}</p>}
        <button className="btn" disabled={!place.trim() || busy} onClick={checkIn}>
          {busy ? 'Finding you…' : 'Leave my footprints here'}
        </button>
        <p className="faint" style={{ fontSize: 14, textAlign: 'center' }}>
          The map only shows places people choose to share. Nobody is tracked.
        </p>
      </div>
    </Page>
  )
}
