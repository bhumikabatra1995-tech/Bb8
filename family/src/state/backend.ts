import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Cloud sync is optional. With VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY set
 * and a family key present, everything is stored in Supabase and shared by
 * every phone. Without them the app still works, saving to this device only.
 *
 * The family key is never baked into the code: it arrives once through the
 * join link (…/?key=XXXX), is remembered on the device, and is sent as the
 * `x-family-key` header that the database's row-level security checks.
 */
const KEY_STORE = 'family-key'

const readFamilyKey = (): string | null => {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('key')
    if (fromUrl) {
      localStorage.setItem(KEY_STORE, fromUrl)
      const clean = new URL(window.location.href)
      clean.searchParams.delete('key')
      window.history.replaceState(null, '', clean.toString())
      return fromUrl
    }
    return localStorage.getItem(KEY_STORE) ?? import.meta.env.VITE_FAMILY_KEY ?? null
  } catch {
    return import.meta.env.VITE_FAMILY_KEY ?? null
  }
}

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const familyKey = readFamilyKey()

export const cloudConfigured = Boolean(url && anon)
export const hasFamilyKey = Boolean(familyKey)

export const remote: SupabaseClient | null =
  url && anon && familyKey
    ? createClient(url, anon, {
        global: { headers: { 'x-family-key': familyKey } },
        auth: { persistSession: false },
      })
    : null
