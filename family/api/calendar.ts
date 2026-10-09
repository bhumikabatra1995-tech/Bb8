/**
 * GET /api/calendar — upcoming events from the family's Google Calendar.
 *
 * Set GOOGLE_CALENDAR_ICS_URL in Vercel to the calendar's *secret address in
 * iCal format* (Google Calendar → Settings → your family calendar →
 * "Secret address in iCal format"). The address stays on the server, so the
 * calendar itself remains private.
 */
type Ev = { id: string; title: string; date: string }

const unfold = (ics: string) => ics.replace(/\r?\n[ \t]/g, '')

const toDate = (v: string) => `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`

const parse = (ics: string): Ev[] => {
  const today = new Date().toISOString().slice(0, 10)
  const horizon = new Date(Date.now() + 366 * 864e5).toISOString().slice(0, 10)
  const out: Ev[] = []
  for (const block of unfold(ics).split('BEGIN:VEVENT').slice(1)) {
    const field = (name: string) => block.match(new RegExp(`^${name}[^:\\n]*:(.*)$`, 'm'))?.[1]?.trim()
    const start = field('DTSTART')
    const title = field('SUMMARY')?.replace(/\\,/g, ',').replace(/\;/g, ';').replace(/\\n/g, ' ')
    if (!start || !title || field('STATUS') === 'CANCELLED') continue
    let date = toDate(start)
    // Birthdays and anniversaries repeat yearly: move them to the next one.
    if (/FREQ=YEARLY/.test(field('RRULE') ?? '')) {
      const year = Number(today.slice(0, 4))
      date = `${year}${date.slice(4)}`
      if (date < today) date = `${year + 1}${date.slice(4)}`
    }
    if (date >= today && date <= horizon) out.push({ id: field('UID') ?? `${title}-${date}`, title, date })
  }
  return out.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 60)
}

export async function GET() {
  const url = process.env.GOOGLE_CALENDAR_ICS_URL
  if (!url) return Response.json([], { headers: { 'cache-control': 'no-store' } })
  try {
    const r = await fetch(url)
    if (!r.ok) throw new Error(`calendar responded ${r.status}`)
    return Response.json(parse(await r.text()), { headers: { 'cache-control': 's-maxage=600, stale-while-revalidate=3600' } })
  } catch (err) {
    console.error(err)
    return Response.json([], { status: 502 })
  }
}
