'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import styles from './game.module.css'

// ---------------------------------------------------------------------------
// Supabase client
// ---------------------------------------------------------------------------
const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

// ---------------------------------------------------------------------------
// Game configuration — edit this array to change active categories
// Available stats: wins, losses, otLosses, points, pointPct,
//   regulationAndOtWins, winsInRegulation, winsInShootout,
//   goalsFor, goalsAgainst, goalsForPerGame, goalsAgainstPerGame,
//   shotsForPerGame, shotsAgainstPerGame, powerPlayPct, powerPlayNetPct,
//   penaltyKillPct, penaltyKillNetPct, faceoffWinPct, teamShutouts
// ---------------------------------------------------------------------------
const CATEGORIES = [
  { id: 'wins',        label: 'Wins',                 stat: 'wins',               higher: true  },
  { id: 'goalsFor',    label: 'Goals for / game',     stat: 'goalsForPerGame',    higher: true  },
  { id: 'goalsAgainst',label: 'Goals against / game', stat: 'goalsAgainstPerGame',higher: false },
  { id: 'pp',          label: 'Power play %',         stat: 'powerPlayPct',       higher: true  },
  { id: 'pk',          label: 'Penalty kill %',       stat: 'penaltyKillPct',     higher: true  },
  { id: 'shots',       label: 'Shots for / game',     stat: 'shotsForPerGame',    higher: true  },
]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Team {
  teamAbbrev:          string
  teamFullName:        string
  gamesPlayed:         number
  wins:                number
  losses:              number
  otLosses:            number
  points:              number
  pointPct:            number
  regulationAndOtWins: number
  winsInRegulation:    number
  winsInShootout:      number
  goalsFor:            number
  goalsAgainst:        number
  goalsForPerGame:     number
  goalsAgainstPerGame: number
  shotsForPerGame:     number
  shotsAgainstPerGame: number
  powerPlayPct:        number
  powerPlayNetPct:     number
  penaltyKillPct:      number
  penaltyKillNetPct:   number
  faceoffWinPct:       number
  teamShutouts:        number
  [key: string]: number | string
}

interface Slot {
  id:           string
  label:        string
  stat:         string
  higher:       boolean
  assignedTeam: string | null
  rank:         number | null
}

type Rankings = Record<string, Record<string, number>>

