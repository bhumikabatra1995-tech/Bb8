import { useId, type ReactNode } from 'react'

export type GlyphName = 'letter' | 'pensieve' | 'hourglass' | 'timeturner' | 'map' | 'dress' | 'snitch' | 'wand' | 'crest' | 'palette' | 'heart' | 'star' | 'quill'

const PATHS: Record<GlyphName, (g: string, deep: string) => ReactNode> = {
  letter: (g, deep) => (
    <>
      <rect x="7" y="13" width="34" height="23" rx="3" fill={g} />
      <path d="M8 15 L24 27 L40 15" stroke={deep} strokeWidth="1.6" fill="none" />
      <circle cx="24" cy="27" r="5" fill="#a3253a" />
      <circle cx="24" cy="27" r="3" fill="none" stroke="#e05a6e" strokeWidth=".8" />
      <path d="M13 10 Q24 3 35 10" stroke={g} strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </>
  ),
  pensieve: (g, deep) => (
    <>
      <path d="M9 22 Q24 30 39 22 L35 31 Q24 37 13 31 Z" fill={g} />
      <ellipse cx="24" cy="22" rx="15" ry="4" fill={deep} />
      <path d="M17 21 Q24 16 30 20 Q26 24 21 22" stroke="#cfe0ff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M20 34 H28 L30 42 H18 Z" fill={g} />
      <path d="M24 16 Q22 11 25 7 M28 15 Q30 11 28 8" stroke="#cfe0ff" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity=".8" />
    </>
  ),
  hourglass: (g, deep) => (
    <>
      <rect x="11" y="5" width="26" height="4" rx="1.5" fill={g} />
      <rect x="11" y="39" width="26" height="4" rx="1.5" fill={g} />
      <path d="M15 9 H33 Q33 20 25 24 Q33 28 33 39 H15 Q15 28 23 24 Q15 20 15 9 Z" fill="none" stroke={g} strokeWidth="1.8" />
      <path d="M17 36 Q24 30 31 36 V38 H17 Z" fill="#e05a6e" />
      <path d="M18 13 H30 Q28 18 24 20 Q20 18 18 13 Z" fill="#7fa8ff" />
      <circle cx="24" cy="27" r=".9" fill={deep} />
    </>
  ),
  timeturner: (g, deep) => (
    <>
      <circle cx="24" cy="24" r="17" fill="none" stroke={g} strokeWidth="2" strokeDasharray="2 2.6" />
      <circle cx="24" cy="24" r="12" fill="none" stroke={g} strokeWidth="2.4" />
      <path d="M19 17 H29 L24 24 L29 31 H19 L24 24 Z" fill={g} stroke={deep} strokeWidth=".6" />
      <circle cx="24" cy="6" r="2.2" fill={g} />
    </>
  ),
  map: (g, deep) => (
    <>
      <path d="M6 12 L17 8 L31 12 L42 8 V36 L31 40 L17 36 L6 40 Z" fill={g} />
      <path d="M17 8 V36 M31 12 V40" stroke={deep} strokeWidth="1" />
      <path d="M10 30 Q16 22 22 26 T36 18" stroke={deep} strokeWidth="1.3" strokeDasharray="1.6 2" fill="none" />
      <circle cx="36" cy="18" r="2.4" fill="#a3253a" />
    </>
  ),
  dress: (g, deep) => (
    <>
      <path d="M19 5 Q24 9 29 5 L31 16 Q27 19 28 22 L39 42 Q24 46 9 42 L20 22 Q21 19 17 16 Z" fill={g} />
      <path d="M18 20 Q24 23 30 20" stroke={deep} strokeWidth="1.4" fill="none" />
      <path d="M24 24 L18 41 M24 24 L30 41 M24 24 V43" stroke={deep} strokeWidth=".8" opacity=".5" />
      <circle cx="24" cy="12" r="1.4" fill={deep} />
    </>
  ),
  snitch: (g, deep) => (
    <>
      <path d="M19 22 Q10 10 2 14 Q8 17 9 20 Q4 22 3 26 Q11 27 19 25 Z" fill="#f4ecd8" opacity=".95" />
      <path d="M29 22 Q38 10 46 14 Q40 17 39 20 Q44 22 45 26 Q37 27 29 25 Z" fill="#f4ecd8" opacity=".95" />
      <circle cx="24" cy="24" r="7" fill={g} />
      <path d="M17.5 24 Q24 28 30.5 24 M24 17 V31" stroke={deep} strokeWidth=".9" fill="none" />
      <circle cx="21.6" cy="21.4" r="2" fill="#fff6dc" opacity=".8" />
    </>
  ),
  wand: (g) => (
    <>
      <path d="M9 40 L33 16" stroke={g} strokeWidth="4" strokeLinecap="round" />
      <path d="M33 16 L37 12" stroke="#fff3cf" strokeWidth="4" strokeLinecap="round" />
      <path d="M38 4 L39.6 8.4 L44 10 L39.6 11.6 L38 16 L36.4 11.6 L32 10 L36.4 8.4 Z" fill="#fff3cf" />
      <circle cx="44" cy="20" r="1.4" fill="#fff3cf" />
      <circle cx="28" cy="6" r="1" fill="#fff3cf" />
    </>
  ),
  crest: (g, deep) => (
    <>
      <path d="M8 6 H40 V22 Q40 37 24 44 Q8 37 8 22 Z" fill={g} />
      <path d="M12 10 H36 V22 Q36 33 24 39 Q12 33 12 22 Z" fill={deep} />
      <path d="M24 14 L26.4 21 L33 21.6 L28 26 L29.6 32.6 L24 29 L18.4 32.6 L20 26 L15 21.6 L21.6 21 Z" fill={g} />
    </>
  ),
  palette: (g, deep) => (
    <>
      <path d="M24 6 C38 6 44 15 42 23 C40 30 33 27 31 31 C29 35 33 40 26 41 C13 42 5 33 6 23 C7 13 14 6 24 6 Z" fill={g} />
      <circle cx="16" cy="18" r="3" fill="#e05a6e" />
      <circle cx="25" cy="13" r="3" fill="#7fa8ff" />
      <circle cx="34" cy="17" r="3" fill="#7fd6a0" />
      <circle cx="14" cy="28" r="3" fill={deep} />
    </>
  ),
  heart: (g) => <path d="M24 41 C10 31 5 23 8 16 C11 9 20 9 24 16 C28 9 37 9 40 16 C43 23 38 31 24 41 Z" fill={g} />,
  star: (g) => <path d="M24 4 L28.6 18 L43 19 L31.6 28 L35.6 42 L24 33.8 L12.4 42 L16.4 28 L5 19 L19.4 18 Z" fill={g} />,
  quill: (g, deep) => (
    <>
      <path d="M38 5 C24 8 14 20 12 36 C20 30 30 22 38 5 Z" fill={g} />
      <path d="M38 5 L14 34" stroke={deep} strokeWidth="1" />
      <path d="M12 36 L8 44" stroke={g} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
}

/** A glowing gold emblem, like enamel-and-gold app iconography. */
export function Glyph({ name, size = 40 }: { name: GlyphName; size?: number }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2=".7" y2="1">
          <stop offset="0" stopColor="#fff3cf" />
          <stop offset=".4" stopColor="#f0c77e" />
          <stop offset="1" stopColor="#a8742a" />
        </linearGradient>
      </defs>
      {PATHS[name](`url(#g-${id})`, '#1a1a3e')}
    </svg>
  )
}
