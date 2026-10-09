import { Navigate } from 'react-router-dom'
import { Crest, Hourglass } from '../components/Art'
import { Page, TopBar } from '../components/UI'
import { memberById, membersOf } from '../data/family'
import { housePoints, memberMonthPoints, useStore } from '../state/store'

export default function Cup() {
  const s = useStore()
  const me = memberById(s.me)
  if (!me) return <Navigate to="/" replace />
  const p33 = housePoints(s, '33C')
  const p34 = housePoints(s, '34C')
  const lead = Math.max(p33, p34, 1)
  const leader = p33 === p34 ? null : p33 > p34 ? '33C' : '34C'
  const now = new Date()
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate()

  return (
    <Page art="great-hall">
      <TopBar title="House Cup" />
      <div style={{ textAlign: 'center' }}>
        <div className="eyebrow">{now.toLocaleDateString(undefined, { month: 'long' })} · {daysLeft} days left</div>
        <h2 className="display shimmer" style={{ fontSize: 26, marginTop: 6 }}>
          {leader ? `${leader} leads` : 'Neck and neck'}
        </h2>
      </div>

      <div className="row" style={{ justifyContent: 'space-around', marginTop: 24, alignItems: 'flex-end' }}>
        {(['33C', '34C'] as const).map((h) => (
          <div key={h} style={{ textAlign: 'center', filter: leader === h ? 'drop-shadow(0 0 24px rgba(233,194,122,.35))' : undefined }}>
            <Hourglass house={h} fill={(h === '33C' ? p33 : p34) / lead} size={110} />
            <div className="display" style={{ fontSize: 34, color: h === '33C' ? 'var(--h33-glow)' : 'var(--h34-glow)', marginTop: 8 }}>
              {h === '33C' ? p33 : p34}
            </div>
            <div className="row" style={{ justifyContent: 'center', gap: 6 }}>
              <Crest house={h} size={22} />
              <span className="display" style={{ letterSpacing: '.2em' }}>
                {h}
              </span>
            </div>
          </div>
        ))}
      </div>

      {(['33C', '34C'] as const).map((h) => (
        <section key={h} className="panel" style={{ marginTop: 22 }}>
          <h3 className="display" style={{ fontSize: 14, letterSpacing: '.2em', color: h === '33C' ? 'var(--h33-glow)' : 'var(--h34-glow)', marginBottom: 6 }}>
            {h} THIS MONTH
          </h3>
          {membersOf(h)
            .map((m) => ({ m, pts: memberMonthPoints(s, m.id) }))
            .sort((a, b) => b.pts - a.pts)
            .map(({ m, pts }) => (
              <div key={m.id} className="row between" style={{ padding: '8px 0', borderBottom: '1px solid rgba(233,194,122,.1)' }}>
                <span style={{ fontWeight: m.id === me.id ? 700 : 500 }}>{m.name}</span>
                <span className="display" style={{ color: 'var(--gold)' }}>
                  {pts}
                </span>
              </div>
            ))}
        </section>
      ))}

      <p className="faint italic" style={{ textAlign: 'center', marginTop: 18 }}>
        Owls +2 · Memories +5 · Questions +2 · Duel wins +10 · Snitches +1 each
      </p>
    </Page>
  )
}
