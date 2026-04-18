'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

const TEAM_LIST = [
  ["ANA","Anaheim Ducks"],      ["BOS","Boston Bruins"],
  ["BUF","Buffalo Sabres"],     ["CAR","Carolina Hurricanes"],
  ["CGY","Calgary Flames"],     ["CHI","Chicago Blackhawks"],
  ["CBJ","Columbus Blue Jackets"],["COL","Colorado Avalanche"],
  ["DAL","Dallas Stars"],       ["DET","Detroit Red Wings"],
  ["EDM","Edmonton Oilers"],    ["FLA","Florida Panthers"],
  ["LAK","Los Angeles Kings"],  ["MIN","Minnesota Wild"],
  ["MTL","Montreal Canadiens"], ["NJD","New Jersey Devils"],
  ["NSH","Nashville Predators"],["NYI","New York Islanders"],
  ["NYR","New York Rangers"],   ["OTT","Ottawa Senators"],
  ["PHI","Philadelphia Flyers"],["PIT","Pittsburgh Penguins"],
  ["SEA","Seattle Kraken"],     ["SJS","San Jose Sharks"],
  ["STL","St. Louis Blues"],    ["TBL","Tampa Bay Lightning"],
  ["TOR","Toronto Maple Leafs"],["UTA","Utah Mammoth"],
  ["VAN","Vancouver Canucks"],  ["VGK","Vegas Golden Knights"],
  ["WSH","Washington Capitals"],["WPG","Winnipeg Jets"],
]

const COUNTRY_NAMES: Record<string, string> = {
  CAN: "Canada", USA: "United States", SWE: "Sweden",
  FIN: "Finland", RUS: "Russia", CZE: "Czech Republic",
  SVK: "Slovakia", CHE: "Switzerland", DEU: "Germany",
  AUT: "Austria", LVA: "Latvia", DNK: "Denmark",
  FRA: "France", NOR: "Norway", BLR: "Belarus",
  AUS: "Australia", SVN: "Slovenia", GBR: "United Kingdom"
}

const COLORS = [
  "#1A3A5C","#2E75B6","#C9472A","#2E8B57","#8B6914",
  "#6A0DAD","#008B8B","#8B0000","#4B0082","#2F4F4F",
  "#B8860B","#556B2F","#8B4513","#483D8B","#2E8B57"
]

const FLAG_URL = (code: string) => `https://flagcdn.com/24x18/${code.toLowerCase()}.png`
const LOGO_URL = (abbrev: string) => `https://assets.nhle.com/logos/nhl/svg/${abbrev}_light.svg`

const COUNTRY_ISO: Record<string, string> = {
  CAN:"ca", USA:"us", SWE:"se", FIN:"fi", RUS:"ru",
  CZE:"cz", SVK:"sk", CHE:"ch", DEU:"de", AUT:"at",
  LVA:"lv", DNK:"dk", FRA:"fr", NOR:"no", BLR:"by",
  AUS:"au", SVN:"si", GBR:"gb"
}

