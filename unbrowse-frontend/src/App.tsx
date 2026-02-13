import { useState, useEffect } from 'react'
import './index.css'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [view, setView] = useState<'home' | 'dash'>('home')

  useEffect(() => {
    const h = () => setView(location.hash === '#dashboard' ? 'dash' : 'home')
    h()
    window.addEventListener('hashchange', h)
    return () => window.removeEventListener('hashchange', h)
  }, [])

  const go = (v: 'home' | 'dash') => {
    location.hash = v === 'home' ? '' : 'dashboard'
    setView(v)
  }

  return view === 'dash' ? <Dashboard goHome={() => go('home')} /> : <Landing goDash={() => go('dash')} />
}
