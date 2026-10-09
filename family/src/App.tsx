import { AnimatePresence } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import { TabBar } from './components/UI'
import { DesignView, Lookbook, Studio } from './pages/Atelier'
import Calendar from './pages/Calendar'
import Cup from './pages/Cup'
import Doors from './pages/Doors'
import Duel from './pages/Duel'
import Games from './pages/Games'
import Home from './pages/Home'
import MapPage from './pages/Map'
import { OwlCompose, OwlInbox, OwlLetter } from './pages/Owls'
import { PensieveList, PensieveQuestion } from './pages/Pensieve'
import { PictionaryDraw, PictionaryGuess, PictionaryList } from './pages/Pictionary'
import Portraits from './pages/Portraits'
import Profile from './pages/Profile'
import Snitch from './pages/Snitch'

export default function App() {
  const location = useLocation()
  return (
    <div className="app">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Doors />} />
          <Route path="/house/:house" element={<Portraits />} />
          <Route path="/home" element={<Home />} />
          <Route path="/me" element={<Profile />} />
          <Route path="/owls" element={<OwlInbox />} />
          <Route path="/owls/new" element={<OwlCompose />} />
          <Route path="/owls/:id" element={<OwlLetter />} />
          <Route path="/pensieve" element={<PensieveList />} />
          <Route path="/pensieve/:id" element={<PensieveQuestion />} />
          <Route path="/cup" element={<Cup />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/duel" element={<Duel />} />
          <Route path="/games/snitch" element={<Snitch />} />
          <Route path="/games/pictionary" element={<PictionaryList />} />
          <Route path="/games/pictionary/draw" element={<PictionaryDraw />} />
          <Route path="/games/pictionary/:id" element={<PictionaryGuess />} />
          <Route path="/atelier" element={<Lookbook />} />
          <Route path="/atelier/new" element={<Studio />} />
          <Route path="/atelier/:id" element={<DesignView />} />
          <Route path="*" element={<Doors />} />
        </Routes>
      </AnimatePresence>
      <TabBar />
    </div>
  )
}
