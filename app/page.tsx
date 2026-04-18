'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const PAGES = [
  {
    href: '/nationality',
    title: 'Nationality Dashboard',
    description: 'Explore the nationality makeup of every NHL team and compare rosters against Stanley Cup finalists from the last 10 years.',
    icon: '🌍',
    stat: '32 Teams',
    stat2: '3 Seasons of Data',
    color: '#2E75B6',
  },
  {
    href: '/travel',
    title: 'Travel Tracker',
    description: 'See how many miles each team has traveled this season. Watch the full season play out with an animated bar chart.',
    icon: '✈️',
    stat: '82 Games',
    stat2: '~45,000 Miles / Team',
    color: '#1A5C38',
  },
  {
    href: '/location',
    title: 'Team Locations',
    description: 'Watch all 32 teams move across North America in real time as the season progresses on an interactive map.',
    icon: '🗺️',
    stat: '32 Teams',
    stat2: 'Live Map Animation',
    color: '#6A0DAD',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-5xl font-black mb-4 tracking-tight">
          Welcome to{' '}
          <span className="text-blue-400">Stat Grinder</span>
        </h1>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto">
          NHL analytics built for fans. Explore team composition, travel data, and real-time locations across the 2025-26 season.
        </p>
      </div>

      {/* Page cards */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PAGES.map(page => (
            <Link
              key={page.href}
              href={page.href}
              className="group bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-600 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
            >
              {/* Thumbnail color band */}
              <div
                className="h-40 flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: page.color + '22', borderBottom: `3px solid ${page.color}` }}
              >
                {/* Large background icon */}
                <span
                  className="absolute text-9xl opacity-10 select-none"
                  style={{ fontSize: '120px' }}
                >
                  {page.icon}
                </span>
                {/* Foreground icon -->*/}
                <span className="text-6xl relative z-10 group-hover:scale-110 transition-transform duration-200">
                  {page.icon}
                </span>
              </div>

              {/* Card content */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {page.title}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {page.description}
                </p>
                {/* Stats pills */}
                <div className="flex gap-2 flex-wrap">
                  <span
                    className="text-xs font-medium px-3 py-1 rounded-full"
                    style={{ backgroundColor: page.color + '33', color: page.color === '#1A5C38' ? '#4ade80' : page.color === '#6A0DAD' ? '#c084fc' : '#60a5fa' }}
                  >
                    {page.stat}
                  </span>
                  <span
                    className="text-xs font-medium px-3 py-1 rounded-full"
                    style={{ backgroundColor: page.color + '33', color: page.color === '#1A5C38' ? '#4ade80' : page.color === '#6A0DAD' ? '#c084fc' : '#60a5fa' }}
                  >
                    {page.stat2}
                  </span>
                </div>
              </div>

              {/* Footer arrow */}
              <div className="px-6 pb-5 flex items-center gap-2 text-sm font-medium"
                style={{ color: page.color === '#1A5C38' ? '#4ade80' : page.color === '#6A0DAD' ? '#c084fc' : '#60a5fa' }}
              >
                Explore
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </main>
  )
}