// ---------------------------------------------------------------------------
// Mock data — fallback when Supabase is unreachable
// ---------------------------------------------------------------------------
const MOCK_TEAMS: Team[] = [
  { teamAbbrev: 'BOS', teamFullName: 'Boston Bruins',          gamesPlayed: 82, wins: 54, losses: 20, otLosses: 8,  points: 116, pointPct: 0.707, regulationAndOtWins: 48, winsInRegulation: 44, winsInShootout: 6,  goalsFor: 289, goalsAgainst: 222, goalsForPerGame: 3.52, goalsAgainstPerGame: 2.71, shotsForPerGame: 34.1, shotsAgainstPerGame: 28.2, powerPlayPct: 26.1, powerPlayNetPct: 22.4, penaltyKillPct: 83.2, penaltyKillNetPct: 80.1, faceoffWinPct: 0.512, teamShutouts: 8  },
  { teamAbbrev: 'CAR', teamFullName: 'Carolina Hurricanes',    gamesPlayed: 82, wins: 52, losses: 22, otLosses: 8,  points: 112, pointPct: 0.683, regulationAndOtWins: 47, winsInRegulation: 43, winsInShootout: 5,  goalsFor: 261, goalsAgainst: 204, goalsForPerGame: 3.18, goalsAgainstPerGame: 2.48, shotsForPerGame: 34.8, shotsAgainstPerGame: 27.1, powerPlayPct: 21.4, powerPlayNetPct: 18.2, penaltyKillPct: 85.1, penaltyKillNetPct: 82.4, faceoffWinPct: 0.524, teamShutouts: 10 },
  { teamAbbrev: 'WPG', teamFullName: 'Winnipeg Jets',          gamesPlayed: 82, wins: 50, losses: 24, otLosses: 8,  points: 108, pointPct: 0.659, regulationAndOtWins: 44, winsInRegulation: 40, winsInShootout: 6,  goalsFor: 265, goalsAgainst: 214, goalsForPerGame: 3.23, goalsAgainstPerGame: 2.61, shotsForPerGame: 30.5, shotsAgainstPerGame: 27.8, powerPlayPct: 22.8, powerPlayNetPct: 19.5, penaltyKillPct: 83.7, penaltyKillNetPct: 80.8, faceoffWinPct: 0.531, teamShutouts: 7  },
  { teamAbbrev: 'DAL', teamFullName: 'Dallas Stars',           gamesPlayed: 82, wins: 49, losses: 25, otLosses: 8,  points: 106, pointPct: 0.646, regulationAndOtWins: 43, winsInRegulation: 39, winsInShootout: 6,  goalsFor: 253, goalsAgainst: 217, goalsForPerGame: 3.08, goalsAgainstPerGame: 2.65, shotsForPerGame: 31.2, shotsAgainstPerGame: 27.4, powerPlayPct: 21.9, powerPlayNetPct: 18.7, penaltyKillPct: 84.2, penaltyKillNetPct: 81.3, faceoffWinPct: 0.518, teamShutouts: 6  },
  { teamAbbrev: 'FLA', teamFullName: 'Florida Panthers',       gamesPlayed: 82, wins: 48, losses: 26, otLosses: 8,  points: 104, pointPct: 0.634, regulationAndOtWins: 42, winsInRegulation: 38, winsInShootout: 6,  goalsFor: 276, goalsAgainst: 229, goalsForPerGame: 3.37, goalsAgainstPerGame: 2.79, shotsForPerGame: 32.8, shotsAgainstPerGame: 28.9, powerPlayPct: 25.2, powerPlayNetPct: 21.8, penaltyKillPct: 81.5, penaltyKillNetPct: 78.4, faceoffWinPct: 0.507, teamShutouts: 5  },
  { teamAbbrev: 'NYR', teamFullName: 'New York Rangers',       gamesPlayed: 82, wins: 46, losses: 28, otLosses: 8,  points: 100, pointPct: 0.610, regulationAndOtWins: 40, winsInRegulation: 36, winsInShootout: 6,  goalsFor: 263, goalsAgainst: 225, goalsForPerGame: 3.21, goalsAgainstPerGame: 2.74, shotsForPerGame: 33.5, shotsAgainstPerGame: 29.1, powerPlayPct: 23.5, powerPlayNetPct: 20.1, penaltyKillPct: 82.1, penaltyKillNetPct: 79.2, faceoffWinPct: 0.503, teamShutouts: 5  },
  { teamAbbrev: 'TOR', teamFullName: 'Toronto Maple Leafs',    gamesPlayed: 82, wins: 45, losses: 29, otLosses: 8,  points: 98,  pointPct: 0.598, regulationAndOtWins: 39, winsInRegulation: 35, winsInShootout: 6,  goalsFor: 252, goalsAgainst: 256, goalsForPerGame: 3.07, goalsAgainstPerGame: 3.12, shotsForPerGame: 32.6, shotsAgainstPerGame: 31.4, powerPlayPct: 22.1, powerPlayNetPct: 18.9, penaltyKillPct: 78.3, penaltyKillNetPct: 75.1, faceoffWinPct: 0.496, teamShutouts: 4  },
  { teamAbbrev: 'COL', teamFullName: 'Colorado Avalanche',     gamesPlayed: 82, wins: 44, losses: 30, otLosses: 8,  points: 96,  pointPct: 0.585, regulationAndOtWins: 38, winsInRegulation: 34, winsInShootout: 6,  goalsFor: 280, goalsAgainst: 261, goalsForPerGame: 3.41, goalsAgainstPerGame: 3.18, shotsForPerGame: 35.1, shotsAgainstPerGame: 30.2, powerPlayPct: 22.6, powerPlayNetPct: 19.4, penaltyKillPct: 79.8, penaltyKillNetPct: 76.7, faceoffWinPct: 0.488, teamShutouts: 4  },
  { teamAbbrev: 'EDM', teamFullName: 'Edmonton Oilers',        gamesPlayed: 82, wins: 43, losses: 31, otLosses: 8,  points: 94,  pointPct: 0.573, regulationAndOtWins: 37, winsInRegulation: 33, winsInShootout: 6,  goalsFor: 270, goalsAgainst: 255, goalsForPerGame: 3.29, goalsAgainstPerGame: 3.11, shotsForPerGame: 30.7, shotsAgainstPerGame: 29.8, powerPlayPct: 27.4, powerPlayNetPct: 24.1, penaltyKillPct: 78.2, penaltyKillNetPct: 75.1, faceoffWinPct: 0.501, teamShutouts: 3  },
  { teamAbbrev: 'WSH', teamFullName: 'Washington Capitals',    gamesPlayed: 82, wins: 43, losses: 31, otLosses: 8,  points: 94,  pointPct: 0.573, regulationAndOtWins: 37, winsInRegulation: 33, winsInShootout: 6,  goalsFor: 258, goalsAgainst: 236, goalsForPerGame: 3.15, goalsAgainstPerGame: 2.88, shotsForPerGame: 32.6, shotsAgainstPerGame: 29.4, powerPlayPct: 23.1, powerPlayNetPct: 19.9, penaltyKillPct: 81.3, penaltyKillNetPct: 78.2, faceoffWinPct: 0.514, teamShutouts: 5  },
  { teamAbbrev: 'VGK', teamFullName: 'Vegas Golden Knights',   gamesPlayed: 82, wins: 42, losses: 32, otLosses: 8,  points: 92,  pointPct: 0.561, regulationAndOtWins: 36, winsInRegulation: 32, winsInShootout: 6,  goalsFor: 253, goalsAgainst: 241, goalsForPerGame: 3.08, goalsAgainstPerGame: 2.94, shotsForPerGame: 31.9, shotsAgainstPerGame: 29.1, powerPlayPct: 22.8, powerPlayNetPct: 19.6, penaltyKillPct: 80.5, penaltyKillNetPct: 77.4, faceoffWinPct: 0.509, teamShutouts: 4  },
  { teamAbbrev: 'MIN', teamFullName: 'Minnesota Wild',         gamesPlayed: 82, wins: 41, losses: 33, otLosses: 8,  points: 90,  pointPct: 0.549, regulationAndOtWins: 35, winsInRegulation: 31, winsInShootout: 6,  goalsFor: 244, goalsAgainst: 234, goalsForPerGame: 2.98, goalsAgainstPerGame: 2.85, shotsForPerGame: 29.8, shotsAgainstPerGame: 28.6, powerPlayPct: 20.4, powerPlayNetPct: 17.2, penaltyKillPct: 82.6, penaltyKillNetPct: 79.5, faceoffWinPct: 0.521, teamShutouts: 5  },
  { teamAbbrev: 'NJD', teamFullName: 'New Jersey Devils',      gamesPlayed: 82, wins: 40, losses: 34, otLosses: 8,  points: 88,  pointPct: 0.537, regulationAndOtWins: 34, winsInRegulation: 30, winsInShootout: 6,  goalsFor: 238, goalsAgainst: 243, goalsForPerGame: 2.90, goalsAgainstPerGame: 2.96, shotsForPerGame: 31.6, shotsAgainstPerGame: 29.8, powerPlayPct: 21.1, powerPlayNetPct: 17.9, penaltyKillPct: 79.4, penaltyKillNetPct: 76.3, faceoffWinPct: 0.497, teamShutouts: 4  },
  { teamAbbrev: 'LAK', teamFullName: 'Los Angeles Kings',      gamesPlayed: 82, wins: 40, losses: 34, otLosses: 8,  points: 88,  pointPct: 0.537, regulationAndOtWins: 34, winsInRegulation: 30, winsInShootout: 6,  goalsFor: 236, goalsAgainst: 230, goalsForPerGame: 2.88, goalsAgainstPerGame: 2.80, shotsForPerGame: 30.5, shotsAgainstPerGame: 28.1, powerPlayPct: 20.5, powerPlayNetPct: 17.3, penaltyKillPct: 81.9, penaltyKillNetPct: 78.8, faceoffWinPct: 0.516, teamShutouts: 5  },
  { teamAbbrev: 'TBL', teamFullName: 'Tampa Bay Lightning',    gamesPlayed: 82, wins: 39, losses: 35, otLosses: 8,  points: 86,  pointPct: 0.524, regulationAndOtWins: 33, winsInRegulation: 29, winsInShootout: 6,  goalsFor: 255, goalsAgainst: 249, goalsForPerGame: 3.11, goalsAgainstPerGame: 3.04, shotsForPerGame: 31.2, shotsAgainstPerGame: 30.1, powerPlayPct: 23.2, powerPlayNetPct: 19.9, penaltyKillPct: 80.1, penaltyKillNetPct: 77.0, faceoffWinPct: 0.508, teamShutouts: 4  },
  { teamAbbrev: 'UTA', teamFullName: 'Utah Hockey Club',       gamesPlayed: 82, wins: 38, losses: 36, otLosses: 8,  points: 84,  pointPct: 0.512, regulationAndOtWins: 32, winsInRegulation: 28, winsInShootout: 6,  goalsFor: 242, goalsAgainst: 239, goalsForPerGame: 2.95, goalsAgainstPerGame: 2.91, shotsForPerGame: 29.6, shotsAgainstPerGame: 28.4, powerPlayPct: 20.8, powerPlayNetPct: 17.6, penaltyKillPct: 80.2, penaltyKillNetPct: 77.1, faceoffWinPct: 0.503, teamShutouts: 4  },
  { teamAbbrev: 'SEA', teamFullName: 'Seattle Kraken',         gamesPlayed: 82, wins: 37, losses: 37, otLosses: 8,  points: 82,  pointPct: 0.500, regulationAndOtWins: 31, winsInRegulation: 27, winsInShootout: 6,  goalsFor: 231, goalsAgainst: 250, goalsForPerGame: 2.82, goalsAgainstPerGame: 3.05, shotsForPerGame: 29.9, shotsAgainstPerGame: 29.6, powerPlayPct: 19.4, powerPlayNetPct: 16.2, penaltyKillPct: 78.6, penaltyKillNetPct: 75.5, faceoffWinPct: 0.491, teamShutouts: 3  },
  { teamAbbrev: 'OTT', teamFullName: 'Ottawa Senators',        gamesPlayed: 82, wins: 37, losses: 37, otLosses: 8,  points: 82,  pointPct: 0.500, regulationAndOtWins: 31, winsInRegulation: 27, winsInShootout: 6,  goalsFor: 249, goalsAgainst: 263, goalsForPerGame: 3.04, goalsAgainstPerGame: 3.21, shotsForPerGame: 31.4, shotsAgainstPerGame: 30.8, powerPlayPct: 21.5, powerPlayNetPct: 18.3, penaltyKillPct: 76.4, penaltyKillNetPct: 73.3, faceoffWinPct: 0.494, teamShutouts: 3  },
  { teamAbbrev: 'VAN', teamFullName: 'Vancouver Canucks',      gamesPlayed: 82, wins: 36, losses: 38, otLosses: 8,  points: 80,  pointPct: 0.488, regulationAndOtWins: 30, winsInRegulation: 26, winsInShootout: 6,  goalsFor: 228, goalsAgainst: 257, goalsForPerGame: 2.78, goalsAgainstPerGame: 3.13, shotsForPerGame: 28.8, shotsAgainstPerGame: 29.3, powerPlayPct: 20.1, powerPlayNetPct: 16.9, penaltyKillPct: 77.2, penaltyKillNetPct: 74.1, faceoffWinPct: 0.486, teamShutouts: 3  },
  { teamAbbrev: 'STL', teamFullName: 'St. Louis Blues',        gamesPlayed: 82, wins: 36, losses: 38, otLosses: 8,  points: 80,  pointPct: 0.488, regulationAndOtWins: 30, winsInRegulation: 26, winsInShootout: 6,  goalsFor: 237, goalsAgainst: 252, goalsForPerGame: 2.89, goalsAgainstPerGame: 3.07, shotsForPerGame: 29.1, shotsAgainstPerGame: 28.7, powerPlayPct: 20.6, powerPlayNetPct: 17.4, penaltyKillPct: 77.8, penaltyKillNetPct: 74.7, faceoffWinPct: 0.502, teamShutouts: 3  },
  { teamAbbrev: 'DET', teamFullName: 'Detroit Red Wings',      gamesPlayed: 82, wins: 35, losses: 39, otLosses: 8,  points: 78,  pointPct: 0.476, regulationAndOtWins: 29, winsInRegulation: 25, winsInShootout: 6,  goalsFor: 225, goalsAgainst: 253, goalsForPerGame: 2.74, goalsAgainstPerGame: 3.09, shotsForPerGame: 29.8, shotsAgainstPerGame: 29.4, powerPlayPct: 19.8, powerPlayNetPct: 16.6, penaltyKillPct: 77.4, penaltyKillNetPct: 74.3, faceoffWinPct: 0.498, teamShutouts: 3  },
  { teamAbbrev: 'PHI', teamFullName: 'Philadelphia Flyers',    gamesPlayed: 82, wins: 35, losses: 39, otLosses: 8,  points: 78,  pointPct: 0.476, regulationAndOtWins: 29, winsInRegulation: 25, winsInShootout: 6,  goalsFor: 234, goalsAgainst: 255, goalsForPerGame: 2.85, goalsAgainstPerGame: 3.11, shotsForPerGame: 28.4, shotsAgainstPerGame: 29.1, powerPlayPct: 19.5, powerPlayNetPct: 16.3, penaltyKillPct: 78.1, penaltyKillNetPct: 75.0, faceoffWinPct: 0.489, teamShutouts: 3  },
  { teamAbbrev: 'NYI', teamFullName: 'New York Islanders',     gamesPlayed: 82, wins: 34, losses: 40, otLosses: 8,  points: 76,  pointPct: 0.463, regulationAndOtWins: 28, winsInRegulation: 24, winsInShootout: 6,  goalsFor: 222, goalsAgainst: 248, goalsForPerGame: 2.71, goalsAgainstPerGame: 3.02, shotsForPerGame: 28.1, shotsAgainstPerGame: 28.8, powerPlayPct: 19.1, powerPlayNetPct: 15.9, penaltyKillPct: 79.3, penaltyKillNetPct: 76.2, faceoffWinPct: 0.511, teamShutouts: 4  },
  { teamAbbrev: 'MTL', teamFullName: 'Montréal Canadiens',     gamesPlayed: 82, wins: 33, losses: 41, otLosses: 8,  points: 74,  pointPct: 0.451, regulationAndOtWins: 27, winsInRegulation: 23, winsInShootout: 6,  goalsFor: 220, goalsAgainst: 264, goalsForPerGame: 2.68, goalsAgainstPerGame: 3.22, shotsForPerGame: 28.5, shotsAgainstPerGame: 30.1, powerPlayPct: 18.8, powerPlayNetPct: 15.6, penaltyKillPct: 77.1, penaltyKillNetPct: 74.0, faceoffWinPct: 0.481, teamShutouts: 2  },
  { teamAbbrev: 'CGY', teamFullName: 'Calgary Flames',         gamesPlayed: 82, wins: 34, losses: 40, otLosses: 8,  points: 76,  pointPct: 0.463, regulationAndOtWins: 28, winsInRegulation: 24, winsInShootout: 6,  goalsFor: 214, goalsAgainst: 261, goalsForPerGame: 2.61, goalsAgainstPerGame: 3.18, shotsForPerGame: 26.4, shotsAgainstPerGame: 29.6, powerPlayPct: 16.2, powerPlayNetPct: 13.0, penaltyKillPct: 80.4, penaltyKillNetPct: 77.3, faceoffWinPct: 0.493, teamShutouts: 4  },
  { teamAbbrev: 'PIT', teamFullName: 'Pittsburgh Penguins',    gamesPlayed: 82, wins: 32, losses: 42, otLosses: 8,  points: 72,  pointPct: 0.439, regulationAndOtWins: 26, winsInRegulation: 22, winsInShootout: 6,  goalsFor: 217, goalsAgainst: 275, goalsForPerGame: 2.65, goalsAgainstPerGame: 3.35, shotsForPerGame: 27.8, shotsAgainstPerGame: 30.4, powerPlayPct: 17.8, powerPlayNetPct: 14.6, penaltyKillPct: 75.8, penaltyKillNetPct: 72.7, faceoffWinPct: 0.487, teamShutouts: 2  },
  { teamAbbrev: 'NSH', teamFullName: 'Nashville Predators',    gamesPlayed: 82, wins: 31, losses: 43, otLosses: 8,  points: 70,  pointPct: 0.427, regulationAndOtWins: 25, winsInRegulation: 21, winsInShootout: 6,  goalsFor: 212, goalsAgainst: 280, goalsForPerGame: 2.59, goalsAgainstPerGame: 3.41, shotsForPerGame: 27.1, shotsAgainstPerGame: 30.8, powerPlayPct: 17.1, powerPlayNetPct: 13.9, penaltyKillPct: 75.2, penaltyKillNetPct: 72.1, faceoffWinPct: 0.483, teamShutouts: 2  },
  { teamAbbrev: 'BUF', teamFullName: 'Buffalo Sabres',         gamesPlayed: 82, wins: 30, losses: 44, otLosses: 8,  points: 68,  pointPct: 0.415, regulationAndOtWins: 24, winsInRegulation: 20, winsInShootout: 6,  goalsFor: 223, goalsAgainst: 277, goalsForPerGame: 2.72, goalsAgainstPerGame: 3.38, shotsForPerGame: 28.2, shotsAgainstPerGame: 30.6, powerPlayPct: 18.4, powerPlayNetPct: 15.2, penaltyKillPct: 75.9, penaltyKillNetPct: 72.8, faceoffWinPct: 0.479, teamShutouts: 2  },
  { teamAbbrev: 'CBJ', teamFullName: 'Columbus Blue Jackets',  gamesPlayed: 82, wins: 29, losses: 45, otLosses: 8,  points: 66,  pointPct: 0.402, regulationAndOtWins: 23, winsInRegulation: 19, winsInShootout: 6,  goalsFor: 214, goalsAgainst: 283, goalsForPerGame: 2.61, goalsAgainstPerGame: 3.45, shotsForPerGame: 27.5, shotsAgainstPerGame: 31.2, powerPlayPct: 17.4, powerPlayNetPct: 14.2, penaltyKillPct: 74.8, penaltyKillNetPct: 71.7, faceoffWinPct: 0.476, teamShutouts: 2  },
  { teamAbbrev: 'CHI', teamFullName: 'Chicago Blackhawks',     gamesPlayed: 82, wins: 29, losses: 45, otLosses: 8,  points: 66,  pointPct: 0.402, regulationAndOtWins: 23, winsInRegulation: 19, winsInShootout: 6,  goalsFor: 210, goalsAgainst: 270, goalsForPerGame: 2.56, goalsAgainstPerGame: 3.29, shotsForPerGame: 24.6, shotsAgainstPerGame: 29.9, powerPlayPct: 16.9, powerPlayNetPct: 13.7, penaltyKillPct: 83.6, penaltyKillNetPct: 80.5, faceoffWinPct: 0.461, teamShutouts: 5  },
  { teamAbbrev: 'ANA', teamFullName: 'Anaheim Ducks',          gamesPlayed: 82, wins: 27, losses: 47, otLosses: 8,  points: 62,  pointPct: 0.378, regulationAndOtWins: 21, winsInRegulation: 17, winsInShootout: 6,  goalsFor: 209, goalsAgainst: 286, goalsForPerGame: 2.55, goalsAgainstPerGame: 3.49, shotsForPerGame: 26.5, shotsAgainstPerGame: 31.4, powerPlayPct: 16.5, powerPlayNetPct: 13.3, penaltyKillPct: 73.8, penaltyKillNetPct: 70.7, faceoffWinPct: 0.471, teamShutouts: 2  },
  { teamAbbrev: 'SJS', teamFullName: 'San Jose Sharks',        gamesPlayed: 82, wins: 25, losses: 49, otLosses: 8,  points: 58,  pointPct: 0.354, regulationAndOtWins: 19, winsInRegulation: 15, winsInShootout: 6,  goalsFor: 210, goalsAgainst: 314, goalsForPerGame: 2.56, goalsAgainstPerGame: 3.83, shotsForPerGame: 26.0, shotsAgainstPerGame: 29.8, powerPlayPct: 21.8, powerPlayNetPct: 19.2, penaltyKillPct: 71.5, penaltyKillNetPct: 75.4, faceoffWinPct: 0.493, teamShutouts: 2  },
]

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------
function shuffle(arr: string[]): string[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function computeRankings(teams: Team[]): Rankings {
  const rankings: Rankings = {}
  for (const cat of CATEGORIES) {
    const sorted = [...teams].sort((a, b) =>
      cat.higher
        ? ((b[cat.stat] as number) ?? 0) - ((a[cat.stat] as number) ?? 0)
        : ((a[cat.stat] as number) ?? 0) - ((b[cat.stat] as number) ?? 0)
    )
    rankings[cat.id] = {}
    sorted.forEach((t, i, arr) => {
      const val = (t[cat.stat] as number) ?? 0
      const prevVal = (arr[i - 1]?.[cat.stat] as number) ?? 0
      if (i === 0 || val !== prevVal) {
        rankings[cat.id][t.teamAbbrev] = i + 1
      } else {
        rankings[cat.id][t.teamAbbrev] = rankings[cat.id][arr[i - 1].teamAbbrev]
      }
    })
  }
  return rankings
}

function rankColorClass(rank: number, total: number): string {
  const p = rank / total
  if (p <= 0.10) return styles.rankG1
  if (p <= 0.22) return styles.rankG2
  if (p <= 0.38) return styles.rankG3
  if (p <= 0.55) return styles.rankM1
  if (p <= 0.70) return styles.rankM2
  if (p <= 0.82) return styles.rankB1
  if (p <= 0.93) return styles.rankB2
  return styles.rankB3
}

function computePerfectScore(teamAbbrevs: string[], rankings: Rankings): number {
  const catIds = CATEGORIES.map(c => c.id)
  function* permutations(arr: string[]): Generator<string[]> {
    if (arr.length <= 1) { yield arr; return }
    for (let i = 0; i < arr.length; i++) {
      const rest = arr.filter((_, j) => j !== i)
      for (const p of permutations(rest)) yield [arr[i], ...p]
    }
  }
  let best = Infinity
  for (const perm of permutations(teamAbbrevs)) {
    let total = 0
    for (let i = 0; i < catIds.length; i++) total += rankings[catIds[i]][perm[i]] ?? 0
    if (total < best) best = total
  }
  return best
}

// ---------------------------------------------------------------------------
// Logo roulette hook
// ---------------------------------------------------------------------------
function useLogoRoulette(targetAbbrev: string | null, allAbbrevs: string[]) {
  const [displayAbbrev, setDisplayAbbrev] = useState(targetAbbrev)
  const [isSpinning, setIsSpinning]       = useState(false)
  const prevTarget = useRef(targetAbbrev)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (prevTarget.current === targetAbbrev || !targetAbbrev || allAbbrevs.length < 2) {
      setDisplayAbbrev(targetAbbrev)
      prevTarget.current = targetAbbrev
      return
    }
    prevTarget.current = targetAbbrev
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsSpinning(true)

    const intervals = [80,80,80,80,80,80,80,80, 140,140,140,140, 220,280,360]
    const others = allAbbrevs.filter(a => a !== targetAbbrev)
    let step = 0

    function tick() {
      if (step < intervals.length) {
        setDisplayAbbrev(others[Math.floor(Math.random() * others.length)])
        timerRef.current = setTimeout(tick, intervals[step++])
      } else {
        setDisplayAbbrev(targetAbbrev)
        setIsSpinning(false)
      }
    }
    timerRef.current = setTimeout(tick, intervals[0])
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [targetAbbrev]) // eslint-disable-line react-hooks/exhaustive-deps

  return { displayAbbrev, isSpinning }
}

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------
async function loadTeamData(): Promise<{ teams: Team[]; source: string }> {
  if (!supabase) return { teams: MOCK_TEAMS, source: 'mock' }
  try {
    const { data, error } = await supabase
      .from('nhl_team_stats')
      .select('*')
      .eq('season', '20252026')
    if (error || !data?.length) throw new Error(error?.message ?? 'No data')
    const teams: Team[] = data.map((t: Record<string, unknown>) => ({
      teamAbbrev:          t.team_abbrev          as string,
      teamFullName:        t.team_full_name        as string,
      gamesPlayed:         t.games_played          as number,
      wins:                t.wins                  as number,
      losses:              t.losses                as number,
      otLosses:            t.ot_losses             as number,
      points:              t.points                as number,
      pointPct:            t.point_pct             as number,
      regulationAndOtWins: t.regulation_and_ot_wins as number,
      winsInRegulation:    t.wins_in_regulation    as number,
      winsInShootout:      t.wins_in_shootout      as number,
      goalsFor:            t.goals_for             as number,
      goalsAgainst:        t.goals_against         as number,
      goalsForPerGame:     t.goals_for_per_game    as number,
      goalsAgainstPerGame: t.goals_against_per_game as number,
      shotsForPerGame:     t.shots_for_per_game    as number,
      shotsAgainstPerGame: t.shots_against_per_game as number,
      powerPlayPct:        t.power_play_pct        as number,
      powerPlayNetPct:     t.power_play_net_pct    as number,
      penaltyKillPct:      t.penalty_kill_pct      as number,
      penaltyKillNetPct:   t.penalty_kill_net_pct  as number,
      faceoffWinPct:       t.faceoff_win_pct       as number,
      teamShutouts:        t.team_shutouts         as number,
    }))
    return { teams, source: 'supabase' }
  } catch {
    return { teams: MOCK_TEAMS, source: 'mock' }
  }
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
function buildInitialSlots(): Slot[] {
  return CATEGORIES.map(cat => ({ ...cat, assignedTeam: null, rank: null }))
}

function TeamCard({ targetAbbrev, allAbbrevs, team }: {
  targetAbbrev: string | null
  allAbbrevs: string[]
  team: Team | undefined
}) {
  const { displayAbbrev, isSpinning } = useLogoRoulette(targetAbbrev, allAbbrevs)
  const [logoFailed, setLogoFailed]   = useState(false)
  useEffect(() => { setLogoFailed(false) }, [displayAbbrev])
  if (!team) return null
  return (
    <div className={`${styles.teamCard} ${isSpinning ? styles.spinning : ''}`}>
      <div className={styles.logoWrap}>
        {!logoFailed ? (
          <img
            className={styles.teamLogo}
            src={`https://assets.nhle.com/logos/nhl/svg/${displayAbbrev}_light.svg`}
            alt={displayAbbrev ?? ''}
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <div className={styles.logoFallback}>{displayAbbrev}</div>
        )}
      </div>
      <div className={styles.teamBody}>
        <div className={`${styles.teamName} ${isSpinning ? styles.hidden : ''}`}>
          {team.teamFullName}
        </div>
        <div className={`${styles.teamRecord} ${isSpinning ? styles.hidden : ''}`}>
          {team.gamesPlayed} GP &nbsp;·&nbsp; {team.wins}W–{team.losses}L–{team.otLosses}OTL
        </div>
      </div>
    </div>
  )
}

function SlotGrid({ slots, onAssign, teamCount, isBlocked }: {
  slots: Slot[]
  onAssign: (id: string) => void
  teamCount: number
  isBlocked: boolean
}) {
  return (
    <div className={styles.slotsGrid}>
      {slots.map(slot => (
        <button
          key={slot.id}
          className={`${styles.slot} ${slot.assignedTeam ? styles.locked : ''} ${isBlocked ? styles.blocked : ''}`}
          onClick={() => !slot.assignedTeam && !isBlocked && onAssign(slot.id)}
          disabled={!!slot.assignedTeam || isBlocked}
          aria-label={slot.assignedTeam ? `${slot.label}: rank ${slot.rank}` : `Assign to ${slot.label}`}
        >
          <div className={`${styles.slotLabel} ${slot.assignedTeam ? styles.slotLabelFilled : ''}`}>
            {slot.label}
          </div>
          <div className={`${styles.slotRank} ${slot.assignedTeam && slot.rank ? rankColorClass(slot.rank, teamCount) : styles.rankEmpty}`}>
            {slot.assignedTeam ? `#${slot.rank}` : '—'}
          </div>
        </button>
      ))}
    </div>
  )
}

function Results({ slots, teams, score, perfectScore, onPlayAgain }: {
  slots: Slot[]
  teams: Team[]
  score: number
  perfectScore: number
  onPlayAgain: () => void
}) {
  const n = teams.length
  const aboveOptimal = score - perfectScore
  return (
    <div className={styles.results}>
      <div className={styles.resultsScore}>{score}</div>
      <div className={styles.resultsLabel}>
        your score &nbsp;·&nbsp; perfect = {perfectScore}
        {aboveOptimal > 0 && (
          <span className={styles.aboveOptimal}> (+{aboveOptimal} above optimal)</span>
        )}
      </div>
      <div className={styles.breakdown}>
        {slots.map(slot => {
          const team = teams.find(t => t.teamAbbrev === slot.assignedTeam)
          const rc = slot.rank ? rankColorClass(slot.rank, n) : ''
          return (
            <div key={slot.id} className={styles.breakdownRow}>
              <span className={styles.bdCat}>{slot.label}</span>
              <span className={styles.bdTeam}>{team?.teamFullName ?? slot.assignedTeam}</span>
              <span className={`${styles.bdRank} ${rc}`}>
                #{slot.rank}
                <span className={styles.bdOf}> / {n}</span>
              </span>
            </div>
          )
        })}
      </div>
      <div className={styles.resultsActions}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onPlayAgain}>
          Play again
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function GamePage() {
  const [status, setStatus]             = useState<'loading' | 'playing' | 'complete'>('loading')
  const [teams, setTeams]               = useState<Team[]>([])
  const [rankings, setRankings]         = useState<Rankings>({})
  const [queue, setQueue]               = useState<string[]>([])
  const [currentTeam, setCurrentTeam]   = useState<string | null>(null)
  const [slots, setSlots]               = useState<Slot[]>(buildInitialSlots)
  const [score, setScore]               = useState(0)
  const [dataSource, setDataSource]     = useState<string | null>(null)
  const [perfectScore, setPerfectScore] = useState<number | null>(null)
  const [isSpinning, setIsSpinning]     = useState(false)
  const drawnTeams = useRef<string[]>([])
  const spinTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  const SPIN_DURATION = 80*8 + 140*4 + 220 + 280 + 360 + 50

  const startGame = useCallback((loadedTeams: Team[], source: string) => {
    const r = computeRankings(loadedTeams)
    const q = shuffle(loadedTeams.map(t => t.teamAbbrev))
    drawnTeams.current = []
    setTeams(loadedTeams)
    setRankings(r)
    setQueue(q.slice(1))
    setCurrentTeam(q[0])
    setSlots(buildInitialSlots())
    setScore(0)
    setPerfectScore(null)
    setDataSource(source)
    setIsSpinning(false)
    setStatus('playing')
  }, [])

  useEffect(() => {
    loadTeamData().then(({ teams, source }) => startGame(teams, source))
  }, [startGame])

  useEffect(() => {
    if (!currentTeam) return
    setIsSpinning(true)
    if (spinTimer.current) clearTimeout(spinTimer.current)
    spinTimer.current = setTimeout(() => setIsSpinning(false), SPIN_DURATION)
    return () => { if (spinTimer.current) clearTimeout(spinTimer.current) }
  }, [currentTeam]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAssign = useCallback((slotId: string) => {
    if (status !== 'playing' || !currentTeam || isSpinning) return
    const rank = rankings[slotId]?.[currentTeam]
    if (!rank) return
    drawnTeams.current = [...drawnTeams.current, currentTeam]
    const newSlots = slots.map(s =>
      s.id === slotId ? { ...s, assignedTeam: currentTeam, rank } : s
    )
    const newScore = score + rank
    const nextTeam = queue[0] ?? null
    const newQueue = queue.slice(1)
    setSlots(newSlots)
    setScore(newScore)
    setCurrentTeam(nextTeam)
    setQueue(newQueue)
    if (newSlots.every(s => s.assignedTeam)) {
      setPerfectScore(computePerfectScore(drawnTeams.current, rankings))
      setStatus('complete')
    }
  }, [status, currentTeam, isSpinning, rankings, slots, score, queue])

  const handlePlayAgain = useCallback(() => {
    startGame(teams, dataSource ?? 'mock')
  }, [teams, dataSource, startGame])

  const currentTeamData = teams.find(t => t.teamAbbrev === currentTeam)
  const allAbbrevs      = teams.map(t => t.teamAbbrev)
  const catsRemaining   = slots.filter(s => !s.assignedTeam).length

  return (
    <main className={styles.page}>
      {/* Back nav */}
      <div className={styles.nav}>
        <Link href="/" className={styles.backLink}>← Back</Link>
      </div>

      <div className={styles.app}>
        {/* Header */}
        <header className={styles.header}>
          <span className={styles.logoText}>Stat Grinder</span>
          <div className={styles.scorebar}>
            <div className={styles.statBlock}>
              <div className={styles.statValue}>{score}</div>
              <div className={styles.statLabel}>Score</div>
            </div>
            <div className={styles.scorebarDivider} />
            <div className={styles.statBlock}>
              <div className={styles.statValue}>
                {status === 'playing' ? catsRemaining : '—'}
              </div>
              <div className={styles.statLabel}>Categories left</div>
            </div>
          </div>
        </header>

        {status === 'loading' && (
          <div className={styles.loading}>Loading team stats…</div>
        )}

        {status === 'playing' && (
          <>
            <TeamCard
              targetAbbrev={currentTeam}
              allAbbrevs={allAbbrevs}
              team={currentTeamData}
            />
            <p className={styles.prompt}>
              {isSpinning ? '\u00A0' : `Assign ${currentTeamData?.teamFullName ?? '…'} to a category`}
            </p>
            <SlotGrid
              slots={slots}
              onAssign={handleAssign}
              teamCount={teams.length}
              isBlocked={isSpinning}
            />
            {dataSource === 'mock' && (
              <p className={styles.dataNotice}>
                Using mock data · run scripts/sync-team-stats.js to load live data
              </p>
            )}
          </>
        )}

        {status === 'complete' && (
          <>
            <SlotGrid slots={slots} onAssign={() => {}} teamCount={teams.length} isBlocked={false} />
            <Results
              slots={slots}
              teams={teams}
              score={score}
              perfectScore={perfectScore ?? 0}
              onPlayAgain={handlePlayAgain}
            />
          </>
        )}

        <footer className={styles.footer}>
          Ranks out of {teams.length || 32} teams · lower total score is better
          {dataSource && dataSource !== 'mock' && (
            <span className={styles.dataSource}> · {dataSource}</span>
          )}
        </footer>
      </div>
    </main>
  )
}
