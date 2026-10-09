import { useEffect, useState } from 'react'
import { actions } from './store'

export const VAPID_PUBLIC = 'BAGAtb94Xu2vKxORo6edvrZaQVichlZQoYjMmzDi-GFDP1wEt-Qz12eGeADxU6lKtsV8ABLM96fe4D2K_JUQvT0'

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const isInstalled = () => window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true

export type PushState = 'unsupported' | 'install-first' | 'off' | 'on' | 'blocked'

export const pushState = (): PushState => {
  if (!('serviceWorker' in navigator)) return 'unsupported'
  // iPhones only allow notifications for apps added to the Home Screen.
  if (isIOS() && !isInstalled()) return 'install-first'
  if (!('PushManager' in window) || !('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'denied') return 'blocked'
  return Notification.permission === 'granted' && onFor().length ? 'on' : 'off'
}

const onFor = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('push-members') ?? '[]') as string[]
  } catch {
    return []
  }
}

export const registerWorker = () => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined)
}

const keyBytes = (b64: string) => {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4)
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

const idFor = async (endpoint: string) => {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint))
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 40)
}

/** Ask permission, subscribe this phone and remember who it belongs to. */
export const enablePush = async (member: string): Promise<PushState> => {
  const state = pushState()
  if (state === 'unsupported' || state === 'install-first') return state
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return perm === 'denied' ? 'blocked' : 'off'
  const reg = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready
  const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID_PUBLIC) }))
  const json = sub.toJSON()
  actions.savePushSub(await idFor(`${member} ${json.endpoint ?? ''}`), member, json)
  localStorage.setItem('push-members', JSON.stringify([...new Set([...onFor(), member])]))
  return 'on'
}

/** A shared phone that already allows notifications also gets them for whoever just picked their portrait. */
export const addPushMember = async (member: string) => {
  try {
    if (pushState() === 'on' && !onFor().includes(member)) await enablePush(member)
  } catch {
    /* ignore */
  }
}

export const usePush = () => {
  const [state, setState] = useState<PushState>('unsupported')
  useEffect(() => setState(pushState()), [])
  return [state, setState] as const
}
