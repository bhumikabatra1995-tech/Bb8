import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Candles, FlyingOwl, Fog, Grain, Moon, MoonRays, Motes, Stars } from '../components/Atmosphere'
import { House } from '../components/House'
import { SceneArt } from '../components/SceneArt'
import type { HouseId } from '../data/family'
import { actions, useStore } from '../state/store'

const SKY_CANDLES = [
  { x: '9%', y: 236, s: 0.85, d: 0 },
  { x: '27%', y: 290, s: 0.55, d: 1.2 },
  { x: '47%', y: 214, s: 0.45, d: 0.6 },
  { x: '68%', y: 270, s: 0.75, d: 1.9 },
  { x: '86%', y: 226, s: 0.5, d: 0.9 },
]

const STEPS = [
  [6, 26, 0], [13, 14, 0.35], [21, 24, 0.7], [29, 12, 1.05], [37, 22, 1.4], [45, 10, 1.75],
  [53, 20, 2.1], [61, 6, 2.45], [68, 14, 2.8], [74, 0, 3.15],
] as const

export default function Doors() {
  const nav = useNavigate()
  const s = useStore()
  const [open, setOpen] = useState<HouseId | null>(null)
  const quick = s.introSeen === new Date().toDateString()

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => {
      actions.markIntroSeen()
      nav(`/house/${open}`)
    }, 1900)
    return () => clearTimeout(t)
  }, [open, nav])

  return (
    <motion.div
      className="screen"
      style={{ padding: 0, overflow: 'hidden', height: '100dvh', minHeight: 640 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, filter: 'blur(8px)' }}
      transition={{ duration: quick ? 0.4 : 1.2 }}
    >
      <div className="backdrop night" />
      <SceneArt name="street" fade={false} />
      <Stars count={46} height={460} />
      <Moon style={{ right: 22, top: 'calc(var(--safe-top) + 18px)', transform: 'scale(.8)' }} />
      <MoonRays right={46} top={80} />
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10%', top: 112, width: 260, height: 30, borderRadius: '50%', background: 'rgba(60,70,120,.5)', filter: 'blur(11px)', animation: 'fogx 26s ease-in-out infinite' }} />
      <FlyingOwl top={150} />
      <Candles items={SKY_CANDLES} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: quick ? 0.1 : 0.6, duration: 1.2 }}
        style={{ position: 'absolute', left: 0, right: 0, top: 'calc(var(--safe-top) + 104px)', textAlign: 'center', padding: '0 24px' }}
      >
        <div className="eyebrow" style={{ letterSpacing: '.42em' }}>
          New York · Vancouver · Delhi
        </div>
        <h1 className="display shimmer" style={{ fontSize: 40, marginTop: 10, filter: 'drop-shadow(0 2px 12px rgba(233,194,122,.35))' }}>
          Welcome Home
        </h1>
        <p className="italic" style={{ fontSize: 20, color: '#e6d8b8', marginTop: 6 }}>
          Two houses. One family. Always next door.
        </p>
      </motion.div>

      {/* street */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '24%', background: 'linear-gradient(180deg, #1c1824 0%, #0b0910 100%)' }}>
        <svg width="100%" height="100%" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, opacity: 0.45, mixBlendMode: 'multiply' }} aria-hidden="true">
          <filter id="cobble">
            <feTurbulence type="turbulence" baseFrequency="0.09 0.16" numOctaves="2" seed="5" result="n" />
            <feDiffuseLighting in="n" lightingColor="#B8AFA0" surfaceScale="2.4">
              <feDistantLight azimuth="270" elevation="40" />
            </feDiffuseLighting>
          </filter>
          <rect width="100%" height="100%" filter="url(#cobble)" />
        </svg>
        {['24%', '38%', '62%', '76%'].map((x, i) => (
          <div key={x} className="lamp" aria-hidden="true" style={{ position: 'absolute', left: x, top: 0, width: 16, height: 60, marginLeft: -8, borderRadius: '50%', background: '#FFB45A', opacity: 0.3, filter: 'blur(7px)', animationDelay: `${i * 0.4}s` }} />
        ))}
      </div>

      {/* houses */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: '24%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 3 }}>
        <House id="33C" width={116} open={open === '33C'} dim={open === '34C'} onOpen={() => setOpen('33C')} />
        <House id="34C" width={116} open={open === '34C'} dim={open === '33C'} onOpen={() => setOpen('34C')} />
      </div>

      {/* light spilling out of the open door */}
      {(['33C', '34C'] as const).map((h) => (
        <div
          key={h}
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0,
            height: '24%',
            left: `calc(50% ${h === '33C' ? '-' : '+'} 59px)`,
            width: 130,
            marginLeft: -65,
            clipPath: 'polygon(36% 0, 64% 0, 100% 100%, 0 100%)',
            background: 'linear-gradient(180deg, rgba(255,214,140,.65), rgba(255,180,90,0))',
            filter: 'blur(5px)',
            opacity: open === h ? 1 : 0,
            transition: 'opacity 1.6s ease .4s',
            pointerEvents: 'none',
          }}
        />
      ))}

      <Fog top={0} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(24% - 40px)', height: 1 }}>
        <Fog top={0} />
      </div>

      {/* Marauder's footprints crossing the street */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '50%', width: 300, marginLeft: -150, bottom: 'calc(24% - 64px)', height: 40 }}>
        {STEPS.map(([x, y, d], i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x * 1.2 + 4}%`,
              bottom: y,
              width: 11,
              height: 5,
              borderRadius: '50%',
              background: '#FFDB8E',
              boxShadow: '0 0 8px 2px rgba(255,200,110,.75)',
              transform: `rotate(${i % 2 ? 8 : -14}deg)`,
              opacity: 0,
              animation: `step 6s ease-out ${d}s infinite`,
            }}
          />
        ))}
      </div>

      <Motes count={12} area={{ top: 320, height: 380 }} />
      <Grain />

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(var(--safe-bottom) + 26px)', textAlign: 'center' }}>
        <motion.p
          className="display"
          animate={{ opacity: open ? 0 : [0.55, 1, 0.55] }}
          transition={{ duration: open ? 0.4 : 3, repeat: open ? 0 : Infinity }}
          style={{ fontSize: 13, letterSpacing: '.36em', color: 'var(--gold)' }}
        >
          TAP A DOOR TO ENTER
        </motion.p>
      </div>
    </motion.div>
  )
}
