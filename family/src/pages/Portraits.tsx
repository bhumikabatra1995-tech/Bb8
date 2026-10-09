import { motion } from 'framer-motion'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Crest, Portrait } from '../components/Art'
import { Page, TopBar } from '../components/UI'
import { membersOf, type HouseId } from '../data/family'
import { actions } from '../state/store'

export default function Portraits() {
  const { house = '34C' } = useParams()
  const id: HouseId = house === '33C' ? '33C' : '34C'
  const other: HouseId = id === '33C' ? '34C' : '33C'
  const nav = useNavigate()
  const people = membersOf(id)

  return (
    <Page art={`gallery-${id}`} candles>
      <TopBar title={id} back="/" />
      <div style={{ textAlign: 'center', marginTop: 6 }} className="stack">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Crest house={id} size={54} />
        </div>
        <h2 className="display shimmer" style={{ fontSize: 28 }}>
          Who’s coming in?
        </h2>
        <p className="italic muted">Tap your portrait.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '22px 10px', marginTop: 26, justifyItems: 'center' }}>
        {people.map((m, i) => (
          <motion.button
            key={m.id}
            type="button"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.6 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              actions.choose(m.id)
              nav('/home')
            }}
            aria-label={`I'm ${m.name}`}
            style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
          >
            <Portrait member={m} size={124} />
          </motion.button>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 30 }}>
        <Link to={`/house/${other}`} className="btn ghost small">
          Knock next door at {other}
        </Link>
      </div>
    </Page>
  )
}
