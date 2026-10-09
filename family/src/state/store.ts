import { useSyncExternalStore } from 'react'
import { MEMBERS, memberById, type HouseId } from '../data/family'
import { remote } from './backend'

export type Recipient = string // a member id, a house id, or 'all'

export type Letter = { id: string; from: string; to: Recipient; body: string; howler: boolean; sentAt: number; readBy: string[] }
export type Question = { id: string; askedBy: string; text: string; at: number }
export type Answer = { id: string; questionId: string; by: string; text: string; at: number }
export type PointEntry = { id: string; member: string; amount: number; reason: string; at: number }
export type FamilyEvent = { id: string; title: string; date: string; addedBy: string }
export type Score = { id: string; game: string; member: string; score: number; at: number }
/** Turn-based game objects (drawings, guesses, quizzes, chess games…) share one table. */
export type Item<T = Record<string, unknown>> = { id: string; kind: string; by: string; data: T; at: number; updatedAt: number }
export type CheckIn = { id: string; member: string; place: string; lat: number; lon: number; note: string; at: number }

export type SyncStatus = 'device' | 'connecting' | 'cloud' | 'offline'

type State = {
  me: string | null
  letters: Letter[]
  questions: Question[]
  answers: Answer[]
  points: PointEntry[]
  events: FamilyEvent[]
  scores: Score[]
  checkins: CheckIn[]
  items: Item[]
  introSeen: string | null
  sync: SyncStatus
  syncError: string | null
  pending: number
}

const KEY = 'family-app-v2'

const empty: State = {
  me: null,
  letters: [],
  questions: [],
  answers: [],
  points: [],
  events: [],
  scores: [],
  checkins: [],
  items: [],
  introSeen: null,
  sync: remote ? 'connecting' : 'device',
  syncError: null,
  pending: 0,
}

const load = (): State => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...empty, ...JSON.parse(raw), sync: empty.sync }
  } catch {
    /* storage unavailable */
  }
  return empty
}

let state: State = load()
const listeners = new Set<() => void>()

const set = (patch: Partial<State> | ((s: State) => Partial<State>)) => {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) }
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota / private mode */
  }
  listeners.forEach((l) => l())
}

export const useStore = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
  )

export const getState = () => state

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => ((Math.random() * 16) | 0).toString(16))

// ---- cloud sync ------------------------------------------------------------

const ts = (v: string) => new Date(v).getTime()
const iso = (n: number) => new Date(n).toISOString()

