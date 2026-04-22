'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'

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

const TEAM_COLORS: Record<string, string> = {
  ANA:"#FC4C02", BOS:"#FFB81C", BUF:"#041E42", CAR:"#A2AAAD",
  CGY:"#F1BE08", CHI:"#C8102E", CBJ:"#041E42", COL:"#6F263D",
  DAL:"#006341", DET:"#C8102E", EDM:"#CF4520", FLA:"#b9975b",
  LAK:"#888888", MIN:"#154734", MTL:"#a6192e", NJD:"#c8102e",
  NSH:"#ffb81c", NYI:"#fc4c02", NYR:"#0033a0", OTT:"#c8102e",
  PHI:"#fa4616", PIT:"#ffb81c", SEA:"#9CDBD9", SJS:"#006272",
  STL:"#003087", TBL:"#00205b", TOR:"#00205b", UTA:"#69B3E7",
  VAN:"#97999b", VGK:"#b4975a", WSH:"#a6192e", WPG:"#041e42",
}

const LOGO_URL = (abbrev: string) =>
  `https://assets.nhle.com/logos/nhl/svg/${abbrev}_light.svg`

function createLogoIcon(abbrev: string) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #1f2937;
        border: 2px solid ${TEAM_COLORS[abbrev] || '#2E75B6'};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.6);
        overflow: hidden;
      ">
        <img
          src="${LOGO_URL(abbrev)}"
          style="width: 22px; height: 22px; object-fit: contain;"
        />
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

// Linearly interpolate between two lat/lon positions
function lerp(
  from: [number, number],
  to: [number, number],
  t: number
): [number, number] {
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
  ]
}

type Props = {
  teamPositions: Record<string, [number, number]>
  teamMiles: Record<string, number>
}

// Animated markers component — lives inside MapContainer
function AnimatedMarkers({ teamPositions, teamMiles }: Props) {
  const ANIMATION_MS = 400
  const TRAIL_LENGTH = 2

  // Current rendered positions (updated every animation frame)
  const [renderPositions, setRenderPositions] = useState<Record<string, [number, number]>>(teamPositions)

  // Trail: last N confirmed positions per team (before current animation)
  const [trails, setTrails] = useState<Record<string, [number, number][]>>({})

  // Refs to track animation state without causing re-renders
  const fromPositions  = useRef<Record<string, [number, number]>>(teamPositions)
  const toPositions    = useRef<Record<string, [number, number]>>(teamPositions)
  const animStartTime  = useRef<number | null>(null)
  const rafHandle      = useRef<number | null>(null)
  const prevPositions  = useRef<Record<string, [number, number]>>(teamPositions)

  useEffect(() => {
    // When target positions change, record the trail and start a new animation
    const newTrails: Record<string, [number, number][]> = {}
    Object.keys(teamPositions).forEach(abbrev => {
      const prev = prevPositions.current[abbrev]
      const next = teamPositions[abbrev]
      if (prev && (prev[0] !== next[0] || prev[1] !== next[1])) {
        const existing = trails[abbrev] || []
        newTrails[abbrev] = [...existing, prev].slice(-TRAIL_LENGTH)
      } else {
        newTrails[abbrev] = trails[abbrev] || []
      }
    })
    setTrails(newTrails)

    fromPositions.current = { ...renderPositions }
    toPositions.current   = { ...teamPositions }
    animStartTime.current = null
    prevPositions.current = { ...teamPositions }

    // Cancel any existing animation
    if (rafHandle.current !== null) {
      cancelAnimationFrame(rafHandle.current)
    }

    function animate(timestamp: number) {
      if (animStartTime.current === null) animStartTime.current = timestamp
      const elapsed = timestamp - animStartTime.current
      const t = Math.min(elapsed / ANIMATION_MS, 1)

      // Ease in-out
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

      const interpolated: Record<string, [number, number]> = {}
      Object.keys(toPositions.current).forEach(abbrev => {
        const from = fromPositions.current[abbrev] || toPositions.current[abbrev]
        const to   = toPositions.current[abbrev]
        interpolated[abbrev] = lerp(from, to, eased)
      })

      setRenderPositions(interpolated)

      if (t < 1) {
        rafHandle.current = requestAnimationFrame(animate)
      }
    }

    rafHandle.current = requestAnimationFrame(animate)

    return () => {
      if (rafHandle.current !== null) cancelAnimationFrame(rafHandle.current)
    }
  }, [teamPositions])

  return (
    <>
      {/* Trail lines */}
      {Object.entries(trails).map(([abbrev, trailPoints]) => {
        if (trailPoints.length === 0) return null
        const current = renderPositions[abbrev]
        if (!current) return null
        const points: [number, number][] = [...trailPoints, current]
        return (
          <Polyline
            key={`trail-${abbrev}`}
            positions={points}
            pathOptions={{
              color: TEAM_COLORS[abbrev] || '#ffffff',
              weight: 1.5,
              opacity: 0.3,
              dashArray: '4 4',
            }}
          />
        )
      })}

      {/* Team markers */}
      {Object.entries(renderPositions).map(([abbrev, pos]) => (
        <Marker
          key={abbrev}
          position={pos}
          icon={createLogoIcon(abbrev)}
        >
          <Tooltip direction="top" offset={[0, -16]}>
            <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{abbrev}</div>
            <div style={{ fontSize: '12px' }}>{TEAM_NAMES[abbrev]}</div>
            <div style={{ fontSize: '12px' }}>
              {(teamMiles[abbrev] || 0).toLocaleString()} miles
            </div>
          </Tooltip>
        </Marker>
      ))}
    </>
  )
}

export default function TravelMap({ teamPositions, teamMiles }: Props) {
  return (
    <MapContainer
      center={[45, -95]}
      zoom={3}
      style={{ height: "500px", width: "100%", borderRadius: "12px" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      <AnimatedMarkers
        teamPositions={teamPositions}
        teamMiles={teamMiles}
      />
    </MapContainer>
  )
}