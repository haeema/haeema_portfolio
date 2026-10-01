import { useEffect, useState } from 'react'
import Hero from './components/Hero'
import Portfolio from './components/Portfolio'
import { profile } from './content'
import './App.css'

const links = [
  { href: '#creations', label: 'Work' },
  { href: '#positioning', label: 'Positioning' },
  { href: '#experience', label: 'Experience' },
]

function App() {
  // Transparent over the hero, then a solid bar once content scrolls under it.
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    const update = () => setSolid(window.scrollY > window.innerHeight * 0.6)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <>
      <header className={`nav${solid ? ' nav--solid' : ''}`}>
        <a className="nav__brand" href="#top">
          <span className="nav__name">{profile.name.toUpperCase()}</span>
          <span className="nav__role">{profile.shortRole}</span>
        </a>
        <nav className="nav__links" aria-label="Sections">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
          <a className="nav__cta" href="#contact">
            Let’s talk
          </a>
        </nav>
      </header>

      <main id="top">
        <Hero />
        <Portfolio />
      </main>
    </>
  )
}

export default App