/* eslint-disable @typescript-eslint/no-explicit-any */
const fromRow = {
  letters: (r: any): Letter => ({ id: r.id, from: r.from_id, to: r.to_id, body: r.body, howler: r.howler, sentAt: ts(r.sent_at), readBy: r.read_by ?? [] }),
  questions: (r: any): Question => ({ id: r.id, askedBy: r.asked_by, text: r.text, at: ts(r.created_at) }),
  answers: (r: any): Answer => ({ id: r.id, questionId: r.question_id, by: r.by_id, text: r.text, at: ts(r.created_at) }),
  points: (r: any): PointEntry => ({ id: r.id, member: r.member, amount: r.amount, reason: r.reason, at: ts(r.at) }),
  events: (r: any): FamilyEvent => ({ id: r.id, title: r.title, date: r.date, addedBy: r.added_by }),
  scores: (r: any): Score => ({ id: r.id, game: r.game, member: r.member, score: r.score, at: ts(r.at) }),
  items: (r: any): Item => ({ id: r.id, kind: r.kind, by: r.by_id, data: r.data ?? {}, at: ts(r.created_at), updatedAt: ts(r.updated_at) }),
  push_subs: (r: any) => ({ id: r.id as string }),
  checkins: (r: any): CheckIn => ({ id: r.id, member: r.member, place: r.place, lat: r.lat, lon: r.lon, note: r.note ?? '', at: ts(r.at) }),
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const syncChannel = remote?.channel('family-sync')

type Table = keyof typeof fromRow
type Op = { table: Table; op: 'insert' | 'update'; id: string; row: Record<string, unknown> }

// Saves wait in an outbox (kept on the phone) until the database confirms
// them, so nothing is lost to a bad signal or a closed app.
const OUTBOX = 'family-outbox-v1'
let outbox: Op[] = (() => {
  try {
    return JSON.parse(localStorage.getItem(OUTBOX) ?? '[]') as Op[]
  } catch {
    return []
  }
})()
const saveOutbox = () => {
  try {
    localStorage.setItem(OUTBOX, JSON.stringify(outbox))
  } catch {
    /* ignore */
  }
}

// Ids written from this phone recently: a refresh that raced the save must
// not make them disappear from the screen.
const recent = new Map<string, number>()
const RECENT_MS = 2 * 60 * 1000

let flushing: Promise<void> | null = null
const flush = (): Promise<void> => {
  if (!remote) return Promise.resolve()
  if (flushing) return flushing
  flushing = (async () => {
    let wrote = false
    while (outbox.length) {
      const o = outbox[0]
      const { error } =
        o.op === 'insert'
          ? await remote!.from(o.table).upsert(o.row, { onConflict: 'id' })
          : await remote!.from(o.table).update(o.row).eq('id', o.id)
      if (error) {
        console.warn(`Could not save to ${o.table}; will retry`, error)
        set({ sync: 'offline', syncError: `${o.table}: ${error.message}`, pending: outbox.length })
        break
      }
      outbox.shift()
      saveOutbox()
      wrote = true
    }
    if (!outbox.length) set({ syncError: null, pending: 0 })
    if (wrote) ping()
  })().finally(() => {
    flushing = null
  })
  return flushing
}

const pull = async () => {
  if (!remote) return
  await flush()
  const order = { letters: 'sent_at', questions: 'created_at', answers: 'created_at', points: 'at', events: 'date', scores: 'at', checkins: 'at', items: 'updated_at' } as const
  try {
    const results = await Promise.all(
      (Object.keys(order) as (keyof typeof order)[]).map(async (table) => {
        const { data, error } = await remote!.from(table).select('*').order(order[table], { ascending: table === 'events' }).limit(1000)
        if (error) throw error
        return [table, (data ?? []).map((r) => (fromRow[table] as (r: unknown) => { id: string })(r))] as const
      }),
    )
    const now = Date.now()
    for (const [id, t] of recent) if (now - t > RECENT_MS) recent.delete(id)
    const keep = new Set([...recent.keys(), ...outbox.map((o) => o.id)])
    set((s) => {
      const merged: Record<string, unknown> = { sync: outbox.length ? 'offline' : 'cloud', pending: outbox.length }
      for (const [table, server] of results) {
        const local = s[table] as { id: string }[]
        const serverIds = new Set(server.map((r) => r.id))
        const localById = new Map(local.map((l) => [l.id, l]))
        const mine = local.filter((l) => keep.has(l.id) && !serverIds.has(l.id))
        merged[table] = [...mine, ...server.map((r) => (keep.has(r.id) && localById.get(r.id)) || r)]
      }
      return merged as Partial<State>
    })
  } catch (err) {
    console.warn('Cloud sync failed, using what is saved on this phone', err)
    set({ sync: 'offline', syncError: err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err) })
  }
}

let pullTimer: ReturnType<typeof setTimeout> | undefined
const schedulePull = () => {
  clearTimeout(pullTimer)
  pullTimer = setTimeout(pull, 250)
}

/** Tell every other open phone to refresh. */
function ping() {
  syncChannel?.send({ type: 'broadcast', event: 'changed', payload: {} })
}

const write = (table: Table, row: Record<string, unknown>, op: 'insert' | 'update' = 'insert', id?: string) => {
  if (!remote) return
  const key = (id ?? row.id) as string
  recent.set(key, Date.now())
  const same = op === 'update' ? outbox.find((o) => o.table === table && o.id === key) : undefined
  if (same) same.row = { ...same.row, ...row }
  else outbox.push({ table, op, id: key, row })
  saveOutbox()
  set({ pending: outbox.length })
  flush()
}

export const startSync = () => {
  if (!remote || !syncChannel) return
  syncChannel.on('broadcast', { event: 'changed' }, schedulePull).subscribe()
  pull()
  setInterval(() => outbox.length && flush().then(schedulePull), 15000)
  window.addEventListener('online', schedulePull)
  window.addEventListener('focus', schedulePull)
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && schedulePull())
}

// ---- phone notifications ---------------------------------------------------

type Notice = { to: Recipient; title: string; body?: string; url?: string; tag?: string }

