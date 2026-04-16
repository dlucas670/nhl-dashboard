'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import nextDynamic from 'next/dynamic'

const TravelMap = nextDynamic(() => import('../components/TravelMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-900 rounded-2xl border border-gray-800"
      style={{ height: "500px" }}
    />
  )
})

const TEAM_NAMES: Record<string, string> = {
  ANA:"Anaheim Ducks",      BOS:"Boston Bruins",
  BUF:"Buffalo Sabres",     CAR:"Carolina Hurricanes",
  CGY:"Calgary Flames",     CHI:"Chicago Blackhawks",
  CBJ:"Columbus Blue Jackets", COL:"Colorado Avalanche",
  DAL:"Dallas Stars",       DET:"Detroit Red Wings",
  EDM:"Edmonton Oilers",    FLA:"Florida Panthers",
  LAK:"Los Angeles Kings",  MIN:"Minnesota Wild",
  MTL:"Montreal Canadiens", NJD:"New Jersey Devils",
  NSH:"Nashville Predators",NYI:"New York Islanders",
  NYR:"New York Rangers",   OTT:"Ottawa Senators",
  PHI:"Philadelphia Flyers",PIT:"Pittsburgh Penguins",
  SEA:"Seattle Kraken",     SJS:"San Jose Sharks",
  STL:"St. Louis Blues",    TBL:"Tampa Bay Lightning",
  TOR:"Toronto Maple Leafs",UTA:"Utah Mammoth",
  VAN:"Vancouver Canucks",  VGK:"Vegas Golden Knights",
  WSH:"Washington Capitals",WPG:"Winnipeg Jets",
}

const ARENAS: Record<string, [number, number]> = {
  ANA:[33.8078,-117.8768], BOS:[42.3662,-71.0621],
  BUF:[42.8750,-78.8764],  CAR:[35.8033,-78.7228],
  CGY:[51.0374,-114.0519], CHI:[41.8806,-87.6742],
  CBJ:[39.9693,-83.0061],  COL:[39.7486,-105.0077],
  DAL:[32.7905,-96.8103],  DET:[42.3411,-83.0550],
  EDM:[53.5461,-113.4938], FLA:[26.1584,-80.3256],
  LAK:[34.0430,-118.2673], MIN:[44.9448,-93.1010],
  MTL:[45.4961,-73.5693],  NJD:[40.7337,-74.1710],
  NSH:[36.1592,-86.7785],  NYI:[40.7223,-73.7273],
  NYR:[40.7505,-73.9934],  OTT:[45.2969,-75.9278],
  PHI:[39.9012,-75.1720],  PIT:[40.4396,-79.9892],
  SEA:[47.6222,-122.3540], SJS:[37.3329,-121.9011],
  STL:[38.6267,-90.2025],  TBL:[27.9428,-82.4519],
  TOR:[43.6435,-79.3791],  UTA:[40.7683,-111.9011],
  VAN:[49.2778,-123.1088], VGK:[36.1028,-115.1784],
  WSH:[38.8981,-77.0209],  WPG:[49.8928,-97.1438],
}

