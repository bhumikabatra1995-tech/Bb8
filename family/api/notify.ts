/**
 * POST /api/notify — sends a phone notification to family members.
 * Body: { from, to, title, body, url, tag }  where `to` is a member id,
 * a house ('33C' | '34C') or 'all'. The sender is never notified.
 *
 * Needs VAPID_PRIVATE_KEY in Vercel (the public half lives in the app).
 */
import webpush from 'web-push'

const VAPID_PUBLIC = 'BAGAtb94Xu2vKxORo6edvrZaQVichlZQoYjMmzDi-GFDP1wEt-Qz12eGeADxU6lKtsV8ABLM96fe4D2K_JUQvT0'

const HOUSE: Record<string, string> = {
  bhumika: '33C', rachita: '33C', mom: '33C', dad: '33C',
  avika: '34C', avya: '34C', bhabhi: '34C', bhaiya: '34C', auntie: '34C', uncle: '34C',
}

const targets = (to: string) =>
  to === 'all' ? Object.keys(HOUSE) : to === '33C' || to === '34C' ? Object.keys(HOUSE).filter((m) => HOUSE[m] === to) : [to]

type Sub = { id: string; member: string; endpoint: string; keys: { p256dh: string; auth: string } }

export async function POST(request: Request) {
  const priv = process.env.VAPID_PRIVATE_KEY
  const url = process.env.VITE_SUPABASE_URL
  const anon = process.env.VITE_SUPABASE_ANON_KEY
  if (!priv || !url || !anon) return Response.json({ sent: 0, reason: 'not configured' })

  const msg = (await request.json()) as { from?: string; to?: string; title?: string; body?: string; url?: string; tag?: string }
  if (!msg.to || !msg.title) return Response.json({ error: 'to and title are required' }, { status: 400 })
  const who = new Set(targets(msg.to).filter((m) => m !== msg.from))
  if (!who.size) return Response.json({ sent: 0 })

  webpush.setVapidDetails('https://bb8-h294.vercel.app', VAPID_PUBLIC, priv)
  const headers = { apikey: anon, Authorization: `Bearer ${anon}` }
  const r = await fetch(`${url}/rest/v1/push_subs?select=*`, { headers })
  if (!r.ok) return Response.json({ error: `subscriptions: ${r.status}` }, { status: 502 })
  const subs = ((await r.json()) as Sub[]).filter((s) => who.has(s.member))

  const payload = JSON.stringify({ title: msg.title, body: msg.body ?? '', url: msg.url ?? '/home', tag: msg.tag })
  let sent = 0
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payload, { TTL: 60 * 60 * 24 })
        sent++
      } catch (err) {
        const code = (err as { statusCode?: number }).statusCode
        // The phone unsubscribed or reinstalled: forget that address.
        if (code === 404 || code === 410) await fetch(`${url}/rest/v1/push_subs?id=eq.${encodeURIComponent(s.id)}`, { method: 'DELETE', headers })
        else console.error('push failed', code, err)
      }
    }),
  )
  return Response.json({ sent })
}
