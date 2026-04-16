'use client'

import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'

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

const TEAM_COLORS = {
  ANA:"#F47A38", BOS:"#FFB81C", BUF:"#003087", CAR:"#CC0000",
  CGY:"#C8102E", CHI:"#CF0A2C", CBJ:"#002654", COL:"#6F263D",
  DAL:"#006847", DET:"#CE1126", EDM:"#FF4C00", FLA:"#041E42",
  LAK:"#A2AAAD", MIN:"#154734", MTL:"#AF1E2D", NJD:"#CE1126",
  NSH:"#FFB81C", NYI:"#003087", NYR:"#0038A8", OTT:"#C52032",
  PHI:"#F74902", PIT:"#FCB514", SEA:"#99D9D9", SJS:"#006D75",
  STL:"#002F87", TBL:"#002868", TOR:"#003E7E", UTA:"#69B3E7",
  VAN:"#00205B", VGK:"#B4975A", WSH:"#CF0A2C", WPG:"#041E42",
}

type Props = {
  teamPositions: Record<string, [number, number]>
  teamMiles: Record<string, number>
}

export default function TravelMap({ teamPositions, teamMiles }: Props) {
  return (
    <MapContainer
      center={[45, -95]}
      zoom={3}
      style={{ height: "500px", width: "100%", borderRadius: "12px" }}
      zoomControl={true}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      {Object.entries(teamPositions).map(([abbrev, [lat, lon]]) => (
        <CircleMarker
          key={abbrev}
          center={[lat, lon]}
          radius={8}
          pathOptions={{
            color: TEAM_COLORS[abbrev] || "#2E75B6",
            fillColor: TEAM_COLORS[abbrev] || "#2E75B6",
            fillOpacity: 0.9,
            weight: 2,
          }}
        >
          <Tooltip permanent={false} direction="top">
            <div style={{ fontWeight: 'bold' }}>{abbrev}</div>
            <div>{TEAM_NAMES[abbrev]}</div>
            <div>{(teamMiles[abbrev] || 0).toLocaleString()} miles</div>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}