export default function LocationPage() {
  const [allTravel, setAllTravel]     = useState<any[]>([])
  const [currentDate, setCurrentDate] = useState("")
  const [isPlaying, setIsPlaying]     = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(150)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    async function fetchAllTravel() {
      setLoading(true)
      const pageSize = 1000
      let allRows: any[] = []
      let page = 0
      let keepFetching = true

      while (keepFetching) {
        const { data: rows, error } = await supabase
          .from('team_travel')
          .select('team_abbrev, game_date, cumulative_miles, to_lat, to_lon')
          .neq('opponent', 'HOME')
          .order('game_date', { ascending: true })
          .range(page * pageSize, (page + 1) * pageSize - 1)

        if (error || !rows || rows.length === 0) {
          keepFetching = false
        } else {
          allRows = [...allRows, ...rows]
          if (rows.length < pageSize) keepFetching = false
          else page++
        }
      }

      setAllTravel(allRows)
      setLoading(false)
    }
    fetchAllTravel()
  }, [])

  const allDates = [...new Set(allTravel.map((r: any) => r.game_date))].sort() as string[]
  const currentDateIndex = Math.max(0, allDates.indexOf(currentDate))

  useEffect(() => {
    if (allDates.length > 0 && !currentDate) {
      setCurrentDate("2025-10-06")
    }
  }, [allDates.length])

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setCurrentDate(prev => {
        const idx = allDates.indexOf(prev)
        if (idx >= allDates.length - 1) { setIsPlaying(false); return prev }
        return allDates[idx + 1]
      })
    }, playbackSpeed)
    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed, allDates.join(",")])

  // Compute each team's current position as of currentDate
  const teamPositions: Record<string, [number, number]> = {}
  const teamMiles: Record<string, number> = {}

  if (currentDate && allTravel.length > 0) {
    const relevantRows = allTravel.filter((r: any) => r.game_date <= currentDate)
    const latest: Record<string, any> = {}
    relevantRows.forEach((row: any) => {
      if (!latest[row.team_abbrev] || row.game_date >= latest[row.team_abbrev].game_date) {
        latest[row.team_abbrev] = row
      }
    })
    Object.keys(TEAM_NAMES).forEach(abbrev => {
      if (latest[abbrev]) {
        teamPositions[abbrev] = [latest[abbrev].to_lat, latest[abbrev].to_lon]
        teamMiles[abbrev] = Math.round(latest[abbrev].cumulative_miles)
      } else {
        teamPositions[abbrev] = ARENAS[abbrev]
        teamMiles[abbrev] = 0
      }
    })
  } else {
    Object.keys(TEAM_NAMES).forEach(abbrev => {
      teamPositions[abbrev] = ARENAS[abbrev]
      teamMiles[abbrev] = 0
    })
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">

        {/* Navigation */}
        <nav className="flex justify-center gap-6 mb-8">
          <a href="/" className="text-blue-400 hover:text-blue-200 font-medium transition-colors">
            Nationality Dashboard
          </a>
          <span className="text-gray-600">|</span>
          <a href="/travel" className="text-blue-400 hover:text-blue-200 font-medium transition-colors">
            Travel Tracker
          </a>
          <span className="text-gray-600">|</span>
          <a href="/location" className="text-white font-semibold border-b-2 border-blue-400 pb-0.5">
            Team Locations
          </a>
        </nav>

        {/* Header */}
        <h1 className="text-4xl font-bold text-center mb-2 text-white">
          🗺️ NHL Team Locations
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Watch all 32 teams travel across North America throughout the 2025-26 season
        </p>

        {loading ? (
          <p className="text-center text-gray-400 text-xl mt-20">Loading map data...</p>
        ) : (
          <>
            {/* Playback Controls */}
            {allDates.length > 0 && (
              <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(p => !p)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                    >
                      {isPlaying ? "⏸ Pause" : "▶ Play"}
                    </button>
                    <button
                      onClick={() => { setIsPlaying(false); setCurrentDate("2025-10-06") }}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      ↺ Reset
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">Speed:</span>
                    {([["Slow", 500], ["Normal", 150], ["Fast", 50]] as [string, number][]).map(([label, ms]) => (
                      <button
                        key={label}
                        onClick={() => setPlaybackSpeed(ms)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          playbackSpeed === ms ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-sm w-24 shrink-0">
                    {allDates[0]?.slice(5)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={allDates.length - 1}
                    value={currentDateIndex}
                    onChange={e => {
                      setIsPlaying(false)
                      setCurrentDate(allDates[Number(e.target.value)])
                    }}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="text-gray-400 text-sm w-24 shrink-0 text-right">
                    {allDates[allDates.length - 1]?.slice(5)}
                  </span>
                </div>
                <div className="text-center mt-2 text-white font-semibold text-lg">
                  {currentDate}
                </div>
              </div>
            )}

            {/* Map */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold text-blue-300 mb-4">
                Team Locations — {currentDate || "Season Start"}
              </h2>
              <TravelMap
                teamPositions={teamPositions}
                teamMiles={teamMiles}
              />
              <p className="text-gray-500 text-xs mt-3 text-center">
                Dots show each team's current location. Hover for details.
                Use the playback controls above to animate through the season.
              </p>
            </div>
          </>
        )}

      </div>
    </main>
  )
}