'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const TEAM_NAMES = {
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

const LOGO_URL = (abbrev) =>
  `https://assets.nhle.com/logos/nhl/svg/${abbrev}_light.svg`

const COLORS = [
  "#2E75B6","#1A5C38","#C9472A","#6A0DAD","#B8860B",
  "#008B8B","#8B0000","#2F4F4F","#556B2F","#483D8B",
  "#8B4513","#2E8B57","#4B0082","#8B6914","#1A3A5C",
]

const CustomYAxisTick = ({ x, y, payload }) => {
  const abbrev = payload.value
  return (
    <g transform={`translate(${x},${y})`}>
      <image
        href={LOGO_URL(abbrev)}
        x={-52}
        y={-12}
        width={24}
        height={24}
      />
      <text
        x={-24}
        y={4}
        textAnchor="start"
        fill="#9CA3AF"
        fontSize={11}
      >
        {abbrev}
      </text>
    </g>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <img src={LOGO_URL(d.abbrev)} className="h-6 w-6 object-contain" />
        <span className="font-semibold text-white">{TEAM_NAMES[d.abbrev]}</span>
      </div>
      <div className="text-gray-300">
        {d.miles.toLocaleString()} miles traveled
      </div>
      <div className="text-gray-400 text-xs mt-1">
        {d.games} games played
      </div>
    </div>
  )
}

export default function TravelPage() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState("")

  useEffect(() => {
    async function fetchTravel() {
      setLoading(true)
      const { data: rows, error } = await supabase
        .from('team_travel')
        .select('team_abbrev, cumulative_miles, game_date, games_played')
        .neq('opponent', 'HOME')
        .order('game_date', { ascending: false })
        .limit(5000)

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      console.log("Total NYR rows:", rows.filter(r => r.team_abbrev === 'NYR').length)
      console.log("Sample NYR rows:", rows.filter(r => r.team_abbrev === 'NYR').slice(0, 3))

      // For each team find the row with the highest cumulative_miles
      // That row also has the correct games_played count
      const totals = {}
      rows.forEach(row => {
        const t = row.team_abbrev
        if (!totals[t] || row.cumulative_miles > totals[t].miles) {
          totals[t] = {
            miles:        row.cumulative_miles,
            games:        row.games_played,
            date:         row.game_date,
          }
        }
      })

      const chartData = Object.entries(totals)
        .map(([abbrev, val]) => ({
          abbrev,
          miles: Math.round(val.miles),
          games: val.games || 0,
        }))
        .sort((a, b) => b.miles - a.miles)

      setData(chartData)

      // Most recent game date across all teams
      const latest = rows.reduce((max, r) =>
        r.game_date > max ? r.game_date : max, "")
      setLastUpdated(latest)
      setLoading(false)
    }
    fetchTravel()
  }, [])

  const chartHeight = data.length * 44 + 60

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">

        {/* Navigation */}
        <nav className="flex justify-center gap-6 mb-8">
          <a href="/"
            className="text-blue-400 hover:text-blue-200 font-medium transition-colors">
            Nationality Dashboard
          </a>
          <span className="text-gray-600">|</span>
          <a href="/travel"
            className="text-white font-semibold border-b-2 border-blue-400 pb-0.5">
            Travel Tracker
          </a>
        </nav>

        {/* Header */}
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

        {loading ? (
          <p className="text-center text-gray-400 text-xl mt-20">Loading...</p>
        ) : (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-blue-300">
                Miles Traveled — All 32 Teams
              </h2>
              <span className="text-gray-400 text-sm">
                Sorted most → least
              </span>
            </div>

            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 80, left: 60, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  tickFormatter={v => `${(v/1000).toFixed(0)}k`}
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
                <Bar dataKey="miles" radius={[0, 4, 4, 0]} maxBarSize={28}
                  label={{
                    position: 'right',
                    formatter: v => v.toLocaleString(),
                    fill: '#9CA3AF',
                    fontSize: 11,
                  }}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
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