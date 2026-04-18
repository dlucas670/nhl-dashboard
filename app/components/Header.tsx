'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/nationality', label: 'Nationality Dashboard' },
  { href: '/travel',      label: 'Travel Tracker' },
  { href: '/location',    label: 'Team Locations' },
]


export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" onClick={() => setMenuOpen(false)}>
          <img
            src="/stat_grinder_logo.svg"
            alt="Stat Grinder"
            className="h-12 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors ${
                pathname === href
                  ? 'text-white border-b-2 border-blue-400 pb-0.5'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Hamburger button — mobile only */}
        <button
          onClick={() => setMenuOpen(p => !p)}
          className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8 focus:outline-none"
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-6 bg-gray-300 transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}/>
          <span className={`block h-0.5 w-6 bg-gray-300 transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`}/>
          <span className={`block h-0.5 w-6 bg-gray-300 transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}/>
        </button>

      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-gray-800 bg-gray-900 px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-medium transition-colors ${
                pathname === href
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}