/** Ask the server to send a banner to the people concerned (never the sender). */
const notify = (from: string, n: Notice) => {
  if (!remote) return
  fetch('/api/notify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ from, ...n }) }).catch(() => undefined)
}

// ---- actions ---------------------------------------------------------------

const addPoints = (member: string, amount: number, reason: string) => {
  if (amount <= 0) return
  const p: PointEntry = { id: uid(), member, amount, reason, at: Date.now() }
  set((s) => ({ points: [p, ...s.points] }))
  write('points', { id: p.id, member, amount, reason, at: iso(p.at) })
}

export const POINTS = { owl: 2, answer: 5, question: 2, duelWin: 10, duelPlay: 2, snitchPerCatch: 1, snitchDailyCap: 15 }

export const actions = {
  choose(me: string | null) {
    set({ me })
  },
  markIntroSeen() {
    set({ introSeen: new Date().toDateString() })
  },
  sendOwl(from: string, to: Recipient, body: string, howler = false) {
    const l: Letter = { id: uid(), from, to, body, howler, sentAt: Date.now(), readBy: [from] }
    set((s) => ({ letters: [l, ...s.letters] }))
    write('letters', { id: l.id, from_id: from, to_id: to, body, howler, sent_at: iso(l.sentAt), read_by: l.readBy })
    addPoints(from, POINTS.owl, 'Sent an owl')
    notify(from, { to, title: howler ? `📣 A Howler from ${nameOf(from)}!` : `🦉 ${nameOf(from)} sent you an owl`, body: body.length > 90 ? `${body.slice(0, 90)}…` : body, url: `/owls/${l.id}`, tag: l.id })
  },
  markRead(letterId: string, me: string) {
    const l = state.letters.find((x) => x.id === letterId)
    if (!l || l.readBy.includes(me)) return
    const readBy = [...l.readBy, me]
    set((s) => ({ letters: s.letters.map((x) => (x.id === letterId ? { ...x, readBy } : x)) }))
    write('letters', { read_by: readBy }, 'update', letterId)
  },
  ask(by: string, text: string) {
    const q: Question = { id: uid(), askedBy: by, text, at: Date.now() }
    set((s) => ({ questions: [q, ...s.questions] }))
    write('questions', { id: q.id, asked_by: by, text, created_at: iso(q.at) })
    notify(by, { to: 'all', title: `✨ ${nameOf(by)} asked the Pensieve`, body: text, url: `/pensieve/${q.id}` })
    addPoints(by, POINTS.question, 'Asked the Pensieve a question')
  },
  answer(questionId: string, by: string, text: string) {
    const a: Answer = { id: uid(), questionId, by, text, at: Date.now() }
    set((s) => ({ answers: [...s.answers, a] }))
    write('answers', { id: a.id, question_id: questionId, by_id: by, text, created_at: iso(a.at) })
    addPoints(by, POINTS.answer, 'Shared a memory in the Pensieve')
  },
  addEvent(title: string, date: string, by: string) {
    const e: FamilyEvent = { id: uid(), title, date, addedBy: by }
    set((s) => ({ events: [...s.events, e].sort((a, b) => a.date.localeCompare(b.date)) }))
    write('events', { id: e.id, title, date, added_by: by })
  },
  recordScore(game: string, member: string, score: number) {
    const sc: Score = { id: uid(), game, member, score, at: Date.now() }
    set((s) => ({ scores: [sc, ...s.scores] }))
    write('scores', { id: sc.id, game, member, score, at: iso(sc.at) })
  },
  snitchGame(member: string, catches: number) {
    actions.recordScore('snitch', member, catches)
    const today = new Date().toDateString()
    const earned = state.points
      .filter((p) => p.member === member && p.reason.startsWith('Snitch Chase') && new Date(p.at).toDateString() === today)
      .reduce((n, p) => n + p.amount, 0)
    const room = Math.max(0, POINTS.snitchDailyCap - earned)
    addPoints(member, Math.min(room, catches * POINTS.snitchPerCatch), `Snitch Chase: ${catches} caught`)
  },
  checkIn(member: string, place: string, lat: number, lon: number, note: string) {
    const c: CheckIn = { id: uid(), member, place, lat, lon, note, at: Date.now() }
    set((s) => ({ checkins: [c, ...s.checkins] }))
    write('checkins', { id: c.id, member, place, lat, lon, note, at: iso(c.at) })
  },
  award(member: string, amount: number, reason: string) {
    addPoints(member, amount, reason)
  },
  addItem<T extends Record<string, unknown>>(kind: string, by: string, data: T): Item<T> {
    const now = Date.now()
    const it: Item<T> = { id: uid(), kind, by, data, at: now, updatedAt: now }
    set((s) => ({ items: [it as Item, ...s.items] }))
    write('items', { id: it.id, kind, by_id: by, data, created_at: iso(now), updated_at: iso(now) })
    const d = data as Record<string, unknown>
    if (kind === 'drawing') notify(by, { to: 'all', title: `🎨 ${nameOf(by)} drew something`, body: 'Can you guess what it is?', url: `/games/pictionary/${it.id}` })
    if (kind === 'design') notify(by, { to: 'all', title: `👗 ${nameOf(by)} designed “${String(d.name ?? 'a new look')}”`, body: 'See it on the runway', url: `/atelier/${it.id}` })
    return it
  },
  updateItem<T extends Record<string, unknown>>(id: string, data: T) {
    const now = Date.now()
    set((s) => ({ items: s.items.map((x) => (x.id === id ? { ...x, data, updatedAt: now } : x)) }))
    write('items', { data, updated_at: iso(now) }, 'update', id)
  },
  savePushSub(id: string, member: string, sub: PushSubscriptionJSON) {
    write('push_subs', { id, member, endpoint: sub.endpoint, keys: sub.keys }, 'insert', id)
  },
  challengeNotice(from: string, to: string) {
    notify(from, { to, title: `⚡ ${nameOf(from)} challenges you to a duel!`, body: 'Come to the duelling hall', url: '/games/duel' })
  },
  duelResult(member: string, opponent: string, won: boolean) {
    actions.recordScore('duel', member, won ? 1 : 0)
    addPoints(member, won ? POINTS.duelWin : POINTS.duelPlay, won ? `Won a wizard duel vs ${opponent}` : `Duelled ${opponent}`)
  },
}

// ---- derived helpers -------------------------------------------------------

export const isForMe = (l: Letter, me: string) => {
  const m = memberById(me)
  return l.to === 'all' || l.to === me || (m && l.to === m.house) || l.from === me
}

export const unreadFor = (s: State, me: string | null) =>
  me ? s.letters.filter((l) => isForMe(l, me) && l.from !== me && !l.readBy.includes(me)) : []

export const personalPoints = (s: State, member: string) =>
  s.points.filter((p) => p.member === member).reduce((n, p) => n + p.amount, 0)

const sameMonth = (at: number, ref: Date) => {
  const d = new Date(at)
  return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear()
}

export const housePoints = (s: State, house: HouseId, month = new Date()) => {
  const ids = new Set(MEMBERS.filter((m) => m.house === house).map((m) => m.id))
  return s.points.filter((p) => ids.has(p.member) && sameMonth(p.at, month)).reduce((n, p) => n + p.amount, 0)
}

export const memberMonthPoints = (s: State, member: string, month = new Date()) =>
  s.points.filter((p) => p.member === member && sameMonth(p.at, month)).reduce((n, p) => n + p.amount, 0)

export const rankInHouse = (s: State, member: string) => {
  const m = memberById(member)
  if (!m) return 0
  const scores = MEMBERS.filter((x) => x.house === m.house)
    .map((x) => ({ id: x.id, pts: personalPoints(s, x.id) }))
    .sort((a, b) => b.pts - a.pts)
  return scores.findIndex((x) => x.id === member) + 1
}

export const bestScores = (s: State, game: string) => {
  const best = new Map<string, number>()
  s.scores.filter((x) => x.game === game).forEach((x) => best.set(x.member, Math.max(best.get(x.member) ?? 0, x.score)))
  return [...best.entries()].map(([member, score]) => ({ member, score })).sort((a, b) => b.score - a.score)
}

export const duelRecord = (s: State, member: string) => {
  const games = s.scores.filter((x) => x.game === 'duel' && x.member === member)
  return { wins: games.filter((g) => g.score === 1).length, played: games.length }
}

export const nameOf = (id: string) => memberById(id)?.name ?? id

export const recipientName = (to: Recipient) =>
  to === 'all' ? 'Everyone' : to === '33C' || to === '34C' ? `All of ${to}` : nameOf(to)

export const itemsOf = <T,>(s: State, kind: string) => s.items.filter((i) => i.kind === kind) as unknown as Item<T>[]
