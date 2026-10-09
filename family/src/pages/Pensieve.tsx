import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { PensieveArt } from '../components/Art'
import { Empty, Page, TopBar, timeAgo } from '../components/UI'
import { memberById } from '../data/family'
import { actions, nameOf, useStore } from '../state/store'

export function PensieveList() {
  const s = useStore()
  const me = memberById(s.me)
  const [asking, setAsking] = useState(false)
  const [text, setText] = useState('')
  if (!me) return <Navigate to="/" replace />

  return (
    <Page art="pensieve">
      <TopBar title="The Pensieve" />
      <div style={{ display: 'grid', placeItems: 'center', marginTop: 4 }}>
        <PensieveArt size={140} />
      </div>
      <p className="italic muted" style={{ textAlign: 'center', marginTop: 4 }}>
        Ask the family a question. Everyone pours in a memory.
      </p>

      {asking ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="panel stack" style={{ marginTop: 18 }}>
          <label className="lbl" htmlFor="q">
            Your question
          </label>
          <textarea id="q" className="field" style={{ minHeight: 100 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="What was Delhi like when you were little?" />
          <div className="row">
            <button className="btn ghost small" onClick={() => setAsking(false)}>
              Cancel
            </button>
            <button
              className="btn small"
              style={{ flex: 1 }}
              disabled={!text.trim()}
              onClick={() => {
                actions.ask(me.id, text.trim())
                setText('')
                setAsking(false)
              }}
            >
              Drop it in
            </button>
          </div>
        </motion.div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <button className="btn" onClick={() => setAsking(true)}>
            Ask a question
          </button>
        </div>
      )}

      {s.questions.length === 0 ? (
        <Empty text="No memories yet. The first question is yours." />
      ) : (
        <ul className="stack" style={{ listStyle: 'none', padding: 0, margin: '24px 0 0' }}>
          {s.questions.map((q) => {
            const answers = s.answers.filter((a) => a.questionId === q.id)
            const mine = answers.some((a) => a.by === me.id)
            return (
              <li key={q.id}>
                <Link to={`/pensieve/${q.id}`} className="panel" style={{ display: 'block', textDecoration: 'none', color: 'var(--text)', borderColor: mine ? 'rgba(233,194,122,.22)' : 'rgba(170,195,255,.45)' }}>
                  <div className="faint" style={{ fontSize: 14 }}>
                    {nameOf(q.askedBy)} asked · {timeAgo(q.at)}
                  </div>
                  <div className="italic" style={{ fontSize: 21, lineHeight: 1.35, marginTop: 4 }}>
                    “{q.text}”
                  </div>
                  <div className="row between" style={{ marginTop: 10 }}>
                    <span className="muted" style={{ fontSize: 15 }}>
                      {answers.length} {answers.length === 1 ? 'memory' : 'memories'}
                    </span>
                    {!mine && (
                      <span className="display" style={{ fontSize: 12, letterSpacing: '.18em', color: '#b9c8f2' }}>
                        ADD YOURS
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Page>
  )
}

export function PensieveQuestion() {
  const { id } = useParams()
  const s = useStore()
  const me = memberById(s.me)
  const [text, setText] = useState('')
  const q = s.questions.find((x) => x.id === id)
  if (!me) return <Navigate to="/" replace />
  if (!q) return <Navigate to="/pensieve" replace />
  const answers = s.answers.filter((a) => a.questionId === q.id)
  const answered = answers.some((a) => a.by === me.id)

  return (
    <Page art="pensieve">
      <TopBar title="A memory" />
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <div className="faint">{nameOf(q.askedBy)} asked</div>
        <h2 className="italic" style={{ fontSize: 26, lineHeight: 1.3, fontWeight: 600, marginTop: 6 }}>
          “{q.text}”
        </h2>
      </div>

      {!answered && (
        <div className="panel stack" style={{ marginTop: 22, borderColor: 'rgba(170,195,255,.45)' }}>
          <label className="lbl" htmlFor="m">
            Your memory
          </label>
          <textarea id="m" className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder="I remember…" />
          <button
            className="btn"
            disabled={!text.trim()}
            onClick={() => {
              actions.answer(q.id, me.id, text.trim())
              setText('')
            }}
          >
            Pour it into the Pensieve
          </button>
          {answers.length > 0 && <p className="faint italic" style={{ textAlign: 'center' }}>Add yours to see the {answers.length} sealed {answers.length === 1 ? 'memory' : 'memories'}.</p>}
        </div>
      )}

      <ul className="stack" style={{ listStyle: 'none', padding: 0, margin: '22px 0 0' }}>
        {answers.map((a, i) => (
          <motion.li key={a.id} initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: answered ? 'blur(0px)' : 'blur(7px)' }} transition={{ delay: i * 0.12, duration: 0.8 }}>
            <div className="panel" style={{ background: 'linear-gradient(180deg, rgba(40,48,72,.7), rgba(16,16,26,.9))', borderColor: 'rgba(170,195,255,.3)' }}>
              <div className="display" style={{ fontSize: 13, letterSpacing: '.18em', color: '#b9c8f2' }}>
                {nameOf(a.by).toUpperCase()}
              </div>
              <p style={{ fontSize: 19, marginTop: 6, whiteSpace: 'pre-wrap' }} aria-hidden={!answered}>
                {answered ? a.text : 'This memory is sealed until you add your own.'}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>
    </Page>
  )
}