export default function Home() {
  const [selectedTeam, setSelectedTeam]     = useState('ANA')
  const [players, setPlayers]               = useState<any[]>([])
  const [loading, setLoading]               = useState(true)
  const [finalists, setFinalists]           = useState<any[]>([])
  const [finalistLoading, setFinalistLoading] = useState(true)
  const [groupedView, setGroupedView]       = useState(false)
  const [dropdownOpen, setDropdownOpen]     = useState(false)
  const [allPlayers, setAllPlayers]         = useState<any[]>([])
  const [leagueView, setLeagueView]         = useState(true)

  useEffect(() => {
    async function fetchPlayers() {
      setLoading(true)
      const { data, error } = await supabase
        .from('players')
        .select('full_name, birth_country, position')
        .eq('team_abbrev', selectedTeam)
        .eq('season', 'current')
      if (!error) setPlayers(data || [])
      setLoading(false)
    }
    fetchPlayers()
  }, [selectedTeam])

  useEffect(() => {
    async function fetchAllPlayers() {
      const { data, error } = await supabase
        .from('players')
        .select('birth_country')
        .eq('season', 'current')
      if (!error) setAllPlayers(data || [])
    }
    fetchAllPlayers()
  }, [])

  useEffect(() => {
    async function fetchFinalists() {
      setFinalistLoading(true)
      const { data, error } = await supabase
        .from('players')
        .select('birth_country, cup_result, season, team_abbrev')
        .eq('is_finalist', true)
      if (!error) setFinalists(data || [])
      setFinalistLoading(false)
    }
    fetchFinalists()
  }, [])

  // Team chart data
  const counts: Record<string, number> = {}
  players.forEach((p: any) => {
    counts[p.birth_country] = (counts[p.birth_country] || 0) + 1
  })
  const chartData = Object.entries(counts)
    .map(([country, count]) => ({
      name: COUNTRY_NAMES[country] || country,
      code: country,
      value: count,
      pct: players.length ? Math.round((count / players.length) * 100) : 0
    }))
    .sort((a, b) => b.value - a.value)

  // League chart data
  const leagueCounts: Record<string, number> = {}
  allPlayers.forEach((p: any) => {
    leagueCounts[p.birth_country] = (leagueCounts[p.birth_country] || 0) + 1
  })
  const leagueChartData = Object.entries(leagueCounts)
    .map(([country, count]) => ({
      name: COUNTRY_NAMES[country] || country,
      code: country,
      value: count,
      pct: allPlayers.length ? Math.round((count / allPlayers.length) * 100) : 0
    }))
    .sort((a, b) => b.value - a.value)

  const displayPlayers = leagueView ? allPlayers : players
  const displayData    = leagueView ? leagueChartData : chartData
  const displayLoading = leagueView ? allPlayers.length === 0 : loading
  const displayLabel   = leagueView ? 'NHL League' : selectedTeam

  // Comparison data
  const buildFinalistData = (result: string) => {
    const teamSeasons: Record<string, string[]> = {}
    finalists
      .filter((p: any) => p.cup_result === result)
      .forEach((p: any) => {
        const key = `${p.team_abbrev}_${p.season}`
        if (!teamSeasons[key]) teamSeasons[key] = []
        teamSeasons[key].push(p.birth_country)
      })
    const countryTotals: Record<string, number> = {}
    const numTeams = Object.keys(teamSeasons).length
    Object.values(teamSeasons).forEach((players: string[]) => {
      const counts: Record<string, number> = {}
      players.forEach(c => { counts[c] = (counts[c] || 0) + 1 })
      Object.entries(counts).forEach(([country, count]) => {
        countryTotals[country] = (countryTotals[country] || 0) + (count / players.length) * 100
      })
    })
    return Object.entries(countryTotals)
      .map(([country, total]) => ({
        country: COUNTRY_NAMES[country] || country,
        code: country,
        pct: Math.round(total / numTeams)
      }))
      .filter(d => d.pct >= 2)
      .sort((a, b) => b.pct - a.pct)
  }

  const currentTeamData = displayData.map(d => ({ country: d.name, code: d.code, pct: d.pct }))

  const allCountries = [...new Set([
    ...currentTeamData.map(d => d.country),
    ...buildFinalistData('finalist').map(d => d.country),
    ...buildFinalistData('runner-up').map(d => d.country),
  ])].slice(0, 8)

  const comparisonData = allCountries.map(country => {
    const current  = currentTeamData.find(d => d.country === country)
    const winner   = buildFinalistData('finalist').find(d => d.country === country)
    const runnerup = buildFinalistData('runner-up').find(d => d.country === country)
    return {
      country: country.length > 12 ? country.slice(0, 12) + '…' : country,
      [displayLabel]: current?.pct || 0,
      'Avg Champion': winner?.pct || 0,
      'Avg Runner-Up': runnerup?.pct || 0,
    }
  })

  const groupCountry = (code: string) => {
    if (code === 'CAN') return 'Canada'
    if (code === 'USA') return 'United States'
    return 'Europe/Other'
  }

  const buildGroupedFinalistData = (result: string) => {
    const teamSeasons: Record<string, string[]> = {}
    finalists
      .filter((p: any) => p.cup_result === result)
      .forEach((p: any) => {
        const key = `${p.team_abbrev}_${p.season}`
        if (!teamSeasons[key]) teamSeasons[key] = []
        teamSeasons[key].push(p.birth_country)
      })
    const numTeams = Object.keys(teamSeasons).length
    const totals: Record<string, number> = { 'Canada': 0, 'United States': 0, 'Europe/Other': 0 }
    Object.values(teamSeasons).forEach((players: string[]) => {
      const counts: Record<string, number> = { 'Canada': 0, 'United States': 0, 'Europe/Other': 0 }
      players.forEach(c => {
        const group = groupCountry(c)
        counts[group] = (counts[group] || 0) + 1
      })
      Object.entries(counts).forEach(([group, count]) => {
        totals[group] = (totals[group] || 0) + (count / players.length) * 100
      })
    })
    return Object.entries(totals).map(([country, total]) => ({
      country,
      pct: Math.round(total / numTeams)
    }))
  }

  const groupedCurrentData = ['Canada', 'United States', 'Europe/Other'].map(group => {
    const count = displayPlayers.filter((p: any) => groupCountry(p.birth_country) === group).length
    return {
      country: group,
      pct: displayPlayers.length ? Math.round((count / displayPlayers.length) * 100) : 0
    }
  })

  const groupedComparisonData = ['Canada', 'United States', 'Europe/Other'].map(group => {
    const current  = groupedCurrentData.find(d => d.country === group)
    const winner   = buildGroupedFinalistData('finalist').find(d => d.country === group)
    const runnerup = buildGroupedFinalistData('runner-up').find(d => d.country === group)
    return {
      country: group,
      [displayLabel]: current?.pct || 0,
      'Avg Champion': winner?.pct || 0,
      'Avg Runner-Up': runnerup?.pct || 0,
    }
  })

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <title>Stat Grinder — Nationality Dashboard</title>
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold text-center mb-2 text-white">
          🏒 NHL Nationality Dashboard
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Explore the nationality makeup of every NHL team
        </p>

        <div className="flex flex-col items-center mb-10 gap-4">

          {/* League / Team toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setLeagueView(true)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                leagueView ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              League
            </button>
            <button
              onClick={() => setLeagueView(false)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                !leagueView ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              By Team
            </button>
            
          </div>

          {/* Logo and dropdown — only in team view */}
          {!leagueView && (
            <>
              <img
                src={LOGO_URL(selectedTeam)}
                alt={selectedTeam}
                className="h-24 w-24 object-contain"
              />
              <div className="relative w-72">
                <button
                  onClick={() => setDropdownOpen(prev => !prev)}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-blue-400 flex items-center gap-3"
                >
                  <img src={LOGO_URL(selectedTeam)} alt={selectedTeam} className="h-10 w-10 object-contain" />
                  <span className="flex-1 text-left">
                    {TEAM_LIST.find(([abbrev]) => abbrev === selectedTeam)?.[1]}
                  </span>
                  <span className="text-gray-400">▾</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute z-10 w-full bg-gray-800 border border-gray-600 rounded-lg mt-1 max-h-72 overflow-y-auto shadow-xl">
                    {TEAM_LIST.map(([abbrev, name]) => (
                      <button
                        key={abbrev}
                        onClick={() => { setSelectedTeam(abbrev); setDropdownOpen(false) }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700 text-left ${
                          abbrev === selectedTeam ? 'bg-gray-700' : ''
                        }`}
                      >
                        <img src={LOGO_URL(abbrev)} alt={abbrev} className="h-10 w-10 object-contain" />
                        <span className="text-white text-sm">{name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {displayLoading ? (
          <p className="text-center text-gray-400 text-xl">Loading...</p>
        ) : leagueView ? (
          // League view — pie left, others table right, full table below
          <div className="flex flex-col gap-8">

            {/* Top row — pie chart + others table side by side */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold text-blue-300 mb-1">
                Nationality Breakdown — NHL League
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                All {displayPlayers.length} NHL players across 32 teams
              </p>
              <div className="flex flex-col lg:flex-row gap-6 items-center">

                {/* Pie chart */}
                <div className="w-full lg:w-3/5">
                  <ResponsiveContainer width="100%" height={360}>
                    <PieChart>
                      <Pie
                        data={(() => {
                          const major = ['CAN', 'USA', 'SWE', 'FIN', 'RUS', 'CZE']
                          const result = major.map(code => ({
                            name: COUNTRY_NAMES[code],
                            code,
                            value: allPlayers.filter((p: any) => p.birth_country === code).length
                          })).filter(d => d.value > 0)
                          const othersValue = allPlayers.filter((p: any) => !major.includes(p.birth_country)).length
                          if (othersValue > 0) result.push({ name: 'Others', code: 'OTHER', value: othersValue })
                          return result
                        })()}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={true}
                      >
                        {['CAN','USA','SWE','FIN','RUS','CZE','OTHER'].map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val, name) => [`${val} players`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Others breakdown table */}
                <div className="w-full lg:w-2/5">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Others — Country Breakdown
                  </h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700">
                        <th className="text-left py-2">Country</th>
                        <th className="text-center py-2">Players</th>
                        <th className="text-center py-2">% of NHL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayData
                        .filter(d => !['CAN','USA','SWE','FIN','RUS','CZE'].includes(d.code))
                        .map((row, i) => (
                          <tr key={i} className="border-b border-gray-800 hover:bg-gray-800">
                            <td className="py-2 flex items-center gap-2">
                              {COUNTRY_ISO[row.code] && (
                                <img src={FLAG_URL(COUNTRY_ISO[row.code])} alt={row.name} className="rounded-sm" />
                              )}
                              {row.name}
                            </td>
                            <td className="text-center py-2">{row.value}</td>
                            <td className="text-center py-2">{row.pct}%</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

            {/* Full country breakdown table */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-blue-300">
                Players by Country — Whole League
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left py-2">Country</th>
                    <th className="text-center py-2">Players</th>
                    <th className="text-center py-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.map((row, i) => (
                    <tr key={i} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="py-2 flex items-center gap-2">
                        {COUNTRY_ISO[row.code] && (
                          <img src={FLAG_URL(COUNTRY_ISO[row.code])} alt={row.name} className="rounded-sm" />
                        )}
                        {row.name}
                      </td>
                      <td className="text-center py-2">{row.value}</td>
                      <td className="text-center py-2">{row.pct}%</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="text-gray-400 font-semibold">
                    <td className="py-2">Total</td>
                    <td className="text-center py-2">{displayPlayers.length}</td>
                    <td className="text-center py-2">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>

          </div>
        ) : (
          // Team view — side by side
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <img src={LOGO_URL(selectedTeam)} alt={selectedTeam} className="h-20 w-20 object-contain" />
                <h2 className="text-xl font-semibold text-blue-300">
                  Nationality Breakdown — {selectedTeam}
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={displayData}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    dataKey="value"
                    label={({ name, pct }) => `${name} ${pct}%`}
                    labelLine={false}
                  >
                    {displayData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val, name) => [`${val} players`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-blue-300">
                Players by Country
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left py-2">Country</th>
                    <th className="text-center py-2">Players</th>
                    <th className="text-center py-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.map((row, i) => (
                    <tr key={i} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="py-2 flex items-center gap-2">
                        {COUNTRY_ISO[row.code] && (
                          <img src={FLAG_URL(COUNTRY_ISO[row.code])} alt={row.name} className="rounded-sm" />
                        )}
                        {row.name}
                      </td>
                      <td className="text-center py-2">{row.value}</td>
                      <td className="text-center py-2">{row.pct}%</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="text-gray-400 font-semibold">
                    <td className="py-2">Total</td>
                    <td className="text-center py-2">{displayPlayers.length}</td>
                    <td className="text-center py-2">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>

          </div>
        )}

        {!displayLoading && !finalistLoading && !leagueView && (

          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mt-8">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-semibold text-blue-300">
                Comparison — {displayLabel} vs Cup Finalists (2015–2025)
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setGroupedView(false)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    !groupedView ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  By Nationality
                </button>
                <button
                  onClick={() => setGroupedView(true)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    groupedView ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  CAN / USA / EUR
                </button>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              {groupedView
                ? 'All non-CAN/USA nationalities grouped as Europe/Other.'
                : `Showing top 8 nationalities. "Avg Champion" and "Avg Runner-Up" are averaged across all finalist rosters.`
              }
            </p>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart
                data={groupedView ? groupedComparisonData : comparisonData}
                margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="country" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  formatter={(val) => `${val}%`}
                />
                <Legend wrapperStyle={{ color: '#9CA3AF', paddingTop: '16px' }} />
                <Bar dataKey={displayLabel} fill="#2E75B6" radius={[4,4,0,0]} />
                <Bar dataKey="Avg Champion" fill="#2E8B57" radius={[4,4,0,0]} />
                <Bar dataKey="Avg Runner-Up" fill="#C9472A" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </main>
  )
}