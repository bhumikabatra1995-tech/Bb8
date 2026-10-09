import { motion } from 'framer-motion'
import { Navigate, useNavigate } from 'react-router-dom'
import { Crest, Hourglass, Portrait } from '../components/Art'
import { Empty, Page, TopBar, timeAgo } from '../components/UI'
import { memberById } from '../data/family'
import { actions, bestScores, duelRecord, housePoints, personalPoints, rankInHouse, useStore } from '../state/store'

const ordinal = (n: number) => `${n}${['th', 'st', 'nd', 'rd'][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10 < 4 ? n % 10 : 0]}`

export default function Profile() {
  const s = useStore()
  const nav = useNavigate()
  const me = memberById(s.me)
  if (!me) return <Navigate to="/" replace />
  const other = me.house === '33C' ? '34C' : '33C'
  const mine = personalPoints(s, me.id)
  const ours = housePoints(s, me.house)
  const theirs = housePoints(s, other)
  const lead = Math.max(ours, theirs, 1)
  const duel = duelRecord(s, me.id)
  const snitch = bestScores(s, 'snitch').find((x) => x.member === me.id)?.score ?? 0
  const log = s.points.filter((p) => p.member === me.id).slice(0, 12)

  return (
    <Page>
      <TopBar title="My card" />

      <motion.div
        initial={{ rotateY: -90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 0.8, 0.3, 1] }}
        style={{
          perspective: 900,
          margin: '10px auto 0',
          maxWidth: 330,
          borderRadius: 22,
          padding: 3,
          background: 'linear-gradient(135deg, #fff0c2, #d9ae5c 30%, #8e6f38 60%, #e9c27a)',
          boxShadow: '0 30px 60px -20px rgba(0,0,0,.9), 0 0 40px rgba(233,194,122,.18)',
        }}
      >
        <div
          style={{
            borderRadius: 19,
            padding: '22px 18px 18px',
            background:
              me.house === '33C'
                ? 'radial-gradient(ellipse at 50% 0%, #2f4aa0, #0c1336 70%)'
                : 'radial-gradient(ellipse at 50% 0%, #9a2640, #2a0710 70%)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <div className="eyebrow" style={{ color: '#e6cf9a' }}>
            Famous Witches &amp; Wizards
          </div>
          <Portrait member={me} size={150} glow />
          <div className="row" style={{ gap: 8, marginTop: 4 }}>
            <Crest house={me.house} size={26} />
            <span className="display" style={{ fontSize: 15, letterSpacing: '.2em', color: '#e6cf9a' }}>
              {me.house} · {me.city.toUpperCase()}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', width: '100%', marginTop: 14, borderTop: '1px solid rgba(233,194,122,.3)', paddingTop: 14 }}>
            {[
              [mine, 'points'],
              [mine ? ordinal(rankInHouse(s, me.id)) : '—', `in ${me.house}`],
              [`${duel.wins}`, 'duels won'],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="display" style={{ fontSize: 26, color: 'var(--gold)' }}>
                  {v}
                </div>
                <div style={{ fontSize: 14, color: '#d8c6a0' }}>{l}</div>
              </div>
            ))}
          </div>
          {snitch > 0 && (
            <div className="italic" style={{ fontSize: 16, color: '#e6cf9a', marginTop: 6 }}>
              Best Snitch Chase: {snitch} caught
            </div>
          )}
        </div>
      </motion.div>

      <section className="panel ornate" style={{ marginTop: 24 }}>
        <div className="row between">
          <h2 className="display" style={{ fontSize: 15, letterSpacing: '.16em', color: 'var(--gold)' }}>
            THE HOUSE CUP
          </h2>
          <span className="faint italic">this month</span>
        </div>
        <div className="row" style={{ justifyContent: 'space-around', marginTop: 14 }}>
          {([me.house, other] as const).map((h) => (
            <div key={h} style={{ textAlign: 'center' }}>
              <Hourglass house={h} fill={(h === me.house ? ours : theirs) / lead} size={64} />
              <div className="display" style={{ fontSize: 22, color: h === '33C' ? 'var(--h33-glow)' : 'var(--h34-glow)', marginTop: 6 }}>
                {h === me.house ? ours : theirs}
              </div>
              <div className="faint">{h === me.house ? `${h} · yours` : h}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel" style={{ marginTop: 18 }}>
        <h2 className="display" style={{ fontSize: 15, letterSpacing: '.16em', color: 'var(--gold)', marginBottom: 8 }}>
          POINTS EARNED
        </h2>
        {log.length === 0 ? (
          <Empty text="Send an owl, share a memory or win a duel to earn your first points." />
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {log.map((p) => (
              <li key={p.id} className="row between" style={{ padding: '10px 0', borderBottom: '1px solid rgba(233,194,122,.12)' }}>
                <span>
                  {p.reason}
                  <span className="faint" style={{ fontSize: 14 }}>
                    {' '}
                    · {timeAgo(p.at)}
                  </span>
                </span>
                <span className="display" style={{ color: 'var(--gold)' }}>
                  +{p.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div style={{ textAlign: 'center', marginTop: 22 }}>
        <button
          className="btn ghost small"
          onClick={() => {
            actions.choose(null)
            nav('/')
          }}
        >
          Not {me.name}? Switch person
        </button>
      </div>
    </Page>
  )
}
