'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import styles from './game.module.css'

// ---------------------------------------------------------------------------
// Supabase client
// ---------------------------------------------------------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type SportId = 'nhl' | 'nfl' | 'mlb' | 'nba'

interface Category {
  id:     string
  label:  string
  stat:   string
  higher: boolean
}

interface Team {
  teamAbbrev:   string
  teamFullName: string
  gamesPlayed:  number
  wins:         number
  losses:       number
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

interface SportConfig {
  id:            SportId
  label:         string
  categories:    Category[]
  logoUrl:       (abbrev: string) => string
  supabaseTable: string
  season:        string
  dbMap:         (row: Record<string, unknown>) => Team
  mockTeams:     Team[]
}

// ---------------------------------------------------------------------------
// Mock data — NHL
// ---------------------------------------------------------------------------
const NHL_MOCK_TEAMS: Team[] = [
  { teamAbbrev: 'BOS', teamFullName: 'Boston Bruins',          gamesPlayed: 82, wins: 54, losses: 20, otLosses: 8,  goalsForPerGame: 3.52, goalsAgainstPerGame: 2.71, shotsForPerGame: 34.1, powerPlayPct: 26.1, penaltyKillPct: 83.2 },
  { teamAbbrev: 'CAR', teamFullName: 'Carolina Hurricanes',    gamesPlayed: 82, wins: 52, losses: 22, otLosses: 8,  goalsForPerGame: 3.18, goalsAgainstPerGame: 2.48, shotsForPerGame: 34.8, powerPlayPct: 21.4, penaltyKillPct: 85.1 },
  { teamAbbrev: 'WPG', teamFullName: 'Winnipeg Jets',          gamesPlayed: 82, wins: 50, losses: 24, otLosses: 8,  goalsForPerGame: 3.23, goalsAgainstPerGame: 2.61, shotsForPerGame: 30.5, powerPlayPct: 22.8, penaltyKillPct: 83.7 },
  { teamAbbrev: 'DAL', teamFullName: 'Dallas Stars',           gamesPlayed: 82, wins: 49, losses: 25, otLosses: 8,  goalsForPerGame: 3.08, goalsAgainstPerGame: 2.65, shotsForPerGame: 31.2, powerPlayPct: 21.9, penaltyKillPct: 84.2 },
  { teamAbbrev: 'FLA', teamFullName: 'Florida Panthers',       gamesPlayed: 82, wins: 48, losses: 26, otLosses: 8,  goalsForPerGame: 3.37, goalsAgainstPerGame: 2.79, shotsForPerGame: 32.8, powerPlayPct: 25.2, penaltyKillPct: 81.5 },
  { teamAbbrev: 'NYR', teamFullName: 'New York Rangers',       gamesPlayed: 82, wins: 46, losses: 28, otLosses: 8,  goalsForPerGame: 3.21, goalsAgainstPerGame: 2.74, shotsForPerGame: 33.5, powerPlayPct: 23.5, penaltyKillPct: 82.1 },
  { teamAbbrev: 'TOR', teamFullName: 'Toronto Maple Leafs',    gamesPlayed: 82, wins: 45, losses: 29, otLosses: 8,  goalsForPerGame: 3.07, goalsAgainstPerGame: 3.12, shotsForPerGame: 32.6, powerPlayPct: 22.1, penaltyKillPct: 78.3 },
  { teamAbbrev: 'COL', teamFullName: 'Colorado Avalanche',     gamesPlayed: 82, wins: 44, losses: 30, otLosses: 8,  goalsForPerGame: 3.41, goalsAgainstPerGame: 3.18, shotsForPerGame: 35.1, powerPlayPct: 22.6, penaltyKillPct: 79.8 },
  { teamAbbrev: 'EDM', teamFullName: 'Edmonton Oilers',        gamesPlayed: 82, wins: 43, losses: 31, otLosses: 8,  goalsForPerGame: 3.29, goalsAgainstPerGame: 3.11, shotsForPerGame: 30.7, powerPlayPct: 27.4, penaltyKillPct: 78.2 },
  { teamAbbrev: 'WSH', teamFullName: 'Washington Capitals',    gamesPlayed: 82, wins: 43, losses: 31, otLosses: 8,  goalsForPerGame: 3.15, goalsAgainstPerGame: 2.88, shotsForPerGame: 32.6, powerPlayPct: 23.1, penaltyKillPct: 81.3 },
  { teamAbbrev: 'VGK', teamFullName: 'Vegas Golden Knights',   gamesPlayed: 82, wins: 42, losses: 32, otLosses: 8,  goalsForPerGame: 3.08, goalsAgainstPerGame: 2.94, shotsForPerGame: 31.9, powerPlayPct: 22.8, penaltyKillPct: 80.5 },
  { teamAbbrev: 'MIN', teamFullName: 'Minnesota Wild',         gamesPlayed: 82, wins: 41, losses: 33, otLosses: 8,  goalsForPerGame: 2.98, goalsAgainstPerGame: 2.85, shotsForPerGame: 29.8, powerPlayPct: 20.4, penaltyKillPct: 82.6 },
  { teamAbbrev: 'NJD', teamFullName: 'New Jersey Devils',      gamesPlayed: 82, wins: 40, losses: 34, otLosses: 8,  goalsForPerGame: 2.90, goalsAgainstPerGame: 2.96, shotsForPerGame: 31.6, powerPlayPct: 21.1, penaltyKillPct: 79.4 },
  { teamAbbrev: 'LAK', teamFullName: 'Los Angeles Kings',      gamesPlayed: 82, wins: 40, losses: 34, otLosses: 8,  goalsForPerGame: 2.88, goalsAgainstPerGame: 2.80, shotsForPerGame: 30.5, powerPlayPct: 20.5, penaltyKillPct: 81.9 },
  { teamAbbrev: 'TBL', teamFullName: 'Tampa Bay Lightning',    gamesPlayed: 82, wins: 39, losses: 35, otLosses: 8,  goalsForPerGame: 3.11, goalsAgainstPerGame: 3.04, shotsForPerGame: 31.2, powerPlayPct: 23.2, penaltyKillPct: 80.1 },
  { teamAbbrev: 'UTA', teamFullName: 'Utah Hockey Club',       gamesPlayed: 82, wins: 38, losses: 36, otLosses: 8,  goalsForPerGame: 2.95, goalsAgainstPerGame: 2.91, shotsForPerGame: 29.6, powerPlayPct: 20.8, penaltyKillPct: 80.2 },
  { teamAbbrev: 'SEA', teamFullName: 'Seattle Kraken',         gamesPlayed: 82, wins: 37, losses: 37, otLosses: 8,  goalsForPerGame: 2.82, goalsAgainstPerGame: 3.05, shotsForPerGame: 29.9, powerPlayPct: 19.4, penaltyKillPct: 78.6 },
  { teamAbbrev: 'OTT', teamFullName: 'Ottawa Senators',        gamesPlayed: 82, wins: 37, losses: 37, otLosses: 8,  goalsForPerGame: 3.04, goalsAgainstPerGame: 3.21, shotsForPerGame: 31.4, powerPlayPct: 21.5, penaltyKillPct: 76.4 },
  { teamAbbrev: 'VAN', teamFullName: 'Vancouver Canucks',      gamesPlayed: 82, wins: 36, losses: 38, otLosses: 8,  goalsForPerGame: 2.78, goalsAgainstPerGame: 3.13, shotsForPerGame: 28.8, powerPlayPct: 20.1, penaltyKillPct: 77.2 },
  { teamAbbrev: 'STL', teamFullName: 'St. Louis Blues',        gamesPlayed: 82, wins: 36, losses: 38, otLosses: 8,  goalsForPerGame: 2.89, goalsAgainstPerGame: 3.07, shotsForPerGame: 29.1, powerPlayPct: 20.6, penaltyKillPct: 77.8 },
  { teamAbbrev: 'DET', teamFullName: 'Detroit Red Wings',      gamesPlayed: 82, wins: 35, losses: 39, otLosses: 8,  goalsForPerGame: 2.74, goalsAgainstPerGame: 3.09, shotsForPerGame: 29.8, powerPlayPct: 19.8, penaltyKillPct: 77.4 },
  { teamAbbrev: 'PHI', teamFullName: 'Philadelphia Flyers',    gamesPlayed: 82, wins: 35, losses: 39, otLosses: 8,  goalsForPerGame: 2.85, goalsAgainstPerGame: 3.11, shotsForPerGame: 28.4, powerPlayPct: 19.5, penaltyKillPct: 78.1 },
  { teamAbbrev: 'NYI', teamFullName: 'New York Islanders',     gamesPlayed: 82, wins: 34, losses: 40, otLosses: 8,  goalsForPerGame: 2.71, goalsAgainstPerGame: 3.02, shotsForPerGame: 28.1, powerPlayPct: 19.1, penaltyKillPct: 79.3 },
  { teamAbbrev: 'MTL', teamFullName: 'Montréal Canadiens',     gamesPlayed: 82, wins: 33, losses: 41, otLosses: 8,  goalsForPerGame: 2.68, goalsAgainstPerGame: 3.22, shotsForPerGame: 28.5, powerPlayPct: 18.8, penaltyKillPct: 77.1 },
  { teamAbbrev: 'CGY', teamFullName: 'Calgary Flames',         gamesPlayed: 82, wins: 34, losses: 40, otLosses: 8,  goalsForPerGame: 2.61, goalsAgainstPerGame: 3.18, shotsForPerGame: 26.4, powerPlayPct: 16.2, penaltyKillPct: 80.4 },
  { teamAbbrev: 'PIT', teamFullName: 'Pittsburgh Penguins',    gamesPlayed: 82, wins: 32, losses: 42, otLosses: 8,  goalsForPerGame: 2.65, goalsAgainstPerGame: 3.35, shotsForPerGame: 27.8, powerPlayPct: 17.8, penaltyKillPct: 75.8 },
  { teamAbbrev: 'NSH', teamFullName: 'Nashville Predators',    gamesPlayed: 82, wins: 31, losses: 43, otLosses: 8,  goalsForPerGame: 2.59, goalsAgainstPerGame: 3.41, shotsForPerGame: 27.1, powerPlayPct: 17.1, penaltyKillPct: 75.2 },
  { teamAbbrev: 'BUF', teamFullName: 'Buffalo Sabres',         gamesPlayed: 82, wins: 30, losses: 44, otLosses: 8,  goalsForPerGame: 2.72, goalsAgainstPerGame: 3.38, shotsForPerGame: 28.2, powerPlayPct: 18.4, penaltyKillPct: 75.9 },
  { teamAbbrev: 'CBJ', teamFullName: 'Columbus Blue Jackets',  gamesPlayed: 82, wins: 29, losses: 45, otLosses: 8,  goalsForPerGame: 2.61, goalsAgainstPerGame: 3.45, shotsForPerGame: 27.5, powerPlayPct: 17.4, penaltyKillPct: 74.8 },
  { teamAbbrev: 'CHI', teamFullName: 'Chicago Blackhawks',     gamesPlayed: 82, wins: 29, losses: 45, otLosses: 8,  goalsForPerGame: 2.56, goalsAgainstPerGame: 3.29, shotsForPerGame: 24.6, powerPlayPct: 16.9, penaltyKillPct: 83.6 },
  { teamAbbrev: 'ANA', teamFullName: 'Anaheim Ducks',          gamesPlayed: 82, wins: 27, losses: 47, otLosses: 8,  goalsForPerGame: 2.55, goalsAgainstPerGame: 3.49, shotsForPerGame: 26.5, powerPlayPct: 16.5, penaltyKillPct: 73.8 },
  { teamAbbrev: 'SJS', teamFullName: 'San Jose Sharks',        gamesPlayed: 82, wins: 25, losses: 49, otLosses: 8,  goalsForPerGame: 2.56, goalsAgainstPerGame: 3.83, shotsForPerGame: 26.0, powerPlayPct: 21.8, penaltyKillPct: 71.5 },
]

// ---------------------------------------------------------------------------
// Mock data — NFL (2024 season)
// ---------------------------------------------------------------------------
const NFL_MOCK_TEAMS: Team[] = [
  { teamAbbrev: 'KC',  teamFullName: 'Kansas City Chiefs',       gamesPlayed: 17, wins: 15, losses: 2,  pointsForPerGame: 29.8, pointsAgainstPerGame: 16.1, yardsPerGame: 387, yardsAllowedPerGame: 278, turnoverDiff: 15 },
  { teamAbbrev: 'DET', teamFullName: 'Detroit Lions',            gamesPlayed: 17, wins: 15, losses: 2,  pointsForPerGame: 33.1, pointsAgainstPerGame: 22.4, yardsPerGame: 395, yardsAllowedPerGame: 323, turnoverDiff: 11 },
  { teamAbbrev: 'PHI', teamFullName: 'Philadelphia Eagles',      gamesPlayed: 17, wins: 14, losses: 3,  pointsForPerGame: 29.6, pointsAgainstPerGame: 21.8, yardsPerGame: 391, yardsAllowedPerGame: 312, turnoverDiff: 8  },
  { teamAbbrev: 'MIN', teamFullName: 'Minnesota Vikings',        gamesPlayed: 17, wins: 14, losses: 3,  pointsForPerGame: 26.4, pointsAgainstPerGame: 21.5, yardsPerGame: 358, yardsAllowedPerGame: 318, turnoverDiff: 5  },
  { teamAbbrev: 'BUF', teamFullName: 'Buffalo Bills',            gamesPlayed: 17, wins: 13, losses: 4,  pointsForPerGame: 28.9, pointsAgainstPerGame: 22.7, yardsPerGame: 376, yardsAllowedPerGame: 319, turnoverDiff: 10 },
  { teamAbbrev: 'BAL', teamFullName: 'Baltimore Ravens',         gamesPlayed: 17, wins: 12, losses: 5,  pointsForPerGame: 28.2, pointsAgainstPerGame: 20.4, yardsPerGame: 363, yardsAllowedPerGame: 288, turnoverDiff: 12 },
  { teamAbbrev: 'WSH', teamFullName: 'Washington Commanders',    gamesPlayed: 17, wins: 12, losses: 5,  pointsForPerGame: 26.2, pointsAgainstPerGame: 23.4, yardsPerGame: 365, yardsAllowedPerGame: 348, turnoverDiff: 4  },
  { teamAbbrev: 'GB',  teamFullName: 'Green Bay Packers',        gamesPlayed: 17, wins: 11, losses: 6,  pointsForPerGame: 27.3, pointsAgainstPerGame: 20.8, yardsPerGame: 355, yardsAllowedPerGame: 305, turnoverDiff: 7  },
  { teamAbbrev: 'LAC', teamFullName: 'Los Angeles Chargers',     gamesPlayed: 17, wins: 11, losses: 6,  pointsForPerGame: 24.2, pointsAgainstPerGame: 22.8, yardsPerGame: 363, yardsAllowedPerGame: 332, turnoverDiff: 4  },
  { teamAbbrev: 'DEN', teamFullName: 'Denver Broncos',           gamesPlayed: 17, wins: 10, losses: 7,  pointsForPerGame: 22.2, pointsAgainstPerGame: 22.0, yardsPerGame: 338, yardsAllowedPerGame: 331, turnoverDiff: 2  },
  { teamAbbrev: 'TB',  teamFullName: 'Tampa Bay Buccaneers',     gamesPlayed: 17, wins: 10, losses: 7,  pointsForPerGame: 24.8, pointsAgainstPerGame: 22.5, yardsPerGame: 358, yardsAllowedPerGame: 335, turnoverDiff: 2  },
  { teamAbbrev: 'HOU', teamFullName: 'Houston Texans',           gamesPlayed: 17, wins: 10, losses: 7,  pointsForPerGame: 23.7, pointsAgainstPerGame: 24.1, yardsPerGame: 341, yardsAllowedPerGame: 344, turnoverDiff: 3  },
  { teamAbbrev: 'LAR', teamFullName: 'Los Angeles Rams',         gamesPlayed: 17, wins: 10, losses: 7,  pointsForPerGame: 25.1, pointsAgainstPerGame: 22.8, yardsPerGame: 367, yardsAllowedPerGame: 334, turnoverDiff: 3  },
  { teamAbbrev: 'SEA', teamFullName: 'Seattle Seahawks',         gamesPlayed: 17, wins: 10, losses: 7,  pointsForPerGame: 25.3, pointsAgainstPerGame: 23.4, yardsPerGame: 371, yardsAllowedPerGame: 340, turnoverDiff: 3  },
  { teamAbbrev: 'PIT', teamFullName: 'Pittsburgh Steelers',      gamesPlayed: 17, wins: 10, losses: 7,  pointsForPerGame: 21.4, pointsAgainstPerGame: 22.6, yardsPerGame: 312, yardsAllowedPerGame: 329, turnoverDiff: -1 },
  { teamAbbrev: 'CIN', teamFullName: 'Cincinnati Bengals',       gamesPlayed: 17, wins: 9,  losses: 8,  pointsForPerGame: 22.5, pointsAgainstPerGame: 22.3, yardsPerGame: 351, yardsAllowedPerGame: 338, turnoverDiff: -1 },
  { teamAbbrev: 'ATL', teamFullName: 'Atlanta Falcons',          gamesPlayed: 17, wins: 8,  losses: 9,  pointsForPerGame: 22.6, pointsAgainstPerGame: 24.2, yardsPerGame: 344, yardsAllowedPerGame: 347, turnoverDiff: -2 },
  { teamAbbrev: 'MIA', teamFullName: 'Miami Dolphins',           gamesPlayed: 17, wins: 8,  losses: 9,  pointsForPerGame: 21.3, pointsAgainstPerGame: 23.8, yardsPerGame: 348, yardsAllowedPerGame: 342, turnoverDiff: 0  },
  { teamAbbrev: 'IND', teamFullName: 'Indianapolis Colts',       gamesPlayed: 17, wins: 8,  losses: 9,  pointsForPerGame: 22.4, pointsAgainstPerGame: 22.1, yardsPerGame: 342, yardsAllowedPerGame: 335, turnoverDiff: 0  },
  { teamAbbrev: 'ARI', teamFullName: 'Arizona Cardinals',        gamesPlayed: 17, wins: 8,  losses: 9,  pointsForPerGame: 23.2, pointsAgainstPerGame: 24.7, yardsPerGame: 352, yardsAllowedPerGame: 349, turnoverDiff: 1  },
  { teamAbbrev: 'DAL', teamFullName: 'Dallas Cowboys',           gamesPlayed: 17, wins: 7,  losses: 10, pointsForPerGame: 20.8, pointsAgainstPerGame: 24.3, yardsPerGame: 345, yardsAllowedPerGame: 347, turnoverDiff: -3 },
  { teamAbbrev: 'SF',  teamFullName: 'San Francisco 49ers',      gamesPlayed: 17, wins: 6,  losses: 11, pointsForPerGame: 20.1, pointsAgainstPerGame: 25.8, yardsPerGame: 335, yardsAllowedPerGame: 352, turnoverDiff: -4 },
  { teamAbbrev: 'NYJ', teamFullName: 'New York Jets',            gamesPlayed: 17, wins: 5,  losses: 12, pointsForPerGame: 18.6, pointsAgainstPerGame: 26.4, yardsPerGame: 298, yardsAllowedPerGame: 358, turnoverDiff: -8 },
  { teamAbbrev: 'NO',  teamFullName: 'New Orleans Saints',       gamesPlayed: 17, wins: 5,  losses: 12, pointsForPerGame: 19.4, pointsAgainstPerGame: 28.3, yardsPerGame: 308, yardsAllowedPerGame: 362, turnoverDiff: -9 },
  { teamAbbrev: 'CHI', teamFullName: 'Chicago Bears',            gamesPlayed: 17, wins: 5,  losses: 12, pointsForPerGame: 19.5, pointsAgainstPerGame: 26.2, yardsPerGame: 316, yardsAllowedPerGame: 356, turnoverDiff: -7 },
  { teamAbbrev: 'CAR', teamFullName: 'Carolina Panthers',        gamesPlayed: 17, wins: 5,  losses: 12, pointsForPerGame: 19.1, pointsAgainstPerGame: 26.3, yardsPerGame: 302, yardsAllowedPerGame: 355, turnoverDiff: -9 },
  { teamAbbrev: 'LV',  teamFullName: 'Las Vegas Raiders',        gamesPlayed: 17, wins: 4,  losses: 13, pointsForPerGame: 19.8, pointsAgainstPerGame: 26.8, yardsPerGame: 319, yardsAllowedPerGame: 361, turnoverDiff: -9 },
  { teamAbbrev: 'JAX', teamFullName: 'Jacksonville Jaguars',     gamesPlayed: 17, wins: 4,  losses: 13, pointsForPerGame: 19.2, pointsAgainstPerGame: 27.1, yardsPerGame: 315, yardsAllowedPerGame: 362, turnoverDiff: -10 },
  { teamAbbrev: 'NE',  teamFullName: 'New England Patriots',     gamesPlayed: 17, wins: 4,  losses: 13, pointsForPerGame: 17.1, pointsAgainstPerGame: 25.8, yardsPerGame: 285, yardsAllowedPerGame: 361, turnoverDiff: -11 },
  { teamAbbrev: 'CLE', teamFullName: 'Cleveland Browns',         gamesPlayed: 17, wins: 3,  losses: 14, pointsForPerGame: 16.2, pointsAgainstPerGame: 26.9, yardsPerGame: 288, yardsAllowedPerGame: 368, turnoverDiff: -12 },
  { teamAbbrev: 'TEN', teamFullName: 'Tennessee Titans',         gamesPlayed: 17, wins: 3,  losses: 14, pointsForPerGame: 16.5, pointsAgainstPerGame: 26.1, yardsPerGame: 292, yardsAllowedPerGame: 356, turnoverDiff: -13 },
  { teamAbbrev: 'NYG', teamFullName: 'New York Giants',          gamesPlayed: 17, wins: 3,  losses: 14, pointsForPerGame: 17.2, pointsAgainstPerGame: 27.8, yardsPerGame: 295, yardsAllowedPerGame: 373, turnoverDiff: -13 },
]

// ---------------------------------------------------------------------------
// Mock data — MLB (2024 season)
// ---------------------------------------------------------------------------
const MLB_MOCK_TEAMS: Team[] = [
  { teamAbbrev: 'LAD', teamFullName: 'Los Angeles Dodgers',     gamesPlayed: 162, wins: 98,  losses: 64,  runsPerGame: 5.21, era: 3.36, battingAvg: 0.257, errorsPerGame: 0.37, homeRuns: 239 },
  { teamAbbrev: 'NYY', teamFullName: 'New York Yankees',        gamesPlayed: 162, wins: 94,  losses: 68,  runsPerGame: 5.05, era: 3.58, battingAvg: 0.248, errorsPerGame: 0.40, homeRuns: 237 },
  { teamAbbrev: 'PHI', teamFullName: 'Philadelphia Phillies',   gamesPlayed: 162, wins: 95,  losses: 67,  runsPerGame: 5.08, era: 3.89, battingAvg: 0.254, errorsPerGame: 0.44, homeRuns: 208 },
  { teamAbbrev: 'SD',  teamFullName: 'San Diego Padres',        gamesPlayed: 162, wins: 93,  losses: 69,  runsPerGame: 4.85, era: 3.73, battingAvg: 0.248, errorsPerGame: 0.42, homeRuns: 175 },
  { teamAbbrev: 'MIL', teamFullName: 'Milwaukee Brewers',       gamesPlayed: 162, wins: 93,  losses: 69,  runsPerGame: 4.65, era: 3.64, battingAvg: 0.244, errorsPerGame: 0.46, homeRuns: 192 },
  { teamAbbrev: 'CLE', teamFullName: 'Cleveland Guardians',     gamesPlayed: 162, wins: 92,  losses: 70,  runsPerGame: 4.48, era: 3.54, battingAvg: 0.243, errorsPerGame: 0.38, homeRuns: 176 },
  { teamAbbrev: 'BAL', teamFullName: 'Baltimore Orioles',       gamesPlayed: 162, wins: 91,  losses: 71,  runsPerGame: 5.12, era: 3.98, battingAvg: 0.255, errorsPerGame: 0.43, homeRuns: 221 },
  { teamAbbrev: 'ATL', teamFullName: 'Atlanta Braves',          gamesPlayed: 162, wins: 89,  losses: 73,  runsPerGame: 5.34, era: 4.12, battingAvg: 0.265, errorsPerGame: 0.48, homeRuns: 214 },
  { teamAbbrev: 'NYM', teamFullName: 'New York Mets',           gamesPlayed: 162, wins: 89,  losses: 73,  runsPerGame: 4.82, era: 3.89, battingAvg: 0.251, errorsPerGame: 0.50, homeRuns: 188 },
  { teamAbbrev: 'ARI', teamFullName: 'Arizona Diamondbacks',    gamesPlayed: 162, wins: 89,  losses: 73,  runsPerGame: 4.96, era: 4.05, battingAvg: 0.253, errorsPerGame: 0.52, homeRuns: 183 },
  { teamAbbrev: 'HOU', teamFullName: 'Houston Astros',          gamesPlayed: 162, wins: 88,  losses: 74,  runsPerGame: 4.74, era: 3.81, battingAvg: 0.249, errorsPerGame: 0.39, homeRuns: 196 },
  { teamAbbrev: 'KC',  teamFullName: 'Kansas City Royals',      gamesPlayed: 162, wins: 86,  losses: 76,  runsPerGame: 4.73, era: 4.12, battingAvg: 0.252, errorsPerGame: 0.55, homeRuns: 168 },
  { teamAbbrev: 'DET', teamFullName: 'Detroit Tigers',          gamesPlayed: 162, wins: 86,  losses: 76,  runsPerGame: 4.34, era: 3.78, battingAvg: 0.241, errorsPerGame: 0.47, homeRuns: 158 },
  { teamAbbrev: 'SEA', teamFullName: 'Seattle Mariners',        gamesPlayed: 162, wins: 85,  losses: 77,  runsPerGame: 4.38, era: 3.62, battingAvg: 0.240, errorsPerGame: 0.41, homeRuns: 172 },
  { teamAbbrev: 'CHC', teamFullName: 'Chicago Cubs',            gamesPlayed: 162, wins: 83,  losses: 79,  runsPerGame: 4.61, era: 4.18, battingAvg: 0.248, errorsPerGame: 0.49, homeRuns: 183 },
  { teamAbbrev: 'STL', teamFullName: 'St. Louis Cardinals',     gamesPlayed: 162, wins: 83,  losses: 79,  runsPerGame: 4.44, era: 4.21, battingAvg: 0.251, errorsPerGame: 0.51, homeRuns: 171 },
  { teamAbbrev: 'MIN', teamFullName: 'Minnesota Twins',         gamesPlayed: 162, wins: 82,  losses: 80,  runsPerGame: 4.52, era: 4.25, battingAvg: 0.247, errorsPerGame: 0.45, homeRuns: 185 },
  { teamAbbrev: 'BOS', teamFullName: 'Boston Red Sox',          gamesPlayed: 162, wins: 81,  losses: 81,  runsPerGame: 4.68, era: 4.48, battingAvg: 0.255, errorsPerGame: 0.53, homeRuns: 186 },
  { teamAbbrev: 'SF',  teamFullName: 'San Francisco Giants',    gamesPlayed: 162, wins: 80,  losses: 82,  runsPerGame: 4.22, era: 4.15, battingAvg: 0.243, errorsPerGame: 0.46, homeRuns: 163 },
  { teamAbbrev: 'TB',  teamFullName: 'Tampa Bay Rays',          gamesPlayed: 162, wins: 80,  losses: 82,  runsPerGame: 4.32, era: 4.02, battingAvg: 0.241, errorsPerGame: 0.44, homeRuns: 162 },
  { teamAbbrev: 'TEX', teamFullName: 'Texas Rangers',           gamesPlayed: 162, wins: 78,  losses: 84,  runsPerGame: 4.44, era: 4.52, battingAvg: 0.250, errorsPerGame: 0.57, homeRuns: 191 },
  { teamAbbrev: 'CIN', teamFullName: 'Cincinnati Reds',         gamesPlayed: 162, wins: 77,  losses: 85,  runsPerGame: 4.51, era: 4.63, battingAvg: 0.247, errorsPerGame: 0.54, homeRuns: 185 },
  { teamAbbrev: 'TOR', teamFullName: 'Toronto Blue Jays',       gamesPlayed: 162, wins: 74,  losses: 88,  runsPerGame: 4.38, era: 4.35, battingAvg: 0.246, errorsPerGame: 0.56, homeRuns: 177 },
  { teamAbbrev: 'PIT', teamFullName: 'Pittsburgh Pirates',      gamesPlayed: 162, wins: 76,  losses: 86,  runsPerGame: 4.12, era: 4.41, battingAvg: 0.238, errorsPerGame: 0.60, homeRuns: 152 },
  { teamAbbrev: 'WSH', teamFullName: 'Washington Nationals',    gamesPlayed: 162, wins: 71,  losses: 91,  runsPerGame: 4.05, era: 4.72, battingAvg: 0.239, errorsPerGame: 0.58, homeRuns: 158 },
  { teamAbbrev: 'MIA', teamFullName: 'Miami Marlins',           gamesPlayed: 162, wins: 62,  losses: 100, runsPerGame: 3.74, era: 4.68, battingAvg: 0.235, errorsPerGame: 0.62, homeRuns: 132 },
  { teamAbbrev: 'OAK', teamFullName: 'Oakland Athletics',       gamesPlayed: 162, wins: 69,  losses: 93,  runsPerGame: 3.88, era: 4.86, battingAvg: 0.231, errorsPerGame: 0.59, homeRuns: 142 },
  { teamAbbrev: 'LAA', teamFullName: 'Los Angeles Angels',      gamesPlayed: 162, wins: 63,  losses: 99,  runsPerGame: 4.01, era: 5.12, battingAvg: 0.238, errorsPerGame: 0.63, homeRuns: 156 },
  { teamAbbrev: 'COL', teamFullName: 'Colorado Rockies',        gamesPlayed: 162, wins: 61,  losses: 101, runsPerGame: 4.78, era: 5.44, battingAvg: 0.262, errorsPerGame: 0.67, homeRuns: 174 },
  { teamAbbrev: 'CWS', teamFullName: 'Chicago White Sox',       gamesPlayed: 162, wins: 41,  losses: 121, runsPerGame: 3.24, era: 5.97, battingAvg: 0.222, errorsPerGame: 0.71, homeRuns: 107 },
]

// ---------------------------------------------------------------------------
// Mock data — NBA (2024-25 season)
// ---------------------------------------------------------------------------
const NBA_MOCK_TEAMS: Team[] = [
  { teamAbbrev: 'OKC', teamFullName: 'Oklahoma City Thunder',   gamesPlayed: 82, wins: 68, losses: 14, pointsPerGame: 121.4, pointsAllowedPerGame: 108.2, reboundsPerGame: 45.1, assistsPerGame: 28.4, threePointPct: 38.2 },
  { teamAbbrev: 'CLE', teamFullName: 'Cleveland Cavaliers',     gamesPlayed: 82, wins: 64, losses: 18, pointsPerGame: 115.2, pointsAllowedPerGame: 104.4, reboundsPerGame: 43.8, assistsPerGame: 27.1, threePointPct: 37.5 },
  { teamAbbrev: 'BOS', teamFullName: 'Boston Celtics',          gamesPlayed: 82, wins: 61, losses: 21, pointsPerGame: 118.6, pointsAllowedPerGame: 107.8, reboundsPerGame: 44.2, assistsPerGame: 27.8, threePointPct: 39.2 },
  { teamAbbrev: 'NYK', teamFullName: 'New York Knicks',         gamesPlayed: 82, wins: 51, losses: 31, pointsPerGame: 114.2, pointsAllowedPerGame: 110.8, reboundsPerGame: 46.2, assistsPerGame: 26.4, threePointPct: 35.6 },
  { teamAbbrev: 'HOU', teamFullName: 'Houston Rockets',         gamesPlayed: 82, wins: 52, losses: 30, pointsPerGame: 112.4, pointsAllowedPerGame: 108.1, reboundsPerGame: 44.5, assistsPerGame: 25.6, threePointPct: 35.8 },
  { teamAbbrev: 'DEN', teamFullName: 'Denver Nuggets',          gamesPlayed: 82, wins: 50, losses: 32, pointsPerGame: 115.8, pointsAllowedPerGame: 111.2, reboundsPerGame: 45.8, assistsPerGame: 29.2, threePointPct: 36.1 },
  { teamAbbrev: 'IND', teamFullName: 'Indiana Pacers',          gamesPlayed: 82, wins: 50, losses: 32, pointsPerGame: 119.2, pointsAllowedPerGame: 116.8, reboundsPerGame: 42.4, assistsPerGame: 30.1, threePointPct: 36.8 },
  { teamAbbrev: 'LAL', teamFullName: 'Los Angeles Lakers',      gamesPlayed: 82, wins: 50, losses: 32, pointsPerGame: 114.8, pointsAllowedPerGame: 111.4, reboundsPerGame: 43.9, assistsPerGame: 27.4, threePointPct: 35.2 },
  { teamAbbrev: 'DAL', teamFullName: 'Dallas Mavericks',        gamesPlayed: 82, wins: 49, losses: 33, pointsPerGame: 116.4, pointsAllowedPerGame: 112.8, reboundsPerGame: 42.8, assistsPerGame: 26.8, threePointPct: 37.4 },
  { teamAbbrev: 'MIN', teamFullName: 'Minnesota Timberwolves',  gamesPlayed: 82, wins: 49, losses: 33, pointsPerGame: 111.8, pointsAllowedPerGame: 108.2, reboundsPerGame: 44.1, assistsPerGame: 25.2, threePointPct: 34.5 },
  { teamAbbrev: 'MIL', teamFullName: 'Milwaukee Bucks',         gamesPlayed: 82, wins: 48, losses: 34, pointsPerGame: 116.8, pointsAllowedPerGame: 113.4, reboundsPerGame: 43.6, assistsPerGame: 27.8, threePointPct: 36.4 },
  { teamAbbrev: 'ORL', teamFullName: 'Orlando Magic',           gamesPlayed: 82, wins: 41, losses: 41, pointsPerGame: 110.6, pointsAllowedPerGame: 109.4, reboundsPerGame: 44.4, assistsPerGame: 24.4, threePointPct: 34.8 },
  { teamAbbrev: 'ATL', teamFullName: 'Atlanta Hawks',           gamesPlayed: 82, wins: 39, losses: 43, pointsPerGame: 118.4, pointsAllowedPerGame: 119.8, reboundsPerGame: 41.8, assistsPerGame: 28.4, threePointPct: 37.1 },
  { teamAbbrev: 'CHI', teamFullName: 'Chicago Bulls',           gamesPlayed: 82, wins: 39, losses: 43, pointsPerGame: 112.8, pointsAllowedPerGame: 115.2, reboundsPerGame: 43.4, assistsPerGame: 26.8, threePointPct: 34.7 },
  { teamAbbrev: 'SAC', teamFullName: 'Sacramento Kings',        gamesPlayed: 82, wins: 37, losses: 45, pointsPerGame: 116.6, pointsAllowedPerGame: 118.1, reboundsPerGame: 42.6, assistsPerGame: 29.4, threePointPct: 36.5 },
  { teamAbbrev: 'LAC', teamFullName: 'Los Angeles Clippers',    gamesPlayed: 82, wins: 38, losses: 44, pointsPerGame: 113.2, pointsAllowedPerGame: 114.6, reboundsPerGame: 42.8, assistsPerGame: 25.8, threePointPct: 35.8 },
  { teamAbbrev: 'GSW', teamFullName: 'Golden State Warriors',   gamesPlayed: 82, wins: 36, losses: 46, pointsPerGame: 117.2, pointsAllowedPerGame: 118.4, reboundsPerGame: 42.2, assistsPerGame: 29.8, threePointPct: 37.8 },
  { teamAbbrev: 'MIA', teamFullName: 'Miami Heat',              gamesPlayed: 82, wins: 36, losses: 46, pointsPerGame: 108.4, pointsAllowedPerGame: 110.8, reboundsPerGame: 41.2, assistsPerGame: 25.2, threePointPct: 34.8 },
  { teamAbbrev: 'PHX', teamFullName: 'Phoenix Suns',            gamesPlayed: 82, wins: 36, losses: 46, pointsPerGame: 113.8, pointsAllowedPerGame: 116.2, reboundsPerGame: 41.4, assistsPerGame: 27.6, threePointPct: 35.4 },
  { teamAbbrev: 'MEM', teamFullName: 'Memphis Grizzlies',       gamesPlayed: 82, wins: 32, losses: 50, pointsPerGame: 113.4, pointsAllowedPerGame: 115.2, reboundsPerGame: 44.8, assistsPerGame: 26.2, threePointPct: 34.2 },
  { teamAbbrev: 'SAS', teamFullName: 'San Antonio Spurs',       gamesPlayed: 82, wins: 34, losses: 48, pointsPerGame: 111.8, pointsAllowedPerGame: 114.4, reboundsPerGame: 43.2, assistsPerGame: 26.4, threePointPct: 34.1 },
  { teamAbbrev: 'TOR', teamFullName: 'Toronto Raptors',         gamesPlayed: 82, wins: 30, losses: 52, pointsPerGame: 109.6, pointsAllowedPerGame: 114.2, reboundsPerGame: 42.4, assistsPerGame: 24.8, threePointPct: 34.4 },
  { teamAbbrev: 'DET', teamFullName: 'Detroit Pistons',         gamesPlayed: 82, wins: 28, losses: 54, pointsPerGame: 110.4, pointsAllowedPerGame: 115.8, reboundsPerGame: 42.4, assistsPerGame: 25.2, threePointPct: 34.2 },
  { teamAbbrev: 'NOP', teamFullName: 'New Orleans Pelicans',    gamesPlayed: 82, wins: 25, losses: 57, pointsPerGame: 110.2, pointsAllowedPerGame: 116.4, reboundsPerGame: 43.6, assistsPerGame: 25.4, threePointPct: 33.9 },
  { teamAbbrev: 'PHI', teamFullName: 'Philadelphia 76ers',      gamesPlayed: 82, wins: 24, losses: 58, pointsPerGame: 108.8, pointsAllowedPerGame: 114.8, reboundsPerGame: 43.8, assistsPerGame: 24.6, threePointPct: 33.7 },
  { teamAbbrev: 'BKN', teamFullName: 'Brooklyn Nets',           gamesPlayed: 82, wins: 22, losses: 60, pointsPerGame: 107.4, pointsAllowedPerGame: 117.2, reboundsPerGame: 40.8, assistsPerGame: 24.2, threePointPct: 34.1 },
  { teamAbbrev: 'POR', teamFullName: 'Portland Trail Blazers',  gamesPlayed: 82, wins: 21, losses: 61, pointsPerGame: 109.8, pointsAllowedPerGame: 118.6, reboundsPerGame: 41.8, assistsPerGame: 24.2, threePointPct: 33.5 },
  { teamAbbrev: 'CHA', teamFullName: 'Charlotte Hornets',       gamesPlayed: 82, wins: 19, losses: 63, pointsPerGame: 108.2, pointsAllowedPerGame: 117.6, reboundsPerGame: 41.4, assistsPerGame: 24.8, threePointPct: 33.7 },
  { teamAbbrev: 'UTA', teamFullName: 'Utah Jazz',               gamesPlayed: 82, wins: 19, losses: 63, pointsPerGame: 106.8, pointsAllowedPerGame: 118.4, reboundsPerGame: 42.8, assistsPerGame: 24.6, threePointPct: 33.4 },
  { teamAbbrev: 'WSH', teamFullName: 'Washington Wizards',      gamesPlayed: 82, wins: 18, losses: 64, pointsPerGame: 107.8, pointsAllowedPerGame: 119.2, reboundsPerGame: 41.2, assistsPerGame: 23.8, threePointPct: 33.4 },
]

// ---------------------------------------------------------------------------
// NFL team name lookup (the NFL sync script does not store team_full_name)
// ---------------------------------------------------------------------------
const NFL_TEAM_NAMES: Record<string, string> = {
  ARI: 'Arizona Cardinals',    ATL: 'Atlanta Falcons',      BAL: 'Baltimore Ravens',
  BUF: 'Buffalo Bills',        CAR: 'Carolina Panthers',    CHI: 'Chicago Bears',
  CIN: 'Cincinnati Bengals',   CLE: 'Cleveland Browns',     DAL: 'Dallas Cowboys',
  DEN: 'Denver Broncos',       DET: 'Detroit Lions',        GB:  'Green Bay Packers',
  HOU: 'Houston Texans',       IND: 'Indianapolis Colts',   JAX: 'Jacksonville Jaguars',
  KC:  'Kansas City Chiefs',   LV:  'Las Vegas Raiders',    LAC: 'Los Angeles Chargers',
  LAR: 'Los Angeles Rams',     MIA: 'Miami Dolphins',       MIN: 'Minnesota Vikings',
  NE:  'New England Patriots', NO:  'New Orleans Saints',   NYG: 'New York Giants',
  NYJ: 'New York Jets',        PHI: 'Philadelphia Eagles',  PIT: 'Pittsburgh Steelers',
  SF:  'San Francisco 49ers',  SEA: 'Seattle Seahawks',     TB:  'Tampa Bay Buccaneers',
  TEN: 'Tennessee Titans',     WAS: 'Washington Commanders',WSH: 'Washington Commanders',
}

// Sport configs
// ---------------------------------------------------------------------------
const SPORT_CONFIGS: Record<SportId, SportConfig> = {
  nhl: {
    id: 'nhl',
    label: 'NHL',
    categories: [
      { id: 'wins',         label: 'Wins',                  stat: 'wins',               higher: true  },
      { id: 'goalsFor',     label: 'Goals for / game',      stat: 'goalsForPerGame',    higher: true  },
      { id: 'goalsAgainst', label: 'Goals against / game',  stat: 'goalsAgainstPerGame',higher: false },
      { id: 'pp',           label: 'Power play %',          stat: 'powerPlayPct',       higher: true  },
      { id: 'pk',           label: 'Penalty kill %',        stat: 'penaltyKillPct',     higher: true  },
      { id: 'shots',        label: 'Shots for / game',      stat: 'shotsForPerGame',    higher: true  },
    ],
    logoUrl: (abbrev) => `https://assets.nhle.com/logos/nhl/svg/${abbrev}_light.svg`,
    supabaseTable: 'nhl_team_stats',
    season: '20252026',
    dbMap: (t) => ({
      teamAbbrev:          t.team_abbrev           as string,
      teamFullName:        t.team_full_name         as string,
      gamesPlayed:         t.games_played           as number,
      wins:                t.wins                   as number,
      losses:              t.losses                 as number,
      otLosses:            t.ot_losses              as number,
      points:              t.points                 as number,
      pointPct:            t.point_pct              as number,
      regulationAndOtWins: t.regulation_and_ot_wins as number,
      winsInRegulation:    t.wins_in_regulation     as number,
      winsInShootout:      t.wins_in_shootout       as number,
      goalsFor:            t.goals_for              as number,
      goalsAgainst:        t.goals_against          as number,
      goalsForPerGame:     t.goals_for_per_game     as number,
      goalsAgainstPerGame: t.goals_against_per_game as number,
      shotsForPerGame:     t.shots_for_per_game     as number,
      shotsAgainstPerGame: t.shots_against_per_game as number,
      powerPlayPct:        t.power_play_pct         as number,
      powerPlayNetPct:     t.power_play_net_pct     as number,
      penaltyKillPct:      t.penalty_kill_pct       as number,
      penaltyKillNetPct:   t.penalty_kill_net_pct   as number,
      faceoffWinPct:       t.faceoff_win_pct        as number,
      teamShutouts:        t.team_shutouts          as number,
    }),
    mockTeams: NHL_MOCK_TEAMS,
  },
  nfl: {
    id: 'nfl',
    label: 'NFL',
    categories: [
      { id: 'wins',     label: 'Wins',                  stat: 'wins',                higher: true  },
      { id: 'ptsFor',   label: 'Points for / game',     stat: 'pointsForPerGame',    higher: true  },
      { id: 'ptsAgt',   label: 'Points against / game', stat: 'pointsAgainstPerGame',higher: false },
      { id: 'ydsFor',   label: 'Total yards / game',    stat: 'yardsPerGame',        higher: true  },
      { id: 'passYds',  label: 'Pass yards / game',     stat: 'passYdsPerGame',      higher: true  },
      { id: 'rushYds',  label: 'Rush yards / game',     stat: 'rushYdsPerGame',      higher: true  },
    ],
    logoUrl: (abbrev) => `https://a.espncdn.com/i/teamlogos/nfl/500/${abbrev.toLowerCase()}.png`,
    supabaseTable: 'nfl_team_stats',
    season: '2025',
    dbMap: (t) => ({
      teamAbbrev:           t.team_abbrev         as string,
      teamFullName:         NFL_TEAM_NAMES[t.team_abbrev as string] ?? String(t.team_abbrev),
      gamesPlayed:          t.games_played         as number,
      wins:                 t.wins                 as number,
      losses:               t.losses               as number,
      pointsForPerGame:     t.pts_per_game         as number,
      pointsAgainstPerGame: t.pts_allowed_per_game as number,
      passYdsPerGame:       t.pass_yds_per_game    as number,
      rushYdsPerGame:       t.rush_yds_per_game    as number,
      yardsPerGame:         Number(t.pass_yds_per_game ?? 0) + Number(t.rush_yds_per_game ?? 0),
    }),
    mockTeams: NFL_MOCK_TEAMS,
  },
  mlb: {
    id: 'mlb',
    label: 'MLB',
    categories: [
      { id: 'wins',   label: 'Wins',            stat: 'wins',          higher: true  },
      { id: 'runs',   label: 'Runs / game',     stat: 'runsPerGame',   higher: true  },
      { id: 'era',    label: 'ERA',             stat: 'era',           higher: false },
      { id: 'avg',    label: 'Batting avg',     stat: 'battingAvg',    higher: true  },
      { id: 'errors', label: 'Most errors / game',   stat: 'errorsPerGame', higher: true  },
      { id: 'hr',     label: 'Home runs / game',stat: 'homeRuns',      higher: true  },
    ],
    logoUrl: (abbrev) => `https://a.espncdn.com/i/teamlogos/mlb/500/${abbrev.toLowerCase()}.png`,
    supabaseTable: 'mlb_team_stats',
    season: '2025',
    dbMap: (t) => ({
      teamAbbrev:   t.team_abbrev   as string,
      teamFullName: t.team_full_name as string,
      gamesPlayed:  t.games_played  as number,
      wins:         t.wins          as number,
      losses:       t.losses        as number,
      runsPerGame:   t.runs_per_game  as number,
      era:           t.era           as number,
      battingAvg:    t.avg           as number,
      errorsPerGame: t.errors_per_game as number,
      homeRuns:      t.hrs_per_game  as number,
    }),
    mockTeams: MLB_MOCK_TEAMS,
  },
  nba: {
    id: 'nba',
    label: 'NBA',
    categories: [
      { id: 'wins',  label: 'Wins',               stat: 'wins',             higher: true  },
      { id: 'pts',   label: 'Points / game',       stat: 'pointsPerGame',   higher: true  },
      { id: 'reb',   label: 'Rebounds / game',     stat: 'reboundsPerGame', higher: true  },
      { id: 'ast',   label: 'Assists / game',      stat: 'assistsPerGame',  higher: true  },
      { id: 'three', label: '3-point %',           stat: 'threePointPct',   higher: true  },
      { id: 'tov',   label: 'Most turnovers / game', stat: 'turnoversPerGame',higher: true  },
    ],
    logoUrl: (abbrev) => `https://a.espncdn.com/i/teamlogos/nba/500/${abbrev.toLowerCase()}.png`,
    supabaseTable: 'nba_team_stats',
    season: '2025-26',
    dbMap: (t) => ({
      teamAbbrev:      t.team_abbrev  as string,
      teamFullName:    t.team_full_name as string,
      gamesPlayed:     t.games_played  as number,
      wins:            t.wins          as number,
      losses:          t.losses        as number,
      pointsPerGame:   t.pts_per_game  as number,
      reboundsPerGame: t.reb_per_game  as number,
      assistsPerGame:  t.ast_per_game  as number,
      threePointPct:   t.fg3_pct       as number,
      turnoversPerGame:t.tov_per_game  as number,
    }),
    mockTeams: NBA_MOCK_TEAMS,
  },
}

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

function computeRankings(teams: Team[], categories: Category[]): Rankings {
  const rankings: Rankings = {}
  for (const cat of categories) {
    const sorted = [...teams].sort((a, b) =>
      cat.higher
        ? ((b[cat.stat] as number) ?? 0) - ((a[cat.stat] as number) ?? 0)
        : ((a[cat.stat] as number) ?? 0) - ((b[cat.stat] as number) ?? 0)
    )
    rankings[cat.id] = {}
    sorted.forEach((t, i, arr) => {
      const val     = (t[cat.stat] as number) ?? 0
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

function computePerfectScore(teamAbbrevs: string[], rankings: Rankings, categories: Category[]): number {
  const catIds = categories.map(c => c.id)
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

// (logo roulette replaced by name-cycling in TeamCard)

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------
async function loadTeamData(config: SportConfig): Promise<{ teams: Team[]; source: string }> {
  if (!supabase) return { teams: config.mockTeams, source: 'mock' }
  try {
    const { data, error } = await supabase
      .from(config.supabaseTable)
      .select('*')
      .eq('season', config.season)
    if (error || !data?.length) throw new Error(error?.message ?? 'No data')
    const teams: Team[] = data.map((row: Record<string, unknown>) => config.dbMap(row))
    return { teams, source: 'supabase' }
  } catch {
    return { teams: config.mockTeams, source: 'mock' }
  }
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
function buildInitialSlots(categories: Category[]): Slot[] {
  return categories.map(cat => ({ ...cat, assignedTeam: null, rank: null }))
}

function TeamCard({ targetAbbrev, teams, logoUrl }: {
  targetAbbrev: string | null
  teams:        Team[]
  logoUrl:      (abbrev: string) => string
}) {
  const [displayName, setDisplayName] = useState('')
  const [spinning, setSpinning]       = useState(false)
  const prevTarget = useRef<string | null>(null)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!targetAbbrev) return
    const finalName = teams.find(t => t.teamAbbrev === targetAbbrev)?.teamFullName ?? targetAbbrev
    if (prevTarget.current === targetAbbrev) {
      if (!displayName) setDisplayName(finalName)
      return
    }
    prevTarget.current = targetAbbrev
    if (timerRef.current) clearTimeout(timerRef.current)

    const otherNames = teams.filter(t => t.teamAbbrev !== targetAbbrev).map(t => t.teamFullName)
    const intervals  = [80,80,80,80,80,80,80,80, 140,140,140,140, 220,280,360]
    let step = 0
    setDisplayName('')
    setSpinning(true)

    function tick() {
      if (step < intervals.length) {
        setDisplayName(otherNames[Math.floor(Math.random() * otherNames.length)])
        timerRef.current = setTimeout(tick, intervals[step++])
      } else {
        setDisplayName(finalName)
        setSpinning(false)
      }
    }
    tick()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [targetAbbrev]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!targetAbbrev) return null

  return (
    <div className={styles.teamCard}>
      <div className={styles.logoWrap}>
        {spinning
          ? <div className={styles.logoPulse} />
          : <img
              key={targetAbbrev}
              className={styles.teamLogo}
              src={logoUrl(targetAbbrev)}
              alt={targetAbbrev}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
        }
      </div>
      <div className={styles.teamBody}>
        <div className={`${styles.teamName} ${spinning ? styles.spinningName : ''}`}>
          {displayName}
        </div>
      </div>
    </div>
  )
}

function SlotGrid({ slots, onAssign, teamCount, isBlocked, logoUrl }: {
  slots:     Slot[]
  onAssign:  (id: string) => void
  teamCount: number
  isBlocked: boolean
  logoUrl:   (abbrev: string) => string
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
          <div className={styles.slotLeft}>
            <div className={`${styles.slotLabel} ${slot.assignedTeam ? styles.slotLabelFilled : ''}`}>
              {slot.label}
            </div>
            {slot.assignedTeam && (
              <img
                className={styles.slotLogo}
                src={logoUrl(slot.assignedTeam)}
                alt=""
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
          </div>
          <div className={`${styles.slotRank} ${slot.assignedTeam && slot.rank ? rankColorClass(slot.rank, teamCount) : styles.rankEmpty}`}>
            {slot.assignedTeam ? `#${slot.rank}` : '—'}
          </div>
        </button>
      ))}
    </div>
  )
}

function Results({ slots, teams, score, perfectScore, previousBest, isNewBest, onPlayAgain }: {
  slots:        Slot[]
  teams:        Team[]
  score:        number
  perfectScore: number
  previousBest: number | null
  isNewBest:    boolean
  onPlayAgain:  () => void
}) {
  const n = teams.length
  const aboveOptimal = score - perfectScore
  const challengeScore = isNewBest ? score : previousBest
  return (
    <div className={styles.results}>
      <div className={styles.resultsScore}>{score}</div>
      <div className={styles.resultsLabel}>
        your score &nbsp;·&nbsp; perfect = {perfectScore}
        {aboveOptimal > 0 && (
          <span className={styles.aboveOptimal}> (+{aboveOptimal} above optimal)</span>
        )}
      </div>
      {isNewBest && previousBest !== null && (
        <div className={styles.newBest}>New best score!</div>
      )}
      {challengeScore !== null && (
        <div className={styles.beatChallenge}>
          Beat your best of <strong>{challengeScore}</strong> next game
        </div>
      )}
      <div className={styles.breakdown}>
        {slots.map(slot => {
          const team = teams.find(t => t.teamAbbrev === slot.assignedTeam)
          const rc   = slot.rank ? rankColorClass(slot.rank, n) : ''
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
const VALID_SPORTS: SportId[] = ['nhl', 'nfl', 'mlb', 'nba']

function GamePageContent() {
  const searchParams = useSearchParams()
  const rawSport = searchParams.get('sport') as SportId | null
  const initSport: SportId = rawSport && VALID_SPORTS.includes(rawSport) ? rawSport : 'nhl'

  const [sportId, setSportId]            = useState<SportId>(initSport)
  const [status, setStatus]             = useState<'loading' | 'playing' | 'complete'>('loading')
  const [teams, setTeams]               = useState<Team[]>([])
  const [rankings, setRankings]         = useState<Rankings>({})
  const [queue, setQueue]               = useState<string[]>([])
  const [currentTeam, setCurrentTeam]   = useState<string | null>(null)
  const [slots, setSlots]               = useState<Slot[]>(() => buildInitialSlots(SPORT_CONFIGS[initSport].categories))
  const [score, setScore]               = useState(0)
  const [dataSource, setDataSource]     = useState<string | null>(null)
  const [perfectScore, setPerfectScore] = useState<number | null>(null)
  const [previousBest, setPreviousBest] = useState<number | null>(null)
  const [isNewBest, setIsNewBest]       = useState(false)
  const [isSpinning, setIsSpinning]     = useState(false)
  const drawnTeams = useRef<string[]>([])
  const spinTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  const SPIN_DURATION = 80*8 + 140*4 + 220 + 280 + 360 + 50

  const startGame = useCallback((loadedTeams: Team[], source: string, config: SportConfig) => {
    const r = computeRankings(loadedTeams, config.categories)
    const q = shuffle(loadedTeams.map(t => t.teamAbbrev))
    drawnTeams.current = []
    setTeams(loadedTeams)
    setRankings(r)
    setQueue(q.slice(1))
    setCurrentTeam(q[0])
    setSlots(buildInitialSlots(config.categories))
    setScore(0)
    setPerfectScore(null)
    setPreviousBest(null)
    setIsNewBest(false)
    setDataSource(source)
    setIsSpinning(false)
    setStatus('playing')
  }, [])

  useEffect(() => {
    const cfg = SPORT_CONFIGS[initSport]
    loadTeamData(cfg).then(({ teams: t, source: s }) => startGame(t, s, cfg))
  }, [startGame]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!currentTeam) return
    setIsSpinning(true)
    if (spinTimer.current) clearTimeout(spinTimer.current)
    spinTimer.current = setTimeout(() => setIsSpinning(false), SPIN_DURATION)
    return () => { if (spinTimer.current) clearTimeout(spinTimer.current) }
  }, [currentTeam]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSportChange = useCallback((id: SportId) => {
    setSportId(id)
    const cfg = SPORT_CONFIGS[id]
    setStatus('loading')
    loadTeamData(cfg).then(({ teams: t, source: s }) => startGame(t, s, cfg))
  }, [startGame])

  const handleAssign = useCallback((slotId: string) => {
    if (status !== 'playing' || !currentTeam || isSpinning) return
    const rank = rankings[slotId]?.[currentTeam]
    if (!rank) return
    drawnTeams.current = [...drawnTeams.current, currentTeam]
    const newSlots = slots.map(s =>
      s.id === slotId ? { ...s, assignedTeam: currentTeam, rank } : s
    )
    const newScore  = score + rank
    const nextTeam  = queue[0] ?? null
    const newQueue  = queue.slice(1)
    setSlots(newSlots)
    setScore(newScore)
    setCurrentTeam(nextTeam)
    setQueue(newQueue)
    if (newSlots.every(s => s.assignedTeam)) {
      setPerfectScore(computePerfectScore(drawnTeams.current, rankings, SPORT_CONFIGS[sportId].categories))
      const key = `sg_best_${sportId}`
      const stored = sessionStorage.getItem(key)
      const prevNum = stored !== null ? parseInt(stored) : null
      const newBest = prevNum === null || newScore < prevNum
      if (newBest) sessionStorage.setItem(key, String(newScore))
      setPreviousBest(prevNum)
      setIsNewBest(newBest)
      setStatus('complete')
    }
  }, [status, currentTeam, isSpinning, rankings, slots, score, queue, sportId])

  const handlePlayAgain = useCallback(() => {
    const cfg = SPORT_CONFIGS[sportId]
    setStatus('loading')
    loadTeamData(cfg).then(({ teams: t, source: s }) => startGame(t, s, cfg))
  }, [sportId, startGame])

  const config          = SPORT_CONFIGS[sportId]
  const currentTeamData = teams.find(t => t.teamAbbrev === currentTeam)
  const catsRemaining   = slots.filter(s => !s.assignedTeam).length

  return (
    <main className={styles.page}>
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

        {/* Sport selector */}
        <div className={styles.sportTabs}>
          {(['nhl', 'nfl', 'mlb', 'nba'] as SportId[]).map(id => (
            <button
              key={id}
              className={`${styles.sportTab} ${sportId === id ? styles.sportTabActive : ''}`}
              onClick={() => sportId !== id && handleSportChange(id)}
            >
              {SPORT_CONFIGS[id].label}
            </button>
          ))}
        </div>

        {status === 'loading' && (
          <div className={styles.loading}>Loading team stats…</div>
        )}

        {status === 'playing' && (
          <>
            <TeamCard
              targetAbbrev={currentTeam}
              teams={teams}
              logoUrl={config.logoUrl}
            />
            <p className={styles.prompt}>
              {isSpinning ? '\u00A0' : `Assign ${currentTeamData?.teamFullName ?? '…'} to a category`}
            </p>
            <SlotGrid
              slots={slots}
              onAssign={handleAssign}
              teamCount={teams.length}
              isBlocked={isSpinning}
              logoUrl={config.logoUrl}
            />
            {dataSource === 'mock' && (
              <p className={styles.dataNotice}>
                Using mock data · connect Supabase to load live stats
              </p>
            )}
          </>
        )}

        {status === 'complete' && (
          <>
            <SlotGrid slots={slots} onAssign={() => {}} teamCount={teams.length} isBlocked={false} logoUrl={config.logoUrl} />
            <Results
              slots={slots}
              teams={teams}
              score={score}
              perfectScore={perfectScore ?? 0}
              previousBest={previousBest}
              isNewBest={isNewBest}
              onPlayAgain={handlePlayAgain}
            />
          </>
        )}

        <footer className={styles.footer}>
          Ranks out of {teams.length || config.mockTeams.length} teams · lower total score is better
          {dataSource && dataSource !== 'mock' && (
            <span className={styles.dataSource}> · {dataSource}</span>
          )}
        </footer>
      </div>
    </main>
  )
}

export default function GamePage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Loading…</div>}>
      <GamePageContent />
    </Suspense>
  )
}
