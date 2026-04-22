'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'

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

const LOGO_URL = (abbrev: string) =>
  `https://assets.nhle.com/logos/nhl/svg/${abbrev}_light.svg`

const TEAM_COLORS: Record<string, string> = {
  ANA:"#FC4C02", BOS:"#FFB81C", BUF:"#041E42", CAR:"#A2AAAD",
  CGY:"#F1BE08", CHI:"#C8102E", CBJ:"#041E42", COL:"#6F263D",
  DAL:"#006341", DET:"#C8102E", EDM:"#CF4520", FLA:"#b9975b",
  LAK:"#010101", MIN:"#154734", MTL:"#a6192e", NJD:"#c8102e",
  NSH:"#ffb81c", NYI:"#fc4c02", NYR:"#0033a0", OTT:"#c8102e",
  PHI:"#fa4616", PIT:"#ffb81c", SEA:"#9CDBD9", SJS:"#006272",
  STL:"#003087", TBL:"#00205b", TOR:"#00205b", UTA:"#69B3E7",
  VAN:"#97999b", VGK:"#b4975a", WSH:"#a6192e", WPG:"#041e42",
}

const CustomYAxisTick = ({ x, y, payload }: any) => {
  const abbrev = payload.value
  return (
    <g transform={`translate(${x},${y})`}>
      <image href={LOGO_URL(abbrev)} x={-52} y={-12} width={24} height={24} />
      <text x={-24} y={4} textAnchor="start" fill="#9CA3AF" fontSize={11}>
        {abbrev}
      </text>
    </g>
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <img src={LOGO_URL(d.abbrev)} className="h-6 w-6 object-contain" alt={d.abbrev} />
        <span className="font-semibold text-white">{TEAM_NAMES[d.abbrev]}</span>
      </div>
      <div className="text-gray-300">{d.miles.toLocaleString()} miles traveled</div>
      <div className="text-gray-400 text-xs mt-1">{d.games} games played</div>
    </div>
  )
}

export default function TravelPage() {
  const [data, setData]               = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [lastUpdated, setLastUpdated] = useState("")
  const [allTravel, setAllTravel]     = useState<any[]>([])
  const [currentDate, setCurrentDate] = useState("")
  const [isPlaying, setIsPlaying]     = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(150)

  useEffect(() => {
    async function fetchTravel() {
      setLoading(true)
      const { data: rows, error } = await supabase
        .from('team_travel')
        .select('team_abbrev, cumulative_miles, game_date, games_played')
        .neq('opponent', 'HOME')
        .order('game_date', { ascending: false })
        .limit(5000)

      if (error) { console.error(error); setLoading(false); return }

      const totals: Record<string, any> = {}
      rows.forEach((row: any) => {
        const t = row.team_abbrev
        if (!totals[t] || row.cumulative_miles > totals[t].miles) {
          totals[t] = { miles: row.cumulative_miles, games: row.games_played }
        }
      })

      const chartData = Object.entries(totals)
        .map(([abbrev, val]: any) => ({ abbrev, miles: Math.round(val.miles), games: val.games || 0 }))
        .sort((a, b) => b.miles - a.miles)

      setData(chartData)
      const latest = rows.reduce((max: string, r: any) => r.game_date > max ? r.game_date : max, "")
      setLastUpdated(latest)
      setLoading(false)
    }
    fetchTravel()
  }, [])

  useEffect(() => {
    async function fetchAllTravel() {
      const pageSize = 1000
      let allRows: any[] = []
      let page = 0
      let keepFetching = true

      while (keepFetching) {
        const { data: rows, error } = await supabase
          .from('team_travel')
          .select('team_abbrev, game_date, cumulative_miles, games_played')
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
    }
    fetchAllTravel()
  }, [])

  const allDates = [...new Set(allTravel.map((r: any) => r.game_date))].sort() as string[]
  const currentDateIndex = Math.max(0, allDates.indexOf(currentDate))

  useEffect(() => {
    if (allDates.length > 0 && !currentDate) {
      // On load show the latest date (current totals)
      setCurrentDate(allDates[allDates.length - 1])
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

  const animatedData = (() => {
    if (allTravel.length === 0) return data
    if (!currentDate || currentDate < "2025-10-07") {
      return Object.keys(TEAM_NAMES).map(abbrev => ({
        abbrev, miles: 0, games: 0,
      })).sort((a, b) => a.abbrev.localeCompare(b.abbrev))
    }
    const totals: Record<string, any> = {}
    allTravel
      .filter((r: any) => r.game_date <= currentDate)
      .forEach((row: any) => {
        const t = row.team_abbrev
        if (!totals[t] || row.cumulative_miles > totals[t].miles) {
          totals[t] = { miles: row.cumulative_miles, games: row.games_played }
        }
      })
    return Object.entries(totals)
      .map(([abbrev, val]: any) => ({ abbrev, miles: Math.round(val.miles), games: val.games || 0 }))
      .sort((a, b) => b.miles - a.miles)
  })()

  const chartHeight = Math.max(animatedData.length, 32) * 44 + 60

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
        <title>Stat Grinder — Travel Tracker</title>
      <div className="max-w-5xl mx-auto">

        

        <h1 className="text-4xl font-bold text-center mb-2 text-white">
          ✈️ NHL Team Travel Tracker
        </h1>
        <p className="text-center text-gray-400 mb-2">
          Total miles traveled by each team since opening night — 2025-26 season
        </p>
        {lastUpdated && (
          <p className="text-center text-gray-500 text-sm mb-8">
            Data through {lastUpdated}
          </p>
        )}

        {allDates.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (!isPlaying) {
                      // If at the end, rewind to start before playing
                      if (currentDate >= allDates[allDates.length - 1]) {
                        setCurrentDate("2025-10-06")
                        setTimeout(() => setIsPlaying(true), 50)
                      } else {
                        setIsPlaying(true)
                      }
                    } else {
                      setIsPlaying(false)
                    }
                  }}
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
              <span className="text-gray-400 text-sm w-24 shrink-0">{allDates[0]?.slice(5)}</span>
              <input
                type="range"
                min={0}
                max={allDates.length - 1}
                value={currentDateIndex}
                onChange={e => { setIsPlaying(false); setCurrentDate(allDates[Number(e.target.value)]) }}
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

        {loading ? (
          <p className="text-center text-gray-400 text-xl mt-20">Loading...</p>
        ) : (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-blue-300">
                Miles Traveled — All 32 Teams
                {currentDate && (
                  <span className="text-gray-400 font-normal text-base ml-3">
                    as of {currentDate}
                  </span>
                )}
              </h2>
              <span className="text-gray-400 text-sm">Sorted most → least</span>
            </div>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={animatedData}
                layout="vertical"
                margin={{ top: 0, right: 80, left: 60, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, () => {
                    const currentMax = Math.max(...animatedData.map((d: any) => d.miles), 1000)
                    return Math.ceil(currentMax / 5000) * 5000
                  }]}
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                  axisLine={{ stroke: '#374151' }}
                />
                <YAxis
                  type="category"
                  dataKey="abbrev"
                  width={60}
                  tick={<CustomYAxisTick />}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="miles" radius={[0, 4, 4, 0]} maxBarSize={28} isAnimationActive={false}
                  label={{
                    position: 'right',
                    formatter: (v: number) => v.toLocaleString(),
                    fill: '#9CA3AF',
                    fontSize: 11,
                  }}
                >
                  {animatedData.map((d: any, i: number) => (
                    <Cell key={i} fill={TEAM_COLORS[d.abbrev] || "#2E75B6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </main>
  )
}