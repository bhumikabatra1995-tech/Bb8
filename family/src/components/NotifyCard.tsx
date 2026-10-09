import { useState } from 'react'
import { enablePush, usePush } from '../state/push'
import { Glyph } from './Glyphs'

/** Invites someone to switch on phone notifications, with iPhone guidance. */
export function NotifyCard({ member, compact = false }: { member: string; compact?: boolean }) {
  const [state, setState] = usePush()
  const [busy, setBusy] = useState(false)
  const [hidden, setHidden] = useState(() => !compact && localStorage.getItem('push-card-hidden') === '1')
  if (state === 'unsupported' || hidden || (state === 'on' && !compact)) return null

  const text =
    state === 'on'
      ? 'Notifications are on for this phone.'
      : state === 'install-first'
        ? 'To get banners on iPhone, first add the app: tap Share, then “Add to Home Screen”, and open it from the new icon.'
        : state === 'blocked'
          ? 'Notifications are blocked. Turn them on in Settings → Notifications → 33C & 34C.'
          : 'Get a banner when someone sends you an owl, draws, or designs something new.'

  return (
    <section className="panel" style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12, padding: '12px 14px' }}>
      <Glyph name="letter" size={34} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{state === 'on' ? 'Notifications' : 'Turn on notifications'}</div>
        <div className="faint" style={{ fontSize: 14 }}>
          {text}
        </div>
      </div>
      {state === 'off' && (
        <button
          className="btn small"
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            try {
              setState(await enablePush(member))
            } finally {
              setBusy(false)
            }
          }}
        >
          {busy ? '…' : 'Turn on'}
        </button>
      )}
      {!compact && state !== 'off' && (
        <button
          className="icon-btn"
          aria-label="Hide"
          onClick={() => {
            localStorage.setItem('push-card-hidden', '1')
            setHidden(true)
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
    </section>
  )
}
