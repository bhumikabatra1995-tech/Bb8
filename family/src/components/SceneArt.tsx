import { useState } from 'react'

/**
 * A painted background plate (public/art/<name>.webp) behind a screen.
 * Live magic — candles, owls, light, sparkles — is layered on top in code.
 * Until a painting is added the screen falls back to its drawn backdrop.
 */
export function SceneArt({ name, height = '100%', fade = true }: { name: string; height?: number | string; fade?: boolean }) {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: 0, height, overflow: 'hidden', pointerEvents: 'none' }}>
      <img
        src={`/art/${name}.webp`}
        alt=""
        onError={() => setOk(false)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: '50% 30%',
          animation: 'kenburns 40s ease-in-out infinite alternate',
        }}
      />
      {fade && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(4,5,12,.15) 0%, rgba(4,5,12,0) 30%, rgba(10,8,7,.55) 70%, rgba(10,8,7,.95) 100%)',
          }}
        />
      )}
    </div>
  )